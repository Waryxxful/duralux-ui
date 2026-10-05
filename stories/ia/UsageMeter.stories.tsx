import type { Meta, StoryObj } from '@storybook/react-vite'
import { UsageMeter } from '../../src'
import { conAncho } from '../componentes/Nuevos/soporte'

const meta: Meta<typeof UsageMeter> = {
  title: 'IA/Conversación/UsageMeter',
  component: UsageMeter,
  tags: ['autodocs'],
  args: { promptTokens: 18400, completionTokens: 2150, limit: 128000, costPer1k: 0.003, variant: 'bar' },
  argTypes: { variant: { control: 'inline-radio', options: ['bar', 'inline'] } },
  parameters: { docs: { description: { component: 'Uso de la ventana de contexto con desglose y costo estimado (si se pasa `costPer1k`).' } } },
  decorators: [conAncho(420)],
}
export default meta
type Story = StoryObj<typeof UsageMeter>

export const Playground: Story = {}
export const CasiLleno: Story = { name: 'Casi lleno', args: { promptTokens: 112000, completionTokens: 6400 } }
export const EnLinea: Story = { name: 'En línea', args: { variant: 'inline' } }
export const SinCosto: Story = { name: 'Sin costo', args: { costPer1k: undefined } }
