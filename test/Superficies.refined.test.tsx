import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { DashGrid, Spotlight, WelcomeBand } from '../src'

afterEach(() => vi.restoreAllMocks())

describe('Spotlight (lote N2)', () => {
  test('superficie de color con grano, cifra tabular, variación y contexto', () => {
    const ref = createRef<HTMLElement>()
    const { container } = render(
      <Spotlight ref={ref} label="Nivel de servicio" value={86} unit="%" delta={{ value: 4, unit: 'pts', label: 'vs. ayer' }} context="Meta 80 %" tone="indigo" />,
    )
    expect(screen.getByRole('region', { name: 'Nivel de servicio' })).toBe(ref.current)
    expect(ref.current).toHaveClass('gcu-spotlight', 'gcu-spotlight--indigo', 'gcu-grain', 'gcu-container')
    expect(container.querySelector('.gcu-stat__value')).toHaveTextContent('86%')
    expect(container.querySelector('.gcu-stat-delta')).toHaveTextContent(/Sube\s*\+4\spts/)
    expect(screen.getByText('Meta 80 %')).toBeInTheDocument()
  })

  test('tono desconocido avisa y usa primary; carga con aria-busy', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    // @ts-expect-error tono inválido a propósito
    const { container } = render(<Spotlight label="X" value={1} context="c" tone="rosa" loading />)
    expect(container.firstChild).toHaveClass('gcu-spotlight--primary')
    expect(container.firstChild).toHaveAttribute('aria-busy', 'true')
    expect(warn).toHaveBeenCalled()
  })
})

describe('WelcomeBand (lote N2)', () => {
  test('nombra la tarea con su cifra, ofrece la acción y muestra cifras', () => {
    render(
      <WelcomeBand
        title="Cobranza tiene 18 llamadas en espera"
        lede="No hay agentes libres desde las 16:42."
        actions={<button type="button">Reasignar agentes</button>}
        stats={[{ label: 'En espera', value: 18 }, { label: 'Espera máxima', value: '4:12' }]}
      />,
    )
    const band = screen.getByRole('region', { name: 'Cobranza tiene 18 llamadas en espera' })
    expect(band).toHaveClass('gcu-welcome-band', 'gcu-grain')
    expect(screen.getByText('Qué atender primero')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Cobranza')
    expect(screen.getByRole('button', { name: 'Reasignar agentes' })).toBeInTheDocument()
    expect(screen.getByText('4:12').tagName).toBe('DD')
  })
})

describe('DashGrid (lote N2)', () => {
  test('filas permitidas con celdas contenedoras', () => {
    const ref = createRef<HTMLDivElement>()
    const { container } = render(
      <DashGrid ref={ref}>
        <DashGrid.Row layout={[8, 4]}>
          <div>Principal</div>
          <div>Lateral</div>
        </DashGrid.Row>
      </DashGrid>,
    )
    expect(ref.current).toHaveClass('gcu-dash-grid', 'gcu-container')
    expect(container.querySelector('.gcu-dash-grid__row')).toHaveClass('gcu-dash-grid__row--8-4')
    const cells = container.querySelectorAll('.gcu-dash-grid__cell')
    expect(cells[0]).toHaveClass('gcu-dash-grid__cell--8', 'gcu-container')
    expect(cells[1]).toHaveClass('gcu-dash-grid__cell--4')
  })

  test('fila no permitida o hijos de más: avisa', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(
      <DashGrid>
        {/* @ts-expect-error 9 no es un span permitido */}
        <DashGrid.Row layout={[9, 3]}>
          <div>A</div>
        </DashGrid.Row>
      </DashGrid>,
    )
    expect(warn).toHaveBeenCalledWith('[duralux]', expect.stringContaining('no está permitida'))
    expect(warn).toHaveBeenCalledWith('[duralux]', expect.stringContaining('1 hijos para 2'))
  })
})
