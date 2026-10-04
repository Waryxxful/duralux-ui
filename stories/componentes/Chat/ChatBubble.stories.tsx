import type { Meta, StoryObj } from '@storybook/react-vite'
import { ChatBubble, ChatTypingIndicator } from '../../../src'
import { Mensajes } from './chatFixtures'

const meta: Meta<typeof ChatBubble> = {
  title: 'Componentes/Chat/ChatBubble',
  component: ChatBubble,
  tags: ['autodocs'],
  args: {
    message: { id: 1, text: '¿Puedo cambiar la fecha de instalación al jueves?', time: '11:20', sender: { name: 'Matías Fuentes' } },
    grouped: false,
  },
  decorators: [(Story) => <div className="gcu-chat-window__messages" style={{ maxWidth: 640 }}><Story /></div>],
  parameters: {
    docs: {
      description: {
        component: 'Un mensaje con autor: avatar y nombre (salvo si va agrupado), burbuja y meta con hora y estado de entrega (ícono + texto). `groupChatMessages` inserta separadores «Hoy», «Ayer» o dd-mm-aaaa y marca `grouped` en los mensajes seguidos del mismo autor. Los mensajes del sistema son discretos y centrados.',
      },
    },
  },
}
export default meta
type Story = StoryObj<typeof ChatBubble>

export const Playground: Story = {}

export const Conversacion: Story = {
  name: 'Caso real: días, agrupación y escribiendo…',
  render: () => <Mensajes typing="Valentina" />,
}

export const ErrorDeEnvio: Story = {
  name: 'Error de envío con reintento',
  render: () => (
    <>
      <ChatBubble message={{ id: 1, text: 'Te envío el comprobante por correo.', time: '12:01', mine: true, sender: { name: 'Tú' }, status: 'sent' }} />
      <ChatBubble
        grouped
        message={{ id: 2, text: '¿Me confirmas el correo de facturación?', time: '12:02', mine: true, sender: { name: 'Tú' }, status: 'failed' }}
        onRetry={() => undefined}
      />
    </>
  ),
}

export const Estados: Story = {
  name: 'Estados de entrega',
  render: () => (
    <>
      {(['sending', 'sent', 'delivered', 'read'] as const).map((status, index) => (
        <ChatBubble
          key={status}
          grouped={index > 0}
          message={{ id: status, text: `Mensaje ${index + 1}`, time: `12:0${index}`, mine: true, sender: { name: 'Tú' }, status }}
        />
      ))}
    </>
  ),
}

export const Escribiendo: Story = {
  name: 'Escribiendo…',
  render: () => <ChatTypingIndicator name="Valentina" />,
}

export const Angosto: Story = {
  name: 'Contenedor angosto (360 px)',
  decorators: [(Story) => <div className="gcu-chat-window__messages" style={{ maxWidth: 360 }}><Story /></div>],
  render: () => <Mensajes />,
}
