import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import { DataTable } from '../src/components/data/DataTable'

interface Fila {
  id: number
  nombre: string
  cola: string
  monto: number
}

const FILAS: Fila[] = [
  { id: 1, nombre: 'Beta', cola: 'Ventas', monto: 30 },
  { id: 2, nombre: 'Alfa', cola: 'Ventas', monto: 10 },
  { id: 3, nombre: 'Gamma', cola: 'Cobranza', monto: 20 },
]

const COLUMNAS = [
  { key: 'nombre' as const, label: 'Nombre', sortable: true },
  { key: 'cola' as const, label: 'Cola', sortable: true },
  { key: 'monto' as const, label: 'Monto', sortable: true, numeric: true },
]

function nombres() {
  return screen.getAllByRole('row').slice(1).map(row => within(row).getAllByRole('cell')[0].textContent)
}

test('ordena por varias columnas con Mayús + clic y numera la prioridad', async () => {
  const user = userEvent.setup()
  render(<DataTable<Fila> columns={COLUMNAS} data={FILAS} aria-label="Campañas" />)

  await user.click(screen.getByRole('button', { name: 'Cola' }))
  await user.keyboard('{Shift>}')
  await user.click(screen.getByRole('button', { name: 'Nombre' }))
  await user.keyboard('{/Shift}')

  expect(nombres()).toEqual(['Gamma', 'Alfa', 'Beta'])
  expect(screen.getByRole('columnheader', { name: 'Cola' })).toHaveAttribute('aria-sort', 'ascending')
  expect(screen.getByRole('columnheader', { name: 'Nombre' })).toHaveAttribute('aria-sort', 'ascending')
  expect(screen.getByRole('button', { name: 'Nombre' })).toHaveAccessibleDescription('Mayús + clic agrega la columna al orden.')
  expect(document.querySelector('[aria-live="polite"]')).toHaveTextContent('Orden: Cola, ascendente; Nombre, ascendente.')

  // Sin Mayús, el orden vuelve a una sola columna.
  await user.click(screen.getByRole('button', { name: 'Monto' }))
  expect(screen.getByRole('columnheader', { name: 'Cola' })).toHaveAttribute('aria-sort', 'none')
  expect(nombres()).toEqual(['Alfa', 'Gamma', 'Beta'])
})

test('alinea a la derecha las columnas numéricas', () => {
  render(<DataTable<Fila> columns={COLUMNAS} data={FILAS} />)
  expect(screen.getByRole('columnheader', { name: 'Monto' })).toHaveClass('text-end')
  expect(screen.getByText('30').closest('td')).toHaveClass('text-end')
})

test('el menú «Columnas» oculta y muestra columnas y avisa el cambio', async () => {
  const user = userEvent.setup()
  const onChange = vi.fn()
  render(
    <DataTable<Fila>
      columns={COLUMNAS}
      data={FILAS}
      defaultColumnVisibility={{ cola: false }}
      onColumnVisibilityChange={onChange}
    />,
  )

  expect(screen.queryByRole('columnheader', { name: 'Cola' })).not.toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Columnas' }))
  await user.click(screen.getByRole('checkbox', { name: 'Cola' }))
  expect(screen.getByRole('columnheader', { name: 'Cola' })).toBeInTheDocument()
  expect(onChange).toHaveBeenLastCalledWith({ nombre: true, cola: true, monto: true })

  await user.click(screen.getByRole('checkbox', { name: 'Monto' }))
  expect(screen.queryByRole('columnheader', { name: 'Monto' })).not.toBeInTheDocument()
})

test('nunca deja la tabla sin columnas: la última visible queda bloqueada', async () => {
  const user = userEvent.setup()
  render(<DataTable<Fila> columns={COLUMNAS} data={FILAS} columnVisibility={{ cola: false, monto: false }} />)
  await user.click(screen.getByRole('button', { name: 'Columnas' }))
  expect(screen.getByRole('checkbox', { name: 'Nombre' })).toBeDisabled()
  expect(screen.getByText('Al menos una columna debe quedar visible.')).toBeInTheDocument()
})

