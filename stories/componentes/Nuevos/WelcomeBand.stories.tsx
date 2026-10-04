import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button, WelcomeBand } from '../../../src'
import { conAncho, TresTemas } from './soporte'

const stats = [
  { label: 'En espera', value: 18 },
  { label: 'Espera máxima', value: '4:32' },
  { label: 'Ejecutivos libres', value: 2 },
]

const meta: Meta<typeof WelcomeBand> = {
  title: 'Componentes/Nuevos/WelcomeBand',
  component: WelcomeBand,
  tags: ['autodocs'],
  args: {
    title: 'Cobranza tiene 18 llamadas en espera',
    lede: 'La espera supera el máximo de 3 minutos. Reasigna ejecutivos de Ventas para bajar la cola.',
    actions: (
      <>
        <Button variant="light">Reasignar ejecutivos</Button>
        <Button variant="link" className="text-white">Ver la cola</Button>
      </>
    ),
    stats,
    tone: 'primary',
  },
  argTypes: { tone: { control: 'select', options: ['primary', 'indigo', 'dark', 'danger', 'success', 'info', 'teal'] } },
  parameters: {
    docs: { description: { component: 'Cabecera «Qué atender primero»: nombra la tarea con su cifra y ofrece una acción. No saluda.' } },
  },
  decorators: [conAncho('none')],
}
export default meta
type Story = StoryObj<typeof WelcomeBand>

export const Playground: Story = {}

export const SinCifras: Story = { name: 'Sin cifras', args: { stats: undefined } }

export const ContenedorAngosto: Story = { name: 'Contenedor angosto (360 px)', parameters: { maxWidth: 360 } }

export const Temas: Story = {
  name: 'Tres temas',
  render: () => <TresTemas>{() => <WelcomeBand title="Cobranza tiene 18 llamadas en espera" stats={stats.slice(0, 2)} tone="indigo" />}</TresTemas>,
}
