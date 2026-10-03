import { afterEach, describe, expect, test } from 'vitest'
import { getChartTheme, APEX_CHART_THEME } from '../src/components/charts/chartPalette'
import { buildApexOptions, readAmbientChartTheme } from '../src/components/charts/chartTheme'

afterEach(() => {
  document.documentElement.removeAttribute('data-gcu-theme')
  document.documentElement.classList.remove('app-skin-dark')
})

describe('charts en tema navy', () => {
  test('Recharts usa superficies navy, no las gris-negro', () => {
    const theme = getChartTheme('navy')
    expect(theme.mode).toBe('navy')
    expect(theme.background).toBe('#121a2d')
    expect(theme.surface).toBe('#1d2a45')
  })

  test('Apex recibe colores navy y modo dark (Apex solo conoce light/dark)', () => {
    const options = buildApexOptions({ type: 'line', height: 200, mode: 'navy', options: {} })
    expect(options.chart.background).toBe(APEX_CHART_THEME.navy.background)
    expect(options.theme.mode).toBe('dark')
  })

  test('el documento en navy se lee como navy aunque también lleve .app-skin-dark', () => {
    document.documentElement.setAttribute('data-gcu-theme', 'navy')
    document.documentElement.classList.add('app-skin-dark')
    expect(readAmbientChartTheme({ current: null })).toBe('navy')
  })
})
