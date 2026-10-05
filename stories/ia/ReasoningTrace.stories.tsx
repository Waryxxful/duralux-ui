import type { Meta, StoryObj } from '@storybook/react-vite'
import { ReasoningTrace } from '../../src'
import { conAncho } from '../componentes/Nuevos/soporte'
import { RAZONAMIENTO } from './datosAgente'

const meta: Meta<typeof ReasoningTrace> = {
  title: 'IA/Agente/ReasoningTrace',
  component: ReasoningTrace,
  tags: ['autodocs'],
  args: { steps: RAZONAMIENTO, seconds: 6, summary: 'revisó 3 colas' },
  parameters: {
    docs: { description: { component: 'Razonamiento del asistente, plegable, con tiempo y pasos numerados. Mientras piensa se abre solo y cuenta el tiempo en vivo; si la persona lo cierra, se respeta.' } },
  },
  decorators: [conAncho(560)],
}
export default meta
type Story = StoryObj<typeof ReasoningTrace>

export const Playground: Story = {}
export const Abierto: Story = { args: { defaultOpen: true } }
export const Pensando: Story = { args: { thinking: true, steps: RAZONAMIENTO.slice(0, 2), summary: undefined } }
export const ContenedorAngosto: Story = { name: 'Contenedor angosto (320 px)', args: { defaultOpen: true }, parameters: { maxWidth: 320 } }
