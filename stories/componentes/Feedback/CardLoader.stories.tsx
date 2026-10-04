import type { Meta, StoryObj } from '@storybook/react-vite'
import { Card, CardLoader } from '../../../src'

const meta: Meta<typeof CardLoader> = {
  title: 'Componentes/Feedback/CardLoader',
  component: CardLoader,
  tags: ['autodocs'],
  args: { loading: true, label: 'Cargando llamadas' },
  parameters: {
    docs: {
      description: {
        component: 'Overlay de carga de una card (región `status` con `aria-busy`). Úsalo vía `Card loading` al refrescar datos ya visibles; para la primera carga prefiere `LoadingState variant="skeleton"`.',
      },
    },
  },
  render: (args) => (
    <div style={{ maxWidth: '24rem' }}>
      <div className="card" style={{ position: 'relative' }}>
        <div className="card-body">
          <p className="mb-1 gcu-tabular">1.240 llamadas · meta 1.200 · +3 %</p>
          <p className="mb-0 text-muted">Actualizado a las 16:42</p>
        </div>
        <CardLoader {...args} />
      </div>
    </div>
  ),
}
export default meta
type Story = StoryObj<typeof CardLoader>

export const Playground: Story = {}

export const EnCard: Story = {
  name: 'Caso real: Card refrescando',
  render: () => (
    <div style={{ maxWidth: '24rem' }}>
      <Card title="Nivel de servicio" loading loadingLabel="Actualizando nivel de servicio">
        <p className="mb-0 gcu-tabular">84 % · meta 80 % · +4 pts</p>
      </Card>
    </div>
  ),
}
