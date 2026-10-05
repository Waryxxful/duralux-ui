import type { Meta, StoryObj } from '@storybook/react-vite'
import { ModelSelector } from '../../src'
import { conAncho } from '../componentes/Nuevos/soporte'
import { MODELOS } from './datosIa'

const meta: Meta<typeof ModelSelector> = {
  title: 'IA/Conversación/ModelSelector',
  component: ModelSelector,
  tags: ['autodocs'],
  args: { models: MODELOS, defaultValue: 'equilibrado', variant: 'list', label: 'Modelo del asistente' },
  argTypes: { variant: { control: 'inline-radio', options: ['list', 'segmented'] } },
  parameters: { docs: { description: { component: 'Elige el modelo: lista con descripción (RadioGroup) o segmentado para la barra del compositor.' } } },
  decorators: [conAncho(480)],
}
export default meta
type Story = StoryObj<typeof ModelSelector>

export const Playground: Story = {}
export const Segmentado: Story = { args: { variant: 'segmented', label: 'Modelo' } }
export const ConDeshabilitado: Story = {
  name: 'Opción no disponible',
  args: { models: [...MODELOS.slice(0, 2), { ...MODELOS[2], disabled: true, description: 'No incluido en tu plan actual.' }] },
}
