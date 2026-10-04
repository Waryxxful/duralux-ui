import type { Meta, StoryObj } from '@storybook/react-vite'
import { Card, Progress, ProgressRing } from '../../../src'

const meta: Meta<typeof Progress> = {
  title: 'Componentes/Presentación/Progress',
  component: Progress,
  tags: ['autodocs'],
  args: { value: 64, max: 100, variant: 'primary', label: 'Avance de la campaña', showValue: false, height: 8 },
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'teal', 'indigo'] },
  },
  parameters: {
    docs: {
      description: {
        component: '`role="progressbar"` con `aria-valuetext` («64 %»). Da siempre contexto a la cifra: meta, variación o tendencia. `success` solo para lo cumplido; `warning` cerca del umbral; `danger` bajo el umbral.',
      },
    },
  },
}
export default meta
type Story = StoryObj<typeof Progress>

export const Playground: Story = {}

export const Tonos: Story = {
  render: () => (
    <div className="d-grid gap-3" style={{ maxWidth: 420 }}>
      {(['primary', 'success', 'warning', 'danger', 'info', 'indigo'] as const).map((tone, i) => (
        <Progress key={tone} value={30 + i * 12} variant={tone} label={`Barra ${tone}`} showValue height={16} />
      ))}
    </div>
  ),
}

export const Anillo: Story = {
  name: 'ProgressRing',
  render: () => (
    <div className="d-flex gap-4 align-items-center">
      <ProgressRing value={84} aria-label="Nivel de servicio" />
      <ProgressRing value={42} size={64} stroke={6} color="var(--gcu-status-warning)" aria-label="Ocupación" />
      <ProgressRing value={100} size={96} color="var(--gcu-status-success)" aria-label="Cumplimiento" />
    </div>
  ),
}

export const CasoReal: Story = {
  name: 'Caso real: metas del turno',
  render: () => (
    <div style={{ maxWidth: 420 }}>
      <Card title="Metas del turno" subtitle="Mañana · 08:00 a 14:00">
        {[
          { label: 'Nivel de servicio', value: 84, meta: 80, tone: 'success' as const },
          { label: 'Contactabilidad', value: 68, meta: 75, tone: 'warning' as const },
          { label: 'Abandono', value: 12, meta: 5, tone: 'danger' as const },
        ].map((row) => (
          <div key={row.label} className="mb-3">
            <div className="d-flex justify-content-between fs-12 mb-1">
              <span>{row.label}</span>
              <span className="gcu-tabular">{row.value} % · meta {row.meta} %</span>
            </div>
            <Progress value={row.value} variant={row.tone} label={row.label} />
          </div>
        ))}
      </Card>
    </div>
  ),
}

export const Angosto: Story = {
  name: 'Contenedor angosto (320 px)',
  render: () => (
    <div style={{ maxWidth: 320 }} className="d-grid gap-3">
      <Progress value={47} label="Carga de la cola" showValue height={16} />
      <ProgressRing value={47} size={64} aria-label="Carga de la cola" />
    </div>
  ),
}
