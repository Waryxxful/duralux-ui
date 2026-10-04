import type { Meta, StoryObj } from '@storybook/react-vite'
import { Donut, Gauge, Sparkline, TrendLine } from '../../../src/charts/apex'
import { conAncho, Fila, HORAS, LLAMADAS, NIVEL_SERVICIO, TresTemas } from './soporte'

const meta: Meta<typeof Sparkline> = {
  title: 'Componentes/Nuevos/Gráficos compactos',
  component: Sparkline,
  tags: ['autodocs'],
  args: { ariaLabel: 'Llamadas por hora', data: LLAMADAS, categories: HORAS, tone: 'primary', variant: 'area', height: 48 },
  argTypes: {
    tone: { control: 'select', options: ['primary', 'success', 'warning', 'danger', 'info', 'indigo', 'teal', 'secondary'] },
    variant: { control: 'inline-radio', options: ['area', 'line'] },
  },
  parameters: {
    docs: { description: { component: 'Sparkline, TrendLine, Gauge y Donut en `@duralux/ui/charts/apex`: tamaños compactos, paleta del tema y alternativa textual (tabla de datos para lectores de pantalla). `ariaLabel` es obligatorio porque no tienen título visible.' } },
  },
  decorators: [conAncho(320)],
}
export default meta
type Story = StoryObj<typeof Sparkline>

export const SparklinePlayground: Story = { name: 'Sparkline' }

export const LineaDeTendencia: Story = {
  name: 'TrendLine con meta y comparación',
  parameters: { maxWidth: 640 },
  render: () => (
    <TrendLine
      ariaLabel="Nivel de servicio por hora"
      categories={HORAS}
      series={[
        { name: 'Hoy', data: NIVEL_SERVICIO },
        { name: 'Ayer', data: [74, 77, 80, 79, 82, 80, 81, 79] },
      ]}
      target={{ value: 80, label: 'Meta 80 %' }}
      tone="success"
      formatValue={(v) => `${v} %`}
    />
  ),
}

export const Medidor: Story = {
  name: 'Gauge',
  render: () => (
    <Fila min="10rem">
      <Gauge ariaLabel="Ocupación de ejecutivos" value={72} tone="primary" />
      <Gauge ariaLabel="Abandono" value={7.8} max={20} tone="danger" />
    </Fila>
  ),
  parameters: { maxWidth: 480 },
}

export const Dona: Story = {
  name: 'Donut',
  render: () => (
    <Donut ariaLabel="Llamadas por resultado" labels={['Compromiso de pago', 'Sin contacto', 'Rechazo']} values={[1240, 980, 620]} totalLabel="Llamadas" />
  ),
}

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
  render: () => (
    <TresTemas>
      {() => (
        <div className="d-grid gap-2">
          <Sparkline ariaLabel="Llamadas por hora" data={LLAMADAS} categories={HORAS} />
          <Gauge ariaLabel="Ocupación de ejecutivos" value={72} height={140} />
        </div>
      )}
    </TresTemas>
  ),
}
