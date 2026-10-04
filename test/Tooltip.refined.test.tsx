import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { Tooltip } from '../src/components/ui/Tooltip'

beforeEach(() => vi.useFakeTimers())
afterEach(() => {
  vi.runOnlyPendingTimers()
  vi.useRealTimers()
  vi.restoreAllMocks()
})

function hover(element: HTMLElement) {
  fireEvent.pointerEnter(element, { pointerType: 'mouse' })
}

describe('Tooltip (lote N1, Craft «Hover Restraint»)', () => {
  test('el primero espera el delay con el puntero y describe al disparador mientras se ve', () => {
    render(<Tooltip content="Exporta el reporte en CSV"><button type="button">Exportar</button></Tooltip>)
    const trigger = screen.getByRole('button', { name: 'Exportar' })
    hover(trigger)
    act(() => { vi.advanceTimersByTime(399) })
    expect(screen.queryByRole('tooltip')).toBeNull()
    act(() => { vi.advanceTimersByTime(101) })
    const tooltip = screen.getByRole('tooltip')
    expect(tooltip).toHaveTextContent('Exporta el reporte en CSV')
    expect(trigger).toHaveAttribute('aria-describedby', tooltip.id)
  })

  test('un vecino aparece al instante dentro de la ventana de 300 ms', () => {
    render(
      <>
        <Tooltip content="Primero"><button type="button">Uno</button></Tooltip>
        <Tooltip content="Segundo"><button type="button">Dos</button></Tooltip>
      </>,
    )
    hover(screen.getByRole('button', { name: 'Uno' }))
    act(() => { vi.advanceTimersByTime(500) })
    fireEvent.pointerLeave(screen.getByRole('button', { name: 'Uno' }), { pointerType: 'mouse' })
    hover(screen.getByRole('button', { name: 'Dos' }))
    expect(screen.getByRole('tooltip')).toHaveTextContent('Segundo')
  })

  test('aparece con el foco de teclado sin esperar y Esc lo cierra', () => {
    render(<Tooltip content="Atajo: Ctrl + K"><button type="button">Buscar</button></Tooltip>)
    const trigger = screen.getByRole('button', { name: 'Buscar' })
    act(() => { trigger.focus() })
    expect(screen.getByRole('tooltip')).toBeInTheDocument()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('tooltip')).toBeNull()
    expect(trigger).not.toHaveAttribute('aria-describedby')
  })

  test('conserva el aria-describedby y los handlers del hijo', () => {
    const onFocus = vi.fn()
    render(
      <Tooltip content="Ayuda"><button type="button" aria-describedby="propio" onFocus={onFocus}>Guardar</button></Tooltip>,
    )
    const trigger = screen.getByRole('button', { name: 'Guardar' })
    act(() => { trigger.focus() })
    expect(onFocus).toHaveBeenCalled()
    expect(trigger.getAttribute('aria-describedby')).toMatch(/^propio /)
  })

  test('un delay fuera de 400–700 se acota y avisa por log', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<Tooltip content="x" delay={50}><button type="button">A</button></Tooltip>)
    expect(warn).toHaveBeenCalledWith('[duralux]', expect.stringContaining('400–700'))
  })
})
