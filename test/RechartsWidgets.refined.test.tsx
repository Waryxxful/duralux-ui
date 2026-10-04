import { createRef, isValidElement, cloneElement } from 'react'
import type * as React from 'react'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

// Recharts real necesita medidas de layout que jsdom no tiene: el mock renderiza
// el contenido personalizado de Legend/Tooltip con un payload fijo para probarlo.
const legendPayload = [
  { value: 'Ventas', color: '#123456', dataKey: 'ventas', type: 'line', payload: { strokeDasharray: '5 5' } },
  { value: 'Gastos', color: '#654321', dataKey: 'gastos', type: 'line', payload: {} },
]
const tooltipPayload = [
  { name: 'Ventas', value: 1240000, color: '#123456', dataKey: 'ventas' },
  { name: 'Gastos', value: 4.5, color: '#654321', dataKey: 'gastos' },
]
type ContentProps = { content?: React.ReactNode; isAnimationActive?: boolean; animationDuration?: number }
const renderContent = (content: React.ReactNode, extra: Record<string, unknown>) => (
  isValidElement(content) ? cloneElement(content, extra) : null
)

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
  AreaChart: ({ children }: { children: React.ReactNode }) => <svg>{children}</svg>,
  LineChart: ({ children }: { children: React.ReactNode }) => <svg>{children}</svg>,
  BarChart: ({ children }: { children: React.ReactNode }) => <svg>{children}</svg>,
  PieChart: ({ children }: { children: React.ReactNode }) => <svg>{children}</svg>,
  Area: ({ isAnimationActive, animationDuration }: ContentProps) => <path data-testid="mark" data-animated={String(isAnimationActive)} data-duration={animationDuration} />,
  Line: ({ isAnimationActive, animationDuration }: ContentProps) => <path data-testid="mark" data-animated={String(isAnimationActive)} data-duration={animationDuration} />,
  Bar: ({ isAnimationActive, animationDuration }: ContentProps) => <rect data-testid="mark" data-animated={String(isAnimationActive)} data-duration={animationDuration} />,
  Pie: ({ children, isAnimationActive, animationDuration }: ContentProps & { children: React.ReactNode }) => <g data-testid="mark" data-animated={String(isAnimationActive)} data-duration={animationDuration}>{children}</g>,
  Cell: () => <path />,
  XAxis: () => <g />,
  YAxis: () => <g />,
  CartesianGrid: ({ vertical }: { vertical?: boolean }) => <g data-testid="grid" data-vertical={String(vertical)} />,
  Tooltip: ({ content }: ContentProps) => <foreignObject>{renderContent(content, { active: true, label: 'Ene', payload: tooltipPayload })}</foreignObject>,
  Legend: ({ content }: ContentProps) => <foreignObject>{renderContent(content, { payload: legendPayload })}</foreignObject>,
}))

import { AreaChartWidget, BarChartWidget, LineChartWidget, PieChartWidget } from '../src/charts/recharts'

const data = [{ name: 'Ene', ventas: 10, gastos: 4 }]
const series = [{ key: 'ventas', label: 'Ventas', dashed: true }, { key: 'gastos', label: 'Gastos' }]

const widgets = [
  ['AreaChartWidget', (ref: React.Ref<HTMLElement>) => <AreaChartWidget ref={ref} ariaLabel="Gráfico" data={data} series={series} />],
  ['BarChartWidget', (ref: React.Ref<HTMLElement>) => <BarChartWidget ref={ref} ariaLabel="Gráfico" data={data} series={series} />],
  ['LineChartWidget', (ref: React.Ref<HTMLElement>) => <LineChartWidget ref={ref} ariaLabel="Gráfico" data={data} series={series} />],
  ['PieChartWidget', (ref: React.Ref<HTMLElement>) => <PieChartWidget ref={ref} ariaLabel="Gráfico" data={[{ name: 'Ventas', value: 10 }, { name: 'Gastos', value: 4 }]} />],
] as const

describe.each(widgets)('%s refinado', (name, renderWidget) => {
  test('es una figura con nombre, reenvía ref y no anida nada en role="img"', () => {
    const ref = createRef<HTMLElement>()
    render(renderWidget(ref))
    const figure = screen.getByRole('figure', { name: 'Gráfico' })
    expect(ref.current).toBe(figure)
    expect(figure).toHaveClass('gcu-chart', 'gcu-container')
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  test('la leyenda identifica cada serie con forma y texto, sin claves por índice', () => {
    render(renderWidget(createRef()))
    const legend = document.querySelector('.gcu-chart-legend') as HTMLElement
    expect(legend).not.toBeNull()
    const items = within(legend).getAllByRole('listitem')
    expect(items.map((item) => item.textContent)).toEqual(['Ventas', 'Gastos'])
    items.forEach((item) => expect(item.querySelector('.gcu-chart-legend__mark')).toHaveAttribute('aria-hidden', 'true'))
    if (name === 'LineChartWidget' || name === 'AreaChartWidget') {
      expect(items[0].querySelector('.gcu-chart-legend__mark')).toHaveClass('gcu-chart-legend__mark--line', 'gcu-chart-legend__mark--dashed')
    }
    if (name === 'PieChartWidget') {
      expect(items[0].querySelector('.gcu-chart-legend__mark')).toHaveClass('gcu-chart-legend__mark--circle')
    }
    if (name === 'BarChartWidget') {
      expect(items[0].querySelector('.gcu-chart-legend__mark')).toHaveClass('gcu-chart-legend__mark--square')
    }
  })

  test('el tooltip usa superficie elevada y cifras es-CL tabulares', () => {
    render(renderWidget(createRef()))
    const tooltip = document.querySelector('.gcu-chart-tooltip') as HTMLElement
    expect(tooltip).not.toBeNull()
    expect(within(tooltip).getByText('Ene')).toHaveClass('gcu-chart-tooltip__label')
    const values = Array.from(tooltip.querySelectorAll('.gcu-chart-tooltip__value'), (node) => node.textContent)
    expect(values).toEqual(['1.240.000', '4,5'])
  })

  test('la animación de entrada respeta prefers-reduced-motion', () => {
    // jsdom no implementa matchMedia: se define solo para este caso.
    const original = window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      writable: true,
      value: (query: string) => ({
        matches: query.includes('reduce'),
        media: query,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
      }),
    })
    render(renderWidget(createRef()))
    screen.getAllByTestId('mark').forEach((mark) => expect(mark).toHaveAttribute('data-animated', 'false'))
    Object.defineProperty(window, 'matchMedia', { configurable: true, writable: true, value: original })
  })
})

test('la grilla es sutil: solo líneas horizontales', () => {
  render(<LineChartWidget ariaLabel="L" data={data} series={series} />)
  expect(screen.getByTestId('grid')).toHaveAttribute('data-vertical', 'false')
})
