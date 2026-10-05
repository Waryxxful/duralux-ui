import type { Meta, StoryObj } from '@storybook/react-vite'
import { ActivityFeed, Badge, Card } from '../../../src'

const AHORA = new Date('2026-10-04T16:45:00')

const meta: Meta<typeof ActivityFeed> = {
  title: 'Componentes/Presentación/ActivityFeed',
  component: ActivityFeed,
  tags: ['autodocs'],
  args: {
    now: AHORA,
    items: [
      { key: 1, variant: 'danger', title: 'Cobranza supera la espera máxima', description: '18 llamadas en espera · espera máxima 4:32.', date: new Date('2026-10-04T16:42:00') },
      { key: 2, variant: 'success', title: 'Retención Fibra alcanzó la meta diaria', description: 'Contactabilidad 78 % · meta 75 %.', date: new Date('2026-10-04T15:10:00'), extra: <Badge variant="success" soft>Meta cumplida</Badge> },
      { key: 3, variant: 'primary', title: 'Paula Herrera asignó 4 ejecutivos', description: 'Desde Servicio hacia Cobranza Q4.', date: new Date('2026-10-04T11:24:00') },
      { key: 4, variant: 'warning', title: 'Guion actualizado a la versión 3', description: 'Nueva oferta de repactación en 6 cuotas.', date: new Date('2026-10-03T08:40:00') },
    ],
  },
  parameters: {
    docs: { description: { component: 'Feed de eventos con riel y punto de color por tipo. `date` muestra el tiempo relativo y la fecha completa en `title`; el tipo también va en el texto, nunca solo en el color.' } },
  },
  decorators: [Story => <div style={{ maxWidth: 480 }}><Card title="Actividad reciente"><Story /></Card></div>],
}
export default meta
type Story = StoryObj<typeof ActivityFeed>

export const Playground: Story = {}

export const Angosto: Story = {
  name: 'Contenedor angosto',
  decorators: [Story => <div style={{ maxWidth: 300 }}><Story /></div>],
}
