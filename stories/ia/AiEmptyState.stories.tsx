import type { Meta, StoryObj } from '@storybook/react-vite'
import { AiEmptyState } from '../../src'
import { conAncho } from '../componentes/Nuevos/soporte'
import { SUGERENCIAS } from './datosIa'

const meta: Meta<typeof AiEmptyState> = {
  title: 'IA/Conversación/AiEmptyState',
  component: AiEmptyState,
  tags: ['autodocs'],
  args: {
    title: '¿Qué quieres revisar hoy?',
    description: 'Pregunta por llamadas, campañas, ejecutivos o indicadores. Cada respuesta cita sus fuentes.',
    suggestions: SUGERENCIAS,
    onPick: () => {},
    align: 'start',
  },
  argTypes: { align: { control: 'inline-radio', options: ['start', 'center'] } },
  parameters: { docs: { description: { component: 'Primer contacto con el asistente: qué puede hacer y 3 a 4 preguntas sugeridas. Elegir una emite `onPick` (no envía sola).' } } },
  decorators: [conAncho(720)],
}
export default meta
type Story = StoryObj<typeof AiEmptyState>

export const Playground: Story = {}
export const Centrado: Story = { args: { align: 'center' } }
export const Angosto: Story = { name: 'Panel angosto', parameters: { maxWidth: 320 } }
