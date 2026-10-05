import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import { Table } from '../src/components/data/Table.jsx'

const columns = [{ key: 'name', header: 'Nombre', render: row => row.name }]

test('Table owns the responsive Duralux wrapper', () => {
  const props = {
    columns,
    rows: [{ id: 1, name: 'Ada' }],
    rowKey: 'id',
    wrapperClassName: 'mi-wrapper',
  }

  const { container } = render(<Table {...props} />)
  const wrapper = container.querySelector('.table-responsive')

  expect(wrapper).toHaveClass('mi-wrapper')
  expect(wrapper.querySelector('table')).toHaveClass('table', 'table-hover')
  expect(container.querySelectorAll('.table-responsive')).toHaveLength(1)
})

test('Table exposes responsive={false} for callers with their own overflow surface', () => {
  const { container } = render(
    <Table
      columns={columns}
      rows={[{ id: 1, name: 'Ada' }]}
      rowKey="id"
      responsive={false}
    />,
  )

  expect(container.querySelector('table')).toBeInTheDocument()
  expect(container.querySelector('.table-responsive')).not.toBeInTheDocument()
})

test('Table keeps loading and empty states inside the styled table', () => {
  const { rerender } = render(
    <Table columns={columns} rows={[]} rowKey="id" loading />,
  )

  expect(screen.getByRole('table')).toHaveAttribute('aria-busy', 'true')
  expect(screen.getByText('Cargando...')).toBeInTheDocument()

  rerender(<Table columns={columns} rows={[]} rowKey="id" emptyMessage="Nada aquí" />)
  expect(screen.getByText('Nada aquí')).toBeInTheDocument()
})

test('Table exposes an accessible caption and a non-contradictory loading status', () => {
  const { container } = render(
    <Table caption="Clientes" columns={columns} rows={[]} rowKey="id" loading />,
  )

  expect(screen.getByRole('table', { name: 'Clientes' })).toBeInTheDocument()
  const status = screen.getByRole('status')
  expect(status).toHaveTextContent('Cargando...')
  expect(status).not.toHaveAttribute('aria-hidden')
  expect(container.querySelector('td')).toHaveAttribute('colspan', '1')
})

test('Table slots keep custom head/body content inside its single table', () => {
  const { container } = render(
    <Table
      columns={columns}
      rows={[{ id: 1, name: 'Ada' }]}
      rowKey="id"
      head={() => <tr><th scope="col">Personalizado</th></tr>}
      body={() => <tr><td>Contenido</td></tr>}
    />,
  )

  expect(container.querySelectorAll('table')).toHaveLength(1)
  expect(container.querySelector('thead')).toHaveTextContent('Personalizado')
  expect(container.querySelector('tbody')).toHaveTextContent('Contenido')
})
