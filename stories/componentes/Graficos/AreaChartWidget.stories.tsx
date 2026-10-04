import type { Meta, StoryObj } from '@storybook/react-vite'
import { AreaChartWidget } from '../../../src/charts/recharts'
import { ATENCION, SERIES_ATENCION } from './datos'
import { TresTemas } from './TresTemas'

const meta: Meta<typeof AreaChartWidget> = {
  title: 'Componentes/Gráficos/AreaChartWidget',
  component: AreaChartWidget,
  tags: ['autodocs'],
  args: {
    ariaLabel: 'Llamadas atendidas y abandonadas por semana',
    data: ATENCION,
    series: SERIES_ATENCION,
    height: 260,
    grid: true,
  },
  argTypes: { loading: { control: 'boolean' }, grid: { control: 'boolean' } },
  parameters: {
    docs: {
      description: {
        component: 'Área con degradado suave para volúmenes acumulados en el tiempo. Misma figura accesible, leyenda con forma + texto, tooltip elevado y estados que los demás widgets. `grid` oculta la grilla en tarjetas muy pequeñas.',
      },
    },
  },
  decorators: [(Story, ctx) => <div style={{ maxWidth: ctx.parameters.maxWidth ?? 720 }}><Story /></div>],
}
export default meta
type Story = StoryObj<typeof AreaChartWidget>

export const Playground: Story = {}

export const SinGrilla: Story = {
  name: 'Una serie sin grilla',
  args: { series: [{ key: 'atendidas', label: 'Atendidas' }], grid: false, height: 160 },
}

export const Vacio: Story = { name: 'Vacío', args: { data: [] } }

export const Carga: Story = { args: { loading: true } }

export const ConError: Story = {
  name: 'Error',
  args: { error: { title: 'Sin conexión con la central', message: 'Revisa la conexión y vuelve a intentarlo.', onRetry: () => {} } },
}

export const Angosto: Story = {
  name: 'Contenedor angosto (360 px)',
  parameters: { maxWidth: 360 },
}

export const Temas: Story = {
  name: 'Claro, oscuro y navy',
  parameters: { maxWidth: 'none' },
  render: (args) => <TresTemas>{(tema) => <AreaChartWidget {...args} ariaLabel={`Llamadas por semana (${tema})`} height={200} />}</TresTemas>,
}
