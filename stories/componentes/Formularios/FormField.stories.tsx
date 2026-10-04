import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import {
  Button,
  Checkbox,
  FileInput,
  FormField,
  Input,
  MultiSelect,
  SearchableSelect,
  Select,
  Textarea,
} from '../../../src'

const meta: Meta<typeof FormField> = {
  title: 'Componentes/Formularios/FormField',
  component: FormField,
  tags: ['autodocs'],
  args: { label: 'Nombre de la campaña', helpText: 'Lo verán los agentes en su bandeja.', required: true, children: <Input /> },
  argTypes: { error: { control: 'text' }, required: { control: 'boolean' } },
  parameters: {
    docs: {
      description: {
        component: 'Label + control + ayuda + error. Responde a su contenedor (container query): en angosto apila el label; desde 36rem va en fila. Con un único control asocia label, `aria-describedby`, `required` y `aria-invalid` sin que hagas nada.',
      },
    },
  },
}
export default meta
type Story = StoryObj<typeof FormField>

export const Playground: Story = {}

export const Contenedores: Story = {
  name: 'Ancho del contenedor',
  render: () => (
    <div className="d-flex flex-wrap gap-4 align-items-start">
      <div style={{ width: 320 }} className="sb-panel">
        <FormField label="Correo" helpText="Contenedor de 320 px: apilado."><Input type="email" /></FormField>
      </div>
      <div style={{ width: 640 }} className="sb-panel">
        <FormField label="Correo" helpText="Contenedor de 640 px: en fila."><Input type="email" /></FormField>
      </div>
    </div>
  ),
}

const EJECUTIVOS = [
  { value: 1, label: 'Camila Rojas' },
  { value: 2, label: 'Diego Muñoz' },
  { value: 3, label: 'Valentina Soto' },
]
const SEGMENTOS = ['Retail', 'Pyme', 'Corporativo', 'Gobierno']

function FormularioCampana() {
  const [enviado, setEnviado] = useState(false)
  return (
    <form
      className="sb-panel"
      style={{ maxWidth: 760 }}
      noValidate
      onSubmit={(event) => { event.preventDefault(); setEnviado(true) }}
    >
      <FormField label="Nombre" required error={enviado ? 'Ingresa un nombre para la campaña.' : undefined}>
        <Input placeholder="Ej.: Cobranza Q4" />
      </FormField>
      <FormField label="Estado"><Select options={['Borrador', 'Activa', 'Pausada']} /></FormField>
      <FormField label="Ejecutivo responsable" helpText="Escribe para filtrar.">
        <SearchableSelect options={EJECUTIVOS} clearable />
      </FormField>
      <FormField label="Segmentos" helpText="Hasta 3.">
        <MultiSelect options={SEGMENTOS} max={3} defaultValue={['Pyme']} />
      </FormField>
      <FormField label="Base de contactos"><FileInput accept=".csv" className="mb-0" /></FormField>
      <FormField label="Guion"><Textarea rows={3} placeholder="Saludo, motivo y cierre" /></FormField>
      <FormField label="Avisos"><Checkbox label="Notificar a los agentes al activar" defaultChecked /></FormField>
      <div className="d-flex justify-content-end gap-2">
        <Button variant="light-brand" type="reset" onClick={() => setEnviado(false)}>Descartar</Button>
        <Button type="submit">Guardar campaña</Button>
      </div>
    </form>
  )
}

export const FormularioReal: Story = { name: 'Formulario real', render: () => <FormularioCampana /> }
