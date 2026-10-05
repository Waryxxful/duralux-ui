import type { Meta, StoryObj } from '@storybook/react-vite'
import { InlineEdit } from '../../src'
import { conAncho } from '../componentes/Nuevos/soporte'

const meta: Meta<typeof InlineEdit> = {
  title: 'IA/Contenido/InlineEdit',
  component: InlineEdit,
  tags: ['autodocs'],
  args: {
    original: 'Estimado cliente, su reclamo fue recibido y será revisado en los próximos días.',
    suggestion: 'Hola, recibimos tu reclamo y lo revisaremos en un máximo de 5 días hábiles.',
    instruction: 'Hacer más cercano y con plazo concreto',
    onAccept: () => {},
    onReject: () => {},
  },
  parameters: {
    docs: { description: { component: 'Mejora sugerida por el asistente con diferencias palabra a palabra (`<ins>`/`<del>`). Con el foco en la sugerencia, Enter acepta; Esc descarta desde cualquier parte. Aceptar solo emite el texto.' } },
  },
  decorators: [conAncho(560)],
}
export default meta
type Story = StoryObj<typeof InlineEdit>

export const Playground: Story = {}
export const ConFoco: Story = { name: 'Con foco (decide con teclado)', args: { autoFocus: true } }
export const ContenedorAngosto: Story = { name: 'Contenedor angosto (320 px)', parameters: { maxWidth: 320 } }
