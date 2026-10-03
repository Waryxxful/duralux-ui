import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import { auditText, auditCssBudget } from '../scripts/audit-contract.mjs'

describe('gate: hex sueltos en componentes', () => {
  test('un style inline con hex en src/components falla', () => {
    const violations = auditText("<div style={{ color: '#ff0000' }} />", '/repo/src/components/ui/X.jsx')
    expect(violations.some(v => v.why.includes('token'))).toBe(true)
  })

  test('el mismo patrón en la demo no aplica (la demo no es librería)', () => {
    expect(auditText("<div style={{ color: '#ff0000' }} />", '/repo/demo/src/pages/X.jsx')).toEqual([])
  })

  test('un style inline con var(--gcu-*) pasa', () => {
    expect(auditText("<div style={{ color: 'var(--gcu-text)' }} />", '/repo/src/components/ui/X.jsx')).toEqual([])
  })
})

describe('gate: presupuesto de deuda CSS por archivo', () => {
  let root: string
  const write = (rel: string, body: string) => {
    mkdirSync(join(root, rel, '..'), { recursive: true })
    writeFileSync(join(root, rel), body)
  }
  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'duralux-budget-'))
    for (const dir of ['src/styles', 'src/components', 'scss/themes']) mkdirSync(join(root, dir), { recursive: true })
    write('scripts/audit/css-budget.json', JSON.stringify({ 'src/styles/a.css': { important: 1, darkSelectors: 1, hex: 1 } }))
  })
  afterEach(() => rmSync(root, { recursive: true, force: true }))

  test('igual o menos que el presupuesto pasa', () => {
    write('src/styles/a.css', '.x{color:#fff!important}.app-skin-dark .y{}')
    expect(auditCssBudget({ cwd: root })).toEqual([])
  })

  test('un !important nuevo excede el presupuesto y falla', () => {
    write('src/styles/a.css', '.x{color:#fff!important}.z{margin:0!important}')
    expect(auditCssBudget({ cwd: root }).join('\n')).toMatch(/a\.css.*important/)
  })

  test('un archivo nuevo con overrides .app-skin-dark falla', () => {
    write('src/styles/a.css', '')
    write('src/styles/b.css', '.app-skin-dark .x{color:red}')
    expect(auditCssBudget({ cwd: root }).join('\n')).toMatch(/b\.css.*darkSelectors/)
  })
})

describe('gate: puntaje react-doctor', () => {
  test('lee el puntaje de la salida', async () => {
    const { parseDoctorScore } = await import('../scripts/audit/baseline.mjs')
    expect(parseDoctorScore('React Doctor\nScore: 63 / 100 Needs work')).toBe(63)
    expect(() => parseDoctorScore('sin puntaje')).toThrow()
  })
})
