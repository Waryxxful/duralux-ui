import type { Meta, StoryObj } from '@storybook/react-vite'
import { ToolChip } from '../../src'
import { conAncho } from '../componentes/Nuevos/soporte'

const meta: Meta<typeof ToolChip> = {
  title: 'IA/Agente/ToolChip',
  component: ToolChip,
  tags: ['autodocs'],
  args: {
    tool: 'read_queue_metrics',
    status: 'done',
    seconds: 1.2,
    args: { periodo: 'ultima_hora', cola: 'cobranza' },
    result: 'Nivel de servicio 71 % · meta 80 % · 18 en espera',
  },
  argTypes: { status: { control: 'inline-radio', options: ['queued', 'running', 'done', 'failed'] } },
  parameters: {
    docs: { description: { component: 'Llamada a una herramienta, compacta y expandible. El estado va en texto (oculto a la vista, leído por lectores) e ícono. Sin argumentos ni resultado es un chip estático.' } },
  },
  decorators: [conAncho(520)],
}
export default meta
type Story = StoryObj<typeof ToolChip>

export const Playground: Story = {}
export const Abierto: Story = { args: { defaultOpen: true } }
export const Estados: Story = {
  render: () => (
    <div className="d-flex flex-wrap gap-2">
      <ToolChip tool="read_agent_presence" status="queued" />
      <ToolChip tool="search_knowledge_base" status="running" />
      <ToolChip tool="read_campaign_performance" status="done" seconds={0.9} />
      <ToolChip tool="read_survey_results" status="failed" seconds={30} result="La fuente no respondió a tiempo." />
    </div>
  ),
}
