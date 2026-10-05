import type { Meta, StoryObj } from '@storybook/react-vite'
import type * as React from 'react'
import { StatsCard } from '../../../src'

/** Los labels de StatsCard son h3: un h2 (oculto) mantiene el orden de encabezados de la página. */
const withHeading = (Story: React.ComponentType) => (
  <section aria-labelledby="sb-kpis">
    <h2 id="sb-kpis" className="visually-hidden">Indicadores</h2>
    <Story />
  </section>
)

const meta: Meta<typeof StatsCard> = {
  title: 'Componentes/Indicadores/StatsCard',
  component: StatsCard,
  tags: ['autodocs'],
  args: {
    icon: 'feather-headphones',
    tone: 'primary',
    value: 84,
    label: 'Nivel de servicio (%)',
    delta: { value: 4, unit: 'pts', label: 'vs. semana pasada' },
    context: 'Meta 80 %',
  },
  argTypes: {
    tone: { control: 'select', options: ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'teal', 'indigo', 'dark', 'neutral'] },
    loading: { control: 'boolean' },
  },
  parameters: {
    docs: {
      description: {
        component: 'KPI con ícono, cifra, variación y contexto. **Toda cifra lleva meta, variación o tendencia**: usa `delta` (número con signo, unidad y flecha; nunca solo color) y `context`. Un número en `value` se formatea en es-CL con cifras tabulares. Responde a su contenedor: en celdas angostas la variación baja bajo la cifra.',
      },
    },
  },
  decorators: [withHeading, (Story, ctx) => <div style={{ maxWidth: ctx.parameters.maxWidth ?? 420 }}><Story /></div>],
}
export default meta
type Story = StoryObj<typeof StatsCard>

export const Playground: Story = {}

export const Variaciones: Story = {
  name: 'Variaciones con signo y sentido',
  render: () => (
    <div className="d-grid gap-3">
      <StatsCard icon="feather-trending-up" tone="success" value={2840} label="Llamadas atendidas" delta={{ value: 12, unit: '%', label: 'vs. ayer' }} context="Meta 2.600" />
      <StatsCard icon="feather-clock" tone="warning" value="5:12" label="TMO" delta={{ value: -24, unit: 's', label: 'vs. semana pasada', goodWhen: 'down' }} context="Meta 5:00" />
      <StatsCard icon="feather-phone-missed" tone="danger" value="7,8 %" label="Abandono" delta={{ value: 1.4, unit: 'pts', label: 'vs. ayer', goodWhen: 'down' }} context="Umbral 5 %" />
      <StatsCard icon="feather-users" tone="neutral" value={42} label="Agentes conectados" delta={{ value: 0, unit: 'agentes', label: 'vs. hace 1 h' }} context="De 48 programados" />
    </div>
  ),
}

export const ConProgreso: Story = {
  name: 'Con progreso y acción',
  args: {
    icon: 'feather-target',
    tone: 'info',
    value: 1240000,
    label: 'Recaudación del mes ($)',
    delta: { value: 8, unit: '%', label: 'vs. mes pasado' },
    context: undefined,
    progress: { value: 62, label: 'Avance de la meta', color: 'info' },
    footer: 'Ver detalle',
    onFooter: () => {},
  },
}

export const Estados: Story = {
  name: 'Carga y vacío',
  render: () => (
    <div className="d-grid gap-3">
      <StatsCard icon="feather-headphones" tone="primary" value={84} label="Nivel de servicio (%)" loading />
      <StatsCard icon="feather-headphones" tone="primary" value={null} label="Nivel de servicio (%)" emptyText="Sin llamadas en el periodo. Prueba con otra fecha." />
    </div>
  ),
}

export const Tablero: Story = {
  name: 'Tablero del contact center',
  parameters: { maxWidth: 'none' },
  render: () => (
    <div className="row g-3" style={{ minWidth: 0 }}>
      <div className="col-12 col-md-6 col-xl-3"><StatsCard icon="feather-alert-triangle" tone="danger" value={18} label="Llamadas en espera" delta={{ value: 6, unit: 'llamadas', label: 'en 10 min', goodWhen: 'down' }} context="Cola Cobranza sin agentes libres" footer="Reasignar agentes" onFooter={() => {}} /></div>
      <div className="col-12 col-md-6 col-xl-3"><StatsCard icon="feather-headphones" tone="success" value="84 %" label="Nivel de servicio" delta={{ value: 4, unit: 'pts', label: 'vs. ayer' }} context="Meta 80 %" /></div>
      <div className="col-12 col-md-6 col-xl-3"><StatsCard icon="feather-clock" tone="warning" value="5:12" label="TMO" delta={{ value: -24, unit: 's', label: 'vs. ayer', goodWhen: 'down' }} context="Meta 5:00" /></div>
      <div className="col-12 col-md-6 col-xl-3"><StatsCard icon="feather-dollar-sign" tone="info" value={1240000} label="Recaudación ($)" progress={{ value: 62, label: 'Meta mensual', color: 'info' }} delta={{ value: 8, unit: '%', label: 'vs. mes pasado' }} /></div>
    </div>
  ),
}

export const ContenedorAngosto: Story = {
  name: 'Contenedor angosto (320 px)',
  parameters: { maxWidth: 320 },
  args: { progress: { value: 84, label: 'Meta del turno', color: 'success' } },
}
