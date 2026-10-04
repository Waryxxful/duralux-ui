import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import * as sass from 'sass'
import { beforeAll, describe, expect, test } from 'vitest'
import { readTokens, renderGeneratedCss } from '../scripts/generate-tokens.mjs'

const root = process.cwd()
const css = readFileSync(resolve(root, 'src/styles/grancrm-ui.css'), 'utf8')
let bootstrap = ''

const ruleBody = (source: string, selector: string) => {
  const start = source.indexOf(`${selector} {`)
  return start === -1 ? '' : source.slice(start, source.indexOf('}', start) + 1)
}

beforeAll(() => {
  bootstrap = sass.compile(resolve(root, 'scss/bootstrap/bootstrap.scss'), {
    style: 'expanded',
    loadPaths: [resolve(root, 'scss')],
    silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'abs-percent'],
  }).css
}, 60_000)

describe('hallazgos de la revisión final 2.1', () => {
  test('crítico: inputs, selects y checks conservan fondo blanco en claro (canon Duralux)', () => {
    for (const selector of ['form-control', 'form-select', 'form-check-input']) {
      expect(bootstrap).toMatch(new RegExp(`\\n\\.${selector} \\{[^}]*background-color: #f{3}(?:f{3})?;`))
      expect(bootstrap).not.toMatch(new RegExp(`\\n\\.${selector} \\{[^}]*background-color: #f0f2f8`))
    }
  })

  test('un ThemeScope navy dentro de html oscuro toma tokens navy, no dark', () => {
    const block = renderGeneratedCss(readTokens(root))
    expect(block).toContain('.app-skin-dark .gcu-theme:not([data-gcu-theme="light"]):not([data-gcu-theme="navy"]){')
  })

  test('los puentes de superficie del ThemeScope local cubren navy', () => {
    expect(css).toContain('.gcu-theme[data-gcu-theme="navy"] .card')
  })

  test('reduced-motion anula duraciones también en .gcu-theme y scopes locales', () => {
    const block = renderGeneratedCss(readTokens(root))
    expect(block).toMatch(/@media \(prefers-reduced-motion:reduce\)\{:root,\.gcu-theme,\[data-gcu-theme\]\{/)
  })

  test('bootstrap.css sigue siendo legible sin grancrm-ui.css (var() con fallback)', () => {
    expect(bootstrap).toMatch(/var\(--gcu-muted, #[0-9a-f]{6}\)/i)
    expect(bootstrap).toMatch(/var\(--gcu-code, #[0-9a-f]{6}\)/i)
  })
})
