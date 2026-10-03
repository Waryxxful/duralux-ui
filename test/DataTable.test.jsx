import { useState } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import { DataTable } from '../src/components/data/DataTable.jsx'

const columns = [{ key: 'name', label: 'Nombre' }]

const searchableData = [
  { id: 1, name: 'Ada Lovelace', email: 'ada@example.test' },
  { id: 2, name: 'Grace Hopper', email: 'grace@example.test' },
  { id: 3, name: 'Linus Torvalds', email: 'linus@example.test' },
]

test('calls column renderers with row, value, and row index', () => {
  const data = [{ id: 1, name: 'Ada' }]
  const cellRenderer = vi.fn((row, value, rowIndex) => `${row.id}:${value}:${rowIndex}`)

  render(
    <DataTable
      columns={[{ key: 'name', label: 'Nombre', render: cellRenderer }]}
      data={data}
    />,
  )

  expect(screen.getByText('1:Ada:0')).toBeInTheDocument()
  expect(cellRenderer).toHaveBeenCalledWith(data[0], 'Ada', 0)
  expect(cellRenderer).toHaveBeenCalledTimes(1)
})

test('clamps the current page after pageSize and data rerenders', async () => {
  const user = userEvent.setup()
  const data = Array.from({ length: 5 }, (_, index) => ({
    id: index + 1,
    name: `Fila ${index + 1}`,
  }))
  const { rerender } = render(<DataTable columns={columns} data={data} pageSize={2} />)

  await user.click(screen.getByRole('button', { name: 'Página siguiente' }))
  await user.click(screen.getByRole('button', { name: 'Página siguiente' }))
  expect(screen.getByText('Fila 5')).toBeInTheDocument()

  rerender(<DataTable columns={columns} data={data} pageSize={3} />)
  expect(screen.getByText('Fila 4')).toBeInTheDocument()
  expect(screen.getByText(/Página 2 de 2/)).toBeInTheDocument()

  rerender(<DataTable columns={columns} data={data.slice(0, 1)} pageSize={3} />)
  expect(screen.getByText('Fila 1')).toBeInTheDocument()
  expect(screen.queryByText('Sin datos')).not.toBeInTheDocument()
})

test('uses native disabled previous and next pager buttons', async () => {
  const user = userEvent.setup()
  const data = Array.from({ length: 3 }, (_, index) => ({
    id: index + 1,
    name: `Fila ${index + 1}`,
  }))

  render(<DataTable columns={columns} data={data} pageSize={1} />)

  const previous = screen.getByRole('button', { name: 'Página anterior' })
  const next = screen.getByRole('button', { name: 'Página siguiente' })
  expect(previous).toHaveAttribute('type', 'button')
  expect(previous).toBeDisabled()
  expect(next).not.toBeDisabled()

  await user.click(screen.getByRole('button', { name: '3' }))
  expect(previous).not.toBeDisabled()
  expect(next).toBeDisabled()
  expect(next).toHaveAttribute('type', 'button')
})

test('composes the public navigation pager with current-page semantics', () => {
  const data = Array.from({ length: 3 }, (_, index) => ({
    id: index + 1,
    name: `Fila ${index + 1}`,
  }))

  render(<DataTable columns={columns} data={data} pageSize={1} />)

  const nav = screen.getByRole('navigation', { name: 'Paginación de la tabla' })
  expect(nav.querySelector('[aria-current="page"]')).toHaveTextContent('1')
})

test('composes one Table surface without nested responsive wrappers', () => {
  const { container, rerender } = render(
    <DataTable
      columns={columns}
      data={[{ id: 1, name: 'Ada' }]}
      responsive
    />,
  )

  expect(container.querySelectorAll('table')).toHaveLength(1)
  expect(container.querySelectorAll('.table-responsive')).toHaveLength(1)

  rerender(
    <DataTable
      columns={columns}
      data={[{ id: 1, name: 'Ada' }]}
      responsive={false}
    />,
  )
  expect(container.querySelectorAll('table')).toHaveLength(1)
  expect(container.querySelectorAll('.table-responsive')).toHaveLength(0)
})

