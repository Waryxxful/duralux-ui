import type { Meta, StoryObj } from '@storybook/react-vite'
import { PieChartWidget } from '../../../src/charts/recharts'
import { FUENTES } from './datos'
import { TresTemas } from './TresTemas'

const meta: Meta<typeof PieChartWidget> = {
  title: 'Componentes/Gráficos/PieChartWidget',
  component: PieChartWidget,
  tags: ['autodocs'],
  args: {
    ariaLabel: 'Fuentes de leads del mes',
    description: 'Orgánico concentra el 42 % de los 2.950 leads.',
    data: FUENTES,
    donut: true,
    legend: true,
    height: 260,
  },
  argTypes: { loading: { control: 'boolean' }, donut: { control: 'boolean' }, legend: { control: 'boolean' } },
  parameters: {
    docs: {
      description: {
        component: 'Torta o anillo para partes de un total (pocas categorías). Las porciones se separan con el color de la superficie; la leyenda usa marca circular + texto y la tabla de datos queda disponible para lectores de pantalla. Acepta `{ name, value }` o `{ x, y }`.',
      },
    },
  },
  decorators: [(Story, ctx) => <div style={{ maxWidth: ctx.parameters.maxWidth ?? 480 }}><Story /></div>],
}
export default meta
type Story = StoryObj<typeof PieChartWidget>

export const Playground: Story = {}

export const Torta: Story = { args: { donut: false } }

export const Vacio: Story = { name: 'Vacío', args: { data: [] } }

export const Carga: Story = { args: { loading: true } }

export const ConError: Story = {
  name: 'Error',
  args: { error: 'No se pudo consultar las fuentes de leads.', onRetry: () => {} },
}

export const Angosto: Story = {
  name: 'Contenedor angosto (360 px)',
  parameters: { maxWidth: 360 },
}

export const Temas: Story = {
  name: 'Claro, oscuro y navy',
  parameters: { maxWidth: 'none' },
  render: (args) => <TresTemas>{(tema) => <PieChartWidget {...args} ariaLabel={`Fuentes de leads (${tema})`} height={220} />}</TresTemas>,
}
