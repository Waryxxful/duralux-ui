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
    for (const file of walk(join(root, dir))) {
      const debt = countDebt(readFileSync(file, 'utf8'))
      if (debt.important + debt.darkSelectors + debt.hex === 0) continue
      files[relative(root, file)] = debt
      for (const key of Object.keys(totals)) totals[key] += debt[key]
    }
  }
  return { totals, files }
}

export function doctorScore(root = ROOT) {
  // react-doctor sale con código ≠ 0 cuando hay errores; el puntaje se lee igual.
  const run = spawnSync('npx', ['react-doctor@latest'], { cwd: root, encoding: 'utf8' })
  const output = `${run.stdout}${run.stderr}`
  const match = output.match(/Score:\s*(\d+)\s*\/\s*100/)
  if (!match) throw new Error('react-doctor no informó un puntaje')
  return Number(match[1])
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const css = measureCss()
  const result = { date: new Date().toISOString().slice(0, 10), css }
  if (!process.argv.includes('--no-doctor')) result.doctorScore = doctorScore()
  const out = resolve(ROOT, arg('out', 'docs/auditoria/baseline.json'))
  writeFileSync(out, `${JSON.stringify(result, null, 2)}\n`)
  console.log('[baseline]', JSON.stringify(css.totals), 'doctor=', result.doctorScore ?? 'omitido', '→', relative(ROOT, out))
}
