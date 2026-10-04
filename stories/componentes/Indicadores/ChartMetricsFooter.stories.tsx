import type { Meta, StoryObj } from '@storybook/react-vite'
import { ChartMetricsFooter } from '../../../src'

const metrics = [
  { id: 'atendidas', label: 'Atendidas', value: 2840, delta: { value: 12, unit: '%' } },
  { id: 'abandonadas', label: 'Abandonadas', value: 124, delta: { value: 1.4, unit: 'pts', goodWhen: 'down' as const } },
  { id: 'tmo', label: 'TMO', value: '5:12', delta: { value: -24, unit: 's', goodWhen: 'down' as const } },
]

const meta: Meta<typeof ChartMetricsFooter> = {
  title: 'Componentes/Indicadores/ChartMetricsFooter',
  component: ChartMetricsFooter,
  tags: ['autodocs'],
  args: { metrics },
  argTypes: { loading: { control: 'boolean' } },
  parameters: {
    docs: {
      description: {
        component: 'De 2 a 4 cifras bajo un gráfico, como lista de definición. Cifras es-CL tabulares con `delta` opcional. Desde 28rem van en una fila con separadores; en contenedores angostos, en dos columnas.',
      },
    },
  },
  decorators: [(Story, ctx) => <div style={{ maxWidth: ctx.parameters.maxWidth ?? 560 }}><Story /></div>],
}
export default meta
type Story = StoryObj<typeof ChartMetricsFooter>

export const Playground: Story = {}

export const SoloCifras: Story = {
  name: 'Solo cifras',
  args: { metrics: [{ label: 'Horas facturables', value: '120 h' }, { label: 'No facturables', value: '40 h' }] },
}

export const Estados: Story = {
  name: 'Carga y vacío',
  render: () => (
    <div className="d-grid gap-4">
      <ChartMetricsFooter loading metrics={metrics} />
      <ChartMetricsFooter metrics={[{ label: 'Atendidas', value: null }, { label: 'Abandonadas', value: null }]} />
    </div>
  ),
}

export const BajoGrafico: Story = {
  name: 'Bajo un gráfico',
  render: () => (
    <div className="card">
      <div className="card-header"><h2 className="h5 card-title mb-0">Llamadas de hoy</h2></div>
      <div className="card-body">
        <div className="gcu-skeleton" style={{ height: 160 }} aria-hidden="true" />
        <ChartMetricsFooter metrics={metrics} />
      </div>
    </div>
  ),
}

export const ContenedorAngosto: Story = {
  name: 'Contenedor angosto (320 px)',
  parameters: { maxWidth: 320 },
}
