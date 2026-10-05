import type { Meta, StoryObj } from '@storybook/react-vite'
import { AgentSteps } from '../../src'
import { conAncho } from '../componentes/Nuevos/soporte'
import { PASOS } from './datosAgente'

const meta: Meta<typeof AgentSteps> = {
  title: 'IA/Agente/AgentSteps',
  component: AgentSteps,
  tags: ['autodocs'],
  args: { steps: PASOS },
  parameters: {
    docs: { description: { component: 'Línea de tiempo de las herramientas que usó el agente: estado en texto, duración, argumentos, resultado y llamadas en paralelo (ToolChip). Solo muestra lo ocurrido; no ejecuta nada.' } },
  },
  decorators: [conAncho(600)],
}
export default meta
type Story = StoryObj<typeof AgentSteps>

export const Playground: Story = {}
export const Compacto: Story = { args: { compact: true } }
export const ConFalla: Story = {
  name: 'Con falla',
  args: { steps: [PASOS[0], { id: 'f', tool: 'read_survey_results', title: 'Leer encuestas de satisfacción', status: 'failed', seconds: 30, result: 'La fuente no respondió a tiempo. El asistente sigue sin estos datos y lo dice en la respuesta.' }] },
}
export const ContenedorAngosto: Story = { name: 'Contenedor angosto (320 px)', parameters: { maxWidth: 320 } }
