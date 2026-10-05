import type { Meta, StoryObj } from '@storybook/react-vite'
import { AiMessage, MessageActions, StreamingAnswer } from '../../src'
import { conAncho } from '../componentes/Nuevos/soporte'
import { FUENTES, PREGUNTA, RESPUESTA } from './datosIa'

const meta: Meta<typeof AiMessage> = {
  title: 'IA/Conversación/AiMessage',
  component: AiMessage,
  tags: ['autodocs'],
  args: { sender: 'user', name: 'Camila Rojas', time: '10:42', children: PREGUNTA },
  argTypes: { sender: { control: 'inline-radio', options: ['user', 'assistant'] } },
  parameters: { docs: { description: { component: 'Un turno de la conversación: la persona a la derecha en burbuja; el asistente a la izquierda con AiAvatar y respuesta a todo el ancho.' } } },
  decorators: [conAncho(720)],
}
export default meta
type Story = StoryObj<typeof AiMessage>

export const Playground: Story = {}

export const Hilo: Story = {
  name: 'Pregunta y respuesta',
  render: () => (
    <div className="d-grid gap-4">
      <AiMessage sender="user" name="Camila Rojas" time="10:42">{PREGUNTA}</AiMessage>
      <AiMessage sender="assistant" time="10:42" actions={<MessageActions text={RESPUESTA} onRegenerate={() => {}} onFeedback={() => {}} />}>
        <StreamingAnswer text={RESPUESTA} sources={FUENTES} />
      </AiMessage>
    </div>
  ),
}
