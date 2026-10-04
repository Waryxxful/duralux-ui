import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { ActiveFilters } from '../../../src'
import type { ActiveFilter } from '../../../src'
import { conAncho } from './soporte'
import { TresTemas } from '../Graficos/TresTemas'

const filtros: ActiveFilter[] = [
  { key: 'estado', label: 'Estado', value: 'Vencido' },
  { key: 'campana', label: 'Campaña', value: 'Cobranza temprana' },
  { key: 'ejecutivo', label: 'Ejecutivo', value: 'Camila Rojas' },
]

const meta: Meta<typeof ActiveFilters> = {
  title: 'Componentes/Nuevos/ActiveFilters',
  component: ActiveFilters,
  tags: ['autodocs'],
  args: { filters: filtros, resultCount: 128, onRemove: () => {}, onClear: () => {} },
  parameters: {
    docs: { description: { component: 'Chips de los filtros aplicados. Cada chip se quita con su botón y «Limpiar filtros» los quita todos. Al quitar uno, el foco pasa al chip siguiente.' } },
  },
  decorators: [conAncho(640)],
}
export default meta
type Story = StoryObj<typeof ActiveFilters>

export const Playground: Story = {}

function Interactivo() {
  const [lista, setLista] = useState(filtros)
  return (
    <ActiveFilters
      filters={lista}
      resultCount={lista.length ? 128 : 2840}
      onRemove={(key) => setLista((prev) => prev.filter((f) => f.key !== key))}
      onClear={() => setLista([])}
    />
  )
}

export const QuitarFiltros: Story = { name: 'Quitar filtros', render: () => <Interactivo /> }

export const ContenedorAngosto: Story = { name: 'Contenedor angosto (320 px)', parameters: { maxWidth: 320 } }

export const Temas: Story = {
  name: 'Tres temas',
  parameters: { maxWidth: 'none' },
  render: () => <TresTemas>{() => <ActiveFilters filters={filtros.slice(0, 2)} onRemove={() => {}} onClear={() => {}} />}</TresTemas>,
}
