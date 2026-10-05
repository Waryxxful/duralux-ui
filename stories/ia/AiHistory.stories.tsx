import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { AiHistory } from '../../src'
import { conAncho } from '../componentes/Nuevos/soporte'
import { HILOS } from './datosIa'

const meta: Meta<typeof AiHistory> = {
  title: 'IA/Conversación/AiHistory',
  component: AiHistory,
  tags: ['autodocs'],
  args: { threads: HILOS, activeId: 't2', onSelect: () => {}, onNew: () => {}, compact: false },
  parameters: { docs: { description: { component: 'Conversaciones anteriores agrupadas por fecha, con las fijadas arriba. La activa lleva `aria-current`.' } } },
  decorators: [conAncho(300)],
}
export default meta
type Story = StoryObj<typeof AiHistory>

export const Playground: Story = {}

function Interactivo() {
  const [active, setActive] = useState('t1')
  return <AiHistory threads={HILOS} activeId={active} onSelect={setActive} onNew={() => {}} />
}

export const Seleccion: Story = { name: 'Interactivo', render: () => <Interactivo /> }
export const Compacto: Story = { args: { compact: true } }
export const Cargando: Story = { args: { loading: true } }
export const Vacio: Story = { name: 'Vacío', args: { threads: [] } }
