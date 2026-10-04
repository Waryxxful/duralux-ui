import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, test, vi } from 'vitest'

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
  AreaChart: ({ children }) => <svg>{children}</svg>,
  Area: ({ dataKey, stroke, fill }) => (
    <path data-testid="area" data-series={dataKey} data-stroke={stroke} fill={fill} />
  ),
  LineChart: ({ children }) => <svg>{children}</svg>,
  Line: ({ dataKey, stroke }) => <path data-testid="line" data-series={dataKey} data-stroke={stroke} />,
  BarChart: ({ children }) => <svg>{children}</svg>,
  Bar: ({ dataKey, fill }) => <rect data-testid="bar" data-series={dataKey} data-fill={fill} />,
  PieChart: ({ children }) => <svg>{children}</svg>,
  Pie: ({ children }) => <g data-testid="pie">{children}</g>,
  Cell: ({ fill }) => <path data-testid="cell" data-fill={fill} />,
  XAxis: ({ tick, axisLine, tickLine }) => (
    <g
      data-testid="x-axis"
      data-tick-fill={tick?.fill}
      data-axis-line={String(axisLine)}
      data-tick-line={String(tickLine)}
    />
  ),
  YAxis: ({ tick }) => <g data-testid="y-axis" data-tick-fill={tick?.fill} />,
  CartesianGrid: ({ stroke }) => <g data-testid="grid" data-stroke={stroke} />,
  Tooltip: ({ contentStyle }) => (
    <g
      data-testid="tooltip"
      data-background={contentStyle?.background}
      data-color={contentStyle?.color}
      data-border={contentStyle?.border}
    />
  ),
  Legend: ({ wrapperStyle }) => <g data-testid="legend" data-color={wrapperStyle?.color} />,
}))

vi.mock('react-apexcharts', () => ({
  default: ({ options }) => (
    <div data-testid="apex-chart" data-options={JSON.stringify(options)} />
  ),
}))

import { ApexChart } from '../src/components/charts/ApexChart'
import { AreaChartWidget } from '../src/components/charts/AreaChartWidget'
import { BarChartWidget } from '../src/components/charts/BarChartWidget'
import { ChartCard } from '../src/components/charts/ChartCard'
import { LineChartWidget } from '../src/components/charts/LineChartWidget'
import { PieChartWidget } from '../src/components/charts/PieChartWidget'
import {
  ApexDataTable,
  PieDataTable,
  RechartsDataTable,
} from '../src/components/charts/chartA11y'
import { CHART_DARK_PALETTE } from '../src/components/charts/chartPalette.js'

// DX-031: ApexChart carga react-apexcharts de forma diferida y resuelve el tema en un
// efecto. Las aserciones sobre sus opciones van dentro de la espera (sin tiempos fijos):
// se reintentan hasta que el motor montó con el tema ya resuelto.
async function waitForApexOptions(assertion, index = 0) {
  let options
  await waitFor(() => {
    options = JSON.parse(screen.getAllByTestId('apex-chart')[index].dataset.options)
    assertion(options)
  }, { timeout: 5000 })
  return options
}

afterEach(() => {
  document.documentElement.classList.remove('app-skin-dark')
  document.documentElement.removeAttribute('data-gcu-theme')
})

test('uses the central Duralux palette when Recharts colors are omitted', () => {
  const data = [{ name: 'Ene', ventas: 10, gastos: 4 }]

  const { unmount } = render(
    <LineChartWidget
      data={data}
      series={[{ key: 'ventas' }, { key: 'gastos' }]}
    />,
  )

  expect(screen.getAllByTestId('line').map((line) => line.dataset.stroke)).toEqual([
    'var(--gcu-primary, #3454d1)',
    'var(--gcu-success, #17c666)',
  ])
  unmount()

  render(<PieChartWidget data={[{ name: 'Orgánico', value: 12 }, { name: 'Referido', value: 8 }]} />)
  expect(screen.getAllByTestId('cell').map((cell) => cell.dataset.fill)).toEqual([
    'var(--gcu-primary, #3454d1)',
    'var(--gcu-success, #17c666)',
  ])
})

function relativeLuminance(hex) {
  const channels = hex.slice(1).match(/.{2}/g).map((channel) => parseInt(channel, 16) / 255)
  const linear = channels.map((channel) => (
    channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  ))
  return (0.2126 * linear[0]) + (0.7152 * linear[1]) + (0.0722 * linear[2])
}

