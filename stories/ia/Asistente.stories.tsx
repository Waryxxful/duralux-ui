import { useState } from 'react'
import type * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { AgentSteps, ApprovalCard, InsightCard, ReasoningTrace, type ApprovalStatus } from '../../src'
import { PASOS, RAZONAMIENTO, SERIE_NS } from './datosAgente'

/**
 * Patrón Asistente: historial + hilo + compositor. Los componentes de conversación (2.8 Conversación)
 * se desarrollan en paralelo; aquí van marcadores con markup local que el integrador reemplaza.
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
const muted: React.CSSProperties = { color: 'var(--gcu-muted)', fontSize: 'var(--gcu-font-size-sm)' }

const HISTORIAL = [
  { id: 'h1', titulo: 'Cobranza bajo la meta de nivel de servicio', cuando: 'Hoy · 10:42', activo: true },
  { id: 'h2', titulo: 'Resumen de reclamos de la semana', cuando: 'Ayer · 17:05', activo: false },
  { id: 'h3', titulo: 'Guion de retención para portabilidad', cuando: '02-10-2026', activo: false },
]

function Historial() {
  // TODO integrador: usar AiMessage/PromptComposer/AiHistory de 2.8 conversación
  return (
    <nav aria-label="Conversaciones anteriores" className="p-3 d-flex flex-column gap-2" style={panel}>
      <h2 className="h6 mb-1">Conversaciones</h2>
      <ul className="list-unstyled mb-0 d-flex flex-column gap-1">
        {HISTORIAL.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              aria-current={item.activo ? 'page' : undefined}
              className="d-block rounded-2 px-2 py-1 text-decoration-none"
              style={{ background: item.activo ? 'var(--gcu-primary-soft)' : 'transparent', color: item.activo ? 'var(--gcu-primary-text)' : 'var(--gcu-text)' }}
            >
              <span className="d-block" style={{ fontSize: 'var(--gcu-font-size-sm)' }}>{item.titulo}</span>
              <span style={{ ...muted, fontSize: 'var(--gcu-font-size-xs)' }}>{item.cuando}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

function Mensaje({ autor, children }: { autor: 'persona' | 'asistente'; children: React.ReactNode }) {
  // TODO integrador: usar AiMessage/PromptComposer/AiHistory de 2.8 conversación
  const persona = autor === 'persona'
  return (
    <div className={persona ? 'align-self-end' : 'align-self-stretch'} style={{ maxWidth: persona ? '36rem' : undefined }}>
      <span className="visually-hidden">{persona ? 'Tú:' : 'Asistente:'}</span>
      <div className="d-flex flex-column gap-3" style={persona ? { ...panel, background: 'var(--gcu-primary-soft)', padding: 'var(--gcu-space-3)' } : undefined}>
        {children}
      </div>
    </div>
  )
}

function Compositor() {
  // TODO integrador: usar AiMessage/PromptComposer/AiHistory de 2.8 conversación
  return (
    <form className="d-flex flex-column gap-2" onSubmit={(event) => event.preventDefault()}>
      <label htmlFor="asistente-pregunta" className="visually-hidden">Pregunta al asistente</label>
      <div className="d-flex gap-2">
        <textarea id="asistente-pregunta" className="form-control" rows={2} placeholder="Pregunta sobre tus colas, campañas o clientes…" />
        <button type="submit" className="btn btn-primary align-self-end">Enviar pregunta</button>
      </div>
      <p className="mb-0" style={{ ...muted, fontSize: 'var(--gcu-font-size-xs)' }}>
        El asistente puede equivocarse. Revisa las fuentes antes de tomar decisiones.
      </p>
    </form>
  )
}

function Asistente() {
  const [decision, setDecision] = useState<ApprovalStatus>('pending')
  return (
    <div className="p-3" style={{ background: 'var(--gcu-surface-subtle)', minHeight: '100vh' }}>
      <h1 className="h5 mb-3">Asistente</h1>
      <div className="d-flex flex-wrap align-items-start gap-3">
        <div style={{ flex: '1 1 16rem', minWidth: 0 }}><Historial /></div>
        <section aria-label="Conversación" className="d-flex flex-column gap-3 p-3" style={{ ...panel, flex: '999 1 28rem', minWidth: 0 }}>
          <Mensaje autor="persona">
            <p className="mb-0">¿Por qué Cobranza está bajo la meta y qué podemos hacer en la próxima hora?</p>
          </Mensaje>
          <Mensaje autor="asistente">
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
          </Mensaje>
          <hr className="my-1" />
          <Compositor />
        </section>
      </div>
    </div>
  )
}

export const Pagina: Story = { name: 'Página', render: () => <Asistente /> }
