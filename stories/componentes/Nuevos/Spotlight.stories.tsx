import type { Meta, StoryObj } from '@storybook/react-vite'
import { Spotlight } from '../../../src'
import { Sparkline } from '../../../src/charts/apex'
import { conAncho, HORAS, NIVEL_SERVICIO } from './soporte'
import { TresTemas } from '../Graficos/TresTemas'

const meta: Meta<typeof Spotlight> = {
  title: 'Componentes/Nuevos/Spotlight',
  component: Spotlight,
  tags: ['autodocs'],
  args: {
    label: 'Nivel de servicio',
    value: 86,
    unit: '%',
    delta: { value: 3, unit: 'pts', label: 'vs. ayer' },
    context: 'Meta 80 %',
    tone: 'primary',
  },
  argTypes: {
    tone: { control: 'select', options: ['primary', 'indigo', 'dark', 'danger', 'success', 'info', 'teal'] },
    loading: { control: 'boolean' },
  },
  parameters: {
    docs: { description: { component: 'Cifra protagonista sobre una superficie de color con texto blanco AA. Úsala una vez por página. Admite un gráfico compacto con `onColor`.' } },
  },
  decorators: [conAncho(360)],
}
export default meta
type Story = StoryObj<typeof Spotlight>

export const Playground: Story = {}

export const ConGrafico: Story = {
  name: 'Con gráfico',
  args: {
    children: <Sparkline ariaLabel="Nivel de servicio por hora" data={NIVEL_SERVICIO} categories={HORAS} onColor />,
  },
}

export const Estados: Story = {
  name: 'Carga y vacío',
  render: () => (
    <div className="d-grid gap-3">
      <Spotlight label="Nivel de servicio" value={86} loading />
      <Spotlight label="Nivel de servicio" value={null} emptyText="Sin llamadas hoy" />
    </div>
  ),
}

export const Temas: Story = {
  name: 'Tres temas',
  parameters: { maxWidth: 'none' },
  render: () => <TresTemas>{() => <Spotlight label="Nivel de servicio" value={86} unit="%" context="Meta 80 %" tone="indigo" />}</TresTemas>,
}