function contrastRatio(first, second) {
  const [light, dark] = [relativeLuminance(first), relativeLuminance(second)].sort((a, b) => b - a)
  return (light + 0.05) / (dark + 0.05)
}

test('uses the literal accessible dark chart palette across Recharts and Apex', async () => {
  document.documentElement.dataset.gcuTheme = 'light'
  const expectedSeries = CHART_DARK_PALETTE
  const expectedText = '#f5f7ff'
  const expectedMuted = '#8b8d98'
  const expectedBorder = '#3a3b42'
  const expectedSurface = '#17181d'

  document.documentElement.dataset.gcuTheme = 'dark'
  render(
    <>
      <LineChartWidget
        ariaLabel="Oscuro"
        data={[{ name: 'Ene', ventas: 10, gastos: 4 }]}
        series={[{ key: 'ventas' }, { key: 'gastos' }]}
      />
      <ApexChart
        ariaLabel="Apex oscuro"
        series={[{ name: 'Ventas', data: [10] }]}
      />
    </>,
  )

  await waitFor(() => expect(screen.getAllByTestId('line')[0]).toHaveAttribute('data-stroke', expectedSeries[0]))
  expect(screen.getAllByTestId('line').map((line) => line.dataset.stroke)).toEqual(expectedSeries.slice(0, 2))
  expect(screen.getByTestId('x-axis')).toHaveAttribute('data-tick-fill', expectedMuted)
  expect(screen.getByTestId('y-axis')).toHaveAttribute('data-tick-fill', expectedMuted)
  expect(screen.getByTestId('grid')).toHaveAttribute('data-stroke', expectedBorder)
  expect(screen.getByTestId('legend')).toHaveAttribute('data-color', expectedText)
  expect(screen.getByTestId('tooltip')).toHaveAttribute('data-background', expectedSurface)
  expect(screen.getByTestId('tooltip')).toHaveAttribute('data-color', expectedText)
  expect(screen.getByTestId('tooltip')).toHaveAttribute('data-border', `1px solid ${expectedBorder}`)

  const apexOptions = await waitForApexOptions((options) => expect(options.colors).toEqual(expectedSeries))
  expect(apexOptions.chart.foreColor).toBe(expectedText)
  expect(apexOptions.grid.borderColor).toBe(expectedBorder)
  expect(apexOptions.xaxis.labels.style.colors).toBe(expectedMuted)
  expect(apexOptions.tooltip.style).toBeUndefined()

  expectedSeries.forEach((color) => expect(contrastRatio(color, '#0e0f12')).toBeGreaterThanOrEqual(3))
  expect(contrastRatio(expectedText, '#0e0f12')).toBeGreaterThanOrEqual(4.5)
  expect(contrastRatio(expectedMuted, '#0e0f12')).toBeGreaterThanOrEqual(4.5)
  expect(contrastRatio(expectedBorder, '#0e0f12')).toBeGreaterThanOrEqual(1.5)
})

test('resolves dark colors for every Recharts widget while preserving custom series colors', async () => {
  document.documentElement.dataset.gcuTheme = 'dark'
  render(
    <>
      <AreaChartWidget
        data={[{ name: 'Ene', ventas: 10 }]}
        series={[{ key: 'ventas' }]}
      />
      <BarChartWidget
        data={[{ name: 'Ene', ventas: 10, gastos: 4 }]}
        series={[{ key: 'ventas', color: '#123456' }, { key: 'gastos' }]}
      />
      <PieChartWidget data={[{ name: 'Ventas', value: 10 }, { name: 'Gastos', value: 4 }]} />
    </>,
  )

  await waitFor(() => expect(screen.getByTestId('area')).toHaveAttribute('data-stroke', '#8ea7ff'))
  expect(screen.getAllByTestId('area')[0]).toHaveAttribute('data-stroke', '#8ea7ff')
  expect(screen.getAllByTestId('bar').map((bar) => bar.dataset.fill)).toEqual(['#123456', '#55e899'])
  expect(screen.getAllByTestId('cell').map((cell) => cell.dataset.fill)).toEqual(['#8ea7ff', '#55e899'])
  expect(screen.getAllByTestId('tooltip').every((tooltip) => tooltip.dataset.background === '#17181d')).toBe(true)
})

