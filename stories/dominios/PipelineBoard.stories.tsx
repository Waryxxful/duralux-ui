import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { PipelineBoard, type PipelineDeal } from '../../src'
import { conAncho } from '../componentes/Nuevos/soporte'
import { ETAPAS, OPORTUNIDADES } from './datos'

const meta: Meta<typeof PipelineBoard> = {
  title: 'Dominios/CRM/PipelineBoard',
  component: PipelineBoard,
  tags: ['autodocs'],
  args: { stages: ETAPAS, deals: OPORTUNIDADES },
  parameters: {
    docs: { description: { component: 'Pipeline por etapa con total (cantidad y monto CLP). Arrastra una tarjeta o, con el foco en ella, usa Alt + ← / → para moverla de etapa; el foco la sigue y un aviso lo anuncia. El tablero emite `onMove` y el consumidor actualiza los datos.' } },
  },
  decorators: [conAncho('none')],
}
export default meta
type Story = StoryObj<typeof PipelineBoard>

function Tablero() {
  const [deals, setDeals] = useState<PipelineDeal[]>(OPORTUNIDADES)
  return (
    <PipelineBoard
      stages={ETAPAS}
      deals={deals}
      onMove={(id, stage) => setDeals((current) => current.map((deal) => (deal.id === id ? { ...deal, stage } : deal)))}
      onOpen={(deal) => console.info('[story] abrir', deal.id)}
    />
  )
}

export const Playground: Story = { render: () => <Tablero /> }

export const SoloLectura: Story = { name: 'Solo lectura (sin onMove)' }
