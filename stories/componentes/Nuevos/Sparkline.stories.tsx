import type { Meta, StoryObj } from '@storybook/react-vite'
import { Sparkline } from '../../../src/charts/apex'
import { conAncho, HORAS, LLAMADAS } from './soporte'
import { TresTemas } from '../Graficos/TresTemas'

const meta: Meta<typeof Sparkline> = {
  title: 'Componentes/Nuevos/Sparkline',
  component: Sparkline,
  tags: ['autodocs'],
  args: { ariaLabel: 'Llamadas por hora', data: LLAMADAS, categories: HORAS, tone: 'primary', variant: 'area', height: 48 },
  argTypes: {
    tone: { control: 'select', options: ['primary', 'success', 'warning', 'danger', 'info', 'indigo', 'teal', 'secondary'] },
    variant: { control: 'inline-radio', options: ['area', 'line'] },
  },
  parameters: {
    docs: { description: { component: 'Tendencia mínima para KpiCard o Spotlight, en `@duralux/ui/charts/apex`. Paleta del tema y tabla de datos para lectores de pantalla; `ariaLabel` es obligatorio porque no tiene título visible.' } },
  },
  decorators: [conAncho(320)],
}
export default meta
type Story = StoryObj<typeof Sparkline>

export const Playground: Story = {}

export const Linea: Story = { name: 'Línea', args: { variant: 'line', tone: 'success' } }

export const Estados: Story = {
  name: 'Carga y vacío',
  render: () => (
    <div className="d-grid gap-3">
      <Sparkline ariaLabel="Llamadas por hora" data={LLAMADAS} loading />
      <Sparkline ariaLabel="Llamadas por hora" data={[]} />
    </div>
  ),
}

export const Temas: Story = {
  name: 'Tres temas',
  parameters: { maxWidth: 'none' },
  render: () => <TresTemas>{() => <Sparkline ariaLabel="Llamadas por hora" data={LLAMADAS} categories={HORAS} />}</TresTemas>,
}
