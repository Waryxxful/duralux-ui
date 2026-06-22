import { Timeline } from '@duralux/ui'
import { ShowcaseSection } from '../ShowcaseSection'

const ITEMS = [
  { id: 1, title: 'Reunión inicial con cliente', description: 'Se definieron los requerimientos del proyecto.', time: '10:00 AM', icon: 'feather-calendar', color: 'primary' },
  { id: 2, title: 'Propuesta enviada', description: 'El cliente recibió la cotización por email.', time: '02:30 PM', icon: 'feather-send', color: 'success' },
  { id: 3, title: 'Pago recibido', description: 'Primer abono del 50% del proyecto.', time: '04:00 PM', icon: 'feather-dollar-sign', color: 'warning' },
  { id: 4, title: 'Proyecto iniciado', description: 'Kick-off con el equipo de desarrollo.', time: '09:00 AM', icon: 'feather-play', color: 'info' },
]

export function TimelinePage() {
  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Timeline</h1>
      <p style={{ color: '#64748b', marginBottom: 32 }}>Props: <code>items=[{'{id, title, description, time, icon, color}'}]</code></p>

      <ShowcaseSection
        title="Timeline de actividad"
        preview={<Timeline items={ITEMS} />}
        code={`<Timeline items={[
  {
    id: 1,
    title: 'Reunión inicial',
    description: 'Se definieron los requerimientos.',
    time: '10:00 AM',
    icon: 'feather-calendar',
    color: 'primary',
  },
  {
    id: 2,
    title: 'Propuesta enviada',
    description: 'Cotización enviada por email.',
    time: '02:30 PM',
    icon: 'feather-send',
    color: 'success',
  },
]} />`}
      />
    </div>
  )
}
