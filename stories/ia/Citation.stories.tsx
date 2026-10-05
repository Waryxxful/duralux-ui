import type { Meta, StoryObj } from '@storybook/react-vite'
import { Citation } from '../../src'
import { conAncho } from '../componentes/Nuevos/soporte'
import { FUENTES } from './datosIa'

const meta: Meta<typeof Citation> = {
  title: 'IA/Conversación/Citation',
  component: Citation,
  tags: ['autodocs'],
  args: { source: FUENTES[0] },
  parameters: { docs: { description: { component: 'Marca de cita `[n]` con vista previa de la fuente al pasar el puntero o al enfocar. Salta a SourceList con `targetId`; los enlaces externos solo se aceptan si son http/https.' } } },
  decorators: [conAncho(560)],
}
export default meta
type Story = StoryObj<typeof Citation>

export const Playground: Story = {}

export const EnTexto: Story = {
  name: 'En un párrafo',
  render: () => (
    <p>
      El nivel de servicio fue 71 %<Citation source={FUENTES[0]} /> con 4 ausencias no programadas
      <Citation source={FUENTES[1]} /> y un alza de la campaña Cobranza Norte<Citation source={FUENTES[2]} />.
    </p>
  ),
}
