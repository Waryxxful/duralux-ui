import type { Meta, StoryObj } from '@storybook/react-vite'
import { BarChartWidget, ChartCard, PieChartWidget } from '../../../src/charts/recharts'
import { ATENCION, FUENTES, SERIES_ATENCION, TresTemas, conEncabezado } from './datos'

const meta: Meta<typeof ChartCard> = {
  title: 'Componentes/Gráficos/ChartCard',
  component: ChartCard,
  tags: ['autodocs'],
  args: {
    title: 'Atención por semana',
    subtitle: 'Últimas 6 semanas · meta 2.600 atendidas',
    actions: [
      { id: 'csv', label: 'Exportar CSV', onClick: () => {} },
      { id: 'detalle', label: 'Ver detalle por cola', onClick: () => {} },
    ],
    children: <BarChartWidget data={ATENCION} series={SERIES_ATENCION} height={240} />,
  },
  argTypes: {
    headingLevel: { control: 'select', options: [2, 3, 4, 5, 6] },
    loading: { control: 'boolean' },
    empty: { control: 'boolean' },
  },
  parameters: {
    docs: {
      description: {
        component: 'Card para un gráfico: título, subtítulo con el contexto de la cifra y menú de acciones. `headingLevel` (h3 por defecto) ajusta el nivel del título al orden de encabezados de la página sin cambiar su tamaño. El título nombra también la figura del gráfico. `loading`, `empty` y `error` usan skeleton, EmptyState y ErrorState. `noPad` está deprecado: usa `noPadding`.',
      },
    },
  },
  decorators: [conEncabezado, (Story, ctx) => <div style={{ maxWidth: ctx.parameters.maxWidth ?? 720 }}><Story /></div>],
}
export default meta
type Story = StoryObj<typeof ChartCard>

export const Playground: Story = {}

export const ConAnillo: Story = {
  name: 'Con anillo',
  args: {
    title: 'Fuentes de leads',
    subtitle: 'Octubre · 2.950 leads',
    children: <PieChartWidget data={FUENTES} height={240} />,
  },
}

export const Vacio: Story = {
  name: 'Vacío',
  args: { empty: true, emptyMessage: 'No hubo llamadas en el periodo. Prueba con otra semana.' },
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
  render: (args) => (
    <TresTemas>
      {(tema) => (
        <ChartCard {...args} title={`Atención (${tema})`}>
          <BarChartWidget data={ATENCION} series={SERIES_ATENCION} height={200} />
        </ChartCard>
      )}
    </TresTemas>
  ),
}
