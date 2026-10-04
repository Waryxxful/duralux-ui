import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { DataTableToolbar } from '../src/components/data/DataTableToolbar'

afterEach(() => vi.restoreAllMocks())

describe('DataTableToolbar refinada (receta de componente 2.3)', () => {
  test('reenvía ref al contenedor y expone la clase del componente', () => {
    const ref = createRef<HTMLDivElement>()
    render(<DataTableToolbar ref={ref} />)
    expect(ref.current).toHaveClass('data-table-toolbar', 'gcu-table-toolbar')
  })

  test('la búsqueda es un landmark de búsqueda con nombre propio', () => {
    render(<DataTableToolbar searchLabel="Buscar campañas" />)
    const search = screen.getByRole('search', { name: 'Buscar campañas' })
    expect(search).toContainElement(screen.getByRole('textbox', { name: 'Buscar campañas' }))
  })

  test('el selector de filas por página y las acciones comparten la fila', async () => {
    const user = userEvent.setup()
    const onPageSizeChange = vi.fn()
    render(
      <DataTableToolbar pageSize={10} pageSizeOptions={[10, 25, 50]} onPageSizeChange={onPageSizeChange}>
        <button type="button">Exportar reporte</button>
      </DataTableToolbar>,
    )
    await user.selectOptions(screen.getByRole('combobox', { name: 'Filas por página' }), '25')
    expect(onPageSizeChange).toHaveBeenCalledWith(25)
    expect(screen.getByRole('button', { name: 'Exportar reporte' }).parentElement).toHaveClass('gcu-table-toolbar__actions')
  })

  test('sin búsqueda, sin selector y sin acciones no renderiza nada', () => {
    const { container } = render(<DataTableToolbar searchable={false} />)
    expect(container.firstChild).toBeNull()
  })
})
