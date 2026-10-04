import type { Meta, StoryObj } from '@storybook/react-vite'
import { TrendLine } from '../../../src/charts/apex'
import { conAncho, HORAS, NIVEL_SERVICIO } from './soporte'
import { TresTemas } from '../Graficos/TresTemas'

const AYER = [74, 77, 80, 79, 82, 80, 81, 79]

const meta: Meta<typeof TrendLine> = {
  title: 'Componentes/Nuevos/TrendLine',
  component: TrendLine,
  tags: ['autodocs'],
  args: {
    ariaLabel: 'Nivel de servicio por hora',
    categories: HORAS,
    series: [{ name: 'Hoy', data: NIVEL_SERVICIO }, { name: 'Ayer', data: AYER }],
    target: { value: 80, label: 'Meta 80 %' },
    tone: 'success',
    formatValue: (v: number) => `${v} %`,
  },
  argTypes: { tone: { control: 'select', options: ['primary', 'success', 'warning', 'danger', 'info', 'indigo', 'teal', 'secondary'] } },
  parameters: {
    docs: { description: { component: 'Línea de tendencia con una serie principal, una de comparación punteada opcional y una línea de meta con su etiqueta. En `@duralux/ui/charts/apex`.' } },
  },
  decorators: [conAncho(640)],
}
export default meta
type Story = StoryObj<typeof TrendLine>

export const Playground: Story = {}

export const SoloSerie: Story = { name: 'Una serie, sin meta', args: { series: [{ name: 'Hoy', data: NIVEL_SERVICIO }], target: undefined } }

export const Carga: Story = { args: { loading: true } }

export const Temas: Story = {
  name: 'Tres temas',
  parameters: { maxWidth: 'none' },
  render: () => (
    <TresTemas>
      {() => <TrendLine ariaLabel="Nivel de servicio por hora" categories={HORAS} series={[{ name: 'Hoy', data: NIVEL_SERVICIO }]} target={{ value: 80, label: 'Meta 80 %' }} height={180} />}
    </TresTemas>
  ),
}
