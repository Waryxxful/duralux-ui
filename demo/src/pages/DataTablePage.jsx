import { DataTable, Badge, Button } from '@duralux/ui'
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

export function DataTablePage() {
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
    </div>
  )
}
