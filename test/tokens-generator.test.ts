import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, test } from 'vitest'
import { checkContrast, contrastRatio, mixHex, readTokens, renderGeneratedCss } from '../scripts/generate-tokens.mjs'

const root = process.cwd()
const css = readFileSync(resolve(root, 'src/styles/grancrm-ui.css'), 'utf8')

describe('generador de tokens DTCG', () => {
  test('emite bloques light, dark y navy en un orden donde navy gana a dark', () => {
    const block = renderGeneratedCss(readTokens(root))
    const light = block.indexOf(':root,.gcu-theme,[data-gcu-theme="light"]{')
    const dark = block.indexOf('[data-gcu-theme="dark"],.app-skin-dark{')
    const navy = block.indexOf('[data-gcu-theme="navy"],[data-gcu-theme="navy"] .gcu-theme:not([data-gcu-theme="light"]):not([data-gcu-theme="dark"]){')
    expect(light).toBeGreaterThanOrEqual(0)
    expect(dark).toBeGreaterThan(light)
    expect(navy).toBeGreaterThan(dark)
  })

  test('un ThemeScope light dentro de html navy no queda capturado por el bloque navy', () => {
    const block = renderGeneratedCss(readTokens(root))
    // El bloque navy anidado excluye explícitamente light y dark locales.
    expect(block).toContain(':not([data-gcu-theme="light"]):not([data-gcu-theme="dark"])')
    // .gcu-theme y [data-gcu-theme="light"] re-declaran los valores claros en el propio elemento.
    expect(block.slice(0, block.indexOf('}'))).toContain('--gcu-surface:#ffffff')
  })

  test('las escalas viven en el bloque claro y llegan a grancrm-ui.css (consumidor sin tokens.css)', () => {
    for (const name of ['--gcu-space-4:16px', '--gcu-radius-lg:8px', '--gcu-control-h-md:36px', '--gcu-duration-fast:150ms', '--gcu-z-modal:1055', '--gcu-font-size-sm:13px', '--gcu-primary-500:#3454d1']) {
      expect(css).toContain(name)
    }
    expect(css).toContain('--gcu-shadow-4:')
    expect(css).toContain('--gcu-focus-ring:')
  })

  test('cada tono tiene soft, border y text derivados del tema', () => {
    const block = renderGeneratedCss(readTokens(root))
    for (const tone of ['primary', 'success', 'danger', 'warning', 'info']) {
      expect(block).toMatch(new RegExp(`--gcu-${tone}-soft:#[0-9a-f]{6}`))
      expect(block).toMatch(new RegExp(`--gcu-${tone}-border:#[0-9a-f]{6}`))
      expect(block).toContain(`--gcu-${tone}-text:var(--gcu-status-${tone})`)
    }
  })

  test('contraste WCAG: valores conocidos', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 1)
    expect(contrastRatio('#64748b', '#f3f4f6')).toBeCloseTo(4.32, 1)
    expect(mixHex('#000000', '#ffffff', 0.5)).toBe('#808080')
  })

  test('todos los pares semánticos de texto cumplen AA en los tres temas', () => {
    expect(checkContrast(readTokens(root))).toEqual([])
  })

  test('checkContrast detecta un par que no cumple', () => {
    const tokens = readTokens(root)
    tokens.theme.light.muted.$value = '#b0b0b0'
    const failures = checkContrast(tokens)
    expect(failures.some(f => f.includes('light') && f.includes('muted'))).toBe(true)
  })
})
