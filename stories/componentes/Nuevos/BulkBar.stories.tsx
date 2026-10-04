import type { Meta, StoryObj } from '@storybook/react-vite'
import { BulkBar, Button } from '../../../src'
import { conAncho, TresTemas } from './soporte'

const acciones = (
  <>
    <Button size="sm" variant="primary">Reasignar</Button>
    <Button size="sm" variant="light-danger">Descartar</Button>
  </>
)

const meta: Meta<typeof BulkBar> = {
  title: 'Componentes/Nuevos/BulkBar',
  component: BulkBar,
  tags: ['autodocs'],
  args: { count: 3, total: 120, actions: acciones, onClear: () => {} },
  argTypes: { count: { control: { type: 'number', min: 0 } } },
  parameters: {
    docs: { description: { component: 'Barra de selección masiva: cantidad seleccionada, acciones y «Quitar selección». Anuncia cada cambio de cantidad en una región `status` y con 0 se oculta. Aparece con una transición breve que respeta reduced-motion.' } },
  },
  decorators: [conAncho(640)],
}
export default meta
type Story = StoryObj<typeof BulkBar>

export const Playground: Story = {}

export const SinTotal: Story = { name: 'Sin total', args: { count: 1, total: undefined } }

export const TextoPropio: Story = {
  name: 'Texto propio',
  args: { count: 8, formatCount: (count: number) => `${count} llamadas marcadas para revisión` },
}

export const ContenedorAngosto: Story = { name: 'Contenedor angosto (320 px)', parameters: { maxWidth: 320 } }

export const Temas: Story = {
  name: 'Tres temas',
  parameters: { maxWidth: 'none' },
  render: () => <TresTemas>{() => <BulkBar count={3} total={120} actions={acciones} onClear={() => {}} />}</TresTemas>,
}
