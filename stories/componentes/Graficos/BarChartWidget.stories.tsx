import type { Meta, StoryObj } from '@storybook/react-vite'
import { BarChartWidget } from '../../../src/charts/recharts'
import { ATENCION, SERIES_ATENCION } from './datos'
import { TresTemas } from './TresTemas'

const meta: Meta<typeof BarChartWidget> = {
  title: 'Componentes/Gráficos/BarChartWidget',
  component: BarChartWidget,
  tags: ['autodocs'],
  args: {
    ariaLabel: 'Llamadas atendidas y abandonadas por semana',
    data: ATENCION,
    series: SERIES_ATENCION,
    height: 260,
    rounded: 6,
  },
  argTypes: { loading: { control: 'boolean' }, stacked: { control: 'boolean' } },
  parameters: {
    docs: {
      description: {
        component: 'Barras para comparar categorías. `stacked` apila las series (solo la barra superior lleva radio), `rounded` define el radio y `barSize` el ancho máximo. Leyenda con marca cuadrada + texto, tooltip elevado con cifras es-CL tabulares.',
      },
    },
  },
  decorators: [(Story, ctx) => <div style={{ maxWidth: ctx.parameters.maxWidth ?? 720 }}><Story /></div>],
}
export default meta
type Story = StoryObj<typeof BarChartWidget>

export const Playground: Story = {}

export const Apiladas: Story = { args: { stacked: true } }

export const Vacio: Story = { name: 'Vacío', args: { data: [] } }

export const Carga: Story = { args: { loading: true } }

export const ConError: Story = {
  name: 'Error',
  args: { error: 'No se pudo consultar el tablero de atención.', onRetry: () => {} },
}

export const Angosto: Story = {
  name: 'Contenedor angosto (360 px)',
  parameters: { maxWidth: 360 },
}

export const Temas: Story = {
  name: 'Claro, oscuro y navy',
  parameters: { maxWidth: 'none' },
  render: (args) => <TresTemas>{(tema) => <BarChartWidget {...args} ariaLabel={`Llamadas por semana (${tema})`} height={200} />}</TresTemas>,
}
