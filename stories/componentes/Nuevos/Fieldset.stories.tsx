import type { Meta, StoryObj } from '@storybook/react-vite'
import { Fieldset, FormField, Input, Select } from '../../../src'
import { TresTemas } from '../Graficos/TresTemas'

function Campos() {
  return (
    <>
      <FormField label="Razón social" required>{(id) => <Input id={id} placeholder="Ej.: Transportes Andes SpA" />}</FormField>
      <FormField label="RUT">{(id) => <Input id={id} placeholder="76.123.456-7" />}</FormField>
      <FormField label="Correo de facturación">{(id) => <Input id={id} type="email" placeholder="pagos@empresa.cl" />}</FormField>
      <FormField label="Plan">{(id) => <Select id={id} options={['Básico', 'Pro', 'Enterprise']} />}</FormField>
    </>
  )
}

const meta: Meta<typeof Fieldset> = {
  title: 'Componentes/Nuevos/Fieldset',
  component: Fieldset,
  tags: ['autodocs'],
  args: { legend: 'Datos de la cuenta', description: 'Se usan en la factura mensual.', columns: 2 },
  argTypes: { columns: { control: 'inline-radio', options: [1, 2] } },
  parameters: {
    docs: {
      description: {
        component: 'Agrupa campos relacionados con `<fieldset>` + `<legend>`. Descripción y error del grupo se asocian con `aria-describedby`; `columns={2}` pasa a dos columnas cuando el propio contenedor mide 32rem o más.',
      },
    },
  },
  render: (args) => <Fieldset {...args}><Campos /></Fieldset>,
}
export default meta
type Story = StoryObj<typeof Fieldset>

export const Playground: Story = {}

export const ConError: Story = {
  name: 'Con error del grupo y deshabilitado',
  render: () => (
    <div className="d-flex flex-column gap-4">
      <Fieldset legend="Datos de la cuenta" error="Revisa el RUT: no coincide con la razón social." columns={2}><Campos /></Fieldset>
      <Fieldset legend="Facturación (bloqueada: la gestiona Finanzas)" disabled columns={2}><Campos /></Fieldset>
    </div>
  ),
}

export const Angosto: Story = {
  name: 'Contenedor angosto (320 px): una columna',
  render: () => <div style={{ maxWidth: 320 }}><Fieldset legend="Datos de la cuenta" columns={2}><Campos /></Fieldset></div>,
}

export const Temas: Story = {
  name: 'Tres temas',
  render: () => (
    <TresTemas>
      {(tema) => (
        <Fieldset legend={`Contacto (${tema})`} description="Para avisos del servicio.">
          <FormField label="Correo">{(id) => <Input id={id} type="email" placeholder="nombre@empresa.cl" />}</FormField>
        </Fieldset>
      )}
    </TresTemas>
  ),
}
