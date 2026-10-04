import type { Meta, StoryObj } from '@storybook/react-vite'
import { FormField, SearchableSelect } from '../../../src'

const PAISES = [
  { value: 'cl', label: 'Chile', icon: 'feather-flag' },
  { value: 'pe', label: 'Perú' },
  { value: 'co', label: 'Colombia' },
  { value: 'mx', label: 'México' },
  { value: 'ar', label: 'Argentina', disabled: true },
]

const meta: Meta<typeof SearchableSelect> = {
  title: 'Componentes/Formularios/SearchableSelect',
  component: SearchableSelect,
  tags: ['autodocs'],
  args: { 'aria-label': 'País', options: PAISES, placeholder: 'Seleccionar…' },
  argTypes: {
    clearable: { control: 'boolean' },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
  },
  parameters: {
    docs: {
      description: {
        component: 'Combobox APG con filtro (ignora tildes). Teclado: flechas, Inicio/Fin, Enter elige, Escape cierra. Úsalo cuando hay más de ~7 opciones; para pocas, Select nativo.',
      },
    },
  },
  decorators: [Story => <div style={{ maxWidth: 420, minHeight: 320 }}><Story /></div>],
}
export default meta
type Story = StoryObj<typeof SearchableSelect>

export const Playground: Story = {}

export const Estados: Story = {
  render: () => (
    <>
      <FormField label="Normal"><SearchableSelect options={PAISES} /></FormField>
      <FormField label="Con valor y limpiar"><SearchableSelect options={PAISES} defaultValue="cl" clearable /></FormField>
      <FormField label="Con error" error="Elige un país."><SearchableSelect options={PAISES} aria-invalid /></FormField>
      <FormField label="Deshabilitado" helpText="Depende de la cuenta elegida."><SearchableSelect options={PAISES} defaultValue="pe" disabled /></FormField>
    </>
  ),
}

export const Abierto: Story = {
  name: 'Lista abierta (foco)',
  render: () => <FormField label="País"><SearchableSelect options={PAISES} defaultValue="co" autoFocus /></FormField>,
}
