import { useEffect, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button, StreamingAnswer } from '../../src'
import { conAncho } from '../componentes/Nuevos/soporte'
import { FUENTES, RESPUESTA, SEGUIMIENTOS } from './datosIa'

const meta: Meta<typeof StreamingAnswer> = {
  title: 'IA/Conversación/StreamingAnswer',
  component: StreamingAnswer,
  tags: ['autodocs'],
  args: { text: RESPUESTA, sources: FUENTES, followUps: SEGUIMIENTOS, onFollowUp: () => {}, streaming: false },
  parameters: { docs: { description: { component: 'Respuesta que llega por partes con citas `[n]`, fuentes y preguntas de seguimiento. Una región `aria-live="polite"` aparte anuncia solo los bloques terminados, nunca cada token.' } } },
  decorators: [conAncho(720)],
}
export default meta
type Story = StoryObj<typeof StreamingAnswer>

export const Playground: Story = {}

function Simulacion() {
  const [n, setN] = useState(0)
  const [ronda, setRonda] = useState(0)
  useEffect(() => {
    setN(0)
    const timer = setInterval(() => setN((x) => (x >= RESPUESTA.length ? x : x + 4)), 40)
    return () => clearInterval(timer)
  }, [ronda])
  const streaming = n < RESPUESTA.length
  return (
    <div className="d-grid gap-3">
      <StreamingAnswer text={RESPUESTA.slice(0, n)} streaming={streaming} sources={FUENTES} followUps={SEGUIMIENTOS} onFollowUp={() => {}} />
      <div><Button variant="light-brand" size="sm" onClick={() => setRonda((r) => r + 1)}>Generar de nuevo</Button></div>
    </div>
  )
}

export const Generando: Story = { name: 'Generación simulada', render: () => <Simulacion /> }
export const SinFuentes: Story = {
  name: 'Sin fuentes',
  args: { text: 'Puedo ayudarte con indicadores de llamadas, campañas y ejecutivos. ¿Qué quieres revisar?', sources: [], followUps: [] },
}
