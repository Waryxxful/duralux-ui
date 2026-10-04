import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { Score, ScoreHero } from '../src'

afterEach(() => vi.restoreAllMocks())

describe('Score (lote N2)', () => {
  test('rango en texto, no solo color: Bueno, Medio, Bajo', () => {
    const { rerender, container } = render(<Score value={86} />)
    expect(container.firstChild).toHaveClass('gcu-score--ok')
    expect(container.firstChild).toHaveTextContent('86/100Bueno')
    rerender(<Score value={64} />)
    expect(screen.getByText('Medio')).toBeInTheDocument()
    rerender(<Score value={31} />)
    expect(screen.getByText('Bajo')).toBeInTheDocument()
  })

  test('cifras tabulares y formato es-CL', () => {
    const { container } = render(<Score value={4.5} max={5} />)
    expect(container.querySelector('.gcu-score__figure')).toHaveClass('gcu-tabular')
    expect(container.firstChild).toHaveTextContent('4,5/5')
  })

  test('anulado: cifra tachada y rango «Anulado»', () => {
    const { container } = render(<Score value={72} voided />)
    expect(container.querySelector('s')).toHaveTextContent('72')
    expect(screen.getByText('Anulado')).toBeInTheDocument()
  })

  test('umbrales propios y rango oculto que igual se anuncia', () => {
    render(<Score value={70} thresholds={{ ok: 70 }} showRange={false} />)
    expect(screen.getByText('Bueno')).toHaveClass('visually-hidden')
  })

  test('sin valor: guion y «Sin puntaje»; ref reenviado', () => {
    const ref = createRef<HTMLSpanElement>()
    render(<Score ref={ref} value={null} />)
    expect(screen.getByText('Sin puntaje')).toBeInTheDocument()
    expect(ref.current).toHaveClass('gcu-score--empty')
  })

  test('fuera de rango avisa por consola', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<Score value={120} />)
    expect(warn).toHaveBeenCalledWith('[duralux]', expect.stringContaining('fuera del rango'))
  })
})

describe('ScoreHero (lote N2)', () => {
  test('cifra protagonista con rango, variación y contexto', () => {
    const { container } = render(
      <ScoreHero value={88} delta={{ value: 6, unit: 'pts', label: 'vs. evaluación anterior' }} context="Meta 80" />,
    )
    expect(container.firstChild).toHaveClass('gcu-score-hero', 'gcu-container', 'gcu-score-hero--ok')
    expect(screen.getByText('Puntaje final')).toBeInTheDocument()
    expect(screen.getByText('Bueno')).toBeInTheDocument()
    expect(container.querySelector('.gcu-stat-delta')).toHaveTextContent(/Sube\s*\+6\spts/)
    expect(screen.getByText('Meta 80')).toBeInTheDocument()
  })

  test('previous anula el puntaje y muestra el anterior', () => {
    const { container } = render(<ScoreHero value={0} previous={76} />)
    expect(screen.getByText('Anulado')).toBeInTheDocument()
    expect(screen.getByText('Antes del error')).toBeInTheDocument()
    expect(container.querySelector('s')).toHaveTextContent('0')
  })

  test('carga: skeleton y aria-busy', () => {
    const { container } = render(<ScoreHero value={null} loading />)
    expect(container.firstChild).toHaveAttribute('aria-busy', 'true')
    expect(container.querySelector('.gcu-skeleton')).toBeInTheDocument()
  })
})
