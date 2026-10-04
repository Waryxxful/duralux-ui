import type { Meta, StoryObj } from '@storybook/react-vite'
import { FormField, MultiSelect } from '../../../src'

const ETIQUETAS = [
  { value: 'vip', label: 'VIP', color: 'var(--gcu-warning)' },
  { value: 'moroso', label: 'Moroso', color: 'var(--gcu-danger)' },
  { value: 'nuevo', label: 'Cliente nuevo', color: 'var(--gcu-success)' },
  { value: 'reclamo', label: 'Con reclamo abierto' },
  { value: 'baja', label: 'Solicitó baja', disabled: true },
]

const meta: Meta<typeof MultiSelect> = {
  title: 'Componentes/Formularios/MultiSelect',
  component: MultiSelect,
  tags: ['autodocs'],
  args: { 'aria-label': 'Etiquetas', options: ETIQUETAS, defaultValue: ['vip'] },
  argTypes: {
    max: { control: { type: 'number', min: 1, max: 5 } },
    disabled: { control: 'boolean' },
  },
  parameters: {
    docs: {
      description: {
        component: 'Selección múltiple con chips. La lista queda abierta al elegir; Retroceso con la búsqueda vacía quita el último chip. Con `max` muestra el contador.',
      },
    },
  },
  decorators: [Story => <div style={{ maxWidth: 440, minHeight: 340 }}><Story /></div>],
}
export default meta
type Story = StoryObj<typeof MultiSelect>

export const Playground: Story = {}

export const Estados: Story = {
  render: () => (
    <>
      <FormField label="Normal"><MultiSelect options={ETIQUETAS} /></FormField>
      <FormField label="Con tope" helpText="Máximo 2 etiquetas."><MultiSelect options={ETIQUETAS} defaultValue={['vip', 'nuevo']} max={2} /></FormField>
      <FormField label="Con error" error="Elige al menos una etiqueta."><MultiSelect options={ETIQUETAS} aria-invalid /></FormField>
      <FormField label="Deshabilitado"><MultiSelect options={ETIQUETAS} defaultValue={['moroso']} disabled /></FormField>
    </>
  ),
}

export const ContenedorAngosto: Story = {
  name: 'Contenedor angosto',
  render: () => (
    <div style={{ maxWidth: 320 }}>
      <FormField label="Etiquetas"><MultiSelect options={ETIQUETAS} defaultValue={['vip', 'moroso', 'nuevo', 'reclamo']} /></FormField>
    </div>
  ),
}
