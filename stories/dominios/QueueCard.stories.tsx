import type { Meta, StoryObj } from '@storybook/react-vite'
import { QueueCard, Tag } from '../../src'
import { conAncho } from '../componentes/Nuevos/soporte'

const meta: Meta<typeof QueueCard> = {
  title: 'Dominios/Operación/QueueCard',
  component: QueueCard,
  tags: ['autodocs'],
  args: { name: 'Soporte hogar', waiting: 6, longestWait: 48, agentsAvailable: 3, serviceLevel: 82, target: 80, thresholdSeconds: 20, channel: <Tag size="sm">Voz</Tag> },
  parameters: {
    docs: { description: { component: 'Estado en vivo de una cola. Crítica cuando la espera máxima supera 6 veces el umbral o hay contactos en espera sin agentes libres; se dice en texto con forma y borde.' } },
  },
  decorators: [conAncho(340)],
}
export default meta
type Story = StoryObj<typeof QueueCard>

export const Playground: Story = {}

export const Critica: Story = {
  name: 'Cola crítica',
  args: { name: 'Ventas móvil', waiting: 14, longestWait: 186, agentsAvailable: 0, serviceLevel: 61, channel: <Tag size="sm">WhatsApp</Tag> },
}

export const Grilla: Story = {
  name: 'Varias colas',
  parameters: { maxWidth: 'none' },
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(16rem, 1fr))', gap: 'var(--gcu-space-4)' }}>
      <QueueCard name="Soporte hogar" waiting={6} longestWait={48} agentsAvailable={3} serviceLevel={82} />
      <QueueCard name="Retención" waiting={2} longestWait={22} agentsAvailable={1} serviceLevel={76} />
      <QueueCard name="Ventas móvil" waiting={14} longestWait={186} agentsAvailable={0} serviceLevel={61} />
    </div>
  ),
}
