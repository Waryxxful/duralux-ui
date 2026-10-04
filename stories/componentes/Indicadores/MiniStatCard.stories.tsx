import type { Meta, StoryObj } from '@storybook/react-vite'
import { MiniStatCard } from '../../../src'

const meta: Meta<typeof MiniStatCard> = {
  title: 'Componentes/Indicadores/MiniStatCard',
  component: MiniStatCard,
  tags: ['autodocs'],
  args: { icon: 'feather-phone-call', tone: 'success', value: 31, label: 'En llamada', context: 'De 48 agentes' },
  argTypes: {
    tone: { control: 'select', options: ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'teal', 'indigo', 'dark', 'neutral'] },
    loading: { control: 'boolean' },
  },
  parameters: {
    docs: {
      description: {
        component: 'Cifra compacta para grillas densas. Centrada en celdas angostas; desde 20rem el ícono va a la izquierda. `color` equivale a `tone`. Acompaña la cifra con `context` o `delta`.',
      },
    },
  },
  decorators: [(Story, ctx) => <div style={{ maxWidth: ctx.parameters.maxWidth ?? 420 }}><Story /></div>],
}
export default meta
type Story = StoryObj<typeof MiniStatCard>

export const Playground: Story = {}

export const Tonos: Story = {
  render: () => (
    <div className="row g-3">
      {(['primary', 'success', 'warning', 'danger', 'info', 'neutral'] as const).map(tone => (
        <div className="col-6" key={tone}><MiniStatCard icon="feather-activity" tone={tone} value={12} label={`Tono ${tone}`} context="Hoy" /></div>
      ))}
    </div>
  ),
}

export const Estados: Story = {
  name: 'Carga y vacío',
  render: () => (
    <div className="row g-3">
      <div className="col-6"><MiniStatCard icon="feather-phone-call" value={31} label="En llamada" loading /></div>
      <div className="col-6"><MiniStatCard icon="feather-phone-call" value={null} label="En llamada" emptyText="Ningún agente conectado." /></div>
    </div>
  ),
}

export const Tablero: Story = {
  name: 'Estado de agentes',
  parameters: { maxWidth: 'none' },
  render: () => (
    <div className="row g-3">
      <div className="col-6 col-lg-3"><MiniStatCard icon="feather-phone-call" tone="success" value={31} label="En llamada" delta={{ value: 4, unit: 'agentes', label: 'vs. 10 min' }} /></div>
      <div className="col-6 col-lg-3"><MiniStatCard icon="feather-coffee" tone="warning" value={9} label="En pausa" delta={{ value: 3, unit: 'agentes', goodWhen: 'down' }} context="Máximo 6" /></div>
      <div className="col-6 col-lg-3"><MiniStatCard icon="feather-user-check" tone="primary" value={5} label="Disponibles" context="Cola Cobranza: 0" /></div>
      <div className="col-6 col-lg-3"><MiniStatCard icon="feather-wifi-off" tone="neutral" value={3} label="Desconectados" context="De 48 programados" /></div>
    </div>
  ),
}

export const ContenedorAngosto: Story = {
  name: 'Contenedor angosto (320 px)',
  parameters: { maxWidth: 320 },
  args: { delta: { value: -2, unit: 'agentes', label: 'vs. 10 min' } },
}
