import type { Meta, StoryObj } from '@storybook/react-vite'
import { ApexChart } from '../../../src/charts/apex'
import { TresTemas } from './datos'

const SEMANAS = ['Sem 36', 'Sem 37', 'Sem 38', 'Sem 39', 'Sem 40', 'Sem 41']

const meta: Meta<typeof ApexChart> = {
  title: 'Componentes/Gráficos/ApexChart',
  component: ApexChart,
  tags: ['autodocs'],
  args: {
    type: 'area',
    height: 280,
    ariaLabel: 'Nivel de servicio y abandono por semana',
    description: 'El nivel de servicio sube de 78 % a 86 % y el abandono baja a 5 %.',
    series: [
      { name: 'Nivel de servicio', data: [78, 81, 79, 84, 86, 85] },
      { name: 'Abandono', data: [8, 7, 9, 6, 5, 5] },
    ],
    options: {
      chart: { toolbar: { show: false } },
      stroke: { curve: 'smooth', width: 2 },
      dataLabels: { enabled: false },
      xaxis: { categories: SEMANAS },
      yaxis: { labels: { formatter: (value: number) => `${Math.round(value)} %` } },
    },
  },
  argTypes: {
    type: { control: 'select', options: ['area', 'line', 'bar'] },
    loading: { control: 'boolean' },
  },
  parameters: {
    docs: {
      description: {
        component: 'Adaptador de ApexCharts con el tema del sistema (claro, oscuro, navy). `options` es el escape hatch hacia Apex: se fusiona sobre el tema y lo explícito gana. Es una `<figure>` con nombre y tabla de datos oculta; la barra de herramientas de Apex queda operable porque no hay `role="img"` alrededor. El motor se carga en el navegador; si falta el peer `react-apexcharts`, muestra el error con reintento y lo registra.',
      },
    },
  },
  decorators: [(Story, ctx) => <div style={{ maxWidth: ctx.parameters.maxWidth ?? 720 }}><Story /></div>],
}
export default meta
type Story = StoryObj<typeof ApexChart>

export const Playground: Story = {}

export const Barras: Story = {
  name: 'Barras',
  args: {
    type: 'bar',
    ariaLabel: 'Llamadas atendidas por cola',
    description: undefined,
    series: [{ name: 'Atendidas', data: [1240, 860, 610, 240] }],
    options: {
      chart: { toolbar: { show: false } },
      dataLabels: { enabled: false },
      plotOptions: { bar: { borderRadius: 4, columnWidth: '45%' } },
      xaxis: { categories: ['Cobranza', 'Retención', 'Ventas', 'Calidad'] },
    },
  },
}

export const Anillo: Story = {
  name: 'Anillo',
  args: {
    type: 'donut',
    height: 260,
    ariaLabel: 'Resultado de las gestiones',
    description: undefined,
    series: [540, 210, 130, 60],
    options: { labels: ['Contactado', 'Sin respuesta', 'Buzón', 'Número inválido'], dataLabels: { enabled: false } },
  },
}

export const Vacio: Story = { name: 'Vacío', args: { series: [] } }

export const Carga: Story = { args: { loading: true } }

export const ConError: Story = {
  name: 'Error',
  args: { error: 'No se pudo consultar el nivel de servicio.', onRetry: () => {} },
}

export const Angosto: Story = {
  name: 'Contenedor angosto (360 px)',
  parameters: { maxWidth: 360 },
}

export const Temas: Story = {
  name: 'Claro, oscuro y navy',
  parameters: { maxWidth: 'none' },
  render: (args) => <TresTemas>{(tema) => <ApexChart {...args} ariaLabel={`Nivel de servicio (${tema})`} height={220} />}</TresTemas>,
}
