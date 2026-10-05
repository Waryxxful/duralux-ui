import type { Meta, StoryObj } from '@storybook/react-vite'
import { TaskRows } from '../../src'
import { conAncho } from '../componentes/Nuevos/soporte'
import { TAREAS } from './datosAgente'

const meta: Meta<typeof TaskRows> = {
  title: 'IA/Agente/TaskRows',
  component: TaskRows,
  tags: ['autodocs'],
  args: { tasks: TAREAS },
  parameters: {
    docs: { description: { component: 'Tareas en vivo de un agente con métrica, estado en texto y notas plegables (`<details>` nativo).' } },
  },
  decorators: [conAncho(560)],
}
export default meta
type Story = StoryObj<typeof TaskRows>

export const Playground: Story = {}
export const Compacto: Story = { args: { compact: true } }
export const Vacio: Story = { name: 'Vacío', args: { tasks: [] } }
export const ContenedorAngosto: Story = { name: 'Contenedor angosto (320 px)', parameters: { maxWidth: 320 } }
