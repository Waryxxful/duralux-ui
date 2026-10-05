import type { Meta, StoryObj } from '@storybook/react-vite'
import { WebResults } from '../../src'
import { conAncho } from '../componentes/Nuevos/soporte'
import { RESULTADOS } from './datosAgente'

const meta: Meta<typeof WebResults> = {
  title: 'IA/Agente/WebResults',
  component: WebResults,
  tags: ['autodocs'],
  args: { query: 'plazo de respuesta a reclamos por cobro no reconocido', results: RESULTADOS, total: 14, scope: 'la base de conocimiento' },
  parameters: {
    docs: { description: { component: 'Búsqueda del asistente: consulta, total y resultados, con el que está leyendo marcado en texto. Los enlaces externos abren en pestaña nueva con aviso; sin `href`, el título es texto.' } },
  },
  decorators: [conAncho(560)],
}
export default meta
type Story = StoryObj<typeof WebResults>

export const Playground: Story = {}
export const Compacto: Story = { args: { compact: true } }
export const SinResultados: Story = { name: 'Sin resultados', args: { results: [], total: 0 } }
export const ContenedorAngosto: Story = { name: 'Contenedor angosto (320 px)', parameters: { maxWidth: 320 } }
