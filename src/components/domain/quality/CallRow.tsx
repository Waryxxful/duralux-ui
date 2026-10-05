import { forwardRef } from 'react'
import { cx } from '../../../utils/cx'
import { isFiniteNumber } from '../../../utils/typeGuards'
import type { CallRowProps } from '../../../public/types'
import { Score } from '../../ui/Score'
import { Severity } from '../../ui/Severity'
import { CALL_SEVERITY_LABEL, callSeverity } from './qualityModel'

/**
 * CallRow — una llamada de la bandeja de calidad: severidad (forma + texto), agente, #ID,
 * origen · foco · fecha, resumen y puntaje (anulado si hay error grave).
 *
 * - Es una opción (`role="option"`) de CallList, que maneja el foco itinerante y la selección.
 *   Fuera de CallList usa List o una tabla.
 * - waitDays: días esperando revisión, en texto («3 d en espera»).
 * Estilos: src/styles/components/call-list.css.
 */
export const CallRow = /* @__PURE__ */ forwardRef<HTMLDivElement, CallRowProps>(function CallRow({
  call,
  active = false,
  onSelect,
  threshold = 50,
  className,
  onClick,
  ...rest
}, ref) {
  const level = callSeverity(call, threshold)
  const meta = [call.source, call.focus, call.date].filter(Boolean).join(' · ')

  return (
    <div
      tabIndex={active ? 0 : -1}
      {...rest}
      ref={ref}
      role="option"
      aria-selected={active}
      className={cx('gcu-call-row', active && 'gcu-call-row--active', `gcu-call-row--${level}`, className)}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) onSelect?.(call.id)
      }}
    >
      <span className="gcu-call-row__marker">
        <Severity level={level} label={false} size="sm" title={CALL_SEVERITY_LABEL[level]} />
      </span>
      <span className="gcu-call-row__main">
        <span className="gcu-call-row__top">
          <span className="gcu-call-row__agent" title={call.agent}>{call.agent}</span>
          <span className="gcu-call-row__id gcu-tabular">#{call.id}</span>
        </span>
        {meta && <span className="gcu-call-row__meta">{meta}</span>}
        {call.summary && <span className="gcu-call-row__summary">{call.summary}</span>}
      </span>
      <span className="gcu-call-row__end">
        <Score value={call.score} voided={call.critical} size="sm" />
        {isFiniteNumber(call.waitDays) && call.waitDays > 0 && (
          <span className="gcu-call-row__wait gcu-tabular">{call.waitDays} d en espera</span>
        )}
      </span>
    </div>
  )
})
