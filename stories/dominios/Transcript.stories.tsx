import type { Meta, StoryObj } from '@storybook/react-vite'
import { Transcript } from '../../src'
import { conAncho } from '../componentes/Nuevos/soporte'
import { TURNOS } from './datos'

const meta: Meta<typeof Transcript> = {
  title: 'Dominios/Calidad/Transcript',
  component: Transcript,
  tags: ['autodocs'],
  args: { turns: TURNOS, flagged: 5, highlight: ['descuento', 'RUT'], maxHeight: '22rem' },
  argTypes: { flagged: { control: { type: 'number', min: 0, max: TURNOS.length - 1 } } },
  parameters: {
    docs: { description: { component: 'Transcripción por turnos con quién habla en texto, marca de tiempo (m:ss), turno citado y términos resaltados. El turno citado se desplaza a la vista dentro del recuadro.' } },
  },
  decorators: [conAncho(560)],
}
export default meta
type Story = StoryObj<typeof Transcript>

export const Playground: Story = {}

export const ConSalto: Story = {
  name: 'Marcas que saltan el audio',
  args: { onSeek: (seconds: number) => console.info('[story] saltar a', seconds) },
}

export const Estados: Story = {
  name: 'Carga y vacío',
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--gcu-space-4)' }}>
      <Transcript turns={[]} loading />
      <Transcript turns={[]} />
    </div>
  ),
}
