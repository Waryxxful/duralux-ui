import type { Meta, StoryObj } from '@storybook/react-vite'
import { DiffView } from '../../src'
import { conAncho } from '../componentes/Nuevos/soporte'
import { ARCHIVOS } from './datosAgente'

const meta: Meta<typeof DiffView> = {
  title: 'IA/Contenido/DiffView',
  component: DiffView,
  tags: ['autodocs'],
  args: { files: ARCHIVOS, onDecide: () => {} },
  parameters: {
    docs: { description: { component: 'Cambios propuestos por archivo (pautas, plantillas, reglas) con diferencia línea a línea y aceptar/rechazar por archivo. Solo emite la decisión; no aplica cambios.' } },
  },
  decorators: [conAncho(640)],
}
export default meta
type Story = StoryObj<typeof DiffView>

export const Playground: Story = {}
export const Resumen: Story = { args: { summary: true } }
export const SoloLectura: Story = { name: 'Solo lectura', args: { onDecide: undefined } }
export const Decidido: Story = { args: { decisions: { 'pauta-calidad/saludo.md': true, 'plantillas/cierre-reclamo.txt': false } } }
export const ContenedorAngosto: Story = { name: 'Contenedor angosto (320 px)', parameters: { maxWidth: 320 } }
