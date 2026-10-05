import type { Meta, StoryObj } from '@storybook/react-vite'
import { Funnel } from '../../src'
import { conAncho } from '../componentes/Nuevos/soporte'
import { EMBUDO } from './datos'

const meta: Meta<typeof Funnel> = {
  title: 'Dominios/CRM/Funnel',
  component: Funnel,
  tags: ['autodocs'],
  args: { steps: EMBUDO, label: 'Embudo de la campaña Renovación Q4' },
  parameters: {
    docs: { description: { component: 'Embudo de conversión: cifra de cada paso, barra proporcional al primero y conversión desde el paso anterior en texto.' } },
  },
  decorators: [conAncho(560)],
}
export default meta
type Story = StoryObj<typeof Funnel>

export const Playground: Story = {}

export const Angosto: Story = { name: 'En un panel angosto', parameters: { maxWidth: 300 } }
