import type { Meta, StoryObj } from '@storybook/react-vite'
import { LoadingState } from '../../../src'

const meta: Meta<typeof LoadingState> = {
  title: 'Componentes/Feedback/LoadingState',
  component: LoadingState,
  tags: ['autodocs'],
  args: { message: 'Cargando campañas…', variant: 'spinner', rows: 3 },
  argTypes: { variant: { control: 'inline-radio', options: ['spinner', 'skeleton'] } },
  parameters: {
    docs: {
      description: {
        component: 'Una sola región `status` con `aria-busy`. En listas y cards prefiere `variant="skeleton"`: evita el salto al llegar los datos y su shimmer respeta reduced-motion.',
      },
    },
  },
}
export default meta
type Story = StoryObj<typeof LoadingState>

export const Playground: Story = {}

export const Skeleton: Story = {
  name: 'Skeleton en card',
  render: () => (
    <div className="card" style={{ maxWidth: '24rem' }}>
      <div className="card-body">
        <LoadingState variant="skeleton" rows={4} message="Cargando agentes" />
      </div>
    </div>
  ),
}