test('renders primitive Recharts values with stable table headers', () => {
  render(<RechartsDataTable title="Valores primitivos" data={[10, 20]} />)

  const table = screen.getByRole('table', { name: 'Valores primitivos' })
  expect(within(table).getAllByRole('columnheader').map((header) => header.textContent)).toEqual([
    'Categoría',
    'Valor',
  ])
  expect(within(table).getAllByRole('rowheader').map((header) => header.textContent)).toEqual(['1', '2'])
  expect(within(table).getAllByRole('cell').map((cell) => cell.textContent)).toEqual(['10', '20'])
  const headers = within(table).getAllByRole('columnheader').map((header) => header.id)
  expect(new Set(headers).size).toBe(headers.length)
  expect(headers.every(Boolean)).toBe(true)
})

test('keeps values from mixed Apex series in a stable matrix', () => {
  render(
    <ApexDataTable
      title="Series mixtas"
      options={{ xaxis: { categories: ['Ene', 'Feb'] } }}
      series={[
        { name: 'Ventas', data: [{ x: 'Ene', y: 10 }, { x: 'Feb', y: 20 }] },
        [30, 40],
        { name: 'Punto', data: { x: 'Ene', y: 5 } },
      ]}
    />,
  )

  const table = screen.getByRole('table', { name: 'Series mixtas' })
  expect(table).toHaveTextContent('Ventas')
  expect(table).toHaveTextContent('Serie 2')
  expect(table).toHaveTextContent('Punto')
  expect(table).toHaveTextContent('10')
  expect(table).toHaveTextContent('20')
  expect(table).toHaveTextContent('30')
  expect(table).toHaveTextContent('40')
  expect(table).toHaveTextContent('5')
  expect(table).toHaveTextContent('Ene')
  expect(table).toHaveTextContent('Feb')
})

test('does not execute hostile table data getters', () => {
  const hostileRow = {}
  Object.defineProperties(hostileRow, {
    name: {
      enumerable: true,
      get() {
        throw new Error('name getter should not run')
      },
    },
    ventas: {
      enumerable: true,
      get() {
        throw new Error('value getter should not run')
      },
    },
  })
  const hostileSeries = {}
  Object.defineProperties(hostileSeries, {
    name: {
      enumerable: true,
      get() {
        throw new Error('series name getter should not run')
      },
    },
    data: {
      enumerable: true,
      get() {
        throw new Error('series data getter should not run')
      },
    },
  })

  expect(() => render(
    <>
      <RechartsDataTable data={[hostileRow]} />
      <ApexDataTable series={[hostileSeries]} />
    </>,
  )).not.toThrow()
})

test('exposes an accessible name, description and tabular alternative', () => {
  render(
    <LineChartWidget
      ariaLabel="Ventas mensuales"
      title="Ventas"
      description="Comparación de ventas por mes"
      data={[{ name: 'Ene', ventas: 10 }]}
      series={[{ key: 'ventas', label: 'Ventas' }]}
    />,
  )

  // DX-004: la figura (no un role="img") lleva nombre y descripción.
  const chart = screen.getByRole('figure', { name: 'Ventas mensuales' })
  expect(chart).toHaveAttribute('aria-describedby')
  expect(screen.getByText('Comparación de ventas por mes')).toBeInTheDocument()
  expect(screen.getByRole('table')).toHaveTextContent('Ventas')
  expect(screen.getByRole('table')).toHaveTextContent('10')
})

test('keeps visual, table, live state and retry controls as sibling trees', async () => {
  const user = userEvent.setup()
  const onRetry = vi.fn()
  const { rerender } = render(
    <LineChartWidget
      ariaLabel="Ventas"
      data={[{ name: 'Ene', ventas: 10 }]}
      series={[{ key: 'ventas', label: 'Ventas' }]}
      loading
    />,
  )

  // DX-004: estados y reintento viven en la figura; nada queda bajo un role="img".
  const figure = screen.getByRole('figure', { name: 'Ventas' })
  const status = screen.getByRole('status')
  expect(status.closest('[role="img"]')).toBeNull()
  expect(screen.queryByRole('img')).not.toBeInTheDocument()
  expect(figure).toContainElement(status)
  expect(screen.queryByRole('table')).not.toBeInTheDocument()

  rerender(
    <LineChartWidget
      ariaLabel="Ventas"
      data={[{ name: 'Ene', ventas: 10 }]}
      series={[{ key: 'ventas', label: 'Ventas' }]}
      error="No se pudo cargar"
      onRetry={onRetry}
    />,
  )
  const retry = screen.getByRole('button', { name: /Reintentar/i })
  expect(retry.closest('[role="img"]')).toBeNull()
  await user.click(retry)
  expect(onRetry).toHaveBeenCalledOnce()
})

