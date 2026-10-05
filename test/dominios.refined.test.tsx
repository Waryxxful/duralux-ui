import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'
import { CallList, PipelineBoard, TargetBar } from '../src'
import type { CallSummary, PipelineDeal, PipelineStage } from '../src'

describe('TargetBar (2.7 dominios)', () => {
  test('más es mejor: cumple desde la meta, cerca dentro del margen, fuera bajo él', () => {
    const { rerender } = render(<TargetBar label="Nivel de servicio" value={80} target={80} />)
    const meter = screen.getByRole('meter', { name: 'Nivel de servicio' })
    expect(meter).toHaveAttribute('aria-valuetext', expect.stringContaining('cumple la meta'))
    rerender(<TargetBar label="Nivel de servicio" value={72} target={80} />)
    expect(meter).toHaveAttribute('aria-valuetext', expect.stringContaining('cerca del umbral'))
    rerender(<TargetBar label="Nivel de servicio" value={71.9} target={80} />)
    expect(meter).toHaveAttribute('aria-valuetext', expect.stringContaining('bajo la meta'))
  })

  test('higherIsWorse: la meta es un máximo y superarla es peor', () => {
    const { rerender } = render(<TargetBar label="Abandono" value={5} target={5} max={15} higherIsWorse />)
    const meter = screen.getByRole('meter', { name: 'Abandono' })
    expect(meter).toHaveAttribute('aria-valuetext', expect.stringContaining('dentro del máximo'))
    rerender(<TargetBar label="Abandono" value={5.5} target={5} max={15} higherIsWorse />)
    expect(meter).toHaveAttribute('aria-valuetext', expect.stringContaining('cerca del umbral'))
    rerender(<TargetBar label="Abandono" value={7.8} target={5} max={15} higherIsWorse />)
    expect(meter).toHaveAttribute('aria-valuetext', expect.stringContaining('sobre el máximo'))
    expect(screen.getByText('Sobre el máximo')).toBeInTheDocument()
  })
})

const STAGES: PipelineStage[] = [
  { key: 'a', label: 'Prospecto' },
  { key: 'b', label: 'Propuesta' },
  { key: 'c', label: 'Ganado' },
]
const DEALS: PipelineDeal[] = [
  { id: 'd1', title: 'Mesa de ayuda', account: 'Clínica', value: 1000, owner: 'Ana Soto', stage: 'a' },
  { id: 'd2', title: 'Renovación', account: 'Retail', value: 2000, owner: 'Luis Díaz', stage: 'c' },
]

describe('PipelineBoard (2.7 dominios)', () => {
  test('Alt + flecha mueve a la etapa vecina y lo anuncia', () => {
    const onMove = vi.fn()
    render(<PipelineBoard stages={STAGES} deals={DEALS} onMove={onMove} />)
    fireEvent.keyDown(screen.getByRole('button', { name: /Mesa de ayuda/ }), { key: 'ArrowRight', altKey: true })
    expect(onMove).toHaveBeenCalledWith('d1', 'b')
    expect(screen.getByRole('status')).toHaveTextContent('«Mesa de ayuda» movida a Propuesta.')
  })

  test('no mueve en los extremos, sin Alt ni sin onMove', () => {
    const onMove = vi.fn()
    const { rerender } = render(<PipelineBoard stages={STAGES} deals={DEALS} onMove={onMove} />)
    fireEvent.keyDown(screen.getByRole('button', { name: /Mesa de ayuda/ }), { key: 'ArrowLeft', altKey: true })
    fireEvent.keyDown(screen.getByRole('button', { name: /Renovación/ }), { key: 'ArrowRight', altKey: true })
    fireEvent.keyDown(screen.getByRole('button', { name: /Mesa de ayuda/ }), { key: 'ArrowRight' })
    expect(onMove).not.toHaveBeenCalled()
    expect(screen.getByRole('status')).toHaveTextContent('Ya está en la última etapa.')
    rerender(<PipelineBoard stages={STAGES} deals={DEALS} />)
    fireEvent.keyDown(screen.getByRole('button', { name: /Mesa de ayuda/ }), { key: 'ArrowRight', altKey: true })
    expect(onMove).not.toHaveBeenCalled()
  })
})

const CALLS: CallSummary[] = [
  { id: 1, agent: 'Ana Soto', score: 90 },
  { id: 2, agent: 'Luis Díaz', score: 40 },
  { id: 3, agent: 'Eva Ruiz', score: null, critical: true },
]

describe('CallList (2.7 dominios)', () => {
  test('una sola parada de tabulación; flechas y Fin mueven el foco; Enter selecciona', () => {
    const onSelect = vi.fn()
    render(<CallList calls={CALLS} activeId={2} onSelect={onSelect} />)
    const options = screen.getAllByRole('option')
    expect(options.map((option) => option.tabIndex)).toEqual([-1, 0, -1])
    options[1]?.focus()
    // SAFETY: getAllByRole devolvió tres opciones (verificado arriba con tabIndex).
    fireEvent.keyDown(options[1] as HTMLElement, { key: 'End' })
    expect(options[2]).toHaveFocus()
    // SAFETY: misma lista de tres opciones.
    fireEvent.keyDown(options[2] as HTMLElement, { key: 'Enter' })
    expect(onSelect).toHaveBeenCalledWith(3)
  })
})
