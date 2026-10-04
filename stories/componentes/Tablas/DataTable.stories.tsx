import type { Meta, StoryObj } from '@storybook/react-vite'
import { Badge, Button, DataTable, EmptyState } from '../../../src'
import type { DataTableColumn, DataTableProps } from '../../../src'

interface Llamada {
  id: number
  agente: string
  campana: string
  estado: 'Contactado' | 'Sin respuesta' | 'Agendado'
  duracion: number
  monto: number
}

const AGENTES = ['Ana Torres', 'Bruno Díaz', 'Carla Muñoz', 'Diego Rojas', 'Elena Soto', 'Felipe Vera']
const CAMPANAS = ['Cobranza Q4', 'Retención Fibra', 'Venta cruzada Hogar', 'Encuesta NPS']
const ESTADOS: Llamada['estado'][] = ['Contactado', 'Sin respuesta', 'Agendado']

function crearLlamadas(cantidad: number): Llamada[] {
  return Array.from({ length: cantidad }, (_, index) => ({
    id: 90000 + index,
    agente: AGENTES[(index * 7) % AGENTES.length],
    campana: CAMPANAS[(index * 3) % CAMPANAS.length],
    estado: ESTADOS[(index * 5) % ESTADOS.length],
    duracion: 45 + ((index * 37) % 600),
    monto: ((index * 7919) % 250) * 1000,
  }))
}

const LLAMADAS = crearLlamadas(48)
const MILES = crearLlamadas(2000)
const clp = (value: number) => `$${value.toLocaleString('es-CL')}`
const minutos = (segundos: number) => `${Math.floor(segundos / 60)}:${String(segundos % 60).padStart(2, '0')}`
const TONO = { Contactado: 'success', 'Sin respuesta': 'warning', Agendado: 'info' } as const

const COLUMNAS: ReadonlyArray<DataTableColumn<Llamada>> = [
  { key: 'id', label: 'ID', sortable: true, render: row => <span className="font-monospace">#{row.id}</span> },
  { key: 'agente', label: 'Agente', sortable: true, hideable: false },
  { key: 'campana', label: 'Campaña', sortable: true },
  { key: 'estado', label: 'Estado', sortable: true, render: row => <Badge variant={TONO[row.estado]} soft>{row.estado}</Badge> },
  { key: 'duracion', label: 'Duración', sortable: true, numeric: true, render: row => minutos(row.duracion) },
  { key: 'monto', label: 'Monto', sortable: true, numeric: true, render: row => clp(row.monto) },
]

const meta: Meta<DataTableProps<Llamada>> = {
  title: 'Componentes/Tablas/DataTable',
  component: DataTable,
  tags: ['autodocs'],
  args: {
    columns: COLUMNAS,
    data: LLAMADAS,
    pageSize: 10,
    'aria-label': 'Llamadas del día',
  },
  argTypes: {
    density: { control: 'inline-radio', options: [undefined, 'compact', 'comfortable'] },
    selectable: { control: 'boolean' },
    searchable: { control: 'boolean' },
    stickyHeader: { control: 'boolean' },
    loading: { control: 'boolean' },
    virtualized: { control: 'boolean' },
  },
  parameters: {
    docs: {
      description: {
        component: 'Tabla de datos sobre TanStack Table con la presentación de `Table` (`.table.table-hover`). Orden por columna (Mayús + clic agrega columnas al orden), búsqueda local o manual, paginación, selección con acciones masivas, menú «Columnas», densidad, encabezado fijo y virtualización para más de 500 filas.',
      },
    },
  },
  decorators: [(Story, context) => <div className="card" style={{ maxWidth: context.parameters.maxWidth }}><Story /></div>],
  render: args => <DataTable<Llamada> {...args} />,
}
export default meta
type Story = StoryObj<DataTableProps<Llamada>>

export const Playground: Story = {}

export const Orden: Story = {
  name: 'Orden (Mayús + clic para varias columnas)',
  args: { pageSize: 8, density: 'compact' },
}

export const Busqueda: Story = {
  name: 'Búsqueda y filas por página',
  args: {
    searchable: true,
    searchLabel: 'Buscar llamadas',
    searchPlaceholder: 'Agente, campaña o estado',
    pageSizeOptions: [10, 25, 50],
    filterResolver: row => `${row.agente} ${row.campana} ${row.estado}`,
  },
}

export const SeleccionMasiva: Story = {
  name: 'Selección con acciones masivas',
  args: {
    selectable: true,
    getRowLabel: row => `#${row.id} de ${row.agente}`,
    renderBulkActions: rows => (
      <>
        <Button size="sm" startIcon="user-check">Reasignar {rows.length}</Button>
        <Button size="sm" variant="light-brand" startIcon="download">Exportar</Button>
      </>
    ),
    actions: [{ label: 'Ver detalle', icon: 'feather-eye', onClick: () => undefined }],
  },
}

export const ColumnasVisibles: Story = {
  name: 'Columnas visibles (menú «Columnas»)',
  args: { defaultColumnVisibility: { id: false, duracion: false }, searchable: true },
}

export const EncabezadoFijo: Story = {
  name: 'Encabezado fijo',
  args: { stickyHeader: true, maxHeight: 360, pageSize: 25 },
}

export const Virtualizada: Story = {
  name: 'Virtualizada (2.000 filas)',
  args: { data: MILES, virtualized: true, density: 'compact', maxHeight: 420, 'aria-label': 'Historial de llamadas' },
}

export const Vacia: Story = {
  name: 'Vacía',
  args: {
    data: [],
    emptyState: (
      <EmptyState
        compact
        icon="phone-off"
        title="Todavía no hay llamadas hoy"
        message="Las llamadas aparecerán aquí apenas se registren."
        action={<Button size="sm" startIcon="refresh-cw">Actualizar</Button>}
      />
    ),
  },
}

export const Cargando: Story = {
  name: 'Cargando',
  args: { loading: true, loadingRows: 6 },
}

export const ConError: Story = {
  name: 'Error al cargar',
  args: { error: new Error('No se pudo conectar con el servidor de llamadas.'), onRetry: () => undefined },
}

export const Angosta: Story = {
  name: 'Contenedor angosto (360 px)',
  args: { searchable: true, selectable: true, columnMenu: true },
  parameters: { maxWidth: 360 },
}