test('accessibleTable={true} selects the generated table while a node remains a custom alternative', () => {
  const { rerender } = render(
    <LineChartWidget
      ariaLabel="Ventas"
      accessibleTable
      data={[{ name: 'Ene', ventas: 10 }]}
      series={[{ key: 'ventas' }]}
    />,
  )

  expect(screen.getByRole('table')).toBeInTheDocument()
  rerender(
    <LineChartWidget
      ariaLabel="Ventas"
      accessibleTable={<table><caption>Custom table</caption></table>}
      data={[{ name: 'Ene', ventas: 10 }]}
      series={[{ key: 'ventas' }]}
    />,
  )
  expect(screen.getByRole('table', { name: 'Custom table' })).toBeInTheDocument()
})

test('accessibleTable={false} removes the alternative without removing the visual name', () => {
  render(
    <LineChartWidget
      ariaLabel="Ventas"
      accessibleTable={false}
      data={[{ name: 'Ene', ventas: 10 }]}
      series={[{ key: 'ventas' }]}
    />,
  )

  expect(screen.getByRole('figure', { name: 'Ventas' })).toBeInTheDocument()
  expect(screen.queryByRole('table')).not.toBeInTheDocument()
})

test('associates a ChartCard title with the chart and keeps explicit fallback renderable', () => {
  const { rerender } = render(
    <ChartCard title="Embudo de ventas">
      <LineChartWidget
        data={[{ name: 'Ene', ventas: 10 }]}
        series={[{ key: 'ventas' }]}
      />
    </ChartCard>,
  )

  const heading = screen.getByRole('heading', { name: 'Embudo de ventas' })
  const chart = screen.getByRole('figure', { name: 'Embudo de ventas' })
  expect(chart.getAttribute('aria-labelledby')).toContain(heading.id)

  rerender(
    <LineChartWidget
      data={[]}
      series={[{ key: 'ventas' }]}
      fallback={<p>Vista alternativa del gráfico</p>}
    />,
  )
  expect(screen.getByText('Vista alternativa del gráfico')).toBeInTheDocument()
  expect(screen.queryByText('Sin resultados')).not.toBeInTheDocument()
})

test('renders composable loading and error states with retry', async () => {
  const user = userEvent.setup()
  const onRetry = vi.fn()

  const { rerender } = render(
    <BarChartWidget
      loading
      ariaLabel="Ingresos"
      data={[]}
      series={[{ key: 'ingresos' }]}
    />,
  )
  expect(screen.getByRole('status')).toBeInTheDocument()
  expect(screen.getAllByText('Cargando...')).toHaveLength(1)
  expect(screen.queryByRole('table')).not.toBeInTheDocument()

  rerender(
    <BarChartWidget
      error="No se pudo cargar ingresos"
      onRetry={onRetry}
      data={[{ name: 'Ene', ingresos: 1 }]}
      series={[{ key: 'ingresos' }]}
    />,
  )
  expect(screen.getByText('No se pudo cargar ingresos')).toBeInTheDocument()
  expect(screen.getAllByRole('alert')).toHaveLength(1)
  await user.click(screen.getByRole('button', { name: /Reintentar/i }))
  expect(onRetry).toHaveBeenCalledOnce()
})

test('applies ambient Apex theme without mutating options and preserves caller precedence', async () => {
  document.documentElement.classList.add('app-skin-dark')
  const options = {
    chart: { toolbar: { show: false } },
    theme: { palette: 'palette2' },
    xaxis: { labels: { style: { colors: '#123456' } } },
  }
  const originalOptions = structuredClone(options)

  const { rerender } = render(
    <ApexChart
      options={options}
      series={[{ name: 'Ventas', data: [10] }]}
      ariaLabel="Ventas"
    />,
  )

  let resolved = await waitForApexOptions((options) => expect(options.theme.mode).toBe('dark'))
  expect(resolved.theme.palette).toBe('palette2')
  expect(resolved.xaxis.labels.style.colors).toBe('#123456')
  expect(resolved.colors[0]).toBe('#8ea7ff')
  expect(options).toEqual(originalOptions)

  rerender(
    <ApexChart
      options={{ theme: { mode: 'light' } }}
      theme="dark"
      series={[{ name: 'Ventas', data: [10] }]}
      ariaLabel="Ventas"
    />,
  )
  resolved = await waitForApexOptions((options) => expect(options.theme.mode).toBe('light'))
})

