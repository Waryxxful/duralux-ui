import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, test } from 'vitest'

// DX-055: el Tooltip lleva también la clase `gcu-theme`, cuya regla de color
// (misma especificidad, más abajo en grancrm-ui.css) le ganaba al globo.
const tooltip = readFileSync(resolve(__dirname, '../src/styles/components/tooltip.css'), 'utf8')

describe('tooltip.css', () => {
  test('el color del globo le gana a .gcu-theme (texto legible sobre el fondo)', () => {
    const regla = tooltip.match(/\.gcu-tooltip,\.gcu-tooltip\.gcu-theme\{[^}]*\}/)?.[0] ?? ''
    expect(regla).toContain('color:var(--gcu-text-inverse)')
    expect(regla).toContain('background-color:var(--gcu-text)')
  })
})
