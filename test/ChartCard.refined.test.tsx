import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { ChartCard } from '../src/charts'

afterEach(() => vi.restoreAllMocks())

describe('ChartCard refinado', () => {
  test('el título es h3 por defecto con la tipografía de título de card (DX-006)', () => {
    render(<ChartCard title="Ventas">contenido</ChartCard>)
    const heading = screen.getByRole('heading', { level: 3, name: 'Ventas' })
    expect(heading).toHaveClass('card-title', 'h5', 'gcu-chart-card__title')
  })

  test('headingLevel ajusta el nivel sin cambiar la tipografía', () => {
    const { rerender } = render(<ChartCard title="Ventas" headingLevel={2}>contenido</ChartCard>)
    expect(screen.getByRole('heading', { level: 2, name: 'Ventas' })).toHaveClass('h5')
    rerender(<ChartCard title="Ventas" headingLevel={4}>contenido</ChartCard>)
    expect(screen.getByRole('heading', { level: 4, name: 'Ventas' })).toBeInTheDocument()
  })

  test('un headingLevel inválido vuelve a h3 y lo registra', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    // @ts-expect-error valor fuera del contrato: debe degradar a h3
    render(<ChartCard title="Ventas" headingLevel={9}>contenido</ChartCard>)
    expect(screen.getByRole('heading', { level: 3, name: 'Ventas' })).toBeInTheDocument()
    expect(warn).toHaveBeenCalledWith('[duralux]', expect.stringContaining('headingLevel'))
  })

  test('reenvía ref, className y style a la sección', () => {
    const ref = createRef<HTMLElement>()
    render(<ChartCard ref={ref} title="Ventas" className="mi-card" style={{ minHeight: 10 }}>contenido</ChartCard>)
    expect(ref.current?.tagName).toBe('SECTION')
    expect(ref.current).toHaveClass('card', 'gcu-chart-card', 'mi-card')
    expect(ref.current).toHaveStyle({ minHeight: '10px' })
    expect(ref.current).toHaveAttribute('aria-labelledby', screen.getByRole('heading').id)
  })

  test('noPadding deja el cuerpo a ras; noPad sigue funcionando con aviso de deprecación', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { container, rerender } = render(<ChartCard title="A" noPadding>x</ChartCard>)
    expect(container.querySelector('.card-body')).toHaveClass('p-0')
    rerender(<ChartCard title="A" noPad>x</ChartCard>)
    expect(container.querySelector('.card-body')).toHaveClass('p-0')
    expect(warn).toHaveBeenCalledWith('[duralux]', expect.stringContaining('noPad'))
  })

  test('los estados usan los componentes de feedback y marcan aria-busy al cargar', () => {
    const { container, rerender } = render(<ChartCard title="Ventas" loading>x</ChartCard>)
    expect(container.querySelector('.card-body')).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(container.querySelector('.gcu-chart__skeleton')).toBeInTheDocument()

    rerender(<ChartCard title="Ventas" empty>x</ChartCard>)
    expect(container.querySelector('.gcu-state--empty')).toBeInTheDocument()

    rerender(<ChartCard title="Ventas" error="Sin conexión" onRetry={() => {}}>x</ChartCard>)
    expect(screen.getByRole('alert')).toHaveTextContent('Sin conexión')
    expect(screen.getByRole('button', { name: /Reintentar/ })).toBeInTheDocument()
  })
})
