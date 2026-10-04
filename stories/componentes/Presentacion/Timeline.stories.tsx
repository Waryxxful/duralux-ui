import type { Meta, StoryObj } from '@storybook/react-vite'
import { ActivityFeed, Badge, Card, Timeline } from '../../../src'

// Instante fijo: las capturas no cambian con la hora real.
const NOW = new Date(2026, 9, 4, 16, 42)
const ago = (minutes: number) => new Date(NOW.getTime() - minutes * 60_000)

const ITEMS = [
  { id: 1, title: 'Ticket #48213 cerrado', description: 'Resuelto en el primer contacto.', date: ago(5), icon: 'feather-check', variant: 'success' as const },
  { id: 2, title: 'Llamada escalada a supervisión', description: 'Cliente con riesgo de fuga.', date: ago(52), icon: 'feather-alert-triangle', variant: 'warning' as const },
  { id: 3, title: 'Campaña Cobranza Q4 iniciada', date: ago(60 * 5), icon: 'feather-play', variant: 'primary' as const, user: { name: 'Camila Rojas' } },
  { id: 4, title: 'Error de integración con el CRM', description: 'Se reintentó automáticamente.', date: ago(60 * 26), icon: 'feather-x-circle', variant: 'danger' as const },
]

const meta: Meta<typeof Timeline> = {
  title: 'Componentes/Presentación/Timeline',
  component: Timeline,
  tags: ['autodocs'],
  args: { items: ITEMS, now: NOW, 'aria-label': 'Actividad reciente' },
  parameters: {
    docs: {
      description: {
        component: 'Con `date` muestra tiempo relativo («hace 5 minutos», «ayer») y la fecha completa dd-mm-aaaa HH:mm en el `title`. El marcador usa el tono; el ícono es decorativo y el texto nombra el evento. En contenedores angostos la hora pasa bajo el título.',
      },
    },
  },
}
export default meta
type Story = StoryObj<typeof Timeline>

export const Playground: Story = {}

export const TextoLegado: Story = {
  name: 'Hora como texto (legado)',
  args: {
    items: [
      { id: 'a', title: 'Reunión de calibración', time: '09:30' },
      { id: 'b', title: 'Cambio de turno', time: '14:00' },
    ],
  },
}

export const Feed: Story = {
  name: 'ActivityFeed',
  render: () => (
    <div style={{ maxWidth: 560 }}>
      <ActivityFeed
        now={NOW}
        items={[
          { key: 'pago', variant: 'success', title: 'Pago recibido · $1.240.000', description: 'Cliente #48213 regularizó su deuda.', date: ago(3) },
          { key: 'pausa', variant: 'warning', title: 'Agente en pausa prolongada', description: 'Diego Fuentes lleva 18 minutos en pausa.', date: ago(18), extra: <Badge variant="warning" soft>Revisar</Badge> },
          { key: 'cola', variant: 'danger', title: 'Cola de soporte sin agentes libres', date: ago(70) },
          { key: 'ia', variant: 'info', title: 'Resumen de IA generado', date: ago(60 * 24 * 3) },
        ]}
      />
    </div>
  ),
}

export const CasoReal: Story = {
  name: 'Caso real: actividad en una card',
  render: () => (
    <div style={{ maxWidth: 520 }}>
      <Card title="Actividad del cliente" subtitle="Últimas 48 horas">
        <Timeline items={ITEMS} now={NOW} aria-label="Actividad del cliente" />
      </Card>
    </div>
  ),
}

export const Angosto: Story = {
  name: 'Contenedor angosto (320 px)',
  render: () => (
    <div style={{ maxWidth: 320 }} className="d-grid gap-4">
      <Timeline items={ITEMS.slice(0, 3)} now={NOW} aria-label="Actividad en angosto" />
      <ActivityFeed now={NOW} items={[{ key: 'x', variant: 'primary', title: 'Campaña reasignada a la cola norte', date: ago(9) }]} />
    </div>
  ),
}
