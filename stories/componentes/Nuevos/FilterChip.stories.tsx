import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { FilterChip } from '../../../src'
import type { FilterChipOption } from '../../../src'
import { conAncho } from './soporte'
import { TresTemas } from '../Graficos/TresTemas'

const equipos: FilterChipOption[] = [
  { value: 'ventas', label: 'Ventas', count: 42 },
  { value: 'retencion', label: 'Retención', count: 18 },
  { value: 'cobranza', label: 'Cobranza', count: 27 },
  { value: 'calidad', label: 'Calidad', count: 6 },
]

const colas: FilterChipOption[] = [
  'Cobranza temprana', 'Cobranza tardía', 'Retención', 'Ventas inbound', 'Ventas outbound',
  'Postventa', 'Reclamos', 'Soporte técnico', 'Encuestas', 'Bienvenida',
].map((label, i) => ({ value: `cola-${i}`, label, count: (i + 3) * 7 }))

const meta: Meta<typeof FilterChip> = {
  title: 'Componentes/Nuevos/FilterChip',
  component: FilterChip,
  tags: ['autodocs'],
  args: { label: 'Equipo', options: equipos, value: [] },
  parameters: {
    docs: { description: { component: 'Ficha de filtro para la barra sobre un listado. Inactiva muestra «+ Nombre» con borde punteado; activa, «Nombre: valor» en el suave del primario. El panel lista casillas con cantidades, búsqueda (por defecto con más de 8 opciones) y «Quitar el filtro». Con `children` el panel es propio y `valueText` resume el valor.' } },
  },
  decorators: [conAncho(640)],
}
export default meta
type Story = StoryObj<typeof FilterChip>

export const Playground: Story = {}

export const Activa: Story = { args: { value: ['ventas', 'retencion'] } }

export const VariosValores: Story = { name: 'Varios valores', args: { value: ['ventas', 'retencion', 'cobranza'] } }

function Barra() {
  const [equipo, setEquipo] = useState<string[]>([])
  const [cola, setCola] = useState<string[]>(['cola-0'])
  const [estado, setEstado] = useState<string[]>(['vencidas'])
  const [fecha, setFecha] = useState('')
  return (
    <div className="d-flex flex-wrap align-items-center gap-2">
      <span className="fs-12 text-muted">Filtrar</span>
      <FilterChip label="Equipo" options={equipos} value={equipo} onChange={setEquipo} />
      <FilterChip label="Cola" options={colas} value={cola} onChange={setCola} />
      <FilterChip
        label="Estado"
        options={[{ value: 'vencidas', label: 'Vencidas', count: 9 }, { value: 'al-dia', label: 'Al día', count: 120 }]}
        value={estado}
        onChange={setEstado}
      />
      <FilterChip label="Vence" valueText={fecha} onClear={() => setFecha('')}>
        <label htmlFor="sb-filter-fecha" className="form-label fs-12">Vence antes del</label>
        <input id="sb-filter-fecha" type="date" className="form-control form-control-sm" value={fecha} onChange={(e) => setFecha(e.target.value)} />
      </FilterChip>
      <FilterChip label="Rol" options={[]} disabled />
    </div>
  )
}

export const BarraDeFiltros: Story = { name: 'Barra de filtros', render: () => <Barra /> }

export const Temas: Story = {
  name: 'Tres temas',
  parameters: { maxWidth: 'none' },
  render: () => (
    <TresTemas>
      {() => (
        <div className="d-flex flex-wrap gap-2">
          <FilterChip label="Equipo" options={equipos} />
          <FilterChip label="Estado" options={equipos} value={['ventas']} />
        </div>
      )}
    </TresTemas>
  ),
}
