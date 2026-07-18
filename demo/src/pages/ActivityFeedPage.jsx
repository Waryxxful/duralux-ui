import { ActivityFeed, Badge } from '@duralux/ui'
import { ShowcaseSection } from '../ShowcaseSection'

const ITEMS = [
  {
    key: 1,
    variant: 'primary',
    title: 'Nuevo pedido #987456',
    description: 'Duralux es un panel de administración limpio construido con Bootstrap y buenas prácticas modernas de frontend.',
    time: 'hace 5 min',
  },
  {
    key: 2,
    variant: 'success',
    title: 'Pago confirmado — Factura #4821',
    description: 'El cliente completó el pago del 50% restante del proyecto.',
    time: 'hace 15 min',
    extra: <Badge variant="success" soft>pagado</Badge>,
  },
  {
    key: 3,
    variant: 'danger',
    title: 'Evento por comenzar — Kickoff Duralux',
    description: 'La reunión de arranque del proyecto comienza en breve, confirmá tu asistencia.',
    time: 'hace 10 min',
  },
  {
    key: 4,
    variant: 'warning',
    title: 'Recordatorio de vencimiento',
    description: 'La suscripción del cliente vence en 3 días.',
    time: 'hace 1 h',
  },
]

export function ActivityFeedPage() {
  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>ActivityFeed</h1>
      <p style={{ color: '#64748b', marginBottom: 32 }}>
        Props: <code>items=[{'{key, variant, title, description, time, extra}'}]</code>
      </p>

      <ShowcaseSection
        title="Feed de actividad"
        description="Markup 1:1 de widgets-lists.html (ul.activity-feed-1 > li.feed-item.feed-item-{variant}); el riel de color es CSS puro."
        preview={<ActivityFeed items={ITEMS} />}
        code={`<ActivityFeed items={[
  {
    key: 1,
    variant: 'primary',
    title: 'Nuevo pedido #987456',
    description: 'Duralux es un panel de administración limpio...',
    time: 'hace 5 min',
  },
  {
    key: 2,
    variant: 'success',
    title: 'Pago confirmado — Factura #4821',
    time: 'hace 15 min',
    extra: <Badge variant="success" soft>pagado</Badge>,
  },
]} />`}
      />
    </div>
  )
}
