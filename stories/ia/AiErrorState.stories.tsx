import type { Meta, StoryObj } from '@storybook/react-vite'
import { AiErrorState } from '../../src'
import { conAncho } from '../componentes/Nuevos/soporte'
import { PREGUNTA } from './datosIa'

const meta: Meta<typeof AiErrorState> = {
  title: 'IA/Conversación/AiErrorState',
  component: AiErrorState,
  tags: ['autodocs'],
  args: { prompt: PREGUNTA, onRetry: () => {}, onEditPrompt: () => {}, variant: 'card' },
  argTypes: { variant: { control: 'inline-radio', options: ['card', 'inline'] } },
  parameters: { docs: { description: { component: 'Falla de generación: qué pasó, la pregunta original conservada y reintentar. La pregunta nunca va a logs.' } } },
  decorators: [conAncho(640)],
}
export default meta
type Story = StoryObj<typeof AiErrorState>

export const Playground: Story = {}
export const EnLinea: Story = { name: 'En línea', args: { variant: 'inline', title: 'No se pudo completar la respuesta' } }
export const Reintentando: Story = { args: { retrying: true } }
export const FuenteNoDisponible: Story = {
  name: 'Fuente no disponible',
  args: { title: 'El informe de Cobranza no está disponible', description: 'La fuente no responde en este momento. Tu pregunta quedó guardada; reintenta en unos minutos.' },
}
