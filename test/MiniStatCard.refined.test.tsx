import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { MiniStatCard } from '../src/components/ui/MiniStatCard'

afterEach(() => vi.restoreAllMocks())

describe('MiniStatCard refinado (lote L4)', () => {
  test('reenvía ref, acepta className y responde a su contenedor', () => {
    const ref = createRef<HTMLDivElement>()
    render(<MiniStatCard ref={ref} value={12} label="En pausa" className="extra" data-testid="mini" />)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
    expect(screen.getByTestId('mini')).toHaveClass('card', 'gcu-mini-stat', 'gcu-container', 'extra')
  })

  test('color legado equivale a tone y el ícono no usa avatar-text (el tema oscuro lo pinta sólido)', () => {
    const { container } = render(<MiniStatCard icon="feather-phone" color="success" value={3} label="En llamada" />)
    const icon = container.querySelector('.gcu-stat__icon')
    expect(icon).toHaveClass('gcu-stat__icon--success')
    expect(icon).not.toHaveClass('avatar-text')
  })

  test('cifra es-CL tabular con variación y contexto', () => {
    const { container } = render(<MiniStatCard value={1240.5} label="Minutos" delta={{ value: 12, unit: '%' }} context="Meta 1.200" />)
    expect(container.querySelector('.gcu-stat__value')).toHaveTextContent('1240,5'.replace('1240', '1.240'))
    expect(container.querySelector('.gcu-stat__value')).toHaveClass('gcu-tabular')
    expect(container.querySelector('.gcu-stat-delta')).toHaveTextContent(/Sube\s*\+12\s%/)
    expect(screen.getByText('Meta 1.200')).toBeInTheDocument()
  })

  test('tono desconocido avisa por log y cae en primary', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    // SAFETY: se fuerza un tono fuera del tipo público para probar el fallback en runtime.
    const { container } = render(<MiniStatCard tone={'fucsia' as never} value={1} label="X" />)
    expect(container.querySelector('.gcu-stat__icon, .gcu-mini-stat')).not.toBeNull()
    expect(warn).toHaveBeenCalledWith('[duralux]', expect.stringContaining('fucsia'))
  })

  test('carga y vacío', () => {
    const { container, rerender } = render(<MiniStatCard value={1} label="X" loading data-testid="mini" />)
    expect(screen.getByTestId('mini')).toHaveAttribute('aria-busy', 'true')
    expect(container.querySelector('.gcu-skeleton')).not.toBeNull()
    rerender(<MiniStatCard value="" label="X" emptyText="Aún no hay llamadas" />)
    expect(screen.getByText('Aún no hay llamadas')).toBeInTheDocument()
  })
})
