import type { Meta, StoryObj } from '@storybook/react-vite'
import { QuotaBanner } from '../../src'
import { conAncho } from '../componentes/Nuevos/soporte'

const meta: Meta<typeof QuotaBanner> = {
  title: 'IA/Conversación/QuotaBanner',
  component: QuotaBanner,
  tags: ['autodocs'],
  args: { used: 38, limit: 50, resetInSeconds: 4 * 3600 + 12 * 60, onRequestMore: () => {}, variant: 'banner' },
  argTypes: { variant: { control: 'inline-radio', options: ['banner', 'compact'] } },
  parameters: { docs: { description: { component: 'Consultas usadas del día con cuenta regresiva. Desde 90 % pasa a advertencia y al 100 % a peligro, siempre con texto.' } } },
  decorators: [conAncho(720)],
}
export default meta
type Story = StoryObj<typeof QuotaBanner>

export const Playground: Story = {}
export const CercaDelLimite: Story = { name: 'Cerca del límite', args: { used: 46 } }
export const Agotada: Story = { args: { used: 50, resetInSeconds: 25 * 60 } }
export const Compacta: Story = { args: { variant: 'compact' }, parameters: { maxWidth: 320 } }
