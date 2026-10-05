import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { ColoredStatCard } from '../src/components/ui/ColoredStatCard'

afterEach(() => vi.restoreAllMocks())

describe('ColoredStatCard refinado (lote L4)', () => {
  test('reenvía ref; la superficie de color lleva grano Craft y responde a su contenedor', () => {
    const ref = createRef<HTMLDivElement>()
    render(<ColoredStatCard ref={ref} tone="success" value={42} label="Ventas" data-testid="c" />)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
    expect(screen.getByTestId('c')).toHaveClass('gcu-colored-stat', 'gcu-colored-stat--success', 'gcu-grain', 'gcu-container')
  })

  test('no deja en el DOM clases con !important del tema (bg-*, text-white, card, avatar-text, badge)', () => {
    const { container } = render(<ColoredStatCard icon="feather-dollar-sign" tone="primary" value={1} label="X" delta={{ value: 3, unit: '%' }} data-testid="c" />)
    const root = screen.getByTestId('c')
    expect(root.className).not.toMatch(/\b(bg-|text-white|card\b)/)
    expect(container.querySelector('.avatar-text, .badge')).toBeNull()
  })

  test('el ícono y la variación van sobre vidrio sombreado propio (legible en oscuro y navy)', () => {
    const { container } = render(<ColoredStatCard icon="feather-users" value={1} label="X" delta={{ value: -2, unit: 'pts' }} />)
    expect(container.querySelector('.gcu-colored-stat__icon')).toHaveClass('gcu-colored-stat__glass')
    const delta = container.querySelector('.gcu-stat-delta')
    expect(delta?.querySelector('.gcu-stat-delta__value')).toHaveClass('gcu-colored-stat__glass')
    expect(delta).toHaveTextContent(/Baja\s*−2\spts/)
  })

  test('cifra es-CL tabular, carga con aria-busy y vacío con explicación', () => {
    const { container, rerender } = render(<ColoredStatCard value={1240000} label="Recaudado" data-testid="c" />)
    expect(container.querySelector('.gcu-stat__value')).toHaveTextContent('1.240.000')
    expect(container.querySelector('.gcu-stat__value')).toHaveClass('gcu-tabular')
    rerender(<ColoredStatCard value={1} label="Recaudado" loading data-testid="c" />)
    expect(screen.getByTestId('c')).toHaveAttribute('aria-busy', 'true')
    rerender(<ColoredStatCard value={null} label="Recaudado" data-testid="c" />)
    expect(screen.getByText('Sin datos para este periodo')).toBeInTheDocument()
  })
})

