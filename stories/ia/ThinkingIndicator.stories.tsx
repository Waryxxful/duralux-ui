import type { Meta, StoryObj } from '@storybook/react-vite'
import { ThinkingIndicator } from '../../src'
import { conAncho } from '../componentes/Nuevos/soporte'

const meta: Meta<typeof ThinkingIndicator> = {
  title: 'IA/Conversación/ThinkingIndicator',
  component: ThinkingIndicator,
  tags: ['autodocs'],
  args: { variant: 'dots' },
  argTypes: { variant: { control: 'inline-radio', options: ['dots', 'bar'] } },
  parameters: { docs: { description: { component: 'Espera corta (< 3 s). Si sigue visible más de 3 s, avisa por consola: esa espera debe pasar a AiLoader.' } } },
  decorators: [conAncho(420)],
}
export default meta
type Story = StoryObj<typeof ThinkingIndicator>

export const Playground: Story = {}
export const Barra: Story = { args: { variant: 'bar', label: 'Buscando en los informes de hoy' } }
