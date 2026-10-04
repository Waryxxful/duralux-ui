import type { Meta, StoryObj } from '@storybook/react-vite'
import { ProcessSteps } from '../../../src'
import { conAncho, TresTemas } from './soporte'

const steps = [
  { key: 'recibida', label: 'Recibida', description: '16:40' },
  { key: 'transcrita', label: 'Transcrita', description: '16:41' },
  { key: 'evaluada', label: 'Evaluada' },
  { key: 'publicada', label: 'Publicada' },
]

const meta: Meta<typeof ProcessSteps> = {
  title: 'Componentes/Nuevos/ProcessSteps',
  component: ProcessSteps,
  tags: ['autodocs'],
  args: { steps, current: 2, label: 'Procesamiento de la llamada', orientation: 'horizontal' },
  argTypes: {
    current: { control: { type: 'number', min: 0, max: 3 } },
    failed: { control: 'boolean' },
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
  },
  parameters: {
    docs: { description: { component: 'Pasos de un proceso con su estado (hecho, en curso, fallido, pendiente). El estado se dice en texto además de la forma; la orientación horizontal pasa a vertical en contenedores angostos.' } },
  },
  decorators: [conAncho(640)],
}
export default meta
type Story = StoryObj<typeof ProcessSteps>

export const Playground: Story = {}

export const Fallido: Story = { args: { failed: true } }

export const Vertical: Story = { args: { orientation: 'vertical' }, parameters: { maxWidth: 320 } }

export const Completo: Story = { args: { current: 4 } }

export const Temas: Story = {
  name: 'Tres temas',
  parameters: { maxWidth: 'none' },
  render: () => <TresTemas>{() => <ProcessSteps steps={steps} current={1} label="Procesamiento de la llamada" orientation="vertical" />}</TresTemas>,
}
