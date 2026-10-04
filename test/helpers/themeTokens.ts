import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * Lee los tokens generados (src/styles/tokens.css) y resuelve un token por tema.
 * Sirve para verificar pares de color que `tokens:check` no cubre (rellenos sólidos,
 * iniciales de avatar, texto sobre barra de progreso).
 */
export type ThemeName = 'light' | 'dark' | 'navy'
export const THEMES: ThemeName[] = ['light', 'dark', 'navy']

const source = readFileSync(resolve(process.cwd(), 'src/styles/tokens.css'), 'utf8')

function declarations(selectorStart: string): Record<string, string> {
  const start = source.indexOf(selectorStart)
  if (start === -1) throw new Error(`Bloque de tokens no encontrado: ${selectorStart}`)
  const body = source.slice(source.indexOf('{', start) + 1, source.indexOf('}', start))
  return Object.fromEntries(
    [...body.matchAll(/(--gcu-[\w-]+)\s*:\s*([^;]+)/g)].map(([, name, value]) => [name, value.trim()]),
  )
}

const light = declarations(':root,.gcu-theme,[data-gcu-theme="light"]{')
const dark = { ...light, ...declarations('[data-gcu-theme="dark"],.app-skin-dark{') }
const navy = { ...dark, ...declarations('[data-gcu-theme="navy"],') }
const byTheme: Record<ThemeName, Record<string, string>> = { light, dark, navy }

/** Valor final de `var(--gcu-x)` (sigue referencias encadenadas). */
export function token(theme: ThemeName, expression: string): string {
  let value = expression.trim()
  for (let depth = 0; depth < 10; depth += 1) {
    const ref = value.match(/^var\((--gcu-[\w-]+)(?:\s*,[^)]*)?\)$/)
    if (!ref) return value
    const next = byTheme[theme][ref[1]]
    if (next === undefined) throw new Error(`Token ${ref[1]} sin valor en ${theme}`)
    value = next
  }
  throw new Error(`Referencia circular en ${expression}`)
}

function channels(value: string): [number, number, number] {
  const hex = value.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)
  if (hex) {
    const full = hex[1].length === 3 ? hex[1].replace(/./g, (d) => d + d) : hex[1]
    return [0, 2, 4].map((i) => Number.parseInt(full.slice(i, i + 2), 16)) as [number, number, number]
  }
  const rgb = value.match(/^rgba?\(([^)]+)\)$/i)
  if (rgb) {
    // SAFETY: tres canales numéricos de rgb(r g b / a) o rgb(r, g, b).
    return rgb[1].split(/[\s,/]+/).slice(0, 3).map(Number) as [number, number, number]
  }
  throw new Error(`Color no soportado: ${value}`)
}

function luminance(value: string): number {
  const [r, g, b] = channels(value).map((c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** Contraste WCAG entre dos expresiones de color (hex o `var(--gcu-*)`) en un tema. */
export function contrast(theme: ThemeName, foreground: string, background: string): number {
  const a = luminance(token(theme, foreground))
  const b = luminance(token(theme, background))
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
}

/** CSS de un componente (src/styles/components/<nombre>.css). */
export function componentCss(name: string): string {
  return readFileSync(resolve(process.cwd(), `src/styles/components/${name}.css`), 'utf8')
}

/** Declaraciones fusionadas de todas las reglas cuyo selector incluye exactamente `selector`. */
export function ruleOf(css: string, selector: string): Record<string, string> {
  let found = false
  const merged: Record<string, string> = {}
  for (const [, rawSelector, body] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selectors = rawSelector.replace(/\/\*[\s\S]*?\*\//g, '').split(',').map((s) => s.trim())
    if (!selectors.includes(selector)) continue
    found = true
    for (const [, p, v] of body.matchAll(/([\w-]+)\s*:\s*([^;]+)/g)) merged[p] = v.trim()
  }
  if (!found) throw new Error(`Regla no encontrada: ${selector}`)
  return merged
}

export const DEBT = /!important|#[0-9a-f]{3,8}\b|app-skin-dark/i
