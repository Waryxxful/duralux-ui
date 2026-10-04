import type { Meta, StoryObj } from '@storybook/react-vite'
import { FormField, Select } from '../../../src'

const ESTADOS = [
  { value: 'activa', label: 'Activa' },
  { value: 'pausada', label: 'Pausada' },
  { value: 'cerrada', label: 'Cerrada', disabled: true },
]

const meta: Meta<typeof Select> = {
  title: 'Componentes/Formularios/Select',
  component: Select,
  tags: ['autodocs'],
  args: { 'aria-label': 'Estado de la campaña', options: ESTADOS, placeholder: 'Selecciona un estado', defaultValue: '' },
  argTypes: {
    controlSize: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    error: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  parameters: {
    docs: { description: { component: 'Select nativo: úsalo con pocas opciones conocidas. Para buscar entre muchas, SearchableSelect.' } },
  },
  decorators: [Story => <div style={{ maxWidth: 420 }}><Story /></div>],
}
export default meta
type Story = StoryObj<typeof Select>

export const Playground: Story = {}

export const Tamanos: Story = {
  name: 'Tamaños (32 / 36 / 40)',
  render: () => (
    <div className="d-flex flex-column gap-2">
      <Select controlSize="sm" aria-label="Pequeño" options={ESTADOS} />
      <Select aria-label="Mediano" options={ESTADOS} />
      <Select controlSize="lg" aria-label="Grande" options={ESTADOS} />
    </div>
  ),
}

export const Estados: Story = {
  render: () => (
    <div className="d-flex flex-column gap-1">
      <FormField label="Normal"><Select options={ESTADOS} /></FormField>
      <FormField label="Con error" error="Elige un estado."><Select options={ESTADOS} placeholder="Selecciona" defaultValue="" error /></FormField>
      <FormField label="Deshabilitado"><Select options={ESTADOS} disabled /></FormField>
      <FormField label="Con foco"><Select options={ESTADOS} autoFocus /></FormField>
    </div>
  ),
}
