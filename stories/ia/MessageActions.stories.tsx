import type { Meta, StoryObj } from '@storybook/react-vite'
import { MessageActions } from '../../src'
import { conAncho } from '../componentes/Nuevos/soporte'
import { RESPUESTA } from './datosIa'

const meta: Meta<typeof MessageActions> = {
  title: 'IA/Conversación/MessageActions',
  component: MessageActions,
  tags: ['autodocs'],
  args: { text: RESPUESTA, variant: 'ghost', onRegenerate: () => {}, onFeedback: () => {} },
  argTypes: { variant: { control: 'inline-radio', options: ['ghost', 'pill'] } },
  parameters: { docs: { description: { component: 'Copiar, regenerar y valorar una respuesta. Regenerar y valorar solo emiten la intención; el texto copiado nunca va a logs.' } } },
  decorators: [conAncho(420)],
}
export default meta
type Story = StoryObj<typeof MessageActions>

export const Playground: Story = {}
export const Pildora: Story = { name: 'Píldora', args: { variant: 'pill' } }
export const SoloCopiar: Story = { name: 'Solo copiar', args: { onRegenerate: undefined, onFeedback: undefined } }
export const Valorada: Story = { name: 'Valoración controlada', args: { feedback: 'up' } }