test('emits only valid Apex tooltip style fields while preserving caller options', async () => {
  const options = {
    tooltip: {
      style: {
        background: '#000',
        color: '#fff',
        fontSize: '12px',
      },
    },
  }
  const originalOptions = structuredClone(options)

  render(<ApexChart options={options} series={[{ name: 'Ventas', data: [10] }]} />)
  await waitForApexOptions((resolved) => expect(resolved.tooltip.style).toEqual({ fontSize: '12px' }))
  expect(options).toEqual(originalOptions)
})

test('resolves two local theme scopes independently', async () => {
  render(
    <>
      <div data-gcu-theme="light">
        <ApexChart ariaLabel="Claro" series={[{ name: 'Ventas', data: [10] }]} />
      </div>
      <div data-gcu-theme="dark">
        <ApexChart ariaLabel="Oscuro" series={[{ name: 'Ventas', data: [10] }]} />
      </div>
    </>,
  )

  await waitFor(() => expect(screen.getAllByTestId('apex-chart')).toHaveLength(2))
  const lightOptions = await waitForApexOptions((options) => expect(options.theme.mode).toBe('light'), 0)
  const darkOptions = await waitForApexOptions((options) => expect(options.theme.mode).toBe('dark'), 1)
  expect(lightOptions.chart.foreColor).not.toBe(darkOptions.chart.foreColor)
})

test('re-resolves a Recharts frame after moving it between theme scopes', async () => {
  const { rerender } = render(
    <div data-gcu-theme="light">
      <LineChartWidget
        data={[{ name: 'Ene', ventas: 10 }]}
        series={[{ key: 'ventas' }]}
      />
    </div>,
  )

  expect(screen.getByTestId('line')).toHaveAttribute('data-stroke', 'var(--gcu-primary, #3454d1)')

  rerender(
    <div data-gcu-theme="dark">
      <LineChartWidget
        data={[{ name: 'Ene', ventas: 10 }]}
        series={[{ key: 'ventas' }]}
      />
    </div>,
  )

  await waitFor(() => expect(screen.getByTestId('line')).toHaveAttribute('data-stroke', '#8ea7ff'))
})

test('explicit Apex theme beats the nearest scope', async () => {
  render(
    <div data-gcu-theme="light">
      <ApexChart
        ariaLabel="Forzado oscuro"
        theme="dark"
        series={[{ name: 'Ventas', data: [10] }]}
      />
    </div>,
  )

  await waitForApexOptions((options) => expect(options.theme.mode).toBe('dark'))
})

test('tabular alternatives preserve captions, headers and x/y points', () => {
  render(
    <>
      <RechartsDataTable
        title="Puntos Recharts"
        data={[{ x: 'Ene', y: 10 }]}
      />
      <PieDataTable
        title="Puntos Pie"
        data={[{ x: 'Referido', y: 8 }]}
      />
      <ApexDataTable
        title="Puntos Apex"
        options={{ xaxis: { categories: ['Ene'] } }}
        series={[{ name: 'Ventas', data: [{ x: 'Ene', y: 10 }] }]}
      />
    </>,
  )

  const tables = screen.getAllByRole('table')
  expect(tables).toHaveLength(3)
  expect(within(tables[0]).getByRole('caption')).toHaveTextContent('Puntos Recharts')
  expect(within(tables[0]).getByRole('columnheader', { name: 'Categoría' })).toBeInTheDocument()
  expect(tables[0]).toHaveTextContent('Ene')
  expect(tables[0]).toHaveTextContent('10')
  expect(tables[1]).toHaveTextContent('Referido')
  expect(tables[1]).toHaveTextContent('8')
  expect(tables[2]).toHaveTextContent('Ventas')
  expect(tables[2]).toHaveTextContent('Ene')
})
