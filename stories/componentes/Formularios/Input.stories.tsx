import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button, FormField, Input } from '../../../src'

const meta: Meta<typeof Input> = {
  title: 'Componentes/Formularios/Input',
  component: Input,
  tags: ['autodocs'],
  args: { 'aria-label': 'Nombre del contacto', placeholder: 'Ej.: Camila Rojas' },
  argTypes: {
    controlSize: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    error: { control: 'boolean' },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
  },
  parameters: {
    docs: {
      description: {
        component: 'Campo de texto con tokens del tema. Siempre con nombre accesible (FormField o `aria-label`). Usa `startAddon`/`endAddon` para prefijos o unidades; `icon` y `prefix` están deprecados. El mensaje de error lo muestra FormField.',
      },
    },
  },
  decorators: [Story => <div style={{ maxWidth: 420 }}><Story /></div>],
}
export default meta
type Story = StoryObj<typeof Input>

export const Playground: Story = {}

export const Tamanos: Story = {
  name: 'Tamaños (32 / 36 / 40)',
  render: () => (
    <div className="d-flex flex-column gap-2">
      <Input controlSize="sm" aria-label="Tamaño pequeño" placeholder="Pequeño · 32 px" />
      <Input aria-label="Tamaño mediano" placeholder="Mediano · 36 px" />
      <Input controlSize="lg" aria-label="Tamaño grande" placeholder="Grande · 40 px" />
      <div className="d-flex gap-2 align-items-center">
        <Input aria-label="Alineado con botón" placeholder="Alineado con el botón" />
        <Button>Buscar</Button>
      </div>
    </div>
  ),
}

export const Estados: Story = {
  render: () => (
    <div className="d-flex flex-column gap-1">
      <FormField label="Normal"><Input placeholder="Escribe aquí" /></FormField>
      <FormField label="Con error" error="Ingresa un correo válido."><Input type="email" defaultValue="camila@" error /></FormField>
      <FormField label="Deshabilitado" helpText="Se habilita al elegir una campaña."><Input disabled defaultValue="Sin campaña" /></FormField>
      <FormField label="Solo lectura"><Input readOnly defaultValue="CL-2026-0042" /></FormField>
    </div>
  ),
}

export const Foco: Story = {
  name: 'Foco con teclado',
  render: () => <FormField label="Con foco"><Input autoFocus placeholder="Anillo de foco del tema" /></FormField>,
}

export const ConAddons: Story = {
  name: 'Con addons',
  render: () => (
    <div className="d-flex flex-column gap-2">
      <Input aria-label="Monto" startAddon="$" endAddon="CLP" inputMode="numeric" className="gcu-tabular" defaultValue="125000" />
      <Input aria-label="Buscar contacto" startAddon={<i className="feather-search" aria-hidden="true" />} placeholder="Buscar contacto" />
      <Input aria-label="Sitio web" startAddon="https://" placeholder="empresa.cl" />
    </div>
  ),
}
