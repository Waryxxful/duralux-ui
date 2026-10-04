import type { Meta, StoryObj } from '@storybook/react-vite'
import { ChatInputBar, ChatWindow } from '../../../src'
import { ChatCompleto, Mensajes } from './chatFixtures'

const CONTACTO = { name: 'Valentina Rojas', online: true, role: 'Cliente · Fibra 600' }

const meta: Meta<typeof ChatWindow> = {
  title: 'Componentes/Chat/ChatWindow',
  component: ChatWindow,
  tags: ['autodocs'],
  args: {
    contact: CONTACTO,
    legacyChildren: false,
    loading: false,
  },
  decorators: [(Story) => <div className="card mb-0 d-flex" style={{ height: 520 }}><Story /></div>],
  parameters: {
    docs: {
      description: {
        component: 'Encabezado del contacto, historial (`role="log"` con `aria-live="polite"`: los mensajes nuevos se anuncian sin interrumpir) y compositor. Dentro de `.gcu-chat` pasa de dos columnas a una cuando el contenedor mide menos de 42rem, y `onBack` muestra «Volver a las conversaciones». Sin contacto muestra un EmptyState.',
      },
    },
  },
}
export default meta
type Story = StoryObj<typeof ChatWindow>

export const Playground: Story = {
  args: {
    messages: <Mensajes />,
    composer: <ChatInputBar multiline maxLength={500} onSend={() => undefined} onAttach={() => undefined} />,
    onPhone: () => undefined,
    onMenu: () => undefined,
  },
}

export const Conversacion: Story = {
  name: 'Caso real: dos columnas con `.gcu-chat`',
  decorators: [(Story) => <Story />],
  render: () => <ChatCompleto />,
}

export const Vacio: Story = {
  name: 'Sin conversación seleccionada',
  args: { contact: null },
}

export const Cargando: Story = {
  name: 'Cargando historial',
  args: { loading: true, composer: <ChatInputBar onSend={() => undefined} disabled disabledReason="Espera a que cargue el historial." /> },
}

export const Angosto: Story = {
  name: 'Contenedor angosto (una columna)',
  decorators: [(Story) => <div style={{ maxWidth: 360 }}><Story /></div>],
  render: () => <ChatCompleto height={600} />,
}

export const AngostoLista: Story = {
  name: 'Contenedor angosto: lista',
  decorators: [(Story) => <div style={{ maxWidth: 360 }}><Story /></div>],
  render: () => <ChatCompleto height={520} initialId={null} />,
}
