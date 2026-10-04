import type { Meta, StoryObj } from '@storybook/react-vite'
import { Radio } from '../../../src'

const meta: Meta<typeof Radio> = {
  title: 'Componentes/Formularios/Radio',
  component: Radio,
  tags: ['autodocs'],
  args: { label: 'Mensual', name: 'sb-plan' },
  argTypes: { error: { control: 'boolean' }, disabled: { control: 'boolean' } },
  parameters: {
    docs: { description: { component: 'Opciones excluyentes agrupadas por `name` dentro de un `fieldset` con `legend`. Las flechas mueven la selección.' } },
  },
}
export default meta
type Story = StoryObj<typeof Radio>

export const Playground: Story = {}

export const Grupo: Story = {
  name: 'Grupo y estados',
  render: () => (
    <div className="d-flex flex-column gap-4">
      <fieldset>
        <legend className="form-label">Frecuencia del reporte</legend>
        <Radio name="frecuencia" label="Diaria" defaultChecked />
        <Radio name="frecuencia" label="Semanal" />
        <Radio name="frecuencia" label="Mensual (solo cuentas Enterprise)" disabled />
      </fieldset>
      <fieldset>
        <legend className="form-label">Resultado de la llamada</legend>
        <Radio name="resultado" label="Contactado" error />
        <Radio name="resultado" label="No contesta" error />
        <div className="invalid-feedback d-block">Elige un resultado para cerrar la gestión.</div>
      </fieldset>
      <fieldset>
        <legend className="form-label">Con foco</legend>
        <Radio name="foco" label="Opción enfocada" autoFocus />
      </fieldset>
    </div>
  ),
}
