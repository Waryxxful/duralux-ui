// Gate de fidelidad: prohíbe patrones que la plantilla Duralux original NO usa.
// Auditoría 2026-07-10: btn-outline-*, table-striped y bg-*-100 (clase inexistente
// en theme.min.css; el canon es bg-soft-*) causaron divergencia visual en producción.
import { readdirSync, readFileSync, statSync } from 'fs'
import { join } from 'path'

const BANNED = [
  { re: /btn-outline-/, why: 'la plantilla no usa btn-outline-*; usá variant="light-brand" o sólido' },
  { re: /table-striped/, why: 'la plantilla usa table table-hover, nunca striped', allow: ['data/Table.jsx'] },
  { re: /bg-(?:\$\{[^}]+\}|primary|secondary|success|danger|warning|info|dark|light)-100/, why: 'bg-*-100 no existe en el theme; el canon es bg-soft-*' },
]

const files = []
const walk = d => readdirSync(d).forEach(n => {
  const p = join(d, n)
  statSync(p).isDirectory() ? walk(p) : /\.(jsx?|tsx?)$/.test(n) && files.push(p)
})
walk('src'); walk('demo')

let errors = 0
for (const f of files) {
  const lines = readFileSync(f, 'utf8').split('\n')
  for (const { re, why, allow = [] } of BANNED) {
    if (allow.some(a => f.endsWith(a))) continue
    lines.forEach((l, i) => {
      if (re.test(l)) { console.error(`✗ ${f}:${i + 1} — ${l.trim().slice(0, 80)}\n  → ${why}`); errors++ }
    })
  }
}
if (errors) { console.error(`\naudit-contract: ${errors} violaciones de fidelidad con la plantilla.`); process.exit(1) }
console.log(`audit-contract: OK (${files.length} archivos, 0 violaciones)`)
