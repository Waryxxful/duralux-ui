import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, describe, expect, test } from 'vitest'
import { readTokens, renderGeneratedCss } from '../scripts/generate-tokens.mjs'
import { applyThemeToDocument } from '../src/theme/ThemeContext'
import { designTokens } from '../src/tokens'

const root = process.cwd()
const read = (p: string) => readFileSync(resolve(root, p), 'utf8')
const block = renderGeneratedCss(readTokens(root))
const blockFor = (selectorStart: string) => block.slice(block.indexOf(selectorStart), block.indexOf('}', block.indexOf(selectorStart)))

describe('Craft — conceptos globales (craft.gustavofior.com)', () => {
  afterEach(() => document.head.querySelector('meta[name="theme-color"]')?.remove())

  test('HTML Background: el lienzo del documento sigue al tema (sin franja blanca al rebotar)', () => {
    expect(read('src/styles/components/base.css')).toContain('html{background-color:var(--gcu-surface-subtle)}')
    expect(read('src/styles/grancrm-ui.css')).toContain('@import "./components/base.css";')
  })

  test('HTML Background: color-scheme por tema (controles nativos y scrollbars oscuros en dark/navy)', () => {
    expect(blockFor(':root,.gcu-theme')).toContain('color-scheme:light')
    expect(blockFor('[data-gcu-theme="dark"],.app-skin-dark{')).toContain('color-scheme:dark')
    expect(blockFor('[data-gcu-theme="navy"]')).toContain('color-scheme:dark')
  })

  test('HTML Background: meta theme-color sigue al tema resuelto', () => {
    applyThemeToDocument('navy')
    expect(document.head.querySelector('meta[name="theme-color"]')?.getAttribute('content')).toBe(designTokens.themes.navy.colors['surface-subtle'])
    applyThemeToDocument('light')
    expect(document.head.querySelector('meta[name="theme-color"]')?.getAttribute('content')).toBe(designTokens.themes.light.colors['surface-subtle'])
  })

  test('Image Outlines: token por tema (negro 10 % en claro, blanco 10 % en oscuro y navy)', () => {
    expect(blockFor(':root,.gcu-theme')).toContain('--gcu-image-outline:rgb(0 0 0 / 0.1)')
    expect(blockFor('[data-gcu-theme="navy"]')).toContain('--gcu-image-outline:rgb(255 255 255 / 0.1)')
    expect(read('src/styles/components/base.css')).toMatch(/\.avatar-image img[^{]*\{outline:1px solid var\(--gcu-image-outline\);outline-offset:-1px\}/)
  })

  test('Noise: utilidad de grano en mosaico (barata), mezclada solo con su superficie', () => {
    const base = read('src/styles/components/base.css')
    expect(base).toMatch(/\.gcu-grain\{[^}]*isolation:isolate/)
    expect(base).toMatch(/\.gcu-grain::after\{[^}]*background-size:200px 200px[^}]*opacity:\.08[^}]*mix-blend-mode:overlay/)
  })

  test('Hover Restraint: el botón no anima color ni fondo en hover (solo la presión)', () => {
    const button = read('src/styles/components/button.css')
    expect(button).not.toMatch(/transition:[^;}]*background-color/)
    expect(button).toMatch(/\.btn\{[^}]*transition:transform var\(--gcu-duration-instant\)/)
  })

  test('Hover Restraint: navegación, ítems de menú y filas cambian sin transición', () => {
    expect(read('src/styles/components/base.css')).toMatch(/\.nxl-navigation \.nxl-link,[^{]*\.dropdown-item,[^{]*\.table-hover > tbody > tr[^{]*\{transition:none\}/)
  })

  test('Optical Alignment: el lado del ícono lleva 2px menos de padding', () => {
    // :first-child ignora nodos de texto (el ícono sería primero y último): el componente marca su ícono.
    expect(read('src/styles/components/button.css')).toContain('.gcu-button__icon--start{margin-inline-start:-2px}')
    expect(read('src/styles/components/button.css')).toContain('.gcu-button__icon--end{margin-inline-end:-2px}')
  })
})

describe('Container queries (skill prefer-container-queries, CSS nativo)', () => {
  test('utilidad de contenedor con nombre y tamaños de referencia en rem', () => {
    const base = read('src/styles/components/base.css')
    expect(base).toContain('.gcu-container{container-type:inline-size}')
    expect(base).toMatch(/@container \(min-width: 28rem\)\{\.gcu-cq-row\{flex-direction:row\}\}/)
  })
})
