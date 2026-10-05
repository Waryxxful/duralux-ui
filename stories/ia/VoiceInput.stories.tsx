import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { VoiceInput } from '../../src'
import { conAncho } from '../componentes/Nuevos/soporte'

const meta: Meta<typeof VoiceInput> = {
  title: 'IA/Conversación/VoiceInput',
  component: VoiceInput,
  tags: ['autodocs'],
  args: { recording: false, onToggle: () => {} },
  parameters: { docs: { description: { component: 'Dictar la pregunta. Muestra el estado; la captura la hace la app. Sin Web Speech API se deshabilita con un aviso visible.' } } },
  decorators: [conAncho(420)],
}
export default meta
type Story = StoryObj<typeof VoiceInput>

export const Playground: Story = {}

function Interactivo() {
  const [recording, setRecording] = useState(false)
  return <VoiceInput recording={recording} onToggle={() => setRecording((r) => !r)} />
}

export const Dictando: Story = { name: 'Interactivo', render: () => <Interactivo /> }
export const SinSoporte: Story = { name: 'Navegador sin dictado', args: { forceUnsupported: true } }
