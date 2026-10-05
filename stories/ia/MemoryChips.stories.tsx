import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { MemoryChips } from '../../src'
import type { AiMemoryItem } from '../../src'
import { conAncho } from '../componentes/Nuevos/soporte'
import { RECUERDOS } from './datosIa'

const meta: Meta<typeof MemoryChips> = {
  title: 'IA/Conversación/MemoryChips',
  component: MemoryChips,
  tags: ['autodocs'],
  args: { items: RECUERDOS, onRemove: () => {}, onAdd: () => {}, variant: 'panel' },
  argTypes: { variant: { control: 'inline-radio', options: ['panel', 'row'] } },
  parameters: { docs: { description: { component: 'Lo que el asistente recuerda; cada recuerdo se puede olvidar. Olvidar y agregar solo emiten la intención.' } } },
  decorators: [conAncho(480)],
}
export default meta
type Story = StoryObj<typeof MemoryChips>

export const Playground: Story = {}

function Interactivo() {
  const [items, setItems] = useState<AiMemoryItem[]>(RECUERDOS)
  return (
    <MemoryChips
      items={items}
      onRemove={(id) => setItems((list) => list.filter((m) => m.id !== id))}
      onAdd={(text) => setItems((list) => [...list, { id: `m${Date.now()}`, text }])}
    />
  )
}

export const Editable: Story = { name: 'Interactivo', render: () => <Interactivo /> }
export const Fila: Story = { args: { variant: 'row' } }
export const Vacio: Story = { name: 'Vacío', args: { items: [] } }
