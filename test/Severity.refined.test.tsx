import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { Severity, severityOf } from '../src'

afterEach(() => vi.restoreAllMocks())

describe('Severity (lote N2)', () => {
  test('forma propia por nivel + texto visible; reenvía ref y atributos', () => {
    const ref = createRef<HTMLSpanElement>()
    const { container } = render(<Severity ref={ref} level="critical" data-testid="sev" className="extra" />)
    const root = screen.getByTestId('sev')
    expect(ref.current).toBe(root)
    expect(root).toHaveClass('gcu-severity', 'gcu-severity--critical', 'extra')
    expect(root).toHaveTextContent('Crítico')
    expect(container.querySelector('.gcu-severity__marker')).toHaveAttribute('aria-hidden', 'true')
  })

  test('etiqueta propia: el nivel se anuncia antes del texto', () => {
    render(<Severity level="warning" label="SLA por vencer" />)
    expect(screen.getByText('SLA por vencer').parentElement ?? document.body).toHaveTextContent('Advertencia: SLA por vencer')
  })

  test('label={false}: solo el marcador, como imagen con nombre', () => {
    render(<Severity level="normal" label={false} />)
    expect(screen.getByRole('img', { name: 'Normal' })).toHaveClass('gcu-severity--normal')
  })

  test('nivel desconocido cae en normal y avisa', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    // @ts-expect-error nivel inválido a propósito
    render(<Severity level="grave" />)
    expect(screen.getByText('Normal')).toBeInTheDocument()
    expect(warn).toHaveBeenCalledWith('[duralux]', expect.stringContaining('nivel desconocido'))
  })
})

describe('severityOf', () => {
  test('más es mejor por defecto: bajo 50 es advertencia; bajo critical, crítico', () => {
    expect(severityOf(84)).toBe('normal')
    expect(severityOf(42)).toBe('warning')
    expect(severityOf(20, { critical: 30 })).toBe('critical')
    expect(severityOf(80, { warning: 80 })).toBe('normal')
  })

  test('higherIsWorse para abandono o TMO', () => {
    const umbrales = { warning: 5, critical: 8, higherIsWorse: true }
    expect(severityOf(3.2, umbrales)).toBe('normal')
    expect(severityOf(5, umbrales)).toBe('warning')
    expect(severityOf(9.1, umbrales)).toBe('critical')
  })

  test('sin valor es normal', () => {
    expect(severityOf(null)).toBe('normal')
    expect(severityOf(undefined)).toBe('normal')
    expect(severityOf(Number.NaN)).toBe('normal')
  })
})
