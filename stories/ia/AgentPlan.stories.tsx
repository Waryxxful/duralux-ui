import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { AgentPlan, type AgentPlanStep } from '../../src'
import { conAncho } from '../componentes/Nuevos/soporte'
import { PLAN } from './datosAgente'

const meta: Meta<typeof AgentPlan> = {
  title: 'IA/Agente/AgentPlan',
  component: AgentPlan,
  tags: ['autodocs'],
  args: { steps: PLAN, onApprove: () => {}, onReject: () => {} },
  parameters: {
    docs: { description: { component: 'Plan de varios pasos propuesto por el agente. Se revisa (y se pueden quitar pasos con `onChange`) antes de aprobar. **Nunca ejecuta:** «Aprobar plan» emite `onApprove(pasos)`; quien consume ejecuta en el servidor y marca `running`.' } },
  },
  decorators: [conAncho(560)],
}
export default meta
type Story = StoryObj<typeof AgentPlan>

export const Playground: Story = {}

function PlanEditable() {
  const [steps, setSteps] = useState<AgentPlanStep[]>(PLAN)
  const [running, setRunning] = useState(false)
  return <AgentPlan steps={steps} onChange={setSteps} running={running} onApprove={() => setRunning(true)} onReject={() => setSteps(PLAN)} />
}

export const Editable: Story = { render: () => <PlanEditable /> }
export const Ejecutando: Story = { args: { running: true } }
export const SinPasos: Story = { name: 'Sin pasos', args: { steps: [] } }
export const ContenedorAngosto: Story = { name: 'Contenedor angosto (320 px)', parameters: { maxWidth: 320 } }
