import type { Meta, StoryObj } from '@storybook/react-vite'
import { Person } from '../../../src'
import { conAncho } from './soporte'
import { TresTemas } from '../Graficos/TresTemas'

const meta: Meta<typeof Person> = {
  title: 'Componentes/Nuevos/Person',
  component: Person,
  tags: ['autodocs'],
  args: { name: 'Camila Rojas', meta: 'Supervisora · Cobranza', size: 'md' },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    variant: { control: 'select', options: ['primary', 'secondary', 'success', 'danger', 'warning', 'info'] },
  },
  parameters: {
    docs: { description: { component: 'Avatar, nombre y un dato secundario (rol, equipo o correo) en una sola línea. Sin foto, muestra las iniciales.' } },
  },
  decorators: [conAncho()],
}
export default meta
type Story = StoryObj<typeof Person>

export const Playground: Story = {}

export const Tamanos: Story = {
  name: 'Tamaños',
  render: () => (
    <div className="d-grid gap-3">
      <Person size="sm" name="Javier Muñoz" meta="Ejecutivo" />
      <Person size="md" name="Javier Muñoz" meta="Ejecutivo" />
      <Person size="lg" name="Javier Muñoz" meta="Ejecutivo" />
    </div>
  ),
}

export const EnTabla: Story = {
  name: 'En una tabla',
  parameters: { maxWidth: 560 },
  render: () => (
    <table className="table table-hover mb-0">
      <thead><tr><th scope="col">Ejecutivo</th><th scope="col" className="text-end">Llamadas</th></tr></thead>
      <tbody>
        <tr><td><Person size="sm" name="Ana Torres" meta="Ventas" /></td><td className="text-end">128</td></tr>
        <tr><td><Person size="sm" name="Luis Pérez" meta="Soporte" variant="info" /></td><td className="text-end">97</td></tr>
      </tbody>
    </table>
  ),
}

export const Temas: Story = {
  name: 'Tres temas',
  parameters: { maxWidth: 'none' },
  render: () => <TresTemas>{() => <Person name="Camila Rojas" meta="Supervisora · Cobranza" />}</TresTemas>,
}
