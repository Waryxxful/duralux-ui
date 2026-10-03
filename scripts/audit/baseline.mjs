// Línea base medible: deuda CSS por archivo + puntaje react-doctor.
// Uso: node scripts/audit/baseline.mjs [--out docs/auditoria/baseline.json] [--no-doctor]
import { spawnSync } from 'node:child_process'
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { extname, join, relative, resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '../..')
const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`)
  return i === -1 ? fallback : process.argv[i + 1]
}

const SCAN = ['src/styles', 'src/components', 'scss/themes']
const EXT = new Set(['.css', '.scss', '.js', '.jsx', '.ts', '.tsx'])
// Los artefactos de tokens son el lugar legítimo de los hex: no cuentan como deuda.
const GENERATED_FILES = new Set(['src/styles/tokens.css', 'scss/themes/_semantic-tokens.generated.scss'])
const GENERATED_BLOCK = /\/\* BEGIN GENERATED SEMANTIC TOKENS \*\/[\s\S]*?\/\* END GENERATED SEMANTIC TOKENS \*\//g

export function countDebt(source) {
  return {
    important: (source.match(/!important/g) ?? []).length,
    darkSelectors: (source.match(/\.app-skin-dark/g) ?? []).length,
    hex: (source.match(/#[0-9a-fA-F]{3,8}\b/g) ?? []).length,
  }
}

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry)
    if (statSync(path).isDirectory()) walk(path, files)
    else if (EXT.has(extname(path))) files.push(path)
  }
  return files
}

export function measureCss(root = ROOT) {
  const files = {}
  const totals = { important: 0, darkSelectors: 0, hex: 0 }
  for (const dir of SCAN) {
    let sources
    try { sources = walk(join(root, dir)) } catch { continue }
    for (const file of sources) {
      if (GENERATED_FILES.has(relative(root, file))) continue
      const debt = countDebt(readFileSync(file, 'utf8').replace(GENERATED_BLOCK, ''))
      if (debt.important + debt.darkSelectors + debt.hex === 0) continue
      files[relative(root, file)] = debt
      for (const key of Object.keys(totals)) totals[key] += debt[key]
    }
  }
  return { totals, files }
}

export function parseDoctorScore(output) {
  const match = output.match(/Score:\s*(\d+)\s*\/\s*100/)
  if (!match) throw new Error('react-doctor no informó un puntaje')
  return Number(match[1])
}

export function doctorScore(root = ROOT) {
  // react-doctor sale con código ≠ 0 cuando hay errores; el puntaje se lee igual.
  // Binario local (devDependency fijada): el gate no depende de la red ni de @latest.
  const run = spawnSync(join(root, 'node_modules/.bin/react-doctor'), [], { cwd: root, encoding: 'utf8' })
  return parseDoctorScore(`${run.stdout}${run.stderr}`)
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const css = measureCss()
  if (process.argv.includes('--budget')) {
    writeFileSync(resolve(ROOT, 'scripts/audit/css-budget.json'), `${JSON.stringify(css.files, null, 2)}\n`)
    console.log('[baseline] presupuesto CSS fijado en scripts/audit/css-budget.json', JSON.stringify(css.totals))
    process.exit(0)
  }
  const result = { date: new Date().toISOString().slice(0, 10), css }
  if (!process.argv.includes('--no-doctor')) result.doctorScore = doctorScore()
  const out = resolve(ROOT, arg('out', 'docs/auditoria/baseline.json'))
  writeFileSync(out, `${JSON.stringify(result, null, 2)}\n`)
  console.log('[baseline]', JSON.stringify(css.totals), 'doctor=', result.doctorScore ?? 'omitido', '→', relative(ROOT, out))
}