test('select-all changes only current-page membership', async () => {
  const user = userEvent.setup()
  const handleSelectionChange = vi.fn()
  const data = Array.from({ length: 4 }, (_, index) => ({
    id: index + 1,
    name: `Fila ${index + 1}`,
  }))

  render(
    <DataTable
      columns={columns}
      data={data}
      pageSize={2}
      selectable
      onSelectionChange={handleSelectionChange}
    />,
  )

  let [selectAll] = screen.getAllByRole('checkbox')
  await user.click(selectAll)
  expect(handleSelectionChange).toHaveBeenLastCalledWith([1, 2])

  await user.click(screen.getByRole('button', { name: '2' }))
  selectAll = screen.getAllByRole('checkbox')[0]
  expect(selectAll).not.toBeChecked()

  const [, firstRow] = screen.getAllByRole('checkbox')
  await user.click(firstRow)
  expect(selectAll.indeterminate).toBe(true)

  await user.click(selectAll)
  expect(handleSelectionChange).toHaveBeenLastCalledWith([1, 2, 3, 4])
  expect(selectAll).toBeChecked()

  await user.click(selectAll)
  expect(handleSelectionChange).toHaveBeenLastCalledWith([1, 2])
})

test('selection checkboxes have useful names, safe IDs, and a mixed state', async () => {
  const user = userEvent.setup()
  const data = [
    { id: 'row/one', name: 'Ada' },
    { id: 'row two', name: 'Grace' },
  ]

  render(<DataTable columns={columns} data={data} selectable />)

  const selectAll = screen.getByRole('checkbox', {
    name: 'Seleccionar todas las filas de la página actual',
  })
  const ada = screen.getByRole('checkbox', { name: 'Seleccionar fila Ada' })
  const grace = screen.getByRole('checkbox', { name: 'Seleccionar fila Grace' })
  const checkboxes = [selectAll, ada, grace]
  const ids = checkboxes.map(checkbox => checkbox.id)
  const labels = Array.from(document.querySelectorAll('label')).map(label => label.htmlFor)

  expect(new Set(ids).size).toBe(ids.length)
  expect(ids.every(id => /^[A-Za-z][A-Za-z0-9_-]*$/.test(id))).toBe(true)
  expect(labels).toEqual(ids)

  await user.click(ada)
  expect(selectAll).toHaveAttribute('aria-checked', 'mixed')
  expect(selectAll.indeterminate).toBe(true)

  await user.click(selectAll)
  expect(selectAll).toBeChecked()
  expect(selectAll).toHaveAttribute('aria-checked', 'true')
  expect(grace).toBeChecked()
})

test('supports a custom row label resolver and a useful default', () => {
  const getRowLabel = vi.fn(row => row.email)
  const data = [{ id: 1, name: 'Ada', email: 'ada@example.test' }]

  const { rerender } = render(
    <DataTable columns={columns} data={data} selectable getRowLabel={getRowLabel} />,
  )

  expect(screen.getByRole('checkbox', { name: 'Seleccionar fila ada@example.test' }))
    .toBeInTheDocument()
  expect(getRowLabel).toHaveBeenCalledWith(data[0], 0)

  rerender(<DataTable columns={columns} data={[{ id: 2, name: 'Grace' }]} selectable />)
  expect(screen.getByRole('checkbox', { name: 'Seleccionar fila Grace' })).toBeInTheDocument()
})

test('uses the global sorted row index in paginated checkbox labels', async () => {
  const user = userEvent.setup()
  const data = [
    { id: 1, name: 'Zulu' },
    { id: 2, name: 'Alpha' },
    { id: 3, name: 'Mike' },
  ]

  render(
    <DataTable
      columns={[{ key: 'name', label: 'Nombre', sortable: true }]}
      data={data}
      pageSize={1}
      selectable
      getRowLabel={(_, index) => `Registro ${index + 1}`}
    />,
  )

  await user.click(screen.getByRole('button', { name: 'Nombre' }))
  await user.click(screen.getByRole('button', { name: '2' }))

  expect(screen.getByRole('checkbox', { name: 'Seleccionar fila Registro 2' }))
    .toBeInTheDocument()
})

