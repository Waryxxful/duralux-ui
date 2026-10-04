import type { Meta, StoryObj } from '@storybook/react-vite'
import { RadioGroup } from '../../../src'
import { TresTemas } from '../Graficos/TresTemas'

const FRECUENCIAS = [
  { value: 'diaria', label: 'Diaria', description: 'Cada día a las 8:00' },
  { value: 'semanal', label: 'Semanal', description: 'Los lunes a las 8:00' },
  { value: 'mensual', label: 'Mensual', description: 'Solo cuentas Enterprise', disabled: true },
]

const meta: Meta<typeof RadioGroup> = {
  title: 'Componentes/Nuevos/RadioGroup',
  component: RadioGroup,
  tags: ['autodocs'],
  args: { legend: 'Frecuencia del reporte', options: FRECUENCIAS, defaultValue: 'semanal', orientation: 'vertical' },
  argTypes: { orientation: { control: 'inline-radio', options: ['vertical', 'horizontal'] } },
  parameters: {
    docs: {
      description: {
        component: 'Una opción entre varias con `<fieldset>` + `<legend>`. Flechas nativas, error del grupo anunciado y asociado; la orientación horizontal vuelve a vertical bajo 28rem de contenedor.',
      },
    },
  },
}
export default meta
type Story = StoryObj<typeof RadioGroup>

export const Playground: Story = {}

export const Estados: Story = {
  name: 'Orientación, ayuda y error',
  render: () => (
    <div className="d-flex flex-column gap-4">
      <RadioGroup legend="Canal preferido" orientation="horizontal" defaultValue="voz" options={[{ value: 'voz', label: 'Voz' }, { value: 'chat', label: 'Chat' }, { value: 'correo', label: 'Correo' }]} />
      <RadioGroup legend="Resultado de la llamada" helpText="Se usa para cerrar la gestión." error="Elige un resultado para cerrar la gestión." options={[{ value: 'contactado', label: 'Contactado' }, { value: 'no-contesta', label: 'No contesta' }]} />
    </div>
  ),
}

export const Angosto: Story = {
  name: 'Contenedor angosto (320 px)',
  render: () => (
    <div style={{ maxWidth: 320 }}>
      <RadioGroup legend="Canal preferido" orientation="horizontal" defaultValue="chat" options={[{ value: 'voz', label: 'Voz' }, { value: 'chat', label: 'Chat' }, { value: 'correo', label: 'Correo' }]} />
    </div>
  ),
}

export const Temas: Story = {
  name: 'Tres temas',
  render: () => <TresTemas>{(tema) => <RadioGroup legend={`Frecuencia (${tema})`} options={FRECUENCIAS} defaultValue="diaria" />}</TresTemas>,
}
