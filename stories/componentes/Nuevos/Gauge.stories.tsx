import type { Meta, StoryObj } from '@storybook/react-vite'
import { Gauge } from '../../../src/charts/apex'
import { conAncho } from './soporte'
import { Fila } from './Fila'
import { TresTemas } from '../Graficos/TresTemas'

const meta: Meta<typeof Gauge> = {
  title: 'Componentes/Nuevos/Gauge',
  component: Gauge,
  tags: ['autodocs'],
  args: { ariaLabel: 'Ocupación de ejecutivos', value: 72, max: 100, unit: '%', tone: 'primary' },
  argTypes: { tone: { control: 'select', options: ['primary', 'success', 'warning', 'danger', 'info', 'indigo', 'teal', 'secondary'] } },
  parameters: {
    docs: { description: { component: 'Medidor semicircular de una cifra sobre un máximo, con la cifra en el centro. En `@duralux/ui/charts/apex`.' } },
  },
  decorators: [conAncho(320)],
}
export default meta
type Story = StoryObj<typeof Gauge>

export const Playground: Story = {}

export const Tonos: Story = {
  parameters: { maxWidth: 520 },
  render: () => (
    <Fila min="10rem">
      <Gauge ariaLabel="Ocupación de ejecutivos" value={72} tone="primary" />
      <Gauge ariaLabel="Abandono" value={7.8} max={20} tone="danger" />
    </Fila>
  ),
}

export const Temas: Story = {
  name: 'Tres temas',
  parameters: { maxWidth: 'none' },
  render: () => <TresTemas>{() => <Gauge ariaLabel="Ocupación de ejecutivos" value={72} height={140} />}</TresTemas>,
}
