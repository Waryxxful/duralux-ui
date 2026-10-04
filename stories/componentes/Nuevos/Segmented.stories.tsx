import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Card, Segmented } from '../../../src'
import { TresTemas } from '../Graficos/TresTemas'

const RANGOS = ['Hoy', 'Semana', 'Mes', 'Trimestre']

const meta: Meta<typeof Segmented> = {
  title: 'Componentes/Nuevos/Segmented',
  component: Segmented,
  tags: ['autodocs'],
  args: { options: RANGOS, defaultValue: 'Semana', 'aria-label': 'Rango', size: 'md', fullWidth: false, disabled: false },
  argTypes: { size: { control: 'inline-radio', options: ['sm', 'md'] } },
  parameters: {
    docs: {
      description: {
        component: '2 a 5 opciones cortas y excluyentes que cambian una vista. Radios nativos en `role="radiogroup"`: una parada de Tab y flechas. El indicador se desliza (0 ms con reduced-motion); radio interior = exterior − separación.',
      },
    },
  },
}
export default meta
type Story = StoryObj<typeof Segmented>

export const Playground: Story = {}

export const Variantes: Story = {
  name: 'Tamaños, íconos y estados',
  render: () => (
    <div className="d-flex flex-column gap-3 align-items-start">
      <Segmented aria-label="Rango (md)" options={RANGOS} defaultValue="Hoy" />
      <Segmented aria-label="Rango (sm)" size="sm" options={RANGOS} defaultValue="Mes" />
      <Segmented
        aria-label="Vista"
        options={[{ value: 'lista', label: 'Lista', icon: 'list' }, { value: 'tablero', label: 'Tablero', icon: 'grid' }]}
        defaultValue="tablero"
      />
      <Segmented aria-label="Canal" options={[{ value: 'voz', label: 'Voz' }, { value: 'chat', label: 'Chat' }, { value: 'correo', label: 'Correo (próximamente)', disabled: true }]} defaultValue="voz" />
      <Segmented aria-label="Deshabilitado" options={RANGOS} defaultValue="Hoy" disabled />
    </div>
  ),
}

function Tablero() {
  const [rango, setRango] = useState('Semana')
  return (
    <Card title="Atención de la cola Soporte" actions={<Segmented aria-label="Rango del tablero" size="sm" options={RANGOS} value={rango} onChange={setRango} />}>
      <p className="mb-0">Mostrando: <strong>{rango}</strong> · 84 % atendidas · meta 80 %</p>
    </Card>
  )
}

export const CasoReal: Story = { name: 'Caso real: rango de un tablero', render: () => <Tablero /> }

export const Angosto: Story = {
  name: 'Contenedor angosto (320 px)',
  render: () => (
    <div style={{ maxWidth: 320 }}>
      <Segmented aria-label="Rango" options={RANGOS} defaultValue="Mes" fullWidth size="sm" />
    </div>
  ),
}

export const Temas: Story = {
  name: 'Tres temas',
  render: () => <TresTemas>{(tema) => <Segmented aria-label={`Rango (${tema})`} options={RANGOS.slice(0, 3)} defaultValue="Semana" />}</TresTemas>,
}
