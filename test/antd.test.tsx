import { act, render, screen } from '@testing-library/react'
import { theme as antdTheme } from 'antd'
import { describe, expect, test } from 'vitest'
import { ThemeProvider } from '../src/theme/ThemeProvider'
import { antdConfigFor, DatePicker, DateRangeFilter, DuraluxAntdProvider, FileDrop, RangePicker, TreeSelect, Cascader, dateRangePresets } from '../src/antd'

describe('@duralux/ui/antd', () => {
  test('la configuración usa el algoritmo oscuro en dark y navy, y los tokens del tema', () => {
    const light = antdConfigFor('light')
    const navy = antdConfigFor('navy')
    expect(light.algorithm).toBe(antdTheme.defaultAlgorithm)
    expect(navy.algorithm).toBe(antdTheme.darkAlgorithm)
    expect(navy.token.colorBgContainer).toBe('#0f172a')
    expect(light.token.controlHeight).toBe(36)
  })

  test('los popups de antd quedan sobre los modales Duralux (z-index)', () => {
    expect(antdConfigFor('light').token.zIndexPopupBase).toBeGreaterThan(1055)
  })

  test('el provider sigue al ThemeProvider (resolved) y aplica locale español', () => {
    render(
      <ThemeProvider enableResponsiveMini={false}>
        <DuraluxAntdProvider><DatePicker /></DuraluxAntdProvider>
      </ThemeProvider>,
    )
    expect(screen.getByPlaceholderText('Selecciona una fecha')).toBeInTheDocument()
  })

  test('sin ThemeProvider sigue a data-gcu-theme de <html> (satélite en el shell) y reacciona al cambio', async () => {
    const Probe = () => <span data-testid="bg">{antdTheme.useToken().token.colorBgContainer}</span>
    document.documentElement.setAttribute('data-gcu-theme', 'dark')
    render(<DuraluxAntdProvider><Probe /></DuraluxAntdProvider>)
    expect(screen.getByTestId('bg').textContent).toBe(antdConfigFor('dark').token.colorBgContainer)
    await act(async () => { document.documentElement.setAttribute('data-gcu-theme', 'navy') })
    expect(screen.getByTestId('bg').textContent).toBe('#0f172a')
    document.documentElement.removeAttribute('data-gcu-theme')
  })

  test('RangePicker con placeholders Desde / Hasta', () => {
    render(<DuraluxAntdProvider theme="light"><RangePicker /></DuraluxAntdProvider>)
    expect(screen.getByPlaceholderText('Desde')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Hasta')).toBeInTheDocument()
  })

  test('DateRangeFilter ofrece presets en español', () => {
    expect(dateRangePresets().map(p => p.label)).toEqual(['Hoy', 'Últimos 7 días', 'Últimos 30 días', 'Este mes', 'Mes anterior'])
    render(<DuraluxAntdProvider theme="light"><DateRangeFilter /></DuraluxAntdProvider>)
    expect(screen.getByPlaceholderText('Desde')).toBeInTheDocument()
  })

  test('TreeSelect, Cascader y FileDrop con textos en español', () => {
    render(
      <DuraluxAntdProvider theme="light">
        <TreeSelect treeData={[{ title: 'Ventas', value: 'v' }]} />
        <Cascader options={[{ label: 'Chile', value: 'cl' }]} />
        <FileDrop />
      </DuraluxAntdProvider>,
    )
    expect(screen.getAllByText('Selecciona una opción')).toHaveLength(2)
    expect(screen.getByText('Arrastra archivos aquí o haz clic para elegirlos')).toBeInTheDocument()
  })
})

describe('@duralux/ui/antd — accesibilidad', () => {
  test('placeholders, deshabilitados y descripciones usan roles de texto con contraste AA', () => {
    for (const theme of ['light', 'dark', 'navy'] as const) {
      const token = antdConfigFor(theme).token
      expect(token.colorTextPlaceholder).toMatch(/^#[0-9a-f]{6}$/)
      expect(token.colorTextDisabled).toBe(token.colorTextPlaceholder)
      expect(token.colorTextDescription).toBe(token.colorTextSecondary)
    }
  })

  test('TreeSelect y Cascader dan nombre accesible a su buscador (aria-label = placeholder)', () => {
    render(
      <DuraluxAntdProvider theme="light">
        <TreeSelect treeData={[{ title: 'Ventas', value: 'v' }]} placeholder="Área" />
        <Cascader options={[{ label: 'Chile', value: 'cl' }]} placeholder="Región" />
      </DuraluxAntdProvider>,
    )
    expect(screen.getByRole('combobox', { name: 'Área' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Región' })).toBeInTheDocument()
  })
})
