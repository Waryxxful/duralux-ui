import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { KpiCard, StatGroup } from '../src'

afterEach(() => vi.restoreAllMocks())

describe('KpiCard (lote N2)', () => {
  test('cifra es-CL tabular con unidad, variación y contexto visibles', () => {
    const ref = createRef<HTMLDivElement>()
    const { container } = render(
      <KpiCard ref={ref} label="Llamadas atendidas" value={2840} delta={{ value: 12, unit: '%', label: 'vs. ayer' }} context="Meta 2.600" />,
    )
    expect(ref.current).toHaveClass('card', 'gcu-kpi-card', 'gcu-container')
    expect(screen.getByRole('heading', { level: 3, name: 'Llamadas atendidas' })).toBeInTheDocument()
    expect(container.querySelector('.gcu-stat__value')).toHaveTextContent('2.840')
    expect(container.querySelector('.gcu-stat__value')).toHaveClass('gcu-tabular')
    expect(container.querySelector('.gcu-stat-delta')).toHaveTextContent(/Sube\s*\+12\s%/)
    expect(screen.getByText('Meta 2.600')).toBeInTheDocument()
  })

  test('unidad como sufijo; estado fuera de meta con forma y texto', () => {
    const { container } = render(
      <KpiCard label="Nivel de servicio" value={72} unit="%" tone="danger" status="Bajo la meta" context="Meta 80 %" />,
    )
    expect(container.querySelector('.gcu-stat__unit')).toHaveTextContent('%')
    expect(container.firstChild).toHaveClass('gcu-kpi-card--danger')
    expect(container.querySelector('.gcu-severity--critical')).toHaveTextContent('Crítico: Bajo la meta')
  })

  test('sin contexto avisa (toda cifra tiene contexto)', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<KpiCard label="Cifra suelta única" value={10} />)
    expect(warn).toHaveBeenCalledWith('[duralux]', expect.stringContaining('no tiene contexto'))
  })

  test('chart cuenta como contexto y se muestra bajo la cifra', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<KpiCard label="Con gráfico" value={10} chart={<span>tendencia</span>} />)
    expect(screen.getByText('tendencia')).toBeInTheDocument()
    expect(warn).not.toHaveBeenCalled()
  })

  test('carga y vacío', () => {
    const { container, rerender } = render(<KpiCard label="TMO" value="5:12" context="Meta 5:00" loading />)
    expect(container.firstChild).toHaveAttribute('aria-busy', 'true')
    rerender(<KpiCard label="TMO" value={null} context="Meta 5:00" emptyText="Sin llamadas hoy." />)
    expect(screen.getByText('Sin llamadas hoy.')).toBeInTheDocument()
  })
})

describe('StatGroup (lote N2)', () => {
  const items = [
    { label: 'Atendidas', value: 2840, delta: { value: 12, unit: '%' }, context: 'Meta 2.600' },
    { label: 'Abandono', value: 4.3, unit: '%', delta: { value: -0.8, unit: 'pts', goodWhen: 'down' as const } },
    { label: 'TMO', value: '5:12', context: 'Meta 5:00' },
  ]

  test('una card con título y pares dt/dd', () => {
    const ref = createRef<HTMLElement>()
    const { container } = render(<StatGroup ref={ref} title="Hoy en el contact center" items={items} />)
    expect(screen.getByRole('region', { name: 'Hoy en el contact center' })).toBe(ref.current)
    expect(container.querySelectorAll('dt')).toHaveLength(3)
    expect(container.querySelector('.gcu-stat-group__grid')).toHaveClass('gcu-stat-group__grid--3')
    expect(screen.getByText('2.840')).toBeInTheDocument()
    expect(container.querySelectorAll('.gcu-stat-delta--positive')).toHaveLength(2)
  })

  test('fuera de 2–4 métricas avisa', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<StatGroup aria-label="Una" items={[items[0]]} />)
    expect(warn).toHaveBeenCalledWith('[duralux]', expect.stringContaining('de 2 a 4'))
  })
})
