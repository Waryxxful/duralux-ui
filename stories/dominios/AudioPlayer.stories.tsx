import { useRef } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { AudioPlayer, Button, type AudioPlayerHandle } from '../../src'
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

/** Salta al segundo de una cita con `playerRef`, sin reemplazar el ref del contenedor. */
function SaltoACita() {
  const player = useRef<AudioPlayerHandle>(null)
  return (
    <>
      <AudioPlayer playerRef={player} duration={312} marks={MARCAS} />
      <div className="d-flex flex-wrap gap-2 mt-3">
        <Button variant="light-brand" size="sm" onClick={() => player.current?.seek(14)}>Ir a 0:14, validación incompleta</Button>
        <Button variant="light-brand" size="sm" onClick={() => player.current?.seek(52)}>Ir a 0:52, promesa sin respaldo</Button>
      </div>
    </>
  )
}

export const SaltoDesdeUnaCita: Story = {
  name: 'Salto al minuto de una cita',
  render: () => <SaltoACita />,
}
