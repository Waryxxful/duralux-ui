import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { StatsCard } from '../src/components/ui/StatsCard'

afterEach(() => vi.restoreAllMocks())

describe('StatsCard refinado (lote L4)', () => {
  test('reenvía ref a la raíz y acepta className y atributos HTML', () => {
    const ref = createRef<HTMLDivElement>()
    render(<StatsCard ref={ref} value={10} label="Leads" className="extra" data-testid="kpi" />)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
    expect(screen.getByTestId('kpi')).toHaveClass('card', 'gcu-stats-card', 'gcu-container', 'extra')
  })

  test('formatea números en es-CL con cifras tabulares', () => {
    const { container } = render(<StatsCard value={2840} label="Llamadas" />)
    const value = container.querySelector('.gcu-stat__value')
    expect(value).toHaveTextContent('2.840')
    expect(value).toHaveClass('gcu-tabular')
  })

  test('delta con signo, unidad, flecha y sentido hablado; el contexto queda visible', () => {
    const { container } = render(
      <StatsCard value="84 %" label="Nivel de servicio" delta={{ value: 4, unit: 'pts', label: 'vs. semana pasada' }} context="Meta 80 %" />,
    )
    const delta = container.querySelector('.gcu-stat-delta')
    expect(delta).toHaveTextContent(/Sube\s*\+4\spts/)
    expect(delta).toHaveClass('gcu-stat-delta--positive')
    expect(delta?.querySelector('.feather-arrow-up-right')).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getByText('vs. semana pasada')).toBeInTheDocument()
    expect(screen.getByText('Meta 80 %')).toBeInTheDocument()
  })

  test('goodWhen="down": bajar el TMO es positivo y usa el signo menos tipográfico', () => {
    const { container } = render(<StatsCard value="5:12" label="TMO" delta={{ value: -0.8, unit: '%', goodWhen: 'down' }} />)
    const delta = container.querySelector('.gcu-stat-delta')
    expect(delta).toHaveTextContent(/Baja\s*−0,8\s%/)
    expect(delta).toHaveClass('gcu-stat-delta--positive')
  })

  test('la cifra principal no se redondea: solo se le da formato es-CL', () => {
    const { container } = render(<StatsCard value={99.99} label="Disponibilidad" />)
    expect(container.querySelector('.gcu-stat__value')).toHaveTextContent('99,99')
  })

  test('tone pinta el ícono con roles semánticos', () => {
    const { container } = render(<StatsCard icon="feather-users" tone="info" value={1} label="Agentes" />)
    expect(container.querySelector('.gcu-stat__icon')).toHaveClass('gcu-stat__icon--info')
    expect(container.querySelector('.gcu-stat__icon .feather-users')).toHaveAttribute('aria-hidden', 'true')
    expect(container.querySelector('.gcu-stat__icon')).not.toHaveClass('avatar-text')
  })

  test('DX-020: el progreso usa <progress> nativo, no role="progressbar"', () => {
    const { container } = render(<StatsCard value={10} label="Meta" progress={{ value: 56, label: 'Avance de la meta', color: 'success' }} />)
    const bar = screen.getByRole('progressbar', { name: 'Avance de la meta' })
    expect(bar.tagName).toBe('PROGRESS')
    expect(bar).toHaveAttribute('value', '56')
    expect(bar).toHaveAttribute('max', '100')
    expect(container.querySelector('[role="progressbar"]')).toBeNull()
    expect(bar).toHaveClass('gcu-stat__meter--success')
  })

  test('carga: skeleton en lugar de la cifra y aria-busy en la raíz', () => {
    const { container } = render(<StatsCard value={10} label="Leads" loading data-testid="kpi" />)
    expect(screen.getByTestId('kpi')).toHaveAttribute('aria-busy', 'true')
    expect(container.querySelector('.gcu-skeleton')).not.toBeNull()
    expect(container.querySelector('.gcu-stat__value')).not.toHaveTextContent('10')
  })

  test('vacío: guion decorativo y explicación visible; 0 no es vacío', () => {
    const { container, rerender } = render(<StatsCard value={null} label="Ventas" />)
    expect(container.querySelector('.gcu-stat__value')).toHaveTextContent('—')
    expect(screen.getByText('Sin datos para este periodo')).toBeInTheDocument()
    rerender(<StatsCard value={0} label="Ventas" />)
    expect(container.querySelector('.gcu-stat__value')).toHaveTextContent('0')
  })
})
