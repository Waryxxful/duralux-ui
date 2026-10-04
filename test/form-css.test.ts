import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import * as sass from 'sass'
import { describe, expect, test } from 'vitest'

const root = process.cwd()
const read = (file: string) => readFileSync(resolve(root, 'src/styles/components', file), 'utf8')
const files = ['form-control.css', 'form-check.css', 'input-group.css', 'form-field.css', 'select.css']
const control = read('form-control.css')
const check = read('form-check.css')
const group = read('input-group.css')
const field = read('form-field.css')
const select = read('select.css')
const glue = readFileSync(resolve(root, 'src/styles/grancrm-ui.css'), 'utf8')

const sassOptions = {
  loadPaths: [resolve(root, 'scss')],
  silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'abs-percent'] as const,
}

describe('CSS de formularios (src/styles/components/*)', () => {
  test('grancrm-ui.css importa cada archivo, así los consumidores no cambian sus imports', () => {
    for (const file of files) expect(glue).toContain(`@import "./components/${file}";`)
  })

  test('alturas 32/36/40 alineadas con los botones', () => {
    expect(control).toMatch(/\.form-control,\.form-select\{[^}]*min-height:var\(--gcu-control-h-md\)/)
    expect(control).toMatch(/\.form-control-sm,\.form-select-sm[^{]*\{[^}]*min-height:var\(--gcu-control-h-sm\)/)
    expect(control).toMatch(/\.form-control-lg,\.form-select-lg[^{]*\{[^}]*min-height:var\(--gcu-control-h-lg\)/)
    expect(group).toMatch(/\.input-group-text\{[^}]*min-height:var\(--gcu-control-h-md\)/)
  })

  test('superficie, texto y borde salen de tokens (sirven en claro, oscuro, navy y ThemeScope)', () => {
    expect(control).toMatch(/\.form-control,\.form-select\{[^}]*background-color:var\(--gcu-surface\)[^}]*/)
    expect(control).toMatch(/\.form-control,\.form-select\{[^}]*color:var\(--gcu-text\)/)
    expect(control).toContain('.form-control::placeholder{color:var(--gcu-text-subtle)')
  })

  test('foco: anillo único solo con :focus-visible; hover solo con puntero e instantáneo', () => {
    expect(control).toContain('.form-control:focus-visible,.form-select:focus-visible{box-shadow:var(--gcu-focus-ring)}')
    expect(check).toContain('.form-check-input:focus-visible{box-shadow:var(--gcu-focus-ring)}')
    expect(control).toMatch(/@media \(hover:hover\)\{\.form-control:hover/)
    expect(control).toMatch(/\.form-control,\.form-select\{[^}]*transition:none/)
  })

  test('estados error, deshabilitado y solo lectura explícitos', () => {
    expect(control).toContain('.form-control.is-invalid,.form-select.is-invalid{border-color:var(--gcu-status-danger)}')
    expect(control).toMatch(/\.form-control:disabled,\.form-select:disabled\{[^}]*cursor:not-allowed/)
    expect(control).toMatch(/\.form-control\[readonly\]\{/)
    expect(field).toContain('.invalid-feedback{color:var(--gcu-status-danger)}')
    expect(check).toMatch(/\.form-check-input\.is-invalid~\.form-check-label[^{]*\{color:var\(--gcu-status-danger\)/)
  })

  test('DX-010: el botón nativo de FileInput usa la superficie del tema', () => {
    expect(control).toMatch(/\.form-control::file-selector-button\{[^}]*background-color:var\(--gcu-surface-sunken\)[^}]*color:var\(--gcu-text\)/)
  })

  test('listbox: capa de dropdown por token y radio anidado en las opciones', () => {
    expect(select).toMatch(/\.gcu-select__listbox\{[^}]*z-index:var\(--gcu-z-dropdown\)/)
    expect(select).toMatch(/\.gcu-select__option\{[^}]*border-radius:max\(0px,calc\(var\(--gcu-radius-lg\) - var\(--gcu-space-1\)\)\)/)
  })

  test('sin deuda: 0 !important, 0 hex, 0 overrides de tema en los archivos nuevos', () => {
    for (const file of files) expect(read(file)).not.toMatch(/!important|#[0-9a-f]{3,8}\b|app-skin-dark/i)
  })

  test('la deuda vieja de formularios ya no vive en grancrm-ui.css', () => {
    expect(glue).not.toMatch(/\.gcu-select__input\{padding-right:64px!important/)
    expect(glue).not.toMatch(/\.gcu-theme\[data-gcu-theme="dark"\] \.form-control/)
    expect(glue).not.toMatch(/\.app-skin-dark \.gcu-select__listbox/)
    expect(glue).not.toMatch(/\.gcu-control\{/)
    // ThemeScope local: los controles leen tokens, ya no hace falta un puente por tema.
    expect(glue).not.toContain('.gcu-theme[data-gcu-theme="navy"] .form-control')
  })

  test('el tema Sass ya no fuerza foco, placeholder ni etiquetas de formulario con !important', () => {
    const form = sass.compileString(
      '@import "bootstrap/functions";\n@import "themes/variables";\n@import "themes/components/form";',
      sassOptions,
    ).css
    expect(form).not.toMatch(/\.form-control[^{]*\{[^}]*!important/)
    expect(form).not.toMatch(/\.form-label[^{]*\{[^}]*!important/)
    expect(form).not.toMatch(/::placeholder[^{]*\{[^}]*!important/)
  })
})
