import type { Meta, StoryObj } from '@storybook/react-vite'
import { Badge, Button, EmptyState, IconButton, Table } from '../../../src'
import type { TableColumn } from '../../../src'

interface Campana {
  id: number
  nombre: string
  cola: string
  estado: 'Activa' | 'Pausada'
  llamadas: number
  contactabilidad: number
  tmo: string
  monto: number
}

const CAMPANAS: Campana[] = [
  { id: 48213, nombre: 'Cobranza Q4', cola: 'Cobranza temprana', estado: 'Activa', llamadas: 12480, contactabilidad: 84, tmo: '5:12', monto: 18240000 },
  { id: 48214, nombre: 'Retención Fibra', cola: 'Retención', estado: 'Activa', llamadas: 6342, contactabilidad: 71, tmo: '7:48', monto: 9120000 },
  { id: 48215, nombre: 'Bienvenida Postpago', cola: 'Onboarding', estado: 'Pausada', llamadas: 987, contactabilidad: 62, tmo: '3:05', monto: 1240000 },
  { id: 48216, nombre: 'Encuesta NPS', cola: 'Calidad', estado: 'Activa', llamadas: 4210, contactabilidad: 77, tmo: '2:41', monto: 0 },
  { id: 48217, nombre: 'Venta cruzada Hogar', cola: 'Ventas', estado: 'Activa', llamadas: 2875, contactabilidad: 58, tmo: '9:20', monto: 32480000 },
]

const miles = (value: number) => value.toLocaleString('es-CL')
const clp = (value: number) => `$${miles(value)}`

const COLUMNAS: ReadonlyArray<TableColumn<Campana>> = [
  { key: 'nombre', header: 'Campaña', render: (row) => <span className="fw-medium text-dark">{row.nombre}</span> },
  { key: 'cola', header: 'Cola' },
  {
    key: 'estado',
    header: 'Estado',
    render: (row) => <Badge variant={row.estado === 'Activa' ? 'success' : 'warning'} soft>{row.estado}</Badge>,
  },
  { key: 'llamadas', header: 'Llamadas', numeric: true, render: (row) => miles(row.llamadas) },
  { key: 'contactabilidad', header: 'Contactabilidad', numeric: true, render: (row) => `${row.contactabilidad} %` },
]

const meta: Meta<typeof Table<Campana>> = {
  title: 'Componentes/Tablas/Table',
  component: Table,
  tags: ['autodocs'],
  args: {
    columns: COLUMNAS,
    rows: CAMPANAS,
    rowKey: 'id',
    'aria-label': 'Campañas activas',
  },
  argTypes: {
    density: { control: 'inline-radio', options: [undefined, 'compact', 'comfortable'] },
    stickyHeader: { control: 'boolean' },
    loading: { control: 'boolean' },
    hover: { control: 'boolean' },
  },
  parameters: {
    docs: {
      description: {
        component: 'Tabla canónica Duralux (`.table-responsive > table.table.table-hover`, nunca `table-striped`). Columnas numéricas con `numeric` (derecha y cifras tabulares), densidad `compact`/`comfortable`, encabezado fijo con sombra solo al hacer scroll, vacío con EmptyState y carga con skeleton por fila. El scroll horizontal ocurre dentro del contenedor, nunca en la página.',
      },
    },
  },
  decorators: [Story => <div className="card"><Story /></div>],
}
export default meta
type Story = StoryObj<typeof Table<Campana>>

export const Playground: Story = {}

export const Vacia: Story = {
  name: 'Vacía (con acción siguiente)',
  args: {
    rows: [],
    emptyState: (
      <EmptyState
        compact
        icon="phone-off"
        title="Todavía no hay campañas en esta cola"
        message="Crea una campaña o cambia el filtro de cola."
        action={<Button size="sm" startIcon="plus">Crear campaña</Button>}
      />
    ),
  },
}

export const VaciaPorDefecto: Story = {
  name: 'Vacía (mensaje por defecto)',
  args: { rows: [], emptyMessage: 'Sin campañas para este periodo' },
}

export const Cargando: Story = {
  name: 'Cargando (skeleton por fila)',
  args: { loading: true, loadingRows: 4 },
}

export const DensaConAcciones: Story = {
  name: 'Densa con acciones',
  args: {
    density: 'compact',
    columns: [
      ...COLUMNAS,
      {
        key: 'acciones',
        header: 'Acciones',
        numeric: true,
        cellClassName: 'gcu-table-actions-cell',
        render: (row) => (
          <div className="d-inline-flex gap-2 gcu-table-actions">
            <IconButton icon="edit-2" label={`Editar ${row.nombre}`} size="sm" />
            <IconButton icon="trash-2" label={`Eliminar ${row.nombre}`} size="sm" variant="light-danger" />
          </div>
        ),
      },
    ],
  },
}

export const Numerica: Story = {
  name: 'Columnas numéricas',
  args: {
    'aria-label': 'Resultados por campaña',
    columns: [
      { key: 'id', header: 'ID', render: (row) => <span className="font-monospace">#{row.id}</span> },
      { key: 'nombre', header: 'Campaña' },
      { key: 'llamadas', header: 'Llamadas', numeric: true, render: (row) => miles(row.llamadas) },
      { key: 'tmo', header: 'TMO', numeric: true },
      { key: 'contactabilidad', header: 'Contactabilidad', numeric: true, render: (row) => `${row.contactabilidad} %` },
      { key: 'monto', header: 'Recaudado', numeric: true, render: (row) => clp(row.monto) },
    ],
  },
}

const MUCHAS = Array.from({ length: 18 }, (_, index) => ({
  ...CAMPANAS[index % CAMPANAS.length],
  id: 48300 + index,
  nombre: `${CAMPANAS[index % CAMPANAS.length].nombre} · lote ${index + 1}`,
}))

export const EncabezadoFijo: Story = {
  name: 'Encabezado fijo (sombra al desplazar)',
  args: { rows: MUCHAS, stickyHeader: true, maxHeight: 320 },
}

export const Comoda: Story = {
  name: 'Cómoda (pocas filas)',
  args: { density: 'comfortable', rows: CAMPANAS.slice(0, 3) },
}

export const Angosta: Story = {
  name: 'Contenedor angosto (scroll dentro de la tabla)',
  decorators: [Story => <div style={{ maxWidth: 360 }}><Story /></div>],
}
