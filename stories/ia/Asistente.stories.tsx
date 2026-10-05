import { useState } from 'react'
import type * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { AgentSteps, AiHistory, AiMessage, ApprovalCard, InsightCard, PromptComposer, ReasoningTrace, type AiThread, type ApprovalStatus } from '../../src'
import { PASOS, RAZONAMIENTO, SERIE_NS } from './datosAgente'

/**
 * Patrón Asistente: historial (AiHistory) + hilo (AiMessage) + compositor (PromptComposer).
 * Una sola acción primaria activa: mientras la aprobación está pendiente, el envío del compositor
 * sigue deshabilitado hasta que la persona escriba.
 */
const meta: Meta = {
  title: 'Patrones/Asistente',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'Página del asistente: historial a la izquierda, hilo con razonamiento, pasos del agente, aprobación humana e insight con fuentes, y el compositor con el aviso fijo. Toda acción con efecto pasa por ApprovalCard; el asistente nunca ejecuta por sí mismo.' } },
  },
}
export default meta
type Story = StoryObj

const panel: React.CSSProperties = { background: 'var(--gcu-surface)', border: '1px solid var(--gcu-border)', borderRadius: 'var(--gcu-radius-lg)' }

const HILOS_ASISTENTE: AiThread[] = [
  { id: 'h1', title: 'Cobranza bajo la meta de nivel de servicio', group: 'Hoy' },
  { id: 'h2', title: 'Resumen de reclamos de la semana', group: 'Ayer' },
  { id: 'h3', title: 'Guion de retención para portabilidad', group: 'Últimos 7 días' },
]

const PREGUNTA_INICIAL = '¿Por qué Cobranza está bajo la meta y qué podemos hacer en la próxima hora?'

function Asistente() {
  const [decision, setDecision] = useState<ApprovalStatus>('pending')
  const [activo, setActivo] = useState('h1')
  return (
    <div className="p-3" style={{ background: 'var(--gcu-surface-subtle)', minHeight: '100vh' }}>
      <h1 className="h5 mb-3">Asistente</h1>
      <div className="d-flex flex-wrap align-items-start gap-3">
        <div className="p-2" style={{ ...panel, flex: '1 1 16rem', minWidth: 0 }}>
          <AiHistory threads={HILOS_ASISTENTE} activeId={activo} onSelect={setActivo} onNew={() => setActivo('h1')} />
        </div>
        <section aria-label="Conversación" className="d-flex flex-column gap-3 p-3" style={{ ...panel, flex: '999 1 28rem', minWidth: 0 }}>
          <AiMessage sender="user" time="10:42">
            <p className="mb-0">{PREGUNTA_INICIAL}</p>
          </AiMessage>
          <AiMessage sender="assistant" time="10:42">
            <ReasoningTrace steps={RAZONAMIENTO} seconds={6} summary="revisó 3 colas" />
            <AgentSteps steps={PASOS.slice(0, 3)} compact label="Pasos que siguió el asistente" />
            <p className="mb-0" style={{ maxWidth: '68ch' }}>
              Cobranza tiene 71 % de nivel de servicio (meta 80 %) con 18 llamadas en espera [1]. Retención tiene 4 agentes con baja ocupación que podrían apoyar durante 2 horas [2].
            </p>
            <InsightCard
              label="Nivel de servicio · Cobranza"
              value="71 %"
              delta={{ value: '−9 pts', direction: 'down', good: false }}
              series={[...SERIE_NS].reverse()}
              seriesLabel="Últimas 8 horas, de 86 % a 71 %. Meta 80 %."
              note="Bajó desde las 10:00 por un aumento de 24 % en llamadas por cobros duplicados [1]."
              sources="[1] Métricas de colas por hora · [2] Presencia de agentes"
              style={{ maxWidth: '24rem' }}
            />
            <ApprovalCard
              title="Mover 4 agentes de Retención a Cobranza durante 2 horas"
              description="Retención seguiría sobre su meta (88 %) según la simulación."
              tool="preview_queue_reassignment"
              intentId="reasignacion-1"
              status={decision}
              onApprove={() => setDecision('approved')}
              onReject={() => setDecision('rejected')}
              style={{ maxWidth: '36rem' }}
            />
          </AiMessage>
          <PromptComposer onSubmit={() => {}} placeholder="Pregunta sobre tus colas, campañas o clientes…" />
        </section>
      </div>
    </div>
  )
}

export const Pagina: Story = { name: 'Página', render: () => <Asistente /> }
