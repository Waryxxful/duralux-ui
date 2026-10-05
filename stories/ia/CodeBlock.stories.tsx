import type { Meta, StoryObj } from '@storybook/react-vite'
import { CodeBlock } from '../../src'
import { conAncho } from '../componentes/Nuevos/soporte'
import { CODIGO } from './datosAgente'

const meta: Meta<typeof CodeBlock> = {
  title: 'IA/Contenido/CodeBlock',
  component: CodeBlock,
  tags: ['autodocs'],
  args: { code: CODIGO, filename: 'regla-escalamiento.json', language: 'JSON', numbered: true, maxLines: 8 },
  parameters: {
    docs: { description: { component: 'Bloque de código sin resaltado (sin dependencias), con copiar (Clipboard API y método alternativo), números de línea que no se copian y plegado sobre `maxLines`. El resultado de copiar se anuncia en `status`.' } },
  },
  decorators: [conAncho(560)],
}
export default meta
type Story = StoryObj<typeof CodeBlock>

export const Playground: Story = {}
export const SinNumeros: Story = { name: 'Sin números', args: { numbered: false } }
export const Corto: Story = { args: { code: '{ "cola": "cobranza", "meta_nivel_servicio": 80 }', filename: undefined, language: 'JSON', numbered: false } }
export const ContenedorAngosto: Story = { name: 'Contenedor angosto (320 px)', parameters: { maxWidth: 320 } }
