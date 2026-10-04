import type { Meta, StoryObj } from '@storybook/react-vite'
import { KpiCard } from '../../../src'
import { Sparkline } from '../../../src/charts/apex'
import { conAncho, Fila, HORAS, NIVEL_SERVICIO, TresTemas } from './soporte'

const meta: Meta<typeof KpiCard> = {
  title: 'Componentes/Nuevos/KpiCard',
  component: KpiCard,
  tags: ['autodocs'],
  args: {
    label: 'Nivel de servicio',
    value: 86,
    unit: '%',
    icon: 'feather-activity',
    delta: { value: 3, unit: 'pts', label: 'vs. ayer' },
    context: 'Meta 80 %',
  },
  argTypes: {
    tone: { control: 'select', options: ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'teal', 'indigo'] },
    loading: { control: 'boolean' },
  },
  parameters: {
    docs: { description: { component: 'Cifra con contexto obligatorio (meta, variación o tendencia). Cifras es-CL tabulares. Con `tone` danger o warning la cifra queda marcada fuera de meta y `status` lo dice en texto.' } },
  },
  decorators: [conAncho(320)],
}
export default meta
type Story = StoryObj<typeof KpiCard>

export const Playground: Story = {}

export const FueraDeMeta: Story = {
  name: 'Fuera de meta',
  args: {
    label: 'Abandono',
    value: 7.8,
    unit: '%',
    icon: 'feather-phone-missed',
    tone: 'danger',
    status: 'Sobre el máximo',
    delta: { value: 1.6, unit: 'pts', goodWhen: 'down', label: 'vs. ayer' },
    context: 'Máximo 5 %',
  },
}

export const ConTendencia: Story = {
  name: 'Con tendencia',
  args: {
    chart: <Sparkline ariaLabel="Nivel de servicio por hora" data={NIVEL_SERVICIO} categories={HORAS} tone="success" />,
  },
}

export const Estados: Story = {
  name: 'Carga y vacío',
  parameters: { maxWidth: 'none' },
  render: () => (
    <Fila>
      <KpiCard label="Nivel de servicio" value={86} loading context="Meta 80 %" />
      <KpiCard label="Nivel de servicio" value={null} context="Meta 80 %" emptyText="Sin llamadas hoy" />
    </Fila>
  ),
}

export const Temas: Story = {
  name: 'Tres temas',
  parameters: { maxWidth: 'none' },
  render: () => (
    <TresTemas>
      {() => <KpiCard label="Nivel de servicio" value={86} unit="%" icon="feather-activity" delta={{ value: 3, unit: 'pts' }} context="Meta 80 %" />}
    </TresTemas>
  ),
}
