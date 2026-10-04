import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, test } from 'vitest'

// CSS propio del lote L2 (Feedback y capas): tokens, sin deuda y sin reglas viejas duplicadas.
const root = process.cwd()
const read = (path: string) => readFileSync(resolve(root, path), 'utf8')
const glue = read('src/styles/grancrm-ui.css')
const files = ['alert', 'toast', 'modal', 'dropdown', 'feedback-state', 'card-loader'] as const
const css = Object.fromEntries(files.map((name) => [name, read(`src/styles/components/${name}.css`)])) as Record<typeof files[number], string>

describe('CSS por componente del lote L2', () => {
  test.each(files)('grancrm-ui.css importa %s.css', (name) => {
    expect(glue).toContain(`@import "./components/${name}.css";`)
  })

  test.each(files)('%s.css sin deuda: 0 !important, 0 hex, 0 overrides de tema', (name) => {
    expect(css[name]).not.toMatch(/!important|#[0-9a-f]{3,8}\b|app-skin-dark/i)
  })
})

describe('Alert', () => {
  test('cada tono usa sus roles semánticos (texto AA sobre suave, verificado por tokens:check)', () => {
    for (const tone of ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'teal', 'indigo']) {
      expect(css.alert).toContain(`--gcu-alert-soft:var(--gcu-${tone}-soft)`)
      expect(css.alert).toContain(`--gcu-alert-text:var(--gcu-${tone}-text)`)
    }
  })

  test('las clases canónicas alert-soft-*-message siguen funcionando sin el componente', () => {
    expect(css.alert).toContain('.alert-soft-warning-message')
  })

  test('grancrm-ui.css y el SCSS ya no traen las reglas viejas ni sus overrides de oscuro', () => {
    expect(glue).not.toMatch(/\.gcu-alert--\w+\{--gcu-alert-icon-fill:#/)
    expect(glue).not.toMatch(/app-skin-dark[^{]*\.(gcu-alert|alert\.alert-soft)/)
    expect(read('scss/themes/components/_alert.scss')).not.toMatch(/!important|app-skin-dark/)
    expect(read('scss/themes/options/_theme-options-dark-theme.scss')).not.toContain('alert-soft-')
  })
})

describe('Toast', () => {
  test('entra con gcu-enter y sale más rápido con la curva de salida', () => {
    expect(css.toast).toMatch(/\.gcu-toast\{[^}]*animation:gcu-enter var\(--gcu-duration-base\) var\(--gcu-ease-enter\)/)
    expect(css.toast).toMatch(/\.gcu-toast--closing\{[^}]*animation:gcu-exit var\(--gcu-duration-fast\) var\(--gcu-ease-exit\) forwards/)
  })

  test('elevación flotante, radio lg y capa de toast', () => {
    expect(css.toast).toMatch(/\.gcu-toast\{[^}]*border-radius:var\(--gcu-radius-lg\)/)
    expect(css.toast).toMatch(/\.gcu-toast\{[^}]*box-shadow:var\(--gcu-shadow-3\)/)
    expect(css.toast).toMatch(/\.gcu-toast-viewport\{[^}]*z-index:var\(--gcu-z-toast\)/)
  })

  test('respeta reduced-motion', () => {
    expect(css.toast).toMatch(/prefers-reduced-motion:reduce\)\{[^@]*\.gcu-toast[^}]*animation:none/)
  })

  test('las reglas viejas salieron de grancrm-ui.css', () => {
    expect(glue).not.toContain('@keyframes gcu-toast-in')
    expect(glue).not.toMatch(/(^|\n)\.gcu-toast\{/)
  })
})

describe('Modal y Dropdown', () => {
  test('modal: elevación 4, radio xl, entrada con gcu-enter y reduced-motion', () => {
    expect(css.modal).toMatch(/\.modal-content\{[^}]*border-radius:var\(--gcu-radius-xl\)[^}]*box-shadow:var\(--gcu-shadow-4\)/)
    expect(css.modal).toMatch(/\.gcu-modal-dialog\{[^}]*animation:gcu-enter var\(--gcu-duration-base\) var\(--gcu-ease-enter\)/)
    expect(css.modal).toMatch(/prefers-reduced-motion:reduce\)\{[^@]*\.gcu-modal-dialog[^}]*animation:none/)
  })

  test('dropdown: elevación 3, radio lg; frecuente = instantáneo (entrada ≤ 100 ms, ítems sin transición)', () => {
    expect(css.dropdown).toMatch(/\.dropdown-menu\{[^}]*border-radius:var\(--gcu-radius-lg\)[^}]*box-shadow:var\(--gcu-shadow-3\)/)
    expect(css.dropdown).toMatch(/\.dropdown-menu\.show\{animation:gcu-enter var\(--gcu-duration-instant\) var\(--gcu-ease-enter\)/)
    expect(css.dropdown).toMatch(/\.dropdown-item\{[^}]*transition:none/)
    expect(css.dropdown).toMatch(/\.dropdown-item\{[^}]*border-radius:max\(0px,calc\(var\(--gcu-radius-lg\) - /)
    expect(css.dropdown).toMatch(/prefers-reduced-motion:reduce\)\{[^@]*\.dropdown-menu\.show[^}]*animation:none/)
  })
})

describe('Estados vacío, error y carga', () => {
  test('ícono en superficie suave, título balanceado y explicación de una línea con ancho de lectura', () => {
    expect(css['feedback-state']).toMatch(/\.gcu-state__icon\{[^}]*background:var\(--gcu-surface-subtle\)/)
    expect(css['feedback-state']).toMatch(/\.gcu-state__title\{[^}]*text-wrap:balance/)
    expect(css['feedback-state']).toMatch(/\.gcu-state__message\{[^}]*max-width:/)
    expect(css['feedback-state']).toMatch(/\.gcu-state--error \.gcu-state__icon\{[^}]*var\(--gcu-danger-soft\)/)
  })

  test('card-loader cubre la card con la superficie del tema, sin override oscuro en SCSS', () => {
    expect(css['card-loader']).toMatch(/\.card-loader\{[^}]*background:color-mix\(in srgb,var\(--gcu-surface\)/)
    expect(read('scss/themes/options/_theme-options-dark-theme.scss')).not.toContain('.card-loader')
  })
})
