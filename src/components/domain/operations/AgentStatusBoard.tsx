import { forwardRef } from 'react'
import { cx } from '../../../utils/cx'
import { log } from '../../../utils/log'
import { isArray, isFunction } from '../../../utils/typeGuards'
import type { AgentPresenceState, AgentStatusBoardProps } from '../../../public/types'
import { Person } from '../../ui/Person'
import { formatDuration, spokenDuration } from '../internal/duration'
import { PRESENCE_LABEL, PRESENCE_ORDER, presenceCountLabel, toPresence } from './operationsModel'

const SKELETON_ROWS = ['a', 'b', 'c', 'd']

/** Marcador de presencia: cada estado tiene su forma (punto, cuadrado, triángulo, anillo, raya). */
function PresenceMarker({ presence }: { presence: AgentPresenceState['presence'] }) {
  return <span className={cx('gcu-presence', `gcu-presence--${presence}`)} aria-hidden="true" />
}

function AgentBody({ agent, long }: { agent: AgentPresenceState; long: boolean }) {
  return (
    <>
      <Person name={agent.name} src={agent.src ?? null} meta={agent.detail ?? agent.queue} />
      <span className="gcu-agent__state">
        <PresenceMarker presence={agent.presence} />
        <span className="gcu-agent__presence">{PRESENCE_LABEL[agent.presence]}</span>
      </span>
      <span
        className={cx('gcu-agent__time', 'gcu-tabular', long && 'gcu-agent__time--long')}
        title="Tiempo en el estado actual"
      >
        <span aria-hidden="true">{formatDuration(agent.since)}</span>
        <span className="visually-hidden">{`${spokenDuration(agent.since)} en el estado${long ? ', sobre lo esperado' : ''}`}</span>
      </span>
    </>
  )
}

/**
 * AgentStatusBoard — presencia en vivo de los agentes, agrupada por estado.
 *
 * - Cada estado lleva forma + texto: disponible (punto), en llamada (cuadrado), post llamada
 *   (triángulo), en pausa (anillo) y desconectado (raya). Se entiende en escala de grises.
 * - Conteo por estado arriba; el tiempo en el estado se marca largo desde `longPauseAfter`
 *   (pausa) y `longCallAfter` (llamada), con texto para lectores de pantalla.
 * - onSelect: cada agente es un botón; sin él, una fila de solo lectura.
 * Estilos: src/styles/components/agent-status-board.css.
 */
export const AgentStatusBoard = /* @__PURE__ */ forwardRef<HTMLDivElement, AgentStatusBoardProps>(function AgentStatusBoard({
  agents,
  onSelect,
  longPauseAfter = 900,
  longCallAfter = 600,
  label = 'Agentes por estado',
  loading = false,
  empty,
  className,
  ...rest
}, ref) {
  const list = (isArray(agents) ? agents : []).filter((agent) => {
    const known = toPresence(agent.presence) !== undefined
    if (!known) log.warn(`AgentStatusBoard: estado desconocido "${String(agent.presence)}" para ${agent.id}; se omite.`)
    return known
  })
  const sorted = [...list].sort((a, b) => PRESENCE_ORDER.indexOf(a.presence) - PRESENCE_ORDER.indexOf(b.presence))
  const isLong = (agent: AgentPresenceState) => (
    (agent.presence === 'en_pausa' && agent.since >= longPauseAfter) || (agent.presence === 'en_llamada' && agent.since >= longCallAfter)
  )
  const selectable = isFunction(onSelect)

  return (
    <div {...rest} ref={ref} className={cx('gcu-agents', className)} aria-busy={loading || undefined} role="region" aria-label={label}>
      <ul className="gcu-agents__summary" aria-label="Conteo por estado">
        <li className="gcu-agents__total gcu-tabular">{loading ? 'Cargando agentes…' : `${list.length} agentes`}</li>
        {!loading && PRESENCE_ORDER.map((presence) => {
          const count = list.filter((agent) => agent.presence === presence).length
          if (count === 0) return null
          return (
            <li key={presence} className="gcu-agents__count gcu-tabular">
              <PresenceMarker presence={presence} />
              {presenceCountLabel(presence, count)}
            </li>
          )
        })}
      </ul>
      {loading ? (
        <div className="gcu-agents__grid">
          {SKELETON_ROWS.map((key) => <span key={key} className="gcu-skeleton gcu-agents__skeleton" />)}
        </div>
      ) : sorted.length === 0 ? (
        <p className="gcu-agents__empty" role="status">
          {empty ?? 'No hay agentes conectados en esta cola. Revisa el filtro de equipo o de turno.'}
        </p>
      ) : (
        <ul className="gcu-agents__grid">
          {sorted.map((agent) => (
            <li key={agent.id} className="gcu-agents__item">
              {selectable ? (
                <button type="button" className="gcu-agent gcu-agent--action" onClick={() => onSelect?.(agent)}>
                  <AgentBody agent={agent} long={isLong(agent)} />
                </button>
              ) : (
                <div className="gcu-agent">
                  <AgentBody agent={agent} long={isLong(agent)} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
})
