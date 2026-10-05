import type { Meta, StoryObj } from '@storybook/react-vite'
import { AiLoader } from '../../src'
import { conAncho } from '../componentes/Nuevos/soporte'

const meta: Meta<typeof AiLoader> = {
  title: 'IA/Conversación/AiLoader',
  component: AiLoader,
  tags: ['autodocs'],
  args: { label: 'Analizando 1.284 llamadas de Cobranza' },
  parameters: { docs: { description: { component: 'Espera larga con tiempo transcurrido. La tarea se anuncia una vez; el contador es visual.' } } },
  decorators: [conAncho(560)],
}
export default meta
type Story = StoryObj<typeof AiLoader>

export const Playground: Story = {}
export const Cancelable: Story = { args: { onCancel: () => {} } }
const INICIO = Date.now() - 75000
export const EnCurso: Story = { name: "Iniciada hace 75 s al cargar", args: { startedAt: INICIO } }