test('prunes selections missing from data and reports the change', async () => {
  const user = userEvent.setup()
  const handleSelectionChange = vi.fn()
  const data = [
    { id: 1, name: 'Ada' },
    { id: 2, name: 'Grace' },
  ]
  const { rerender } = render(
    <DataTable
      columns={columns}
      data={data}
      selectable
      onSelectionChange={handleSelectionChange}
    />,
  )

  await user.click(screen.getAllByRole('checkbox')[0])
  rerender(
    <DataTable
      columns={columns}
      data={data.slice(1)}
      selectable
      onSelectionChange={handleSelectionChange}
    />,
  )

  await waitFor(() => {
    expect(handleSelectionChange).toHaveBeenLastCalledWith([2])
  })
})

test('uses unique checkbox IDs and matching labels across table instances', () => {
  const { container } = render(
    <>
      <DataTable columns={columns} data={[{ id: 1, name: 'Ada' }]} selectable />
      <DataTable columns={columns} data={[{ id: 1, name: 'Grace' }]} selectable />
    </>,
  )

  const ids = screen.getAllByRole('checkbox').map((checkbox) => checkbox.id)
  const labelTargets = Array.from(container.querySelectorAll('label')).map((label) => label.htmlFor)

  expect(ids.every(Boolean)).toBe(true)
  expect(new Set(ids).size).toBe(ids.length)
  expect(labelTargets).toEqual(ids)
})

test('adds the selected class to selected rows', async () => {
  const user = userEvent.setup()

  render(<DataTable columns={columns} data={[{ id: 1, name: 'Ada' }]} selectable />)

  const row = screen.getByText('Ada').closest('tr')
  await user.click(screen.getAllByRole('checkbox')[1])
  expect(row).toHaveClass('single-item', 'selected')
})

test('sorts from the keyboard and exposes aria-sort', async () => {
  const user = userEvent.setup()
  const data = [
    { id: 1, name: 'Beta' },
    { id: 2, name: 'Alpha' },
  ]

  render(
    <DataTable
      columns={[{ key: 'name', label: 'Nombre', sortable: true }]}
      data={data}
    />,
  )

  const header = screen.getByRole('columnheader', { name: 'Nombre' })
  const sortButton = screen.getByRole('button', { name: 'Nombre' })
  expect(header).toHaveAttribute('aria-sort', 'none')

  sortButton.focus()
  await user.keyboard('{Enter}')
  expect(header).toHaveAttribute('aria-sort', 'ascending')
  expect(screen.getAllByRole('cell').map((cell) => cell.textContent)).toEqual(['Alpha', 'Beta'])

  await user.keyboard(' ')
  expect(header).toHaveAttribute('aria-sort', 'descending')
  expect(screen.getAllByRole('cell').map((cell) => cell.textContent)).toEqual(['Beta', 'Alpha'])
})

test('renders variant "button" actions with visible label and default variant as icon-only', async () => {
  const user = userEvent.setup()
  const onIconClick = vi.fn()
  const onButtonClick = vi.fn()
  const data = [{ id: 1, name: 'Ada' }]

  render(
    <DataTable
      columns={columns}
      data={data}
      actions={[
        { label: 'Editar', icon: 'feather-edit', onClick: onIconClick },
        { label: 'Detalle', icon: 'feather-eye', variant: 'button', onClick: onButtonClick },
      ]}
    />,
  )

  const editar = screen.getByRole('button', { name: 'Editar' })
  expect(editar).toHaveAttribute('aria-label', 'Editar')
  expect(editar).toHaveClass('btn', 'btn-icon', 'btn-light-brand')
  expect(editar.querySelector('i')).toHaveAttribute('aria-hidden', 'true')

  const detalle = screen.getByRole('button', { name: 'Detalle' })
  expect(detalle).toHaveClass('btn', 'btn-light-brand')
  await user.click(detalle)
  expect(onButtonClick).toHaveBeenCalledWith(data[0])
  expect(onIconClick).not.toHaveBeenCalled()
})

