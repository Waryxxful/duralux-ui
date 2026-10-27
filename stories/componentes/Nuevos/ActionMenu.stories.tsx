import type { Meta, StoryObj } from '@storybook/react-vite'
import { ActionMenu } from '../../../src'
import type { ActionMenuItem } from '../../../src'
import { conAncho } from './soporte'
import { TresTemas } from '../Graficos/TresTemas'

const acciones: ActionMenuItem[] = [
  { key: 'editar', label: 'Editar', icon: 'edit-2', onSelect: () => {} },
  { key: 'duplicar', label: 'Duplicar', icon: 'copy', onSelect: () => {}, description: 'Crea una copia en borrador' },
  { key: 'subir', label: 'Subir', icon: 'arrow-up', shortcut: 'Alt ↑', onSelect: () => {} },
  { key: 'bajar', label: 'Bajar', icon: 'arrow-down', shortcut: 'Alt ↓', onSelect: () => {}, disabled: true },
  { key: 'eliminar', label: 'Eliminar', icon: 'trash-2', tone: 'danger', separatorBefore: true, onSelect: () => {} },
]

const meta: Meta<typeof ActionMenu> = {
  title: 'Componentes/Nuevos/ActionMenu',
  component: ActionMenu,
  tags: ['autodocs'],
  args: { label: 'Acciones de la lección 2.3', items: acciones },
  parameters: {
    docs: { description: { component: 'Botón «⋯» con las acciones de una fila (patrón APG menu button). ↑/↓, Inicio y Fin recorren los ítems habilitados; Esc cierra y devuelve el foco. Las acciones destructivas van en rojo y separadas con `separatorBefore`.' } },
  },
  decorators: [conAncho(420)],
}
export default meta
type Story = StoryObj<typeof ActionMenu>

export const Playground: Story = {}

export const Mediano: Story = { args: { size: 'md' } }

export const AlineadoAlInicio: Story = { name: 'Alineado al inicio', args: { align: 'start' } }

export const EnUnaFila: Story = {
  name: 'En una fila',
  render: (args) => (
    <div className="d-flex align-items-center justify-content-between gap-2 p-2 border rounded-3">
      <span>2.3 · Manejo de objeciones</span>
      <ActionMenu {...args} />
    </div>
  ),
}

export const Temas: Story = {
  name: 'Tres temas',
  parameters: { maxWidth: 'none' },
  render: () => <TresTemas>{() => <ActionMenu label="Acciones" items={acciones} />}</TresTemas>,
}
