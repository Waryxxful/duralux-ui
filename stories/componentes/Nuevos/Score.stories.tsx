import type { Meta, StoryObj } from '@storybook/react-vite'
import { Score, ScoreHero } from '../../../src'
import { conAncho, TresTemas } from './soporte'

const meta: Meta<typeof Score> = {
  title: 'Componentes/Nuevos/Score',
  component: Score,
  tags: ['autodocs'],
  args: { value: 86, max: 100, showRange: true, size: 'md' },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md'] },
    voided: { control: 'boolean' },
  },
  parameters: {
    docs: {
      description: {
        component: 'Puntaje sobre un máximo con rango en texto: bueno (≥ 80 %), medio (≥ 50 %), bajo o anulado por un error grave. `ScoreHero` es la versión protagonista de una ficha de evaluación.',
      },
    },
  },
  decorators: [conAncho()],
}
export default meta
type Story = StoryObj<typeof Score>

export const Playground: Story = {}

export const Rangos: Story = {
  render: () => (
    <div className="d-grid gap-2">
      <Score value={92} />
      <Score value={64} />
      <Score value={38} />
      <Score value={88} voided />
      <Score value={null} />
    </div>
  ),
}

export const Protagonista: Story = {
  name: 'ScoreHero',
  render: () => (
    <div className="d-grid gap-3">
      <ScoreHero value={84} delta={{ value: 6, unit: 'pts', label: 'vs. evaluación anterior' }} context="Meta 80 · 12 evaluaciones" />
      <ScoreHero value={0} previous={76} context="Anulado por error grave: dato sensible sin validar" />
      <ScoreHero value={null} loading />
    </div>
  ),
}

export const Temas: Story = {
  name: 'Tres temas',
  parameters: { maxWidth: 'none' },
  render: () => (
    <TresTemas>
      {() => (
        <div className="d-grid gap-2">
          <Score value={92} />
          <Score value={64} />
          <Score value={38} />
          <Score value={88} voided />
        </div>
      )}
    </TresTemas>
  ),
}
