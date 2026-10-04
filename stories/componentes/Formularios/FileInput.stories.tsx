import type { Meta, StoryObj } from '@storybook/react-vite'
import { FileInput } from '../../../src'

const meta: Meta<typeof FileInput> = {
  title: 'Componentes/Formularios/FileInput',
  component: FileInput,
  tags: ['autodocs'],
  args: { label: 'Contrato firmado', helpText: 'PDF de hasta 10 MB.', accept: 'application/pdf' },
  argTypes: {
    controlSize: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    disabled: { control: 'boolean' },
    error: { control: 'text' },
  },
  parameters: {
    docs: { description: { component: 'El botón nativo toma la superficie del tema en claro, oscuro y navy (DX-010). El error string se enlaza por `aria-describedby`.' } },
  },
  decorators: [Story => <div style={{ maxWidth: 480 }}><Story /></div>],
}
export default meta
type Story = StoryObj<typeof FileInput>

export const Playground: Story = {}

export const Tamanos: Story = {
  name: 'Tamaños (32 / 36 / 40)',
  render: () => (
    <>
      <FileInput controlSize="sm" label="Pequeño" />
      <FileInput label="Mediano" />
      <FileInput controlSize="lg" label="Grande" />
    </>
  ),
}

export const Estados: Story = {
  render: () => (
    <>
      <FileInput label="Normal" helpText="Formatos: CSV o XLSX." accept=".csv,.xlsx" />
      <FileInput label="Con error" error="El archivo supera los 10 MB." />
      <FileInput label="Deshabilitado" helpText="Disponible al guardar la campaña." disabled />
      <FileInput label="Con foco" autoFocus />
    </>
  ),
}
