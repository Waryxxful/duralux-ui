import { forwardRef, useEffect, useRef } from 'react'
import { cx } from '../../../utils/cx'
import { assignRef } from '../../../utils/assignRef'
import { isArray, isFiniteNumber, isFunction } from '../../../utils/typeGuards'
import type { TranscriptProps } from '../../../public/types'
import { formatDuration } from '../internal/duration'
import { splitHighlights } from './qualityModel'

const SKELETON_TURNS = ['a', 'b', 'c', 'd']

/**
 * Transcript — conversación por turnos (agente / cliente) con marca de tiempo y resaltado.
 *
 * - Cada turno dice quién habla en texto, no solo por lado o color.
 * - at: segundo del turno (m:ss). Con `onSeek` la marca es un botón que salta el audio.
 * - flagged: turno citado por un criterio; se marca («Turno citado») y se desplaza a la vista
 *   dentro del recuadro (nunca desplaza la página).
 * - highlight: términos resaltados con `<mark>`.
 * Estilos: src/styles/components/transcript.css.
 */
export const Transcript = /* @__PURE__ */ forwardRef<HTMLDivElement, TranscriptProps>(function Transcript({
  turns,
  flagged = null,
  highlight,
  agentLabel = 'Agente',
  clientLabel = 'Cliente',
  onSeek,
  maxHeight = '35rem',
  label = 'Transcripción',
  loading = false,
  className,
  style,
  ...rest
}, ref) {
  const box = useRef<HTMLDivElement | null>(null)
  const list = isArray(turns) ? turns : []

  useEffect(() => {
    if (!isFiniteNumber(flagged)) return
    const container = box.current
    const turn = container?.querySelector<HTMLElement>(`[data-turn="${flagged}"]`)
    if (!container || !turn) return
    // Desplaza solo dentro del recuadro: scrollIntoView movería también la página.
    container.scrollTo({ top: turn.offsetTop - container.clientHeight / 3, behavior: 'smooth' })
  }, [flagged])

  return (
    <div
      {...rest}
      ref={(node) => {
        box.current = node
        assignRef(ref, node)
      }}
      role="region"
      aria-label={label}
      aria-busy={loading || undefined}
      tabIndex={0}
      className={cx('gcu-transcript', 'gcu-scroll', className)}
      style={{ maxHeight, ...style }}
    >
      {loading ? (
        <div className="gcu-transcript__list">
          {SKELETON_TURNS.map((key) => <span key={key} className="gcu-skeleton gcu-transcript__skeleton" />)}
        </div>
      ) : list.length === 0 ? (
        <p className="gcu-transcript__empty">Esta llamada no tiene transcripción. Revisa el audio o vuelve a intentarlo más tarde.</p>
      ) : (
        <ol className="gcu-transcript__list">
          {list.map((turn, index) => {
            const who = turn.speaker === 'agent' ? agentLabel : clientLabel
            const isFlagged = flagged === index
            return (
              <li
                // El orden de los turnos es fijo: el índice es su identidad (y lo que cita un criterio).
                key={index}
                data-turn={index}
                className={cx('gcu-turn', turn.speaker === 'agent' ? 'gcu-turn--agent' : 'gcu-turn--client', isFlagged && 'gcu-turn--flagged')}
              >
                <span className="gcu-turn__head">
                  <span className="gcu-turn__who">{who}</span>
                  {isFiniteNumber(turn.at) && (isFunction(onSeek) ? (
                    <button
                      type="button"
                      className="gcu-turn__time gcu-tabular"
                      aria-label={`Ir a ${formatDuration(turn.at)}`}
                      onClick={() => {
                        if (isFiniteNumber(turn.at)) onSeek?.(turn.at)
                      }}
                    >
                      {formatDuration(turn.at)}
                    </button>
                  ) : (
                    <span className="gcu-turn__time gcu-tabular">{formatDuration(turn.at)}</span>
                  ))}
                  {isFlagged && <span className="gcu-turn__flag">Turno citado</span>}
                </span>
                <span className="gcu-turn__text">
                  {splitHighlights(turn.text, highlight).map((part, partIndex) => (
                    part.hit
                      // Tramos derivados del texto: su posición es estable mientras el texto no cambie.
                      ? <mark key={partIndex} className="gcu-turn__mark">{part.text}</mark>
                      : <span key={partIndex}>{part.text}</span>
                  ))}
                </span>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
})
