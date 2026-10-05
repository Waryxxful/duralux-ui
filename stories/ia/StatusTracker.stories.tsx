import type { Meta, StoryObj } from '@storybook/react-vite'
import { StatusTracker } from '../../src'
import { conAncho } from '../componentes/Nuevos/soporte'
import { ETAPAS } from './datosAgente'

const meta: Meta<typeof StatusTracker> = {
  title: 'IA/Agente/StatusTracker',
  component: StatusTracker,
  tags: ['autodocs'],
  args: { stages: ETAPAS, current: 2, label: 'Carga de grabaciones a la base de conocimiento', detail: 'Indexando 320 de 1.200 grabaciones.' },
  argTypes: { current: { control: { type: 'number', min: 0, max: 4 } } },
  parameters: {
    docs: { description: { component: 'Avance de una operación larga por etapas. Una sola frase en `role="status"` anuncia el cambio; la lista reutiliza ProcessSteps. `minimal` muestra solo la frase y una barra.' } },
  },
  decorators: [conAncho(480)],
}
export default meta
type Story = StoryObj<typeof StatusTracker>

export const Playground: Story = {}
export const Minimo: Story = { name: 'Mínimo', args: { minimal: true } }
export const ConFalla: Story = { name: 'Con falla', args: { failed: true, detail: 'El archivo de audio está dañado. Vuelve a subirlo o descártalo.' } }
export const Terminado: Story = { args: { current: 4, detail: undefined } }