test('falls back to accessible action labels and omits actions without callbacks', async () => {
  const user = userEvent.setup()
  const onFallbackAction = vi.fn()
  const warning = vi.spyOn(console, 'warn').mockImplementation(() => {})

  try {
    render(
      <DataTable
        columns={columns}
        data={[{ id: 1, name: 'Ada' }]}
        actions={[
          { onClick: onFallbackAction },
          { label: 'Sin callback', icon: 'feather-x' },
          {},
        ]}
      />,
    )

    const fallback = screen.getByRole('button', { name: 'Acción 1' })
    await user.click(fallback)

    expect(onFallbackAction).toHaveBeenCalledWith({ id: 1, name: 'Ada' })
    expect(screen.queryByRole('button', { name: 'Sin callback' })).not.toBeInTheDocument()
    expect(warning).toHaveBeenCalled()
  } finally {
    warning.mockRestore()
  }
})

test('autoWidth adds table-auto-width class; default has no extra class', () => {
  const { rerender } = render(<DataTable columns={columns} data={[{ id: 1, name: 'Ada' }]} />)
  expect(document.querySelector('table')).not.toHaveClass('table-auto-width')

  rerender(<DataTable columns={columns} data={[{ id: 1, name: 'Ada' }]} autoWidth />)
  expect(document.querySelector('table')).toHaveClass('table', 'table-hover', 'table-auto-width')
})

test('safely normalizes a non-positive pageSize', () => {
  render(
    <DataTable
      columns={columns}
      data={[
        { id: 1, name: 'Ada' },
        { id: 2, name: 'Grace' },
      ]}
      pageSize={0}
    />,
  )

  expect(screen.getByText('Ada')).toBeInTheDocument()
  expect(screen.getByText('Grace')).toBeInTheDocument()
})

test('does not render a toolbar unless search or page-size options are enabled', () => {
  render(<DataTable columns={columns} data={[{ id: 1, name: 'Ada' }]} />)

  expect(screen.queryByRole('textbox', { name: 'Buscar registros' })).not.toBeInTheDocument()
  expect(screen.queryByRole('combobox', { name: 'Filas por página' })).not.toBeInTheDocument()
})

test('filters locally with an uncontrolled accessible search and resets the page', async () => {
  const user = userEvent.setup()

  render(
    <DataTable
      columns={columns}
      data={searchableData}
      pageSize={1}
      searchable
      filterResolver={row => row.name}
    />,
  )

  await user.click(screen.getByRole('button', { name: '2' }))
  const search = screen.getByRole('textbox', { name: 'Buscar registros' })
  await user.type(search, 'Ada')

  expect(search).toHaveValue('Ada')
  expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
  expect(screen.queryByText('Grace Hopper')).not.toBeInTheDocument()
  expect(screen.queryByText('Linus Torvalds')).not.toBeInTheDocument()
  expect(screen.queryByText('Página 2 de')).not.toBeInTheDocument()
  expect(screen.getByText(/1 de 3 registros/)).toBeInTheDocument()
})

test('supports controlled search values and reports changes exactly once', async () => {
  const user = userEvent.setup()
  const onSearchChange = vi.fn()

  function ControlledSearch() {
    const [value, setValue] = useState('Grace')

    return (
      <DataTable
        columns={columns}
        data={searchableData}
        searchable
        searchValue={value}
        onSearchChange={nextValue => {
          onSearchChange(nextValue)
          setValue(nextValue)
        }}
        filterResolver={row => row.name}
      />
    )
  }

  render(<ControlledSearch />)

  const search = screen.getByRole('textbox', { name: 'Buscar registros' })
  expect(search).toHaveValue('Grace')
  expect(screen.getByText('Grace Hopper')).toBeInTheDocument()
  expect(screen.queryByText('Ada Lovelace')).not.toBeInTheDocument()

  await user.clear(search)
  await user.type(search, 'Ada')

  expect(onSearchChange).toHaveBeenCalled()
  expect(onSearchChange).toHaveBeenLastCalledWith('Ada')
  expect(search).toHaveValue('Ada')
  expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
})

test('manual filtering calls the consumer without applying the predicate twice', async () => {
  const user = userEvent.setup()
  const onSearchChange = vi.fn()
  const filterPredicate = vi.fn(() => {
    throw new Error('manual mode must not invoke the local predicate')
  })

  render(
    <DataTable
      columns={columns}
      data={searchableData}
      searchable
      filterMode="manual"
      filterPredicate={filterPredicate}
      onSearchChange={onSearchChange}
    />,
  )

  const search = screen.getByRole('textbox', { name: 'Buscar registros' })
  await user.type(search, 'Grace')

  expect(onSearchChange).toHaveBeenLastCalledWith('Grace')
  expect(filterPredicate).not.toHaveBeenCalled()
  expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
  expect(screen.getByText('Grace Hopper')).toBeInTheDocument()
})

