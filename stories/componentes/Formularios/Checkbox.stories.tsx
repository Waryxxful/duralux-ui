import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Checkbox } from '../../../src'

const meta: Meta<typeof Checkbox> = {
  title: 'Componentes/Formularios/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  args: { label: 'Recibir resumen diario por correo' },
  argTypes: {
    error: { control: 'boolean' },
    disabled: { control: 'boolean' },
    indeterminate: { control: 'boolean' },
  },
  parameters: {
    docs: { description: { component: 'Opción independiente; el label es parte del área clicable. Para opciones excluyentes usa Radio.' } },
  },
}
export default meta
type Story = StoryObj<typeof Checkbox>

export const Playground: Story = {}

export const Estados: Story = {
  render: () => (
    <div className="d-flex flex-column gap-2">
      <Checkbox label="Sin marcar" />
      <Checkbox label="Marcado" defaultChecked />
      <Checkbox label="Parcial (algunas campañas)" indeterminate />
      <Checkbox label="Con error: acepta los términos" error />
      <Checkbox label="Deshabilitado" disabled />
      <Checkbox label="Deshabilitado y marcado" disabled defaultChecked />
      <Checkbox label="Con foco" autoFocus />
      <div className="form-check form-switch">
        <input className="form-check-input" type="checkbox" role="switch" id="sb-switch" defaultChecked />
        <label className="form-check-label" htmlFor="sb-switch">Interruptor (form-switch)</label>
      </div>
    </div>
  ),
}

function SeleccionGrupo() {
  const canales = ['Teléfono', 'WhatsApp', 'Correo']
  const [elegidos, setElegidos] = useState<string[]>(['Teléfono'])
  const todos = elegidos.length === canales.length
  return (
    <fieldset>
      <legend className="form-label">Canales de contacto</legend>
      <Checkbox
        label="Todos los canales"
        checked={todos}
        indeterminate={!todos && elegidos.length > 0}
        onChange={() => setElegidos(todos ? [] : canales)}
      />
      <div className="ps-4">
        {canales.map(canal => (
          <Checkbox
            key={canal}
            label={canal}
            checked={elegidos.includes(canal)}
            onChange={() => setElegidos(prev => prev.includes(canal) ? prev.filter(c => c !== canal) : [...prev, canal])}
          />
        ))}
      </div>
    </fieldset>
  )
}

export const Grupo: Story = { name: 'Grupo con estado parcial', render: () => <SeleccionGrupo /> }
