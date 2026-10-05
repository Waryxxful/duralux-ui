import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { CallList, type CallId } from '../../src'
import { conAncho } from '../componentes/Nuevos/soporte'
import { LLAMADAS } from './datos'

const meta: Meta<typeof CallList> = {
  title: 'Dominios/Calidad/CallList',
  component: CallList,
  tags: ['autodocs'],
  args: { calls: LLAMADAS, label: 'Llamadas por revisar' },
  parameters: {
    docs: { description: { component: 'Bandeja de llamadas (listbox de selección única): una parada de tabulación, flechas, Inicio y Fin para moverse; Enter o Espacio la abre.' } },
  },
  decorators: [conAncho(480)],
}
export default meta
type Story = StoryObj<typeof CallList>

function Bandeja() {
  const [active, setActive] = useState<CallId | null>(LLAMADAS[0]?.id ?? null)
  return <CallList calls={LLAMADAS} activeId={active} onSelect={setActive} label="Llamadas por revisar" />
}

export const Playground: Story = { render: () => <Bandeja /> }

export const Estados: Story = {
  name: 'Carga y vacío',
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--gcu-space-4)' }}>
      <CallList calls={[]} loading />
      <CallList calls={[]} />
    </div>
  ),
}
