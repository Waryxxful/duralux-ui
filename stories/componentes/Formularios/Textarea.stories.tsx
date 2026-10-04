import type { Meta, StoryObj } from '@storybook/react-vite'
import { FormField, Textarea } from '../../../src'

const meta: Meta<typeof Textarea> = {
  title: 'Componentes/Formularios/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  args: { 'aria-label': 'Observaciones', placeholder: 'Detalle de la gestión' },
  argTypes: {
    controlSize: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    error: { control: 'boolean' },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    rows: { control: { type: 'number', min: 2, max: 12 } },
  },
  parameters: {
    docs: { description: { component: 'Texto largo; crece solo en vertical. 4 filas por defecto.' } },
  },
  decorators: [Story => <div style={{ maxWidth: 520 }}><Story /></div>],
}
export default meta
type Story = StoryObj<typeof Textarea>

export const Playground: Story = {}

export const Tamanos: Story = {
  name: 'Tamaños',
  render: () => (
    <div className="d-flex flex-column gap-2">
      <Textarea controlSize="sm" rows={2} aria-label="Nota corta" placeholder="Pequeño" />
      <Textarea rows={3} aria-label="Nota media" placeholder="Mediano" />
      <Textarea controlSize="lg" rows={3} aria-label="Nota larga" placeholder="Grande" />
    </div>
  ),
}

export const Estados: Story = {
  render: () => (
    <div className="d-flex flex-column gap-1">
      <FormField label="Normal"><Textarea placeholder="Describe el motivo del contacto" /></FormField>
      <FormField label="Con error" error="El detalle es obligatorio para cerrar el caso."><Textarea error /></FormField>
      <FormField label="Deshabilitado"><Textarea disabled defaultValue="Caso cerrado por el sistema." /></FormField>
      <FormField label="Solo lectura"><Textarea readOnly rows={2} defaultValue="Cliente solicita llamada después de las 18:00." /></FormField>
      <FormField label="Con foco"><Textarea autoFocus rows={2} placeholder="Anillo de foco del tema" /></FormField>
    </div>
  ),
}
