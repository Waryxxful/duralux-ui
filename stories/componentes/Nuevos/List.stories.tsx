import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Avatar, Badge, BulkBar, Button, List } from '../../../src'
import { conAncho } from './soporte'
import { TresTemas } from '../Graficos/TresTemas'

const items = [
  { id: 1, title: 'Ana Torres', meta: 'Ventas · 128 llamadas', leading: <Avatar name="Ana Torres" size="sm" />, trailing: <Badge variant="success" soft>Disponible</Badge>, textValue: 'Ana Torres' },
  { id: 2, title: 'Luis Pérez', meta: 'Soporte · 97 llamadas', leading: <Avatar name="Luis Pérez" size="sm" />, trailing: <Badge variant="warning" soft>En pausa</Badge>, textValue: 'Luis Pérez' },
  { id: 3, title: 'Camila Rojas', meta: 'Cobranza · 143 llamadas', leading: <Avatar name="Camila Rojas" size="sm" />, trailing: <Badge variant="secondary" soft>Desconectada</Badge>, textValue: 'Camila Rojas' },
  { id: 4, title: 'Javier Muñoz', meta: 'Cobranza · 64 llamadas', leading: <Avatar name="Javier Muñoz" size="sm" />, disabled: true, textValue: 'Javier Muñoz' },
]

const meta: Meta<typeof List> = {
  title: 'Componentes/Nuevos/List',
  component: List,
  tags: ['autodocs'],
  args: { items, label: 'Ejecutivos', selectionMode: 'none', density: 'default' },
  argTypes: {
    selectionMode: { control: 'inline-radio', options: ['none', 'single', 'multiple'] },
    density: { control: 'inline-radio', options: ['compact', 'default', 'comfortable'] },
    loading: { control: 'boolean' },
  },
  parameters: {
    docs: { description: { component: 'Lista de entidades con avatar, dato secundario y estado. Con `selectionMode` single o multiple pasa a ser un `listbox` con teclado completo (flechas, Inicio/Fin, búsqueda por tipeo, Espacio y Ctrl+A).' } },
  },
  decorators: [conAncho(480)],
}
export default meta
type Story = StoryObj<typeof List>

export const Playground: Story = {}

export const Notificaciones: Story = {
  args: {
    label: 'Notificaciones',
    items: [
      { id: 'a', title: 'Cobranza superó el máximo de espera', meta: 'Hace 3 min', unread: true, onClick: () => {} },
      { id: 'b', title: 'Camila Rojas cerró 12 compromisos de pago', meta: 'Hace 1 h', onClick: () => {} },
      { id: 'c', title: 'Se publicó el informe semanal', meta: 'Ayer', href: '#informe' },
    ],
  },
}

function SeleccionMultiple() {
  const [ids, setIds] = useState<Array<string | number>>([1])
  return (
    <div className="d-grid gap-2">
      <List items={items} label="Ejecutivos" selectionMode="multiple" selectedIds={ids} onSelectionChange={setIds} />
      <BulkBar
        count={ids.length}
        total={items.length}
        onClear={() => setIds([])}
        actions={<Button size="sm" variant="primary">Reasignar</Button>}
      />
    </div>
  )
}

export const ConSeleccion: Story = { name: 'Selección múltiple con BulkBar', render: () => <SeleccionMultiple /> }

export const Estados: Story = {
  name: 'Carga y vacío',
  render: () => (
    <div className="d-grid gap-4">
      <List items={items} label="Ejecutivos" loading />
      <List items={[]} label="Ejecutivos" empty="No hay ejecutivos conectados en esta campaña." />
    </div>
  ),
}

export const Temas: Story = {
  name: 'Tres temas',
  parameters: { maxWidth: 'none' },
  render: () => <TresTemas>{() => <List items={items.slice(0, 3)} label="Ejecutivos" selectionMode="single" defaultSelectedIds={[2]} />}</TresTemas>,
}
