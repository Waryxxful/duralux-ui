import { useState } from 'react'
import { DataTable, Badge, Button, Table, Pagination, ResponsiveTable } from '@duralux/ui'
import { ShowcaseSection } from '../ShowcaseSection'

const COLUMNS = [
  { key: 'name', label: 'Cliente', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'group', label: 'Grupo', render: (row) => <Badge variant="primary" soft>{row.group}</Badge> },
  { key: 'status', label: 'Estado', render: (row) => (
    <Badge variant={row.status === 'Activo' ? 'success' : row.status === 'Inactivo' ? 'warning' : 'danger'} soft>
      {row.status}
    </Badge>
  )},
]

const DATA = [
  { id: 1, name: 'Alexandra Della', email: 'alex@outlook.com', group: 'VIP', status: 'Activo' },
  { id: 2, name: 'Archie Cantones', email: 'archie@gmail.com', group: 'Team', status: 'Inactivo' },
  { id: 3, name: 'Holmes Cherryman', email: 'holmes@email.com', group: 'Wholesale', status: 'Activo' },
  { id: 4, name: 'Malanie Hanvey', email: 'lanie@gmail.com', group: 'Primary', status: 'Eliminado' },
  { id: 5, name: 'Carole Bartak', email: 'caroe@gmail.com', group: 'VIP', status: 'Activo' },
  { id: 6, name: 'Ricardo Villar', email: 'r.villar@empresa.com', group: 'Personal', status: 'Activo' },
]

const ACTIONS = [
  { label: 'Ver', icon: 'feather-eye', onClick: (row) => alert(`Ver: ${row.name}`) },
  { label: 'Editar', icon: 'feather-edit-3', onClick: (row) => alert(`Editar: ${row.name}`) },
  { label: 'Eliminar', icon: 'feather-trash-2', onClick: (row) => alert(`Eliminar: ${row.name}`) },
]

const TABLE_COLUMNS = [
  { key: 'name', header: 'Cliente', render: (row) => row.name },
  { key: 'email', header: 'Email', render: (row) => row.email },
  { key: 'group', header: 'Grupo', render: (row) => <Badge variant="primary" soft>{row.group}</Badge> },
  { key: 'status', header: 'Estado', render: (row) => (
    <Badge variant={row.status === 'Activo' ? 'success' : row.status === 'Inactivo' ? 'warning' : 'danger'} soft>
      {row.status}
    </Badge>
  )},
]

export function DataTablePage() {
  const [page, setPage] = useState(1)

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>DataTable</h1>
      <p style={{ color: '#64748b', marginBottom: 32 }}>Props: <code>columns, data, actions, pageSize, selectable, onSelectionChange, rowKey</code></p>

      <ShowcaseSection
        title="Tabla con sort, checkboxes y acciones"
        preview={
          <DataTable
            columns={COLUMNS}
            data={DATA}
            rowKey="id"
            selectable
            pageSize={4}
            actions={ACTIONS}
            onSelectionChange={(ids) => console.log('Selected:', ids)}
          />
        }
        code={`const COLUMNS = [
  { key: 'name', label: 'Cliente', sortable: true },
  { key: 'status', label: 'Estado', render: (row) => (
    <Badge variant="success" soft>{row.status}</Badge>
  )},
]

const ACTIONS = [
  { label: 'Ver', icon: 'feather-eye', onClick: (row) => navigate(\`/clientes/\${row.id}\`) },
  { label: 'Editar', icon: 'feather-edit-3', onClick: (row) => navigate(\`/clientes/\${row.id}/editar\`) },
]

<DataTable
  columns={COLUMNS}
  data={data}
  rowKey="id"
  selectable
  pageSize={10}
  actions={ACTIONS}
/>`}
      />

      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4, marginTop: 48 }}>Table</h1>
      <p style={{ color: '#64748b', marginBottom: 32 }}>Props: <code>columns, rows, rowKey, emptyMessage, loading, className, striped, hover</code></p>

      <ShowcaseSection
        title="Table básica con striped y hover"
        preview={
          <Table
            columns={TABLE_COLUMNS}
            rows={DATA}
            rowKey={(row) => row.id}
            striped
            hover
          />
        }
        code={`<Table
  columns={TABLE_COLUMNS}
  rows={DATA}
  rowKey={(row) => row.id}
  striped
  hover
/>`}
      />

      <ShowcaseSection
        title="Table sin registros"
        preview={
          <Table
            columns={TABLE_COLUMNS}
            rows={[]}
            rowKey={(row) => row.id}
          />
        }
        code={`<Table columns={TABLE_COLUMNS} rows={[]} rowKey={(row) => row.id} />`}
      />

      <ShowcaseSection
        title="Table cargando"
        preview={
          <Table
            columns={TABLE_COLUMNS}
            rows={[]}
            rowKey={(row) => row.id}
            loading
          />
        }
        code={`<Table columns={TABLE_COLUMNS} rows={[]} rowKey={(row) => row.id} loading />`}
      />

      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4, marginTop: 48 }}>Pagination</h1>
      <p style={{ color: '#64748b', marginBottom: 32 }}>Props: <code>page, totalPages, onPageChange, sibling, className</code></p>

      <ShowcaseSection
        title="Paginación (página actual: {page})"
        preview={
          <Pagination
            page={page}
            totalPages={10}
            onPageChange={setPage}
            sibling={1}
          />
        }
        code={`const [page, setPage] = useState(1)

<Pagination
  page={page}
  totalPages={10}
  onPageChange={setPage}
  sibling={1}
/>`}
      />

      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4, marginTop: 48 }}>ResponsiveTable</h1>
      <p style={{ color: '#64748b', marginBottom: 32 }}>Props: mismos que Table más <code>wrapperClassName</code></p>

      <ShowcaseSection
        title="ResponsiveTable (scroll horizontal en pantallas pequeñas)"
        preview={
          <ResponsiveTable
            columns={TABLE_COLUMNS}
            rows={DATA}
            rowKey={(row) => row.id}
            striped
            hover
          />
        }
        code={`<ResponsiveTable
  columns={TABLE_COLUMNS}
  rows={DATA}
  rowKey={(row) => row.id}
  striped
  hover
/>`}
      />
    </div>
  )
}
