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
    expect(css).toContain('--gcu-focus-ring-color:')
  })


  test('superficies: cards con borde fino y elevación 1; modales xl con elevación 4', () => {
    // Corrección documentada (lote L2): modal y dropdown pasaron a su CSS propio (src/styles/components/).
    const modalCss = readFileSync(resolve(process.cwd(), 'src/styles/components/modal.css'), 'utf8')
    const dropdownCss = readFileSync(resolve(process.cwd(), 'src/styles/components/dropdown.css'), 'utf8')
    expect(modalCss).toMatch(/\.modal-content\{[^}]*border-radius:var\(--gcu-radius-xl\)[^}]*var\(--gcu-shadow-4\)/)
    expect(dropdownCss).toMatch(/\.dropdown-menu\{[^}]*var\(--gcu-shadow-3\)/)
    // Corrección 2.3 (lote L3): la superficie de .card vive en components/card.css (importado por grancrm-ui.css).
    const cardCss = readFileSync(resolve(process.cwd(), 'src/styles/components/card.css'), 'utf8')
    expect(css).toContain('@import "./components/card.css";')
    expect(cardCss).toMatch(/(^|\n)\.card\{[^}]*box-shadow:var\(--gcu-shadow-1\)/)
    expect(cardCss).toMatch(/(^|\n)\.card\{[^}]*border-color:var\(--gcu-border\)/)
  })

  test('entrada animada de capas flotantes con keyframes propios', () => {
    expect(refinement).toContain('@keyframes gcu-enter')
    expect(readFileSync(resolve(process.cwd(), 'src/styles/components/dropdown.css'), 'utf8')).toMatch(/\.dropdown-menu\.show\{animation:gcu-enter/)
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

  test('hover solo en dispositivos con puntero', () => {
    expect(refinement).toContain('@media (hover:hover)')
  })
})

describe('ColoredStatCard: contraste AA en claro y oscuro (verificación final 2.1)', () => {
  test('el vidrio se sombrea en todos los temas: ninguna regla lo aclara con blanco translúcido', () => {
    expect(css).not.toMatch(/gcu-colored-stat__glass[^{]*\{[^}]*background-color:rgba\(255,255,255,\.22\)/)
  })

  test('el subtítulo no baja su opacidad (blanco sobre el relleno AA queda justo en 4,5:1)', () => {
    expect(css).not.toMatch(/\.gcu-colored-stat p\{opacity:\.82/)
  })

  test('la meta de la burbuja saliente conserva AA sobre primary', () => {
    expect(css).not.toMatch(/\.gcu-message-bubble__meta\{[^}]*opacity:\.72/)
  })
})

// «ColoredStatCard en oscuro» se movió a test/indicadores-css.test.ts (lote L4): el vidrio ya no usa
// .avatar-text, así que el html.app-skin-dark .avatar-text del tema no lo alcanza y no hace falta !important.

describe('regresiones vistas en apps reales (DEV)', () => {
  test('tabular-nums no se aplica a toda la tabla (en Inter ensancha guiones y puntuación de emails)', () => {
    expect(refinement).not.toMatch(/(^|\n|,)table,\.table,/)
    expect(refinement).toMatch(/td\.text-end[^{]*\{font-variant-numeric:tabular-nums/)
  })

})
