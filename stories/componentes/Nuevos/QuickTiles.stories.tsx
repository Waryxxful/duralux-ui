import type { Meta, StoryObj } from '@storybook/react-vite'
import { QuickTiles } from '../../../src'
import { conAncho } from './soporte'
import { TresTemas } from '../Graficos/TresTemas'

const items = [
  { label: 'Nueva campaña', icon: 'feather-plus-circle', description: 'Configura una campaña de llamadas', href: '#campana' },
  { label: 'Importar contactos', icon: 'feather-upload', tone: 'info' as const, onClick: () => {} },
  { label: 'Ver grabaciones', icon: 'feather-headphones', tone: 'teal' as const, href: '#grabaciones' },
  { label: 'Exportar informe', icon: 'feather-download', disabled: true, disabledReason: 'Disponible al cerrar el día' },
]

const meta: Meta<typeof QuickTiles> = {
  title: 'Componentes/Nuevos/QuickTiles',
  component: QuickTiles,
  tags: ['autodocs'],
  args: { title: 'Accesos rápidos', items },
  parameters: {
    docs: { description: { component: 'Tiles de acción frecuentes. Cada tile es un enlace o un botón; un tile deshabilitado explica por qué en texto visible.' } },
  },
  decorators: [conAncho(720)],
}
export default meta
type Story = StoryObj<typeof QuickTiles>

export const Playground: Story = {}

export const ContenedorAngosto: Story = { name: 'Contenedor angosto (320 px)', parameters: { maxWidth: 320 } }

export const Temas: Story = {
  name: 'Tres temas',
  parameters: { maxWidth: 'none' },
  render: () => <TresTemas>{() => <QuickTiles title="Accesos rápidos" items={items.slice(0, 2)} />}</TresTemas>,
}
