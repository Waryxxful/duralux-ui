import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, test } from 'vitest'

const root = process.cwd()
const chart = readFileSync(resolve(root, 'src/styles/components/chart.css'), 'utf8')
const glue = readFileSync(resolve(root, 'src/styles/grancrm-ui.css'), 'utf8')
const darkScss = readFileSync(resolve(root, 'scss/themes/options/_theme-options-dark-theme.scss'), 'utf8')

describe('CSS de gráficos (src/styles/components/chart.css)', () => {
  test('solo tokens: sin hex, sin prioridad forzada ni overrides de tema', () => {
    expect(chart).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
    expect(chart).not.toContain('!important')
    expect(chart).not.toContain('.app-skin-dark')
    expect(chart).not.toContain('data-gcu-theme')
  })

  test('se importa desde grancrm-ui.css y las reglas viejas ya no están ahí ni en el SCSS oscuro', () => {
    expect(glue).toContain('@import "./components/chart.css";')
    expect(glue).not.toContain('.recharts-wrapper{')
    expect(darkScss).not.toMatch(/apexcharts/)
    expect(darkScss).not.toMatch(/radar-(fill|stroke)/)
  })

  test('ejes en --gcu-muted y grilla sutil en --gcu-border', () => {
    expect(chart).toMatch(/\.recharts-cartesian-axis-tick-value\{fill:var\(--gcu-muted\)/)
    expect(chart).toMatch(/\.recharts-cartesian-grid line\{stroke:var\(--gcu-border\)\}/)
  })

  test('tooltips con superficie elevada y cifras tabulares (Recharts y Apex)', () => {
    const tooltip = chart.match(/\.gcu-chart-tooltip\{[^}]*\}/)?.[0] ?? ''
    expect(tooltip).toContain('background:var(--gcu-surface-raised)')
    expect(tooltip).toContain('box-shadow:var(--gcu-shadow-3)')
    expect(chart).toMatch(/\.gcu-chart-tooltip__value\{[^}]*tabular-nums/)
    const apex = chart.match(/\.apexcharts-canvas \.apexcharts-tooltip:is\([^)]*\)\{[^}]*\}/)?.[0] ?? ''
    expect(apex).toContain('var(--gcu-surface-raised)')
    expect(apex).toContain('tabular-nums')
  })

  test('leyenda con forma: línea, línea punteada, cuadrado y círculo', () => {
    expect(chart).toContain('.gcu-chart-legend__mark--line{')
    expect(chart).toContain('.gcu-chart-legend__mark--dashed{border-top-style:dashed}')
    expect(chart).toContain('.gcu-chart-legend__mark--circle{')
  })

  test('entrada animada con tokens de movimiento (reduced-motion los lleva a 0) y respuesta al contenedor', () => {
    expect(chart).toMatch(/animation:gcu-enter var\(--gcu-duration-[a-z]+\) var\(--gcu-ease-enter\)/)
    expect(chart).toMatch(/@container \(min-width:\d+rem\)/)
    expect(chart).not.toMatch(/@media \((min|max)-width/)
  })
})
