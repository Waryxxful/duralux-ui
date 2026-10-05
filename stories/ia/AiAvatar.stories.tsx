import type { Meta, StoryObj } from '@storybook/react-vite'
import { AiAvatar } from '../../src'
import { conAncho } from '../componentes/Nuevos/soporte'

const meta: Meta<typeof AiAvatar> = {
  title: 'IA/Conversación/AiAvatar',
  component: AiAvatar,
  tags: ['autodocs'],
  args: { size: 'md', busy: false },
  argTypes: { size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] } },
  parameters: { docs: { description: { component: 'Identidad del asistente: gradiente de tokens con grano (`.gcu-grain`), sin WebGL. Decorativo por defecto; con `label` se anuncia como imagen. `busy` gira lento mientras trabaja (fijo con reduced-motion).' } } },
  decorators: [conAncho(420)],
}
export default meta
type Story = StoryObj<typeof AiAvatar>

export const Playground: Story = {}

export const Tamanos: Story = {
  name: 'Tamaños y estado',
  render: () => (
    <div className="d-flex align-items-center gap-3">
      <AiAvatar size="sm" />
      <AiAvatar size="md" />
      <AiAvatar size="lg" label="Asistente" />
      <AiAvatar size="lg" busy label="Asistente trabajando" />
    </div>
  ),
}
