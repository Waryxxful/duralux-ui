/**
 * Falla el build si un componente exportado desde src/index.js cuya impl es
 * .jsx (sin tipos propios, vite-plugin-dts sólo procesa .ts/.tsx) no tiene su
 * `export declare function X` correspondiente escrito a mano en
 * write-index-dts.mjs — o si ese archivo declara un componente que ya no se
 * exporta desde src/index.js (declaración obsoleta).
 *
 * Sin este chequeo, agregar/renombrar un componente .jsx y olvidar
 * write-index-dts.mjs no rompía el build: el componente sólo quedaba sin
 * tipos en dist/index.d.ts, detectable únicamente por revisión manual.
 */
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const srcDir = join(rootDir, 'src');

function resolveSourceExt(relativePath) {
  const base = join(srcDir, relativePath);
  for (const ext of ['.ts', '.tsx', '.jsx', '.js']) {
    if (existsSync(base + ext)) return ext;
  }
  return null;
}

async function findUntypedExports() {
  const indexSrc = await readFile(join(srcDir, 'index.js'), 'utf8');
  const exportRe = /export\s*\{([^}]+)\}\s*from\s*'(\.[^']+)'/g;
  const untyped = new Set();
  const unresolved = [];

  for (const match of indexSrc.matchAll(exportRe)) {
    const [, namesRaw, relativePath] = match;
    const ext = resolveSourceExt(relativePath);
    if (ext === null) {
      unresolved.push(relativePath);
      continue;
    }
    // Sólo .jsx/.js carecen de tipos propios; vite-plugin-dts ya cubre .ts/.tsx
    // (ver vite.config.js: dts({ include: ['src/**/*.ts','src/**/*.tsx'] })).
    if (ext !== '.jsx' && ext !== '.js') continue;

    for (const rawName of namesRaw.split(',')) {
      const name = rawName.split(' as ').pop().trim();
      if (name) untyped.add(name);
    }
  }

  if (unresolved.length) {
    throw new Error(`No pude resolver el archivo fuente para: ${unresolved.join(', ')}`);
  }

  return untyped;
}

async function findManuallyDeclared() {
  const dtsSrc = await readFile(join(__dirname, 'write-index-dts.mjs'), 'utf8');
  const declared = new Set();
  for (const match of dtsSrc.matchAll(/export declare function (\w+)/g)) {
    declared.add(match[1]);
  }
  return declared;
}

const [untyped, declared] = await Promise.all([findUntypedExports(), findManuallyDeclared()]);

const missing = [...untyped].filter(name => !declared.has(name)).sort();
const stale = [...declared].filter(name => !untyped.has(name)).sort();

if (missing.length) {
  console.error(
    `\n✗ scripts/write-index-dts.mjs no declara tipos para estos componentes .jsx exportados desde src/index.js:\n` +
    missing.map(n => `  - ${n}`).join('\n') +
    `\n\nAgregá su "export interface XProps { ... }" + "export declare function X(...)" en scripts/write-index-dts.mjs.\n`,
  );
  process.exit(1);
}

if (stale.length) {
  console.warn(
    `\n⚠ scripts/write-index-dts.mjs declara tipos para componentes que ya no se exportan (.jsx) desde src/index.js — ` +
    `revisar si se renombraron, se migraron a .tsx (y por lo tanto ya los cubre vite-plugin-dts), o quedaron obsoletos:\n` +
    stale.map(n => `  - ${n}`).join('\n') + '\n',
  );
}

console.log(`✓ write-index-dts.mjs cubre los ${untyped.size} componentes .jsx exportados desde src/index.js`);