test('preserves selection for rows temporarily hidden by a local filter', async () => {
  const user = userEvent.setup()
  const onSelectionChange = vi.fn()

  render(
    <DataTable
      columns={columns}
      data={searchableData}
      selectable
      searchable
      filterResolver={row => row.name}
      onSelectionChange={onSelectionChange}
    />,
  )

  await user.click(screen.getByRole('checkbox', { name: 'Seleccionar fila Ada Lovelace' }))
  const search = screen.getByRole('textbox', { name: 'Buscar registros' })
  await user.type(search, 'Grace')

  expect(screen.queryByRole('checkbox', { name: 'Seleccionar fila Ada Lovelace' }))
    .not.toBeInTheDocument()
  await user.clear(search)

  expect(screen.getByRole('checkbox', { name: 'Seleccionar fila Ada Lovelace' }))
    .toBeChecked()
  expect(onSelectionChange).toHaveBeenLastCalledWith([1])
})

test('defensively ignores resolver failures and distinguishes no-results from empty data', () => {
  const warning = vi.spyOn(console, 'warn').mockImplementation(() => {})

  try {
    const { rerender } = render(
      <DataTable
        columns={columns}
        data={[]}
        emptyMessage="No hay filas"
        noResultsMessage="Nada coincide"
        searchable
      />,
    )

    expect(screen.getByText('No hay filas')).toBeInTheDocument()
    rerender(
      <DataTable
        columns={columns}
        data={[{ id: 1, name: 'Ada' }]}
        searchValue="zzz"
        searchable
        noResultsMessage="Nada coincide"
        filterResolver={() => {
          throw new Error('resolver failure')
        }}
      />,
    )

    expect(screen.getByText('Nada coincide')).toBeInTheDocument()
    expect(screen.queryByText('No hay filas')).not.toBeInTheDocument()
    expect(warning).toHaveBeenCalled()

    rerender(
      <DataTable
        columns={columns}
        data={[]}
        loading
        searchable
      />,
    )
    expect(screen.getAllByRole('status')).toHaveLength(1)
    expect(screen.getByRole('status')).toHaveTextContent('Cargando...')
  } finally {
    warning.mockRestore()
  }
})

test('normalizes page-size options, has an internal fallback, and resets the page', async () => {
  const user = userEvent.setup()
  const data = Array.from({ length: 5 }, (_, index) => ({
    id: index + 1,
    name: `Fila ${index + 1}`,
  }))

  render(
    <DataTable
      columns={columns}
      data={data}
      pageSize={1}
      pageSizeOptions={[NaN, -2, 2, 2, 4, Infinity]}
    />,
  )

  const select = screen.getByRole('combobox', { name: 'Filas por página' })
  expect(Array.from(select.options).map(option => option.value)).toEqual(['1', '2', '4'])

  await user.click(screen.getByRole('button', { name: 'Página siguiente' }))
  await user.click(screen.getByRole('button', { name: 'Página siguiente' }))
  await user.selectOptions(select, '4')

  expect(select).toHaveValue('4')
  expect(screen.getByText('Fila 1')).toBeInTheDocument()
  expect(screen.queryByText('Página 3 de')).not.toBeInTheDocument()
})

test('supports controlled page size and does not show a dead one-option selector', async () => {
  const user = userEvent.setup()
  const onPageSizeChange = vi.fn()

  function ControlledPageSize() {
    const [value, setValue] = useState(1)

    return (
      <DataTable
        columns={columns}
        data={[{ id: 1, name: 'Ada' }, { id: 2, name: 'Grace' }]}
        pageSize={value}
        pageSizeOptions={[1, 2]}
        onPageSizeChange={nextValue => {
          onPageSizeChange(nextValue)
          setValue(nextValue)
        }}
      />
    )
  }

  const { rerender } = render(<ControlledPageSize />)
  const select = screen.getByRole('combobox', { name: 'Filas por página' })
  await user.selectOptions(select, '2')

  expect(onPageSizeChange).toHaveBeenCalledWith(2)
  expect(screen.getByText('Grace')).toBeInTheDocument()

  rerender(
    <DataTable
      columns={columns}
      data={[{ id: 1, name: 'Ada' }]}
      pageSize={1}
      pageSizeOptions={[1]}
    />,
  )
  expect(screen.queryByRole('combobox', { name: 'Filas por página' })).not.toBeInTheDocument()
})

