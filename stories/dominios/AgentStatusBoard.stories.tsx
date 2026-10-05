import type { Meta, StoryObj } from '@storybook/react-vite'
import { AgentStatusBoard } from '../../src'
import { conAncho } from '../componentes/Nuevos/soporte'
import { AGENTES } from './datos'

const meta: Meta<typeof AgentStatusBoard> = {
  title: 'Dominios/Operación/AgentStatusBoard',
  component: AgentStatusBoard,
  tags: ['autodocs'],
  args: { agents: AGENTES },
  parameters: {
    docs: { description: { component: 'Presencia en vivo con forma + texto (punto, cuadrado, triángulo, anillo, raya), conteo por estado y tiempo largo marcado. La grilla responde a su contenedor.' } },
  },
  decorators: [conAncho('none')],
}
export default meta
type Story = StoryObj<typeof AgentStatusBoard>

export const Playground: Story = {
  args: { onSelect: (agent) => console.info('[story] agente', agent.id) },
}

export const Angosto: Story = { name: 'En un panel angosto', parameters: { maxWidth: 320 } }

export const Estados: Story = {
  name: 'Carga y vacío',
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--gcu-space-6)' }}>
      <AgentStatusBoard agents={[]} loading />
      <AgentStatusBoard agents={[]} />
    </div>
  ),
}
