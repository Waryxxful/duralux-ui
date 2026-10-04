import type { Meta, StoryObj } from '@storybook/react-vite'
import { RankList } from '../../../src'
import { conAncho, TresTemas } from './soporte'

const items = [
  { label: 'Camila Rojas', meta: 'Cobranza', value: 143 },
  { label: 'Ana Torres', meta: 'Ventas', value: 128 },
  { label: 'Luis Pérez', meta: 'Soporte', value: 97 },
  { label: 'Javier Muñoz', meta: 'Cobranza', value: 64, tone: 'warning' as const },
]

const meta: Meta<typeof RankList> = {
  title: 'Componentes/Nuevos/RankList',
  component: RankList,
  tags: ['autodocs'],
  args: { items, unit: 'llamadas', label: 'Ejecutivos con más llamadas' },
  argTypes: { loading: { control: 'boolean' } },
  parameters: {
    docs: { description: { component: 'Ranking de 3 a 6 filas ya ordenadas, con barra proporcional y cifra es-CL. La barra es apoyo visual: la cifra siempre está en texto.' } },
  },
  decorators: [conAncho(420)],
}
export default meta
type Story = StoryObj<typeof RankList>

export const Playground: Story = {}

export const ConMaximo: Story = { name: 'Con máximo fijo', args: { max: 200, items: items.map((i) => ({ ...i, display: `${i.value} / 200` })) } }

export const Estados: Story = {
  name: 'Carga y vacío',
  render: () => (
    <div className="d-grid gap-4">
      <RankList items={items} loading label="Ejecutivos con más llamadas" />
      <RankList items={[]} label="Ejecutivos con más llamadas" emptyText="Todavía no hay llamadas hoy." />
    </div>
  ),
}

export const Temas: Story = {
  name: 'Tres temas',
  parameters: { maxWidth: 'none' },
  render: () => <TresTemas>{() => <RankList items={items.slice(0, 3)} unit="llamadas" label="Ranking" />}</TresTemas>,
}
