import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button, Dropdown, DropdownMenu, IconButton } from '../../../src'

const meta: Meta<typeof Dropdown> = {
  title: 'Componentes/Feedback/Dropdown',
  component: Dropdown,
  tags: ['autodocs'],
  args: { align: 'start', defaultOpen: true },
  argTypes: { align: { control: 'inline-radio', options: ['start', 'end'] } },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Botón que abre un menú de acciones secundarias. `Esc` y clic fuera cierran; `Esc` devuelve el foco al botón. Se usa muchas veces al día: abre en 100 ms y los ítems cambian de fondo sin transición. Elevación 3, radio lg y radio anidado en los ítems.',
      },
    },
  },
  render: (args) => (
    <div style={{ minHeight: '16rem' }}>
      <Dropdown
        {...args}
        trigger={(props, { open }) => (
          <Button {...props} variant="light-brand" endIcon={open ? 'chevron-up' : 'chevron-down'}>Acciones</Button>
        )}
      >
        <DropdownMenu>
          <button type="button" className="dropdown-item"><i className="feather-edit-2" aria-hidden="true" />Editar campaña</button>
          <button type="button" className="dropdown-item"><i className="feather-copy" aria-hidden="true" />Duplicar campaña</button>
          <button type="button" className="dropdown-item"><i className="feather-download" aria-hidden="true" />Exportar reporte</button>
          <div className="dropdown-divider" />
          <button type="button" className="dropdown-item gcu-dropdown-item--danger"><i className="feather-trash-2" aria-hidden="true" />Eliminar campaña</button>
        </DropdownMenu>
      </Dropdown>
    </div>
  ),
}
export default meta
type Story = StoryObj<typeof Dropdown>

export const Playground: Story = {}

export const AlineadoAlFinal: Story = {
  name: 'Alineado al final (acciones de fila)',
  args: { align: 'end' },
  render: (args) => (
    <div className="d-flex justify-content-end" style={{ minHeight: '12rem' }}>
      <Dropdown
        {...args}
        trigger={(props) => <IconButton {...props} icon="more-horizontal" label="Más acciones para Cobranza Q4" />}
      >
        <DropdownMenu>
          <button type="button" className="dropdown-item">Ver detalle</button>
          <button type="button" className="dropdown-item">Pausar campaña</button>
        </DropdownMenu>
      </Dropdown>
    </div>
  ),
}
