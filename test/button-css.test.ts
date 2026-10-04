import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, test } from 'vitest'

const root = process.cwd()
const button = readFileSync(resolve(root, 'src/styles/components/button.css'), 'utf8')
const glue = readFileSync(resolve(root, 'src/styles/grancrm-ui.css'), 'utf8')

describe('CSS de Button (src/styles/components/button.css)', () => {
  test('grancrm-ui.css lo importa, así los consumidores no cambian sus imports', () => {
    expect(glue).toContain('@import "./components/button.css";')
  })

  test('alturas 32/36/40 alineadas con inputs', () => {
    expect(button).toMatch(/\.btn:not\(\.btn-link\)\{[^}]*min-height:var\(--gcu-control-h-md\)/)
    expect(button).toContain('.btn-sm:not(.btn-link){min-height:var(--gcu-control-h-sm)}')
    expect(button).toContain('.btn-lg:not(.btn-link){min-height:var(--gcu-control-h-lg)}')
  })

  test('btn-link en línea conserva su padding (DX-036)', () => {
    expect(button).not.toMatch(/(^|\n)\.btn\{[^}]*padding-top:0/)
  })

  test('IconButton sm 32 px; en tablas, altura densa xs', () => {
    expect(button).toContain('.btn-icon.btn-sm{min-width:var(--gcu-control-h-sm);min-height:var(--gcu-control-h-sm)}')
    expect(button).toContain('.table .btn-icon{min-width:var(--gcu-control-h-xs);min-height:var(--gcu-control-h-xs)}')
  })

  test('presión con escala solo habilitado, anulada con reduced-motion', () => {
    expect(button).toContain('.btn:active:not(:disabled):not(.disabled){transform:scale(var(--gcu-press-scale))}')
    expect(button).toMatch(/prefers-reduced-motion:reduce\)\{\.btn:active[^}]*transform:none/)
  })

  test('sin deuda: 0 !important, 0 hex, 0 overrides de tema', () => {
    expect(button).not.toMatch(/!important|#[0-9a-f]{3,8}\b|app-skin-dark/i)
  })
})
