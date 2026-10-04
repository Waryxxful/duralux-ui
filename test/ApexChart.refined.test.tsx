import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

vi.mock('react-apexcharts', () => ({
  default: ({ options }: { options: unknown }) => (
    <div data-testid="apex-chart" data-options={JSON.stringify(options)}>
      <button type="button">Menú del gráfico</button>
    </div>
  ),
}))

import { ApexChart, ChartCard } from '../src/charts/apex'

describe('ApexChart refinado (DX-004)', () => {
  test('es una figura con nombre: nada interactivo queda dentro de un role="img"', async () => {
    const ref = createRef<HTMLElement>()
    render(
      <ApexChart
        ref={ref}
        ariaLabel="Ventas por mes"
        description="Ventas de enero a marzo"
        options={{ xaxis: { categories: ['Ene', 'Feb'] } }}
        series={[{ name: 'Ventas', data: [10, 20] }]}
      />,
    )

    const figure = screen.getByRole('figure', { name: 'Ventas por mes' })
    expect(ref.current).toBe(figure)
    expect(figure.tagName).toBe('FIGURE')
    expect(figure).toHaveAccessibleDescription('Ventas de enero a marzo')
    const control = await screen.findByRole('button', { name: 'Menú del gráfico' })
    expect(control.closest('[role="img"]')).toBeNull()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(screen.getByRole('table', { name: 'Ventas por mes' })).toHaveTextContent('Feb')
  })

  test('el título del ChartCard nombra la figura y el título propio va en figcaption', () => {
    const { rerender } = render(
      <ChartCard title="Embudo">
        <ApexChart series={[{ name: 'Leads', data: [3] }]} />
      </ChartCard>,
    )
    expect(screen.getByRole('figure', { name: 'Embudo' })).toBeInTheDocument()

    rerender(<ApexChart title="Propio" series={[{ name: 'Leads', data: [3] }]} />)
    const figure = screen.getByRole('figure', { name: 'Propio' })
    expect(figure.querySelector('figcaption')).toHaveTextContent('Propio')
  })

  test('className y style llegan a la figura junto con el alto del lienzo', () => {
    render(<ApexChart ariaLabel="A" height={240} className="extra" style={{ marginTop: 4 }} series={[{ name: 'A', data: [1] }]} />)
    const figure = screen.getByRole('figure', { name: 'A' })
    expect(figure).toHaveClass('gcu-chart', 'gcu-container', 'extra')
    expect(figure.style.getPropertyValue('--gcu-chart-height')).toBe('240px')
    expect(figure).toHaveStyle({ marginTop: '4px' })
  })

  test('la carga es un skeleton con el alto del gráfico dentro de una región status', () => {
    const { container } = render(<ApexChart ariaLabel="A" loading series={[{ name: 'A', data: [1] }]} />)
    const figure = screen.getByRole('figure', { name: 'A' })
    expect(figure).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByRole('status')).toHaveTextContent('Cargando...')
    expect(container.querySelectorAll('.gcu-chart__skeleton-bar').length).toBeGreaterThan(0)
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  test('el vacío usa EmptyState con un mensaje que dice qué pasó', () => {
    render(<ApexChart ariaLabel="A" series={[]} />)
    expect(screen.getByRole('status')).toHaveTextContent('Sin datos para graficar')
  })
})
