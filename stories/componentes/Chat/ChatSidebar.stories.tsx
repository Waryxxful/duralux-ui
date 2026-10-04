import type { Meta, StoryObj } from '@storybook/react-vite'
import { ChatSidebar } from '../../../src'
import { CONTACTOS } from './chatData'

const meta: Meta<typeof ChatSidebar> = {
  title: 'Componentes/Chat/ChatSidebar',
  component: ChatSidebar,
  tags: ['autodocs'],
  args: {
    contacts: CONTACTOS,
    selectedId: 'valentina',
    onSelect: () => undefined,
    onEdit: () => undefined,
    labels: { sidebar: 'Conversaciones', edit: 'Nueva conversación' },
    loading: false,
  },
  decorators: [(Story) => <div className="card mb-0 d-flex" style={{ height: 520, maxWidth: 360 }}><Story /></div>],
  parameters: {
    docs: {
      description: {
        component: 'Lista de conversaciones: búsqueda local (sin tildes ni mayúsculas), no leídos con Badge y texto más marcado, presencia con punto + descripción accesible. Con `onSelect` es un `listbox`: ↑/↓/Inicio/Fin mueven el foco, Enter o Espacio seleccionan. Sin resultados o sin conversaciones muestra un EmptyState.',
      },
    },
  },
}
export default meta
type Story = StoryObj<typeof ChatSidebar>

export const Playground: Story = {}

export const SoloLectura: Story = {
  name: 'Solo lectura (sin onSelect)',
  args: { onSelect: undefined, onEdit: undefined, selectedId: undefined },
}

export const Vacio: Story = {
  name: 'Sin conversaciones',
  args: { contacts: [] },
}

export const Cargando: Story = {
  args: { contacts: [], loading: true },
}

export const Angosto: Story = {
  name: 'Contenedor angosto (280 px)',
  decorators: [(Story) => <div style={{ maxWidth: 280 }}><Story /></div>],
}
