import type { Meta, StoryObj } from '@storybook/react-vite'
import { MessageBubble } from '../../../src'

const meta: Meta<typeof MessageBubble> = {
  title: 'Componentes/Chat/MessageBubble',
  component: MessageBubble,
  tags: ['autodocs'],
  args: {
    variant: 'incoming',
    children: 'Buenos días, le habla Katia de soporte. ¿En qué le puedo ayudar?',
    time: '10:04',
    highlighted: false,
    grouped: false,
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['incoming', 'outgoing', 'system'] },
    status: { control: 'select', options: [undefined, 'sending', 'sent', 'delivered', 'read', 'failed'] },
  },
  decorators: [(Story) => <div className="gcu-chat-window__messages" style={{ maxWidth: 640 }}><Story /></div>],
  parameters: {
    docs: {
      description: {
        component: 'Burbuja portable (chat y transcripciones). Entrante en superficie elevada, saliente en primario con texto `on-primary` (AA en los tres temas), meta con cifras tabulares y sin opacidad. Esquina del autor cerrada como cola sutil; lo que va dentro (`.gcu-message-bubble__media`) usa radio anidado.',
      },
    },
  },
}
export default meta
type Story = StoryObj<typeof MessageBubble>

export const Playground: Story = {}

export const Transcripcion: Story = {
  name: 'Caso real: transcripción con evidencia',
  render: () => (
    <>
      <MessageBubble variant="system">Llamada iniciada · 23-09-2026 16:42</MessageBubble>
      <MessageBubble variant="incoming" header="Agente" time="16:42">Aló, ¿hablo con Katia?</MessageBubble>
      <MessageBubble variant="incoming" grouped time="16:42">Le llamo por el cobro duplicado de su plan.</MessageBubble>
      <MessageBubble variant="outgoing" header="Cliente" time="16:43" highlighted>Sí, quiero cancelar el servicio si no lo arreglan hoy.</MessageBubble>
      <MessageBubble variant="incoming" header="Agente" time="16:44">Entiendo. Ya anulé el cobro y le envío el comprobante.</MessageBubble>
      <MessageBubble variant="outgoing" header="Cliente" time="16:44" status="read">Gracias.</MessageBubble>
    </>
  ),
}

export const ErrorDeEnvio: Story = {
  name: 'Error de envío',
  args: { variant: 'outgoing', children: '¿Me confirmas el correo de facturación?', status: 'failed', time: '12:02' },
}

export const Angosto: Story = {
  name: 'Contenedor angosto (360 px)',
  decorators: [(Story) => <div className="gcu-chat-window__messages" style={{ maxWidth: 360 }}><Story /></div>],
  render: () => (
    <>
      <MessageBubble variant="incoming" time="09:12">Hola, ayer me llegó un cobro duplicado del plan Fibra 600 y necesito el comprobante.</MessageBubble>
      <MessageBubble variant="outgoing" time="09:20" status="delivered">Gracias. Ya abrí el caso #48213 y lo derivé a facturación.</MessageBubble>
    </>
  ),
}
