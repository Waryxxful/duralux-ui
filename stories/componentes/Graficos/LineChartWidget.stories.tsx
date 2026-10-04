import type { Meta, StoryObj } from '@storybook/react-vite'
import { LineChartWidget } from '../../../src/charts/recharts'
import { ATENCION } from './datos'
import { TresTemas } from './TresTemas'

const meta: Meta<typeof LineChartWidget> = {
  title: 'Componentes/Gráficos/LineChartWidget',
  component: LineChartWidget,
  tags: ['autodocs'],
  args: {
    ariaLabel: 'Llamadas atendidas y meta por semana',
    description: 'Las atendidas superan la meta de 2.600 desde la semana 39.',
    data: ATENCION,
    series: [{ key: 'atendidas', label: 'Atendidas' }, { key: 'meta', label: 'Meta', dashed: true }],
    height: 260,
  },
  argTypes: { loading: { control: 'boolean' } },
  parameters: {
    docs: {
      description: {
        component: 'Líneas para tendencias. Es una `<figure>` con nombre (`ariaLabel`, `title` o el título del ChartCard) y una tabla de datos para lectores de pantalla; nada interactivo queda dentro de un `role="img"`. La leyenda identifica cada serie por forma + texto (`dashed` dibuja la línea punteada). Grilla horizontal sutil, ejes en `--gcu-muted`, tooltip elevado con cifras tabulares y entrada que respeta reduced-motion.',
      },
    },
  },
  decorators: [(Story, ctx) => <div style={{ maxWidth: ctx.parameters.maxWidth ?? 720 }}><Story /></div>],
}
export default meta
type Story = StoryObj<typeof LineChartWidget>

export const Playground: Story = {}

export const UnaSerie: Story = {
  name: 'Una serie',
  args: { series: [{ key: 'atendidas', label: 'Atendidas' }] },
}

export const Vacio: Story = {
  name: 'Vacío',
  args: { data: [], emptyMessage: 'No hubo llamadas en el periodo. Prueba con otra semana.' },
}

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
  render: (args) => <TresTemas>{(tema) => <LineChartWidget {...args} ariaLabel={`Llamadas por semana (${tema})`} height={200} />}</TresTemas>,
}
