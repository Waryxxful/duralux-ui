import type { Meta, StoryObj } from '@storybook/react-vite'
import { ColoredStatCard } from '../../../src'

const tones = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'teal', 'indigo', 'dark'] as const

const meta: Meta<typeof ColoredStatCard> = {
  title: 'Componentes/Indicadores/ColoredStatCard',
  component: ColoredStatCard,
  tags: ['autodocs'],
  args: {
    icon: 'feather-dollar-sign',
    tone: 'primary',
    value: 1240000,
    label: 'Recaudación del mes ($)',
    delta: { value: 8, unit: '%', label: 'vs. mes pasado' },
    context: 'Meta $2.000.000',
  },
  argTypes: { tone: { control: 'select', options: tones }, loading: { control: 'boolean' } },
  parameters: {
    docs: {
      description: {
        component: 'Cifra destacada sobre una superficie de color con grano (Craft «Noise»). Los rellenos son pasos profundos de la paleta (≈ 7:1 con blanco) que no cambian entre claro, oscuro y navy; el ícono y la variación van sobre vidrio sombreado. Úsala para la cifra que manda en la vista, no para cuatro tarjetas iguales. `bg`, `trend` y `trendUp` están deprecados.',
      },
    },
  },
  decorators: [Story => <div style={{ maxWidth: 420 }}><Story /></div>],
}
export default meta
type Story = StoryObj<typeof ColoredStatCard>

export const Playground: Story = {}

export const Tonos: Story = {
  decorators: [Story => <div style={{ maxWidth: 'none' }}><Story /></div>],
  render: () => (
    <div className="row g-3">
      {tones.map(tone => (
        <div className="col-12 col-md-6 col-xl-4" key={tone}>
          <ColoredStatCard icon="feather-activity" tone={tone} value={2840} label={`Tono ${tone}`} delta={{ value: tone === 'danger' ? -3 : 5, unit: '%', label: 'vs. ayer' }} />
        </div>
      ))}
    </div>
  ),
}

export const Estados: Story = {
  name: 'Carga y vacío',
  render: () => (
    <div className="d-grid gap-3">
      <ColoredStatCard icon="feather-dollar-sign" tone="primary" value={1} label="Recaudación del mes ($)" loading />
      <ColoredStatCard icon="feather-dollar-sign" tone="dark" value={null} label="Recaudación del mes ($)" emptyText="Aún no hay pagos este mes." />
    </div>
  ),
}

export const Tablero: Story = {
  name: 'Campaña bajo la meta',
  decorators: [Story => <div style={{ maxWidth: 'none' }}><Story /></div>],
  render: () => (
    <div className="row g-3">
      <div className="col-12 col-lg-6">
        <ColoredStatCard icon="feather-alert-triangle" tone="danger" value="68 %" label="Contactabilidad · Cobranza Q4" delta={{ value: -6, unit: 'pts', label: 'vs. semana pasada' }} context="Meta 75 %: faltan 412 contactos" />
      </div>
      <div className="col-12 col-lg-6">
        <ColoredStatCard icon="feather-check-circle" tone="success" value={1240} label="Promesas de pago" delta={{ value: 12, unit: '%', label: 'vs. semana pasada' }} context="Meta 1.100 cumplida" />
      </div>
    </div>
  ),
}

export const ContenedorAngosto: Story = {
  name: 'Contenedor angosto (320 px)',
  decorators: [Story => <div style={{ maxWidth: 320 }}><Story /></div>],
}
