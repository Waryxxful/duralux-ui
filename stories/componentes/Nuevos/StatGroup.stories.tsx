import type { Meta, StoryObj } from '@storybook/react-vite'
import { StatGroup } from '../../../src'
import { conAncho, TresTemas } from './soporte'

const items = [
  { label: 'Atendidas', value: 2840, icon: 'feather-phone-call', tone: 'success' as const, delta: { value: 12, unit: '%' } },
  { label: 'En espera', value: 18, icon: 'feather-clock', tone: 'warning' as const, context: 'Máximo 10' },
  { label: 'Abandonadas', value: 124, icon: 'feather-phone-missed', tone: 'danger' as const, delta: { value: 1.4, unit: 'pts', goodWhen: 'down' as const } },
  { label: 'TMO', value: '5:12', icon: 'feather-watch', context: 'Meta 5:00' },
]

const meta: Meta<typeof StatGroup> = {
  title: 'Componentes/Nuevos/StatGroup',
  component: StatGroup,
  tags: ['autodocs'],
  args: { title: 'Llamadas de hoy', items },
  argTypes: { loading: { control: 'boolean' } },
  parameters: {
    docs: { description: { component: 'De 2 a 4 métricas relacionadas en una sola card. Reemplaza filas de StatsCard iguales. Se reorganiza según el ancho del contenedor.' } },
  },
  decorators: [conAncho(960)],
}
export default meta
type Story = StoryObj<typeof StatGroup>

export const Playground: Story = {}

export const DosMetricas: Story = { name: 'Dos métricas', args: { items: items.slice(0, 2) }, parameters: { maxWidth: 480 } }

export const Carga: Story = { args: { loading: true } }

export const ContenedorAngosto: Story = { name: 'Contenedor angosto (320 px)', parameters: { maxWidth: 320 } }

export const Temas: Story = {
  name: 'Tres temas',
  parameters: { maxWidth: 'none' },
  render: () => <TresTemas>{() => <StatGroup title="Llamadas de hoy" items={items.slice(0, 2)} />}</TresTemas>,
}
