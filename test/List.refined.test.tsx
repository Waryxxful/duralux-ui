import { createRef, useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { ActiveFilters, BulkBar, List } from '../src'

afterEach(() => vi.restoreAllMocks())

const ITEMS = [
  { id: 1, title: 'Camila Rojas', meta: 'Cobranza' },
  { id: 2, title: 'Benjamín Soto', meta: 'Retención', disabled: true },
  { id: 3, title: 'Daniela Pérez', meta: 'Ventas' },
  { id: 4, title: 'Diego Muñoz', meta: 'Calidad' },
]

describe('List (lote N2)', () => {
  test('sin selección: list-group-flush; filas con onClick son botones', async () => {
    const onClick = vi.fn()
    const ref = createRef<HTMLElement>()
    render(<List ref={ref} label="Agentes" items={[{ id: 'a', title: 'Fila', onClick, unread: true }, { id: 'b', title: 'Enlace', href: '#x' }]} />)
    expect(ref.current).toHaveClass('list-group', 'list-group-flush', 'gcu-list')
    await userEvent.click(screen.getByRole('button', { name: /Sin leer: Fila/ }))
    expect(onClick).toHaveBeenCalled()
    expect(screen.getByRole('link', { name: 'Enlace' })).toHaveAttribute('href', '#x')
  })

  test('single: listbox con flechas (salta deshabilitados), Inicio/Fin y Enter', async () => {
    const onSelectionChange = vi.fn()
    render(<List label="Agentes" selectionMode="single" items={ITEMS} onSelectionChange={onSelectionChange} />)
    const listbox = screen.getByRole('listbox', { name: 'Agentes' })
    expect(listbox).not.toHaveAttribute('aria-multiselectable')
    const options = screen.getAllByRole('option')
    expect(options[0]).toHaveAttribute('tabindex', '0')
    expect(options[2]).toHaveAttribute('tabindex', '-1')
    await userEvent.tab()
    expect(options[0]).toHaveFocus()
    await userEvent.keyboard('{ArrowDown}')
    expect(options[2]).toHaveFocus()
    await userEvent.keyboard('{End}')
    expect(options[3]).toHaveFocus()
    await userEvent.keyboard('{Home}')
    expect(options[0]).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    expect(onSelectionChange).toHaveBeenLastCalledWith([1])
    expect(options[0]).toHaveAttribute('aria-selected', 'true')
  })

  test('multiple: Espacio alterna, Ctrl+A selecciona todo, búsqueda por tipeo', async () => {
    const onSelectionChange = vi.fn()
    render(<List label="Agentes" selectionMode="multiple" items={ITEMS} onSelectionChange={onSelectionChange} />)
    expect(screen.getByRole('listbox')).toHaveAttribute('aria-multiselectable', 'true')
    await userEvent.tab()
    await userEvent.keyboard('di')
    expect(screen.getByRole('option', { name: /Diego/ })).toHaveFocus()
    await userEvent.keyboard(' ')
    expect(onSelectionChange).toHaveBeenLastCalledWith([4])
    await userEvent.keyboard('{Control>}a{/Control}')
    expect(onSelectionChange).toHaveBeenLastCalledWith([1, 3, 4])
  })

  test('controlada: respeta selectedIds', async () => {
    function Controlada() {
      const [ids, setIds] = useState<Array<string | number>>([3])
      return <List label="Agentes" selectionMode="single" items={ITEMS} selectedIds={ids} onSelectionChange={setIds} />
    }
    render(<Controlada />)
    expect(screen.getByRole('option', { name: /Daniela/ })).toHaveAttribute('aria-selected', 'true')
    await userEvent.click(screen.getByRole('option', { name: /Camila/ }))
    expect(screen.getByRole('option', { name: /Camila/ })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('option', { name: /Daniela/ })).toHaveAttribute('aria-selected', 'false')
  })

  test('vacío y carga', () => {
    const { rerender, container } = render(<List items={[]} empty="Nadie coincide con la búsqueda." />)
    expect(screen.getByRole('status')).toHaveTextContent('Nadie coincide con la búsqueda.')
    rerender(<List items={ITEMS} loading />)
    expect(container.firstChild).toHaveAttribute('aria-busy', 'true')
  })
})

describe('BulkBar (lote N2)', () => {
  test('anuncia «3 seleccionados» y ofrece quitar la selección', async () => {
    const onClear = vi.fn()
    const ref = createRef<HTMLDivElement>()
    const { rerender } = render(<BulkBar ref={ref} count={0} onClear={onClear} />)
    expect(screen.queryByRole('region')).toBeNull()
    expect(ref.current).toHaveAttribute('data-state', 'closed')
    rerender(<BulkBar ref={ref} count={3} onClear={onClear} actions={<button type="button">Reasignar</button>} />)
    expect(screen.getByRole('status')).toHaveTextContent('3 seleccionados')
    expect(screen.getByRole('region', { name: 'Acciones sobre la selección' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Quitar selección' }))
    expect(onClear).toHaveBeenCalled()
  })

  test('singular y total', () => {
    render(<BulkBar count={1} total={1200} />)
    expect(screen.getByRole('status')).toHaveTextContent('1 de 1.200 seleccionado')
  })
})

describe('ActiveFilters (lote N2)', () => {
  test('chips con quitar accesible, foco al siguiente y limpiar filtros', async () => {
    function Filtros() {
      const [filters, setFilters] = useState([
        { key: 'estado', label: 'Estado', value: 'Vencido' },
        { key: 'cola', label: 'Cola', value: 'Cobranza' },
      ])
      return (
        <ActiveFilters
          filters={filters}
          resultCount={128}
          onRemove={(key) => setFilters((current) => current.filter((f) => f.key !== key))}
          onClear={() => setFilters([])}
        />
      )
    }
    render(<Filtros />)
    expect(screen.getByRole('list', { name: 'Filtros activos' })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('128 resultados')
    await userEvent.click(screen.getByRole('button', { name: 'Quitar filtro Estado: Vencido' }))
    expect(screen.getByRole('button', { name: 'Quitar filtro Cola: Cobranza' })).toHaveFocus()
  })

  test('limpiar y vacío', async () => {
    const onClear = vi.fn()
    const { rerender, container } = render(
      <ActiveFilters filters={[{ key: 'a', label: 'A' }, { key: 'b', label: 'B' }]} onRemove={() => {}} onClear={onClear} />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Limpiar filtros' }))
    expect(onClear).toHaveBeenCalled()
    rerender(<ActiveFilters filters={[]} onRemove={() => {}} />)
    expect(container).toBeEmptyDOMElement()
  })
})
