import type { Meta, StoryObj } from '@storybook/react-vite'
import { CriterionRow } from '../../src'
import { conAncho } from '../componentes/Nuevos/soporte'
import { CRITERIOS } from './datos'

const meta: Meta<typeof CriterionRow> = {
  title: 'Dominios/Calidad/CriterionRow',
  component: CriterionRow,
  tags: ['autodocs'],
  args: { criterion: CRITERIOS[1] },
  parameters: {
    docs: { description: { component: 'Fila de la pauta de calidad: cumple / no cumple / no aplica con ícono y texto, justificación, cita y evidencia. Usa el selector de tema de la barra para ver claro, oscuro y navy.' } },
  },
  decorators: [conAncho(640)],
}
export default meta
type Story = StoryObj<typeof CriterionRow>

export const Playground: Story = {
  args: { onShowTurn: (turn: number) => console.info('[story] turno citado', turn) },
}

export const Pauta: Story = {
  name: 'Pauta completa',
  render: () => (
    <div>
      {CRITERIOS.map((criterion) => (
        <CriterionRow key={criterion.id} criterion={criterion} onShowTurn={(turn) => console.info('[story] turno citado', turn)} />
      ))}
    </div>
  ),
}

export const Angosta: Story = {
  name: 'En un panel angosto',
  parameters: { maxWidth: 300 },
  args: { criterion: CRITERIOS[4] },
}
