import { createRef } from 'react'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { Table } from '../src/components/data/Table'

afterEach(() => vi.restoreAllMocks())

interface Fila { id: number, agente: string, llamadas: number }
const columns = [
  { key: 'agente', header: 'Agente' },
  { key: 'llamadas', header: 'Llamadas', numeric: true },
]
const rows: Fila[] = [
  { id: 1, agente: 'Ana Rojas', llamadas: 1240 },
  { id: 2, agente: 'Luis Pérez', llamadas: 87 },
]

describe('Table refinada (receta de componente 2.3)', () => {
  test('reenvía ref al <table> nativo y expone la clase del componente', () => {
    const ref = createRef<HTMLTableElement>()
    render(<Table ref={ref} columns={columns} rows={rows} rowKey="id" />)
    expect(ref.current).toBeInstanceOf(HTMLTableElement)
    expect(ref.current).toHaveClass('table', 'table-hover', 'gcu-table')
  })

  test('las columnas numéricas se alinean a la derecha en encabezado y celdas (números tabulares)', () => {
    render(<Table columns={columns} rows={rows} rowKey="id" />)
    expect(screen.getByRole('columnheader', { name: 'Llamadas' })).toHaveClass('text-end')
    expect(screen.getByRole('cell', { name: '1240' })).toHaveClass('text-end')
    expect(screen.getByRole('cell', { name: 'Ana Rojas' })).not.toHaveClass('text-end')
  })

  test('densidad compacta o cómoda como modificador de la tabla', () => {
    const { rerender } = render(<Table columns={columns} rows={rows} rowKey="id" density="compact" />)
    expect(screen.getByRole('table')).toHaveClass('gcu-table--compact')
    rerender(<Table columns={columns} rows={rows} rowKey="id" density="comfortable" />)
    expect(screen.getByRole('table')).toHaveClass('gcu-table--comfortable')
    expect(screen.getByRole('table')).not.toHaveClass('gcu-table--compact')
  })

  test('el estado vacío usa EmptyState dentro de la tabla, con el mensaje como título', () => {
    const { container } = render(<Table columns={columns} rows={[]} rowKey="id" emptyMessage="Sin llamadas en este periodo" />)
    const state = container.querySelector('td .gcu-state--empty')
    expect(state).not.toBeNull()
    expect(state).toHaveTextContent('Sin llamadas en este periodo')
    expect(container.querySelector('td')).toHaveAttribute('colspan', '2')
    // Sin el texto por defecto de EmptyState debajo de un mensaje propio.
    expect(state).not.toHaveTextContent('Cuando haya elementos disponibles')
  })

  test('si emptyMessage ya es un elemento (uso real en apps: <EmptyState />) no se anida otro EmptyState', () => {
    const { container } = render(<Table columns={columns} rows={[]} rowKey="id" emptyMessage={<div className="gcu-state gcu-state--empty">Sin usuarios</div>} />)
    expect(container.querySelectorAll('.gcu-state--empty')).toHaveLength(1)
    expect(screen.getByText('Sin usuarios')).toBeInTheDocument()
  })

  test('emptyState reemplaza el vacío por defecto (por ejemplo, con una acción)', () => {
    render(<Table columns={columns} rows={[]} rowKey="id" emptyState={<p>Crea tu primera campaña</p>} />)
    expect(screen.getByText('Crea tu primera campaña')).toBeInTheDocument()
  })

  test('la carga muestra un skeleton por fila, oculto a lectores, y un estado anunciado', () => {
    const { container } = render(<Table columns={columns} rows={[]} rowKey="id" loading loadingRows={3} />)
    expect(screen.getByRole('table')).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByRole('status')).toHaveTextContent('Cargando...')
    const skeletonRows = container.querySelectorAll('tbody tr.gcu-table__skeleton-row')
    expect(skeletonRows).toHaveLength(3)
    skeletonRows.forEach((row) => {
      expect(row).toHaveAttribute('aria-hidden', 'true')
      expect(row.querySelectorAll('td')).toHaveLength(2)
      expect(row.querySelectorAll('.gcu-skeleton')).toHaveLength(2)
    })
  })

  test('el contenedor desplaza en horizontal dentro de sí, nunca la página', () => {
    const { container } = render(<Table columns={columns} rows={rows} rowKey="id" />)
    expect(container.firstElementChild).toHaveClass('table-responsive', 'gcu-table-scroll')
  })

  test('encabezado fijo: el contenedor desplaza en vertical y marca cuando hay scroll (sombra)', () => {
    const { container } = render(<Table columns={columns} rows={rows} rowKey="id" stickyHeader maxHeight={240} />)
    // SAFETY: con responsive (por defecto) el primer hijo es el contenedor <div> de la tabla.
    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper).toHaveClass('gcu-table-scroll--sticky', 'gcu-scroll')
    expect(wrapper.style.maxHeight).toBe('240px')
    expect(wrapper).not.toHaveAttribute('data-scrolled')
    wrapper.scrollTop = 40
    fireEvent.scroll(wrapper)
    expect(wrapper).toHaveAttribute('data-scrolled', 'true')
    wrapper.scrollTop = 0
    fireEvent.scroll(wrapper)
    expect(wrapper).not.toHaveAttribute('data-scrolled')
  })

  test('el contenedor con scroll se puede recorrer con teclado (axe scrollable-region-focusable)', () => {
    const { container, rerender } = render(<Table columns={columns} rows={rows} rowKey="id" aria-label="Campañas" stickyHeader />)
    // SAFETY: con responsive (por defecto) el primer hijo es el contenedor <div> de la tabla.
    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper).toHaveAttribute('tabindex', '0')
    expect(wrapper).toHaveAttribute('role', 'region')
    expect(wrapper).toHaveAccessibleName('Campañas')
    // Sin desborde (jsdom mide 0) y sin encabezado fijo no agrega una parada de tabulación.
    rerender(<Table columns={columns} rows={rows} rowKey="id" aria-label="Campañas" />)
    expect(container.firstElementChild).not.toHaveAttribute('tabindex')
  })

  test('encabezado fijo sin contenedor propio avisa por log y no rompe', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<Table columns={columns} rows={rows} rowKey="id" stickyHeader responsive={false} />)
    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(warn).toHaveBeenCalledWith('[duralux]', expect.stringContaining('stickyHeader'))
  })

  test('las filas mantienen el contenido (sin regresión del render por columna)', () => {
    render(<Table columns={[{ key: 'agente', header: 'Agente', render: (row: Fila) => <strong>{row.agente}</strong> }]} rows={rows} rowKey="id" />)
    const body = screen.getAllByRole('rowgroup')[1]
    expect(within(body).getAllByRole('row')).toHaveLength(2)
    expect(within(body).getByText('Luis Pérez').tagName).toBe('STRONG')
  })
})

