import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button, FormField, InputGroup } from '../../../src'

const meta: Meta<typeof InputGroup> = {
  title: 'Componentes/Formularios/InputGroup',
  component: InputGroup,
  tags: ['autodocs'],
  args: { prepend: '@', children: <input className="form-control" aria-label="Usuario" placeholder="usuario" /> },
  argTypes: { controlSize: { control: 'inline-radio', options: ['sm', 'md', 'lg'] } },
  parameters: {
    docs: { description: { component: 'Une un control con textos o botones. Con un solo control hijo, FormField le pasa label, ayuda y error.' } },
  },
  decorators: [Story => <div style={{ maxWidth: 440 }}><Story /></div>],
}
export default meta
type Story = StoryObj<typeof InputGroup>

export const Playground: Story = {}

export const Tamanos: Story = {
  name: 'Tamaños',
  render: () => (
    <div className="d-flex flex-column gap-2">
      <InputGroup controlSize="sm" prepend="$"><input className="form-control" aria-label="Monto pequeño" /></InputGroup>
      <InputGroup prepend="$"><input className="form-control" aria-label="Monto mediano" /></InputGroup>
      <InputGroup controlSize="lg" prepend="$"><input className="form-control" aria-label="Monto grande" /></InputGroup>
    </div>
  ),
}

export const Estados: Story = {
  render: () => (
    <>
      <FormField label="Descuento" helpText="Entre 0 y 30 %.">
        <InputGroup append="%"><input className="form-control gcu-tabular" inputMode="numeric" defaultValue="15" /></InputGroup>
      </FormField>
      <FormField label="Descuento máximo" error="No puede superar el 30 %.">
        <InputGroup append="%"><input className="form-control is-invalid gcu-tabular" inputMode="numeric" defaultValue="45" /></InputGroup>
      </FormField>
      <FormField label="Dominio">
        <InputGroup prepend="https://" disabled><input className="form-control" defaultValue="grancrm.cl" /></InputGroup>
      </FormField>
    </>
  ),
}

export const ConBoton: Story = {
  name: 'Con botón',
  render: () => (
    <div className="input-group">
      <input className="form-control" aria-label="Correo para invitar" placeholder="correo@empresa.cl" />
      <Button>Invitar</Button>
    </div>
  ),
}
