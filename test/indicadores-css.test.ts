import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import * as sass from 'sass'
import { describe, expect, test } from 'vitest'

const root = process.cwd()
const read = (file: string) => readFileSync(resolve(root, 'src/styles/components', file), 'utf8')
const files = [
  'indicator.css',
  'stats-card.css',
  'mini-stat-card.css',
  'colored-stat-card.css',
  'quick-link-grid.css',
  'chart-metrics-footer.css',
  'connection-card.css',
]
const indicator = read('indicator.css')
const colored = read('colored-stat-card.css')
const glue = readFileSync(resolve(root, 'src/styles/grancrm-ui.css'), 'utf8')
const generated = glue.slice(glue.indexOf('/* BEGIN GENERATED SEMANTIC TOKENS */'), glue.indexOf('/* END GENERATED SEMANTIC TOKENS */'))
const lightBlock = generated.slice(generated.indexOf(':root,.gcu-theme,[data-gcu-theme="light"]{'), generated.indexOf('}', generated.indexOf(':root,.gcu-theme,[data-gcu-theme="light"]{')))
const themedBlocks = generated.slice(generated.indexOf('[data-gcu-theme="dark"]'))

/** Valor de un token en el bloque claro generado (los pasos de paleta solo se declaran ahí). */
function token(name: string): string {
  const match = lightBlock.match(new RegExp(`--gcu-${name}:([^;}]+)`))
  if (!match) throw new Error(`token --gcu-${name} no encontrado`)
  return match[1].trim()
}

function hexToRgb(hex: string): [number, number, number] {
  const value = hex.replace('#', '')
  const full = value.length === 3 ? value.split('').map(c => c + c).join('') : value
  return [0, 2, 4].map(i => parseInt(full.slice(i, i + 2), 16)) as [number, number, number]
}

function luminance([r, g, b]: [number, number, number]): number {
  const [lr, lg, lb] = [r, g, b].map(v => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb
}

function contrast(a: [number, number, number], b: [number, number, number]): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

function composite(top: [number, number, number], bottom: [number, number, number], alpha: number): [number, number, number] {
  return top.map((channel, i) => Math.round(channel * alpha + bottom[i] * (1 - alpha))) as [number, number, number]
}

const tones = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'teal', 'indigo', 'dark']

