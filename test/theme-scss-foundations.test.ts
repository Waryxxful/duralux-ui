import { resolve } from 'node:path'
import * as sass from 'sass'
import { beforeAll, describe, expect, test } from 'vitest'

const root = process.cwd()
let css = ''
let bootstrap = ''

const compile = (entry: string) => sass.compile(resolve(root, entry), {
  style: 'expanded',
  loadPaths: [resolve(root, 'scss')],
  silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'abs-percent'],
}).css

beforeAll(() => {
  css = compile('scss/theme.scss')
  bootstrap = compile('scss/bootstrap/bootstrap.scss')
}, 60_000)

function rulesFor(selectorFragment: string): string {
  const parts: string[] = []
  let index = css.indexOf(selectorFragment)
  while (index !== -1) {
    parts.push(css.slice(index, css.indexOf('}', index) + 1))
    index = css.indexOf(selectorFragment, index + 1)
  }
  return parts.join('\n')
}

describe('theme.scss — fundaciones 2.1', () => {
  test('emite el oscuro navy en runtime bajo html.app-skin-dark[data-gcu-theme=navy]', () => {
    const navy = rulesFor('html.app-skin-dark[data-gcu-theme=navy]')
    expect(navy).not.toBe('')
    expect(navy).toContain('#0f172a')
    expect(navy).toContain('#121a2d')
  })

  test('el oscuro gris-negro sigue intacto en html.app-skin-dark', () => {
    expect(css).toMatch(/html\.app-skin-dark [^{]*\{[^}]*#0e0f12/)
  })

  test('no depende de Google Fonts y declara Inter Variable autoalojada primero', () => {
    expect(css).not.toContain('fonts.googleapis.com')
    expect(css).toMatch(/font-family:\s*"Inter Variable"/)
  })

  test('code usa un color con contraste AA (DX-001)', () => {
    expect(bootstrap).toMatch(/--bs-code-color:\s*var\(--gcu-code\)/)
  })

  test('feedback inválido usa el danger semántico, no #dc3545 de Bootstrap (DX-002)', () => {
    const start = bootstrap.indexOf('.valid-feedback {')
    const validation = bootstrap.slice(start, start + 9000)
    expect(validation).not.toBe('')
    expect(validation).not.toContain('#dc3545')
    expect(validation).not.toContain('#ea4d4d')
  })
})
