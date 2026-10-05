import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { ModelSelector, PromptComposer, VoiceInput } from '../../src'
import { conAncho } from '../componentes/Nuevos/soporte'
import { MODELOS, PREGUNTA } from './datosIa'

const meta: Meta<typeof PromptComposer> = {
  title: 'IA/Conversación/PromptComposer',
  component: PromptComposer,
  tags: ['autodocs'],
  args: { onSubmit: () => {}, busy: false, variant: 'default', maxLength: 2000 },
  argTypes: { variant: { control: 'inline-radio', options: ['default', 'minimal'] } },
  parameters: { docs: { description: { component: 'Caja para preguntar al asistente. Enter envía; Shift+Enter salta de línea. Adjuntos, contador y aviso fijo: «El asistente puede equivocarse. Revisa las fuentes antes de tomar decisiones.»' } } },
  decorators: [conAncho(720)],
}
export default meta
type Story = StoryObj<typeof PromptComposer>

export const Playground: Story = {}

function ConHerramientas() {
  const [model, setModel] = useState('equilibrado')
  const [recording, setRecording] = useState(false)
  return (
    <PromptComposer
      onSubmit={() => {}}
      tools={(
        <>
          <ModelSelector variant="segmented" label="Modelo" models={MODELOS} value={model} onChange={setModel} />
          <VoiceInput recording={recording} onToggle={() => setRecording((r) => !r)} />
        </>
      )}
    />
  )
}

export const Herramientas: Story = { name: 'Con modelo y dictado', render: () => <ConHerramientas /> }
export const Generando: Story = { name: 'Generando (detener)', args: { busy: true, onStop: () => {} } }
export const PreguntaConservada: Story = { name: 'Pregunta conservada', args: { defaultValue: PREGUNTA } }
export const SinCupo: Story = { name: 'Deshabilitado con motivo', args: { disabled: true, disabledReason: 'Llegaste al límite de consultas de hoy. Se reinicia a las 00:00.' } }
export const Minimal: Story = { args: { variant: 'minimal', allowAttachments: false } }
export const Angosto: Story = { name: 'Panel angosto', parameters: { maxWidth: 320 } }
