import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { ChartMetricsFooter } from '../src/components/ui/ChartMetricsFooter'

describe('ChartMetricsFooter refinado (lote L4)', () => {
  test('reenvía ref, responde a su contenedor y expone pares término/valor', () => {
    const ref = createRef<HTMLDivElement>()
    const { container } = render(
      <ChartMetricsFooter ref={ref} className="extra" metrics={[{ label: 'Atendidas', value: 2840 }, { label: 'Abandonadas', value: 124 }]} />,
    )
    expect(ref.current).toHaveClass('gcu-chart-metrics', 'gcu-container', 'extra')
    expect(container.querySelectorAll('dt')).toHaveLength(2)
    expect(container.querySelector('dd')).toHaveTextContent('2.840')
    expect(container.querySelector('dd')).toHaveClass('gcu-tabular')
  })

  test('sin utilidades de borde del tema (en oscuro las fuerza con !important)', () => {
    const { container } = render(<ChartMetricsFooter metrics={[{ label: 'A', value: 1 }, { label: 'B', value: 2 }]} />)
    expect(container.querySelector('.border-start, .border-top, .text-dark')).toBeNull()
  })

  test('cada métrica puede llevar su variación con signo y unidad', () => {
    const { container } = render(<ChartMetricsFooter metrics={[{ label: 'TMO', value: '5:12', delta: { value: -24, unit: 's', goodWhen: 'down' } }]} />)
    expect(container.querySelector('.gcu-stat-delta')).toHaveTextContent(/Baja\s*−24\ss/)
    expect(container.querySelector('.gcu-stat-delta')).toHaveClass('gcu-stat-delta--positive')
  })

  test('carga: skeleton por valor y aria-busy', () => {
    const { container } = render(<ChartMetricsFooter loading metrics={[{ label: 'A', value: 1 }]} data-testid="f" />)
    expect(screen.getByTestId('f')).toHaveAttribute('aria-busy', 'true')
    expect(container.querySelector('.gcu-skeleton')).not.toBeNull()
  })
})
