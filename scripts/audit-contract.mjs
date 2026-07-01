#!/usr/bin/env node
/**
 * Auditoría de contrato: cada prop declarada en el .d.ts de grancrm-ui para
 * @duralux/ui debe estar realmente manejada por la implementación JSX de duralux.
 *
 * Detecta el bug que rompió PageHeader (actions/subtitle), FormField (helpText,
 * render-prop) y evita que vuelva a pasar: si el .d.ts promete una prop que la
 * impl ignora, esto falla.
 *
 * Uso: node scripts/audit-contract.mjs   (exit 1 si hay divergencias)
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const DURALUX_SRC = join(here, '..', 'src');
const DTS = join(here, '..', '..', 'orquestador', 'frontend', 'packages', 'grancrm-ui', 'src', 'duralux.d.ts');

// Props que se cubren por spread de atributos HTML nativos (no requieren manejo explícito)
const HTML_PASSTHROUGH = new Set([
  'className', 'id', 'style', 'onClick', 'onChange', 'onSubmit', 'type', 'value',
  'placeholder', 'disabled', 'name', 'checked', 'aria-label', 'data-raw', 'href',
  'onBlur', 'onFocus', 'onKeyDown', 'required', 'readOnly', 'autoFocus', 'rows',
]);

function allFiles(dir) {
  return readdirSync(dir).flatMap(n => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? allFiles(p) : p.endsWith('.jsx') ? [p] : [];
  });
}

// 1) Parsear el .d.ts: interface XxxProps { props } + function Comp(props: XxxProps)
const dts = readFileSync(DTS, 'utf8');
const interfaces = {};
for (const m of dts.matchAll(/export interface (\w+Props(?:<T>)?)[^{]*\{([\s\S]*?)\n\s{2}\}/g)) {
  const name = m[1].replace('<T>', '');
  const props = [...m[2].matchAll(/^\s{4}'?([\w-]+)'?\??\s*:/gm)].map(x => x[1]);
  interfaces[name] = props;
}
const compToProps = {};
for (const m of dts.matchAll(/export function (\w+)(?:<T>)?\(props: (\w+Props)(?:<T>)?\)/g)) {
  compToProps[m[1]] = interfaces[m[2]] || [];
}

// 2) Localizar impl de cada componente y extraer props destructuradas + si hay spread
const files = allFiles(DURALUX_SRC);
function implFor(comp) {
  for (const f of files) {
    const src = readFileSync(f, 'utf8');
    const re = new RegExp(`(?:export\\s+)?(?:function|const)\\s+${comp}\\b`);
    if (re.test(src)) return { f, src };
  }
  return null;
}
function handledProps(src, comp) {
  // localizar la definición del componente
  const def = src.search(new RegExp(`(?:function\\s+${comp}\\b|(?:const|let|var)\\s+${comp}\\s*=)`));
  if (def < 0) return { names: new Set(), spread: false };
  const after = src.slice(def);
  const paren = after.indexOf('(');
  if (paren < 0) return { names: new Set(), spread: false };
  let rest = after.slice(paren + 1).replace(/^\s+/, '');
  if (!rest.startsWith('{')) return { names: new Set(), spread: false }; // no destructura props
  // capturar el bloque de destructuring balanceando llaves
  let depth = 0, body = '';
  for (const c of rest) {
    if (c === '{') { depth++; if (depth === 1) continue; }
    else if (c === '}') { depth--; if (depth === 0) break; }
    body += c;
  }
  const spread = /\.\.\.\w+/.test(body);
  // identificadores top-level (ignora valores default anidados quedándonos con la clave)
  const names = new Set([...body.matchAll(/(?:^|,)\s*([A-Za-z_$][\w$]*|'[\w-]+')/g)]
    .map(x => x[1].replace(/'/g, '')));
  return { names, spread };
}

// 3) Reportar divergencias
let problems = 0;
const results = [];
for (const [comp, props] of Object.entries(compToProps)) {
  const impl = implFor(comp);
  if (!impl) { results.push(`⚠️  ${comp}: no se encontró implementación`); problems++; continue; }
  const { names, spread } = handledProps(impl.src, comp);
  // ¿reenvía el rest a OTRO componente (<Comp {...rest}/>)? entonces esas props sí se manejan
  const spreadVar = (impl.src.match(new RegExp(`${comp}[\\s\\S]*?\\.\\.\\.(\\w+)`)) || [])[1];
  const forwards = spreadVar && new RegExp(`<[A-Z][\\w]*[^>]*\\{\\.\\.\\.${spreadVar}\\}`).test(impl.src);
  const missing = forwards ? [] : props.filter(p => !names.has(p) && !(spread && HTML_PASSTHROUGH.has(p)));
  if (missing.length) {
    results.push(`❌ ${comp}: props declaradas pero NO manejadas por la impl → ${missing.join(', ')}`);
    problems += missing.length;
  }
}

console.log(`Auditoría de contrato @duralux/ui (${Object.keys(compToProps).length} componentes)\n`);
console.log(results.length ? results.join('\n') : '✅ Sin divergencias: la impl maneja todas las props declaradas.');
if (problems) { console.log(`\n${problems} divergencia(s).`); process.exit(1); }
