import type { Meta, StoryObj } from '@storybook/react-vite'
import { CallRow } from '../../src'
import { conAncho } from '../componentes/Nuevos/soporte'
import { LLAMADAS } from './datos'

const meta: Meta<typeof CallRow> = {
  title: 'Dominios/Calidad/CallRow',
  component: CallRow,
  tags: ['autodocs'],
  args: { call: LLAMADAS[1], active: false, threshold: 50 },
  parameters: {
    docs: { description: { component: 'Llamada de la bandeja: severidad con forma, agente, #ID, origen · foco · fecha, resumen y puntaje (anulado con error grave). Es una opción de CallList; aquí se muestra dentro de un listbox para conservar la semántica.' } },
  },
  // El primer decorador es el más interno: el listbox envuelve la opción directamente.
  decorators: [
    (Story) => <div role="listbox" aria-label="Llamada de ejemplo"><Story /></div>,
    conAncho(480),
  ],
}
export default meta
type Story = StoryObj<typeof CallRow>

export const Playground: Story = {}

export const ErrorGrave: Story = { name: 'Error grave', args: { call: LLAMADAS[0] } }

export const Activa: Story = { name: 'Activa', args: { call: LLAMADAS[2], active: true } }