test('keeps cell rendering work stable when selecting a row', async () => {
  const user = userEvent.setup()
  const renderCell = vi.fn(row => row.name)

  render(
    <DataTable
      columns={[{ key: 'name', label: 'Nombre', render: renderCell }]}
      data={searchableData}
      selectable
    />,
  )

  expect(renderCell).toHaveBeenCalledTimes(searchableData.length)
  await user.click(screen.getByRole('checkbox', { name: 'Seleccionar fila Ada Lovelace' }))
  expect(renderCell).toHaveBeenCalledTimes(searchableData.length)
})


test('memoizes sorting so selecting a row does not sort again', async () => {
  const user = userEvent.setup()
  const compare = vi.spyOn(String.prototype, 'localeCompare')
  const data = [
    { id: 1, name: 'Beta' },
    { id: 2, name: 'Alpha' },
  ]

  try {
    render(
      <DataTable
        columns={[{ key: 'name', label: 'Nombre', sortable: true }]}
        data={data}
        selectable
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Nombre' }))
    const callsAfterSort = compare.mock.calls.length
    await user.click(screen.getByRole('checkbox', { name: 'Seleccionar fila Alpha' }))

    expect(compare).toHaveBeenCalledTimes(callsAfterSort)
  } finally {
    compare.mockRestore()
  }
})

test('warns in development for duplicate row keys while still rendering rows', () => {
  const warning = vi.spyOn(console, 'warn').mockImplementation(() => {})

  try {
    render(
      <DataTable
        columns={columns}
        data={[{ id: 'same', name: 'Ada' }, { id: 'same', name: 'Grace' }]}
      />,
    )

    expect(screen.getByText('Ada')).toBeInTheDocument()
    expect(screen.getByText('Grace')).toBeInTheDocument()
    expect(warning).toHaveBeenCalledWith(expect.stringContaining('único'))
  } finally {
    warning.mockRestore()
  }
})

test('keeps duplicate, invalid, and hostile identities safe in production rendering', () => {
  const warning = vi.spyOn(console, 'warn').mockImplementation(() => {})
  const hostileIdentity = {
    [Symbol.toPrimitive]() {
      throw new Error('no string conversion')
    },
  }

  try {
    render(
      <DataTable
        columns={columns}
        data={[
          { id: 'same', name: 'Ada' },
          { id: 'same', name: 'Grace' },
          { id: '', name: 'Lin' },
          { id: hostileIdentity, name: 'Noa' },
        ]}
        selectable
      />,
    )

    expect(screen.getByText('Ada')).toBeInTheDocument()
    expect(screen.getByText('Grace')).toBeInTheDocument()
    expect(screen.getByText('Lin')).toBeInTheDocument()
    expect(screen.getByText('Noa')).toBeInTheDocument()

    const ids = screen.getAllByRole('checkbox').map(checkbox => checkbox.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(ids.every(id => /^[A-Za-z][A-Za-z0-9_-]*$/.test(id))).toBe(true)
    expect(warning).toHaveBeenCalled()
  } finally {
    warning.mockRestore()
  }
})

test('warns when the same row receives a different key after sorting', async () => {
  const user = userEvent.setup()
  const warning = vi.spyOn(console, 'warn').mockImplementation(() => {})
  const data = [
    { id: 'beta', name: 'Beta' },
    { id: 'alpha', name: 'Alpha' },
  ]

  try {
    render(
      <DataTable
        columns={[{ key: 'name', label: 'Nombre', sortable: true }]}
        data={data}
        rowKey={(_, index) => index}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Nombre' }))
    expect(warning).toHaveBeenCalledWith(expect.stringContaining('estable'))
  } finally {
    warning.mockRestore()
  }
})
