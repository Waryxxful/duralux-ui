import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button, EmptyState, QuickLinkGrid } from '../../../src'

const items = [
  { id: 'colas', icon: 'feather-layers', label: 'Colas', description: '3 sin agentes', href: '#colas', color: 'danger' },
  { id: 'agentes', icon: 'feather-users', label: 'Agentes', description: '48 programados', href: '#agentes', color: 'primary' },
  { id: 'campanas', icon: 'feather-target', label: 'Campañas', description: '2 bajo la meta', href: '#campanas', color: 'warning' },
  { id: 'reportes', icon: 'feather-bar-chart-2', label: 'Reportes', description: 'Actualizados 16:42', href: '#reportes', color: 'info' },
]

const meta: Meta<typeof QuickLinkGrid> = {
  title: 'Componentes/Indicadores/QuickLinkGrid',
  component: QuickLinkGrid,
  tags: ['autodocs'],
  args: { items, columns: 4 },
  argTypes: { columns: { control: { type: 'range', min: 1, max: 6 } } },
  parameters: {
    docs: {
      description: {
        component: 'Accesos directos ícono + texto con una cifra opcional (`description`). El enlace o botón es el propio tile: hover instantáneo, presión y anillo de foco del tema. Grilla CSS por contenedor: 2 columnas en angosto y `columns` desde 36rem (sin `col-md-*` de viewport).',
      },
    },
  },
}
export default meta
type Story = StoryObj<typeof QuickLinkGrid>

export const Playground: Story = {}

export const Acciones: Story = {
  name: 'Botones y solo lectura',
  args: {
    columns: 3,
    items: [
      { id: 'reasignar', icon: 'feather-shuffle', label: 'Reasignar agentes', description: '12 pendientes', onClick: () => {}, color: 'primary' },
      { id: 'pausar', icon: 'feather-pause-circle', label: 'Pausar campaña', onClick: () => {}, color: 'warning' },
      { id: 'historial', icon: 'feather-archive', label: 'Historial (sin permiso)', color: 'secondary' },
    ],
  },
}

export const Vacio: Story = {
  name: 'Vacío',
  render: () => (
    <EmptyState
      icon="link"
      title="No hay accesos configurados"
      message="Pide a un administrador que agregue los accesos de tu equipo."
      action={<Button size="sm" variant="light-brand">Solicitar accesos</Button>}
    />
  ),
}

export const Tablero: Story = {
  name: 'En una card de tablero',
  render: () => (
    <div className="card">
      <div className="card-header"><h2 className="h5 card-title mb-0">Accesos del supervisor</h2></div>
      <div className="card-body"><QuickLinkGrid items={items} columns={4} /></div>
    </div>
  ),
}

export const ContenedorAngosto: Story = {
  name: 'Contenedor angosto (320 px)',
  decorators: [(Story, ctx) => <div style={{ maxWidth: ctx.parameters.maxWidth ?? 320 }}><Story /></div>],
}
