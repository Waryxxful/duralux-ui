import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import { DataTable } from '../src/components/data/DataTable.jsx'

const columns = [{ key: 'name', label: 'Nombre' }]

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
})

test('clamps the current page after pageSize and data rerenders', async () => {
  const user = userEvent.setup()
  const data = Array.from({ length: 5 }, (_, index) => ({
    id: index + 1,
    name: `Fila ${index + 1}`,
  }))
  const { rerender } = render(<DataTable columns={columns} data={data} pageSize={2} />)

  await user.click(screen.getByRole('button', { name: '3' }))
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
