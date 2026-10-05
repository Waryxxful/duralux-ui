import type { Meta, StoryObj } from '@storybook/react-vite'
import { SourceList } from '../../src'
import { conAncho } from '../componentes/Nuevos/soporte'
import { FUENTES } from './datosIa'

const meta: Meta<typeof SourceList> = {
  title: 'IA/Conversación/SourceList',
  component: SourceList,
  tags: ['autodocs'],
  args: { sources: FUENTES },
  parameters: { docs: { description: { component: 'Fuentes de una respuesta, numeradas como sus citas. Sin fuentes, lo dice: una respuesta sin respaldo no se presenta como respaldada.' } } },
  decorators: [conAncho(560)],
}
export default meta
type Story = StoryObj<typeof SourceList>

export const Playground: Story = {}
export const SinFuentes: Story = { name: 'Sin fuentes', args: { sources: [] } }
