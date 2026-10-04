import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { AppStatusCard, EntityCard, ProcessSteps, QuickTiles, RankList } from '../src'

afterEach(() => vi.restoreAllMocks())

describe('EntityCard (lote N2)', () => {
  test('título enlazado que cubre la card, cifras tabulares y estado inactivo en texto', () => {
    const ref = createRef<HTMLElement>()
    const { container } = render(
      <EntityCard
        ref={ref}
        title="Retail Sur"
        subtitle="Cliente desde 2021"
        href="/clientes/1"
        inactive
        stats={[{ label: 'Campañas', value: 12 }, { label: 'Contactos', value: 48213 }]}
      />,
    )
    expect(ref.current?.tagName).toBe('ARTICLE')
    expect(screen.getByRole('link', { name: 'Retail Sur' })).toHaveAttribute('href', '/clientes/1')
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Retail Sur')
    expect(screen.getByText('48.213')).toHaveClass('gcu-tabular')
    expect(screen.getByText('Inactiva')).toBeInTheDocument()
    expect(container.querySelector('.gcu-avatar')).toHaveTextContent('RS')
  })

  test('onClick vuelve el título un botón', async () => {
    const onClick = vi.fn()
    render(<EntityCard title="Campaña Invierno" onClick={onClick} />)
    await userEvent.click(screen.getByRole('button', { name: 'Campaña Invierno' }))
    expect(onClick).toHaveBeenCalled()
  })
})

describe('RankList (lote N2)', () => {
  test('puesto, cifra es-CL con unidad y barra proporcional decorativa', () => {
    const { container } = render(
      <RankList label="Motivos de llamada" unit="llamadas" items={[{ label: 'Deuda', value: 1240 }, { label: 'Portabilidad', value: 620, tone: 'danger' }]} />,
    )
    expect(screen.getByRole('list', { name: 'Motivos de llamada' })).toBeInTheDocument()
    expect(screen.getByText('1.240')).toBeInTheDocument()
    const fills = container.querySelectorAll<HTMLElement>('.gcu-rank-list__fill')
    expect(fills[0].style.width).toBe('100%')
    expect(fills[1].style.width).toBe('50%')
    expect(container.querySelector('.gcu-rank-list__bar')).toHaveAttribute('aria-hidden', 'true')
    expect(container.querySelector('.gcu-rank-list__item--danger')).toBeInTheDocument()
  })

  test('más de 6 filas avisa; vacío y carga', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const many = Array.from({ length: 7 }, (_, i) => ({ id: i, label: `M${i}`, value: i }))
    const { rerender, container } = render(<RankList items={many} />)
    expect(warn).toHaveBeenCalledWith('[duralux]', expect.stringContaining('de 3 a 6'))
    rerender(<RankList items={[]} />)
    expect(screen.getByText('Sin datos para este periodo.')).toBeInTheDocument()
    rerender(<RankList items={[]} loading />)
    expect(container.firstChild).toHaveAttribute('aria-busy', 'true')
  })
})

describe('QuickTiles (lote N2)', () => {
  test('enlaces y botones; el deshabilitado explica por qué', async () => {
    const onClick = vi.fn()
    render(
      <QuickTiles
        title="Accesos rápidos"
        items={[
          { label: 'Crear campaña', icon: 'plus', href: '/campanas/nueva' },
          { label: 'Importar contactos', icon: 'upload', onClick },
          { label: 'Exportar reporte', icon: 'download', disabled: true, disabledReason: 'Disponible al cerrar el día', onClick },
        ]}
      />,
    )
    expect(screen.getByRole('region', { name: 'Accesos rápidos' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Crear campaña' })).toHaveAttribute('href', '/campanas/nueva')
    await userEvent.click(screen.getByRole('button', { name: 'Importar contactos' }))
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button', { name: /Exportar reporte/ })).toBeDisabled()
    expect(screen.getByText('Disponible al cerrar el día')).toBeInTheDocument()
  })
})

describe('ProcessSteps (lote N2)', () => {
  const steps = [
    { key: 't', label: 'Transcripción' },
    { key: 'a', label: 'Análisis IA' },
    { key: 'c', label: 'Completado' },
  ]

  test('estado en texto y aria-current en el paso en curso', () => {
    const ref = createRef<HTMLDivElement>()
    render(<ProcessSteps ref={ref} label="Procesamiento de la llamada" steps={steps} current={1} />)
    expect(ref.current).toHaveClass('gcu-process-steps', 'gcu-container')
    const items = screen.getAllByRole('listitem')
    expect(items[0]).toHaveTextContent('Completado')
    expect(items[1]).toHaveAttribute('aria-current', 'step')
    expect(items[1]).toHaveTextContent('En curso')
    expect(items[2]).toHaveTextContent('Pendiente')
  })

  test('failed marca el paso en curso con error', () => {
    render(<ProcessSteps label="Proceso" steps={steps} current={1} failed />)
    expect(screen.getAllByRole('listitem')[1]).toHaveTextContent('Con error')
  })
})

describe('AppStatusCard (lote N2)', () => {
  test('estado del contrato en texto con forma de Severity y detalle', () => {
    const { container, rerender } = render(<AppStatusCard name="Call reviews" status="caido" detail="Desde 16:42" action={<a href="#i">Ver incidente</a>} />)
    expect(screen.getByText('Caída')).toBeInTheDocument()
    expect(container.querySelector('.gcu-severity--critical')).toBeInTheDocument()
    expect(screen.getByText('Desde 16:42')).toBeInTheDocument()
    rerender(<AppStatusCard name="Call reviews" status="activo" />)
    expect(screen.getByText('Operativa')).toBeInTheDocument()
  })
})
