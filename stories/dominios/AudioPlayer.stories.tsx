import type { Meta, StoryObj } from '@storybook/react-vite'
import { AudioPlayer } from '../../src'
import { conAncho } from '../componentes/Nuevos/soporte'
import { MARCAS } from './datos'

const meta: Meta<typeof AudioPlayer> = {
  title: 'Dominios/Calidad/AudioPlayer',
  component: AudioPlayer,
  tags: ['autodocs'],
  args: { duration: 312, marks: MARCAS },
  argTypes: { waveform: { control: 'boolean' } },
  parameters: {
    docs: { description: { component: 'Reproductor de la grabación: reproducir, retroceder y adelantar 10 s, velocidad y barra nativa operable con teclado (atajos Espacio/K, J y L con el foco en el reproductor). Sin `src` simula el avance. `waveform={false}` es la alternativa sin onda.' } },
  },
  decorators: [conAncho(640)],
}
export default meta
type Story = StoryObj<typeof AudioPlayer>

export const Playground: Story = {
  args: { onMarkClick: (mark) => console.info('[story] marca', mark.label) },
}

export const SinOnda: Story = {
  name: 'Alternativa sin onda',
  args: { waveform: false },
}

export const Angosto: Story = {
  name: 'En un panel angosto',
  parameters: { maxWidth: 320 },
}
