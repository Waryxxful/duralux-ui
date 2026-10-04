import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button, CardBody, CardFooter, CardHeader, StatCard, StatusBadge, StatusButton } from '../../../src'

const meta: Meta<typeof StatCard> = {
  title: 'Componentes/Indicadores/StatCard (GranCRM)',
  component: StatCard,
  tags: ['autodocs'],
  args: { title: 'Tickets abiertos', value: 128, icon: 'inbox', variant: 'warning', change: { value: -12.5, label: 'vs. mes pasado' } },
  parameters: {
    docs: {
      description: {
        component: 'Extras GranCRM: `StatCard` (firma `title` / `variant` / `change` sobre StatsCard: `change.value` es un porcentaje con signo y flecha), `CardHeader` / `CardBody` / `CardFooter` sueltos y `StatusBadge` / `StatusButton` (el estado siempre con texto). Todos reenvían ref.',
      },
    },
  },
  decorators: [
    Story => (
      <section aria-labelledby="sb-extras">
        <h2 id="sb-extras" className="visually-hidden">Extras GranCRM</h2>
        <div style={{ maxWidth: 420 }}><Story /></div>
      </section>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof StatCard>

export const Playground: Story = {}

export const Estados: Story = {
  name: 'Sin variación y vacío',
  render: () => (
    <div className="d-grid gap-3">
      <StatCard title="Tickets abiertos" value={128} icon="inbox" variant="primary" footer="Ver tickets" />
      <StatCard title="Tickets abiertos" value={null} icon="inbox" variant="secondary" />
    </div>
  ),
}

export const CardCompuesta: Story = {
  name: 'Card compuesta con estados',
  render: () => (
    <div className="card">
      <CardHeader title="Campañas activas" actions={<Button size="sm" variant="light-brand">Ver todas</Button>} />
      <CardBody>
        <ul className="list-unstyled d-grid gap-2 mb-0">
          <li className="d-flex justify-content-between align-items-center">Cobranza Q4 <StatusBadge status="success" soft label="En meta" /></li>
          <li className="d-flex justify-content-between align-items-center">Retención Fibra <StatusBadge status="warning" soft label="Cerca del umbral" /></li>
          <li className="d-flex justify-content-between align-items-center">Upgrade Móvil <StatusButton status="danger" soft label="Revisar abandono" onClick={() => {}} /></li>
        </ul>
      </CardBody>
      <CardFooter className="text-muted fs-12">Actualizado 16:42</CardFooter>
    </div>
  ),
}

export const ContenedorAngosto: Story = {
  name: 'Contenedor angosto (320 px)',
  decorators: [Story => <div style={{ maxWidth: 320 }}><Story /></div>],
}
