import type { Meta, StoryObj } from '@storybook/react-vite'
import { Donut } from '../../../src/charts/apex'
import { conAncho } from './soporte'
import { TresTemas } from '../Graficos/TresTemas'

const meta: Meta<typeof Donut> = {
  title: 'Componentes/Nuevos/Donut',
  component: Donut,
  tags: ['autodocs'],
  args: {
    ariaLabel: 'Llamadas por resultado',
    labels: ['Compromiso de pago', 'Sin contacto', 'Rechazo'],
    values: [1240, 980, 620],
    totalLabel: 'Llamadas',
  },
  parameters: {
    docs: { description: { component: 'Dona compacta con el total en el centro (suma es-CL por defecto). Úsala con pocas categorías. En `@duralux/ui/charts/apex`.' } },
  },
  decorators: [conAncho(360)],
}
export default meta
type Story = StoryObj<typeof Donut>

export const Playground: Story = {}

export const TotalPropio: Story = { name: 'Total propio', args: { total: '2,8 mil', totalLabel: 'Llamadas hoy' } }

export const Carga: Story = { args: { loading: true } }

export const Temas: Story = {
  name: 'Tres temas',
  parameters: { maxWidth: 'none' },
  render: () => <TresTemas>{() => <Donut ariaLabel="Llamadas por resultado" labels={['Compromiso', 'Sin contacto']} values={[1240, 980]} height={200} />}</TresTemas>,
}
