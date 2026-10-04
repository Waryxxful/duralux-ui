import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, test } from 'vitest'

// CSS propio del lote L5 (Tablas): tokens, sin deuda y sin reglas viejas duplicadas.
const root = process.cwd()
const read = (path: string) => readFileSync(resolve(root, path), 'utf8')
const glue = read('src/styles/grancrm-ui.css')
const table = read('src/styles/components/table.css')
const pagination = read('src/styles/components/pagination.css')
const tableScss = read('scss/themes/components/_table.scss')
const darkScss = read('scss/themes/options/_theme-options-dark-theme.scss')

describe('CSS por componente del lote L5', () => {
  test.each(['table', 'pagination'])('grancrm-ui.css importa %s.css', (name) => {
    expect(glue).toContain(`@import "./components/${name}.css";`)
  })

  test.each([['table', table], ['pagination', pagination]])('%s.css sin deuda: 0 !important, 0 hex, 0 overrides de tema', (_name, css) => {
    expect(css).not.toMatch(/!important|#[0-9a-f]{3,8}\b|app-skin-dark|data-gcu-theme/i)
  })
})

describe('Table', () => {
  test('Bootstrap pinta las celdas desde tokens: color, borde y hover de fila', () => {
    expect(table).toMatch(/\.table\{[^}]*--bs-table-color:var\(--gcu-muted\)/)
    expect(table).toMatch(/\.table\{[^}]*--bs-table-border-color:var\(--gcu-border\)/)
    expect(table).toMatch(/\.table\{[^}]*--bs-table-hover-bg:var\(--gcu-table-row-hover\)/)
  })

  test('DX-039: controles y texto centrados en la misma fila, con o sin .table-responsive', () => {
    expect(table).toMatch(/(^|\n)\.table\{[^}]*vertical-align:middle/)
  })

  test('DX-040: sin rayado; ninguna regla de filas pares/impares', () => {
    expect(table).not.toMatch(/nth-(of-type|child)/)
    expect(darkScss).not.toMatch(/tr:nth-of-type\(odd\)/)
    expect(darkScss).not.toContain('<---------------! Table !--------------->')
  })

  test('encabezado en mayúsculas pequeñas con tracking de mayúsculas, sin peso 700', () => {
    expect(table).toMatch(/\.table>thead>tr>th[^{]*\{[^}]*text-transform:uppercase[^}]*letter-spacing:var\(--gcu-tracking-caps\)/)
    expect(table).toMatch(/\.table>thead>tr>th[^{]*\{[^}]*font-size:var\(--gcu-font-size-2xs\)/)
    expect(table).not.toMatch(/font-weight:700/)
  })

  test('filas de altura consistente y densidades', () => {
    expect(table).toMatch(/\.table>tbody>tr>\*\{[^}]*height:var\(--gcu-table-row-h\)/)
    expect(table).toMatch(/\.gcu-table--compact\{[^}]*--gcu-table-row-h:var\(--gcu-space-10\)/)
    expect(table).toMatch(/\.gcu-table--comfortable\{[^}]*--gcu-table-row-h:/)
  })

  test('hover de fila instantáneo: la tabla no declara transiciones', () => {
    expect(table).not.toMatch(/transition:(?!none)/)
  })

  test('scroll horizontal dentro del contenedor; encabezado fijo con sombra solo al hacer scroll', () => {
    expect(table).toMatch(/\.gcu-table-scroll\{[^}]*overflow-x:auto/)
    expect(table).toMatch(/\.gcu-table-scroll--sticky>\.table>thead>tr>th\{[^}]*position:sticky/)
    expect(table).toMatch(/\.gcu-table-scroll--sticky\[data-scrolled="true"\]>\.table>thead>tr>th\{[^}]*box-shadow/)
  })

  test('la barra de la tabla responde a su contenedor, no al viewport', () => {
    expect(table).toMatch(/\.data-table-toolbar\{[^}]*container-type:inline-size/)
    expect(table).toMatch(/@container \(max-width: 36rem\)/)
    expect(glue).not.toMatch(/\.data-table-toolbar/)
  })

  test('grancrm-ui.css y el SCSS ya no traen las reglas viejas de tablas ni sus overrides de oscuro', () => {
    expect(glue).not.toMatch(/\.gcu-table[{ ,.:_-]|\.gcu-table--|\.gcu-table__/)
    expect(glue).not.toMatch(/\.gcu-table-actions/)
    expect(glue).not.toMatch(/\.table-auto-width/)
    expect(glue).not.toMatch(/data-gcu-theme="(dark|navy)"\] \.table|data-gcu-theme="light"\] \.table/)
    expect(glue).not.toMatch(/tr:last-child \.btn/)
    expect(tableScss).not.toMatch(/\.table-responsive \{\s*\.table \{/)
    expect(darkScss).not.toMatch(/\n\t\t\.table[ ,{]/)
  })

  test('las clases de acciones que usan las apps siguen existiendo', () => {
    expect(table).toMatch(/\.gcu-table-actions-cell/)
    expect(table).toMatch(/\.gcu-table-actions\{/)
    expect(table).toMatch(/\.table-auto-width\{width:auto\}/)
  })
})

describe('Pagination', () => {
  test('Bootstrap pinta la paginación desde tokens; la página actual con primary', () => {
    expect(pagination).toMatch(/\.pagination\{[^}]*--bs-pagination-color:var\(--gcu-text\)/)
    expect(pagination).toMatch(/\.pagination\{[^}]*--bs-pagination-active-bg:var\(--gcu-primary\)/)
    expect(pagination).toMatch(/\.pagination\{[^}]*--bs-pagination-active-color:var\(--gcu-on-primary\)/)
  })

  test('botones de 32 px con números tabulares y hover instantáneo solo con puntero', () => {
    expect(pagination).toMatch(/\.page-link\{[^}]*height:var\(--gcu-control-h-sm\)/)
    expect(pagination).toMatch(/\.page-link\{[^}]*min-width:var\(--gcu-control-h-sm\)/)
    expect(pagination).toMatch(/\.page-link\{[^}]*font-variant-numeric:tabular-nums/)
    expect(pagination).toMatch(/\.page-link\{[^}]*transition:none/)
    expect(pagination).toMatch(/@media \(hover:hover\)\{\.pagination\{--bs-pagination-hover-bg:/)
  })

  test('grancrm-ui.css y el SCSS oscuro ya no traen la paginación vieja', () => {
    expect(glue).not.toMatch(/\.gcu-pagination/)
    expect(darkScss).not.toMatch(/--bs-pagination-/)
  })
})