test('acciones masivas: reciben las filas seleccionadas y pueden limpiar la selección', async () => {
  const user = userEvent.setup()
  const renderBulk = vi.fn((rows: Fila[]) => <button type="button">Archivar {rows.length}</button>)
  render(<DataTable<Fila> columns={COLUMNAS} data={FILAS} selectable getRowLabel={row => row.nombre} renderBulkActions={renderBulk} />)

  expect(screen.queryByText('Limpiar selección')).not.toBeInTheDocument()
  await user.click(screen.getByRole('checkbox', { name: 'Seleccionar fila Gamma' }))
  await user.click(screen.getByRole('checkbox', { name: 'Seleccionar fila Beta' }))
  expect(screen.getByText('2 seleccionadas')).toBeInTheDocument()
  expect(renderBulk).toHaveBeenLastCalledWith([FILAS[2], FILAS[0]], expect.objectContaining({ count: 2 }))

  await user.click(screen.getByRole('button', { name: 'Limpiar selección' }))
  expect(screen.queryByText('2 seleccionadas')).not.toBeInTheDocument()
  expect(screen.getByRole('checkbox', { name: 'Seleccionar fila Gamma' })).not.toBeChecked()
})

test('densidad, encabezado fijo y skeleton vienen de Table', () => {
  const { container, rerender } = render(<DataTable<Fila> columns={COLUMNAS} data={FILAS} density="compact" stickyHeader />)
  expect(container.querySelector('table')).toHaveClass('table', 'table-hover', 'gcu-table--compact')
  expect(container.querySelector('.gcu-table-scroll--sticky')).not.toBeNull()

  rerender(<DataTable<Fila> columns={COLUMNAS} data={FILAS} loading loadingRows={3} />)
  expect(container.querySelectorAll('.gcu-table__skeleton-row')).toHaveLength(3)
  expect(container.querySelector('table')).toHaveAttribute('aria-busy', 'true')
})

test('muestra el error con reintento en lugar de las filas', async () => {
  const user = userEvent.setup()
  const onRetry = vi.fn()
  const error = vi.spyOn(console, 'error').mockImplementation(() => {})
  try {
    render(<DataTable<Fila> columns={COLUMNAS} data={FILAS} error={new Error('Servidor no disponible')} onRetry={onRetry} />)
    expect(screen.getByRole('alert')).toHaveTextContent('Servidor no disponible')
    expect(screen.queryByText('Beta')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(onRetry).toHaveBeenCalled()
  } finally {
    error.mockRestore()
  }
})

test('anuncia total y página en una región polite', async () => {
  const user = userEvent.setup()
  const muchas = Array.from({ length: 25 }, (_, index) => ({ id: index + 1, nombre: `F${index + 1}`, cola: 'X', monto: index }))
  render(<DataTable<Fila> columns={COLUMNAS} data={muchas} pageSize={10} />)
  const live = document.querySelector('[aria-live="polite"]')
  expect(live).toHaveTextContent('Registros visibles: 25. Página actual: 1 de 3.')
  await user.click(screen.getByRole('button', { name: 'Página siguiente' }))
  expect(live).toHaveTextContent('Página actual: 2 de 3.')
})

test('virtualizada: sin paginación, monta solo una parte de 2.000 filas y expone aria-rowcount', async () => {
  const muchas = Array.from({ length: 2000 }, (_, index) => ({ id: index + 1, nombre: `F${index + 1}`, cola: 'X', monto: index }))
  const { container } = render(<DataTable<Fila> columns={COLUMNAS} data={muchas} virtualized pageSize={10} aria-label="Llamadas" />)

  expect(container.querySelector('table')).toHaveAttribute('aria-rowcount', '2001')
  expect(screen.queryByRole('navigation', { name: 'Paginación de Llamadas' })).not.toBeInTheDocument()
  expect(container.querySelector('.gcu-table-scroll--sticky')).not.toBeNull()
  await waitFor(() => {
    const rows = container.querySelectorAll('tbody tr.single-item')
    expect(rows.length).toBeGreaterThan(0)
    expect(rows.length).toBeLessThan(100)
  })
})
