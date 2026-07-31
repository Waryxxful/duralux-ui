// Gate de fidelidad: prohíbe patrones que la plantilla Duralux original NO usa.
// Auditoría 2026-07-10 + 2026-07-31: outline buttons, table-striped, bg-*-100,
// y prop variant="outline*" en JSX.
import { readdirSync, readFileSync, statSync } from 'fs'
import { join } from 'path'

const BANNED = [
  { re: /btn-outline-/, why: 'la plantilla no usa btn-outline-*; usá variant="light-brand" o sólido' },
  { re: /variant\s*=\s*["']outline[^"']*["']/, why: 'variant outline* está prohibido; usá light-brand o semántico sólido' },
  { re: /variant\s*=\s*\{["']outline[^"']*["']\}/, why: 'variant outline* está prohibido; usá light-brand o semántico sólido' },
  { re: /table-striped/, why: 'la plantilla usa table table-hover, nunca striped', allow: [] },
  { re: /bg-(?:\$\{[^}]+\}|primary|secondary|success|danger|warning|info|dark|light)-100/, why: 'bg-*-100 no existe en el theme; el canon es bg-soft-*' },
]

const files = []
const walk = d => {
  try {
    readdirSync(d).forEach(n => {
      const p = join(d, n)
      if (statSync(p).isDirectory()) walk(p)
      else if (/\.(jsx?|tsx?)$/.test(n)) files.push(p)
    })
  } catch {
    // skip missing dirs
  }
}
walk('src')
walk('demo/src')

let errors = 0
for (const f of files) {
  const lines = readFileSync(f, 'utf8').split('\n')
  for (const { re, why, allow = [] } of BANNED) {
    if (allow.some(a => f.endsWith(a))) continue
    lines.forEach((l, i) => {
      // Skip comments that only document the ban
      if (/^\s*(\/\/|\*|\/\*)/.test(l) && !/variant=|btn-outline|table-striped|bg-/.test(l.replace(/\/\/.*/, ''))) {
        // still check non-comment code; comments with live code rare
      }
      if (re.test(l)) {
        // Allow lines that only mention the ban in a string comment of audit script itself
        if (f.includes('audit-contract')) return
        console.error(`✗ ${f}:${i + 1} — ${l.trim().slice(0, 80)}\n  → ${why}`)
        errors++
      }
    })
  }
}
if (errors) {
  console.error(`\naudit-contract: ${errors} violaciones de fidelidad con la plantilla.`)
  process.exit(1)
}
console.log(`audit-contract: OK (${files.length} archivos, 0 violaciones)`)