describe('CSS de indicadores (src/styles/components/*)', () => {
  test('grancrm-ui.css importa cada archivo, así los consumidores no cambian sus imports', () => {
    for (const file of files) expect(glue).toContain(`@import "./components/${file}";`)
  })

  test('sin deuda: 0 !important, 0 hex, 0 overrides de tema en los archivos nuevos', () => {
    for (const file of files) expect(read(file), file).not.toMatch(/!important|#[0-9a-f]{3,8}\b|app-skin-dark/i)
  })

  test('responden a su contenedor (@container), no al viewport', () => {
    for (const file of files.filter(f => f !== 'indicator.css')) {
      expect(read(file), file).toMatch(/@container \(min-width: \d+rem\)/)
      expect(read(file), file).not.toMatch(/@media \((min|max)-width/)
    }
  })

  test('cifras y variaciones con números tabulares (Craft)', () => {
    expect(indicator).toMatch(/\.gcu-stat__value\{[^}]*font-variant-numeric:tabular-nums/)
    expect(indicator).toMatch(/\.gcu-stat-delta__value\{[^}]*font-variant-numeric:tabular-nums/)
    expect(indicator).not.toMatch(/font-weight:(700|bold)/)
  })

  test('íconos suaves con el par AA de tokens --gcu-{tono}-soft / --gcu-{tono}-text', () => {
    for (const tone of ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'teal', 'indigo']) {
      expect(indicator).toContain(`.gcu-stat__icon--${tone}{background-color:var(--gcu-${tone}-soft);color:var(--gcu-${tone}-text)}`)
    }
  })

  test('hover instantáneo y solo con puntero; foco con el anillo del tema', () => {
    const quick = read('quick-link-grid.css')
    expect(quick).toMatch(/@media \(hover:hover\)\{\.card\.gcu-quick-link--interactive:hover/)
    expect(quick).toMatch(/\.card\.gcu-quick-link--interactive:focus-visible\{[^}]*box-shadow:var\(--gcu-focus-ring\)/)
    expect(quick).not.toMatch(/transition:[^;}]*(box-shadow|border-color|background)/)
    expect(read('stats-card.css')).toMatch(/@media \(hover:hover\)\{\.gcu-stats-card button\.gcu-stats-card__footer:hover/)
  })

  test('radio anidado en el pie de StatsCard: radio de la card menos su borde', () => {
    expect(read('stats-card.css')).toContain('max(0px,calc(var(--gcu-radius-lg) - 1px))')
  })
})

describe('ColoredStatCard: contraste AA en claro, oscuro y navy (movido desde theme-css.contract y refinement-css)', () => {
  test('cada relleno es un paso de paleta que no cambia por tema y deja el texto blanco en AA', () => {
    const white = hexToRgb(token('on-darken'))
    expect(token('on-darken').toLowerCase()).toMatch(/^#fff(fff)?$/)
    for (const tone of tones) {
      const match = colored.match(new RegExp(`\\.gcu-colored-stat--${tone}\\{--gcu-colored-stat-fill:var\\(--gcu-([a-z0-9-]+)\\)\\}`))
      expect(match, `relleno ${tone}`).not.toBeNull()
      const fillToken = match![1]
      // El paso de paleta no se redefine en oscuro ni navy: el relleno (y su contraste) es el mismo.
      expect(themedBlocks, `--gcu-${fillToken} no debe cambiar por tema`).not.toContain(`--gcu-${fillToken}:`)
      const fill = hexToRgb(token(fillToken))
      expect(contrast(white, fill), `blanco sobre ${tone}`).toBeGreaterThanOrEqual(4.5)
    }
  })

  test('el vidrio se sombrea con darken (nunca se aclara) y conserva AA con blanco en cada tono', () => {
    const glass = colored.match(/\.gcu-colored-stat__glass\{[^}]*background-color:rgba\(var\(--gcu-darken-rgb\),(\.\d+)\)/)
    expect(glass).not.toBeNull()
    const alpha = Number(glass![1])
    const darken = token('darken-rgb').split(',').map(Number) as [number, number, number]
    const white = hexToRgb(token('on-darken'))
    for (const tone of tones) {
      const fillToken = colored.match(new RegExp(`\\.gcu-colored-stat--${tone}\\{--gcu-colored-stat-fill:var\\(--gcu-([a-z0-9-]+)\\)`))![1]
      const surface = composite(darken, hexToRgb(token(fillToken)), alpha)
      expect(contrast(white, surface), `vidrio ${tone}`).toBeGreaterThanOrEqual(4.5)
    }
    expect(colored).not.toMatch(/rgba\(255,\s*255,\s*255/)
  })

  test('el texto no baja su opacidad y la superficie lleva grano', () => {
    expect(colored).not.toMatch(/opacity:/)
    expect(colored).toMatch(/\.gcu-colored-stat \.gcu-stat__value,[^{]*\{color:inherit\}/)
    expect(read('base.css')).toMatch(/\.gcu-grain::after\{/)
  })

  test('en oscuro el vidrio no depende de .avatar-text: ninguna regla del tema ni del glue lo alcanza', () => {
    const theme = sass.compile(resolve(root, 'scss/theme.scss'), {
      loadPaths: [resolve(root, 'scss')],
      silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'abs-percent'],
    }).css
    expect(theme).not.toMatch(/gcu-colored-stat|gcu-mini-stat|gcu-quick-link|gcu-stats-card/)
    expect(glue).not.toMatch(/gcu-colored-stat|gcu-mini-stat|gcu-quick-link|gcu-stats-card/)
    expect(existsSync(resolve(root, 'scss/themes/components/_widgets-ui.scss'))).toBe(false)
  })
})
