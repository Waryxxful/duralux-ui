import type { Meta, StoryObj } from '@storybook/react-vite'
import { AppStatusCard, Button } from '../../../src'
import { conAncho, Fila, TresTemas } from './soporte'

const meta: Meta<typeof AppStatusCard> = {
  title: 'Componentes/Nuevos/AppStatusCard',
  component: AppStatusCard,
  tags: ['autodocs'],
  args: {
    name: 'Tablero TI',
    description: 'Kanban de solicitudes internas',
    icon: 'feather-trello',
    status: 'activo',
    detail: 'Responde en 320 ms',
  },
  argTypes: { status: { control: 'inline-radio', options: ['activo', 'montaje', 'caido'] } },
  parameters: {
    docs: { description: { component: 'Estado de una app conectada (activo, en montaje o caída), con detalle en texto y una acción opcional.' } },
  },
  decorators: [conAncho(360)],
}
export default meta
type Story = StoryObj<typeof AppStatusCard>

export const Playground: Story = {}

export const Estados: Story = {
  parameters: { maxWidth: 'none' },
  render: () => (
    <Fila>
      <AppStatusCard name="Tablero TI" icon="feather-trello" status="activo" detail="Responde en 320 ms" />
      <AppStatusCard name="Chat" icon="feather-message-circle" status="montaje" detail="Desde 16:42" />
      <AppStatusCard name="Grabaciones" icon="feather-headphones" status="caido" detail="Sin respuesta desde 16:10" action={<Button size="sm" variant="light-primary">Reintentar</Button>} />
    </Fila>
  ),
}

export const Temas: Story = {
  name: 'Tres temas',
  parameters: { maxWidth: 'none' },
  render: () => <TresTemas>{() => <AppStatusCard name="Chat" icon="feather-message-circle" status="montaje" detail="Desde 16:42" />}</TresTemas>,
}
