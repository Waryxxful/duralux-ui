import type { Meta, StoryObj } from '@storybook/react-vite'
import { Badge } from '../../../src'

const TONES = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'teal', 'indigo', 'dark'] as const

const meta: Meta<typeof Badge> = {
  title: 'Componentes/Presentación/Badge',
  component: Badge,
  tags: ['autodocs'],
  args: { children: 'En curso', variant: 'primary', soft: true, dot: false, pill: false },
  argTypes: {
    variant: { control: 'select', options: [...TONES, 'light'] },
  },
  parameters: {
    docs: {
      description: {
        component: 'Estado con tokens por tono. Usa `soft` para estados en tablas y listas (lo más común); sólido solo para destacar un único estado. El estado nunca va solo en color: el texto siempre lo nombra. `dot` agrega un punto decorativo.',
      },
    },
  },
}
export default meta
type Story = StoryObj<typeof Badge>

export const Playground: Story = {}

export const Suaves: Story = {
  render: () => (
    <div className="d-flex flex-wrap gap-2">
      {TONES.map((tone) => <Badge key={tone} variant={tone} soft>{tone}</Badge>)}
      <Badge variant="light">Borrador</Badge>
    </div>
  ),
}

export const Solidos: Story = {
  name: 'Sólidos',
  render: () => (
    <div className="d-flex flex-wrap gap-2">
      {TONES.map((tone) => <Badge key={tone} variant={tone}>{tone}</Badge>)}
    </div>
  ),
}

export const ConPunto: Story = {
  name: 'Con punto de estado',
  render: () => (
    <div className="d-flex flex-wrap gap-2">
      <Badge variant="success" soft dot pill>En línea</Badge>
      <Badge variant="warning" soft dot pill>En pausa</Badge>
      <Badge variant="danger" soft dot pill>Desconectado</Badge>
      <Badge variant="secondary" soft dot pill>Sin turno</Badge>
    </div>
  ),
}

export const Interactivo: Story = {
  name: 'Como filtro (botón)',
  render: () => (
    <div className="d-flex flex-wrap gap-2">
      <Badge as="button" type="button" variant="primary" soft pill>Todas · 128</Badge>
      <Badge as="button" type="button" variant="danger" soft pill>Vencidas · 7</Badge>
      <Badge as="button" type="button" variant="success" soft pill>Resueltas · 96</Badge>
    </div>
  ),
}

export const EnTabla: Story = {
  name: 'Caso real: estado de agentes',
  render: () => (
    <table className="table table-hover mb-0">
      <thead><tr><th>Agente</th><th>Estado</th><th className="text-end">TMO</th></tr></thead>
      <tbody>
        <tr><td>Camila Rojas</td><td><Badge variant="success" soft dot>En línea</Badge></td><td className="text-end">4:52</td></tr>
        <tr><td>Diego Fuentes</td><td><Badge variant="warning" soft dot>En pausa</Badge></td><td className="text-end">6:10</td></tr>
        <tr><td>Valentina Soto</td><td><Badge variant="danger" soft dot>Desconectada</Badge></td><td className="text-end">—</td></tr>
      </tbody>
    </table>
  ),
}

export const Angosto: Story = {
  name: 'Contenedor angosto (320 px)',
  render: () => (
    <div style={{ maxWidth: 320 }} className="d-flex flex-wrap gap-2">
      <Badge variant="success" soft dot>En línea</Badge>
      <Badge variant="danger">Vencido hace 3 días</Badge>
      <Badge variant="light">Borrador</Badge>
    </div>
  ),
}
