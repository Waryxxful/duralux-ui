import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, test } from 'vitest'

const css = readFileSync(resolve(process.cwd(), 'src/styles/grancrm-ui.css'), 'utf8')
const refinement = css.slice(css.indexOf('/* BEGIN REFINEMENT 2.1 */'), css.indexOf('/* END REFINEMENT 2.1 */'))

const rule = (selector: string) => {
  const start = refinement.indexOf(`${selector}{`)
  return start === -1 ? '' : refinement.slice(start, refinement.indexOf('}', start) + 1)
}

describe('refinamiento visual 2.1 (grancrm-ui.css)', () => {
  test('existe la capa de refinamiento y va al final para ganar a theme.css', () => {
    expect(refinement.length).toBeGreaterThan(0)
    expect(css.lastIndexOf('/* END REFINEMENT 2.1 */')).toBeGreaterThan(css.lastIndexOf('.gcu-'))
  })

  test('foco: anillo único con offset, solo en :focus-visible', () => {
    expect(refinement).toMatch(/\.btn:focus-visible[^{]*\{[^}]*box-shadow:var\(--gcu-focus-ring\)/)
    expect(refinement).toMatch(/\.form-control:focus-visible/)
    expect(css).toContain('--gcu-focus-ring-color:')
  })

  test('controles y botones comparten alturas 32/36/40', () => {
    expect(rule('.form-control,.form-select')).toContain('min-height:var(--gcu-control-h-md)')
    expect(refinement).toMatch(/\.btn\{[^}]*min-height:var\(--gcu-control-h-md\)/)
    expect(refinement).toContain('.btn-sm{min-height:var(--gcu-control-h-sm)')
    expect(refinement).toContain('.btn-lg{min-height:var(--gcu-control-h-lg)')
  })

  test('presión con escala solo en botones habilitados', () => {
    expect(refinement).toMatch(/\.btn:active:not\(:disabled\):not\(\.disabled\)\{transform:scale\(var\(--gcu-press-scale\)\)/)
  })

  test('superficies: cards con borde fino y elevación 1; modales xl con elevación 4', () => {
    expect(rule('.card')).toContain('box-shadow:var(--gcu-shadow-1)')
    expect(rule('.card')).toContain('border-color:var(--gcu-border)')
    expect(refinement).toMatch(/\.modal-content,\.gcu-modal__content\{[^}]*border-radius:var\(--gcu-radius-xl\)[^}]*var\(--gcu-shadow-4\)/)
    expect(refinement).toMatch(/\.dropdown-menu\{[^}]*var\(--gcu-shadow-3\)/)
  })

  test('entrada animada de capas flotantes con keyframes propios', () => {
    expect(refinement).toContain('@keyframes gcu-enter')
    expect(refinement).toMatch(/\.dropdown-menu\.show\{animation:gcu-enter/)
  })

  test('skeleton con shimmer que se detiene con reduced-motion', () => {
    expect(rule('.gcu-skeleton')).toContain('animation:gcu-shimmer')
    expect(refinement).toMatch(/@media \(prefers-reduced-motion:reduce\)\{[^@]*\.gcu-skeleton[^}]*animation:none/)
  })

  test('detalles: selección, números tabulares, títulos balanceados, scroll estable', () => {
    expect(refinement).toContain('::selection{background:var(--gcu-selection)')
    expect(refinement).toMatch(/font-variant-numeric:tabular-nums/)
    expect(refinement).toMatch(/text-wrap:balance/)
    expect(rule('.gcu-scroll')).toContain('scrollbar-gutter:stable')
  })

  test('feedback inválido sigue el tema (danger legible en oscuro/navy)', () => {
    expect(rule('.invalid-feedback')).toContain('color:var(--gcu-status-danger)')
  })

  test('hover solo en dispositivos con puntero', () => {
    expect(refinement).toContain('@media (hover:hover)')
  })
})
