import { forwardRef } from 'react'
import { cx } from '../../utils/cx'
import { log } from '../../utils/log'
import { isArray, isFiniteNumber, isString } from '../../utils/typeGuards'
import { ProcessSteps } from '../composition/ProcessSteps'
import type { StatusTrackerProps } from '../../public/types'

function stageText(label: unknown): string {
  return isString(label) ? label : ''
}

/**
 * StatusTracker — avance de una operación larga por etapas (en cola → procesando → indexando → listo).
 *
 * - Una sola frase en `role="status"` («Etapa 2 de 4: Procesando» + detalle): los lectores de
 *   pantalla oyen el cambio, no toda la lista otra vez.
 * - La lista de etapas reutiliza ProcessSteps (vertical), con estado en texto por etapa.
 * - minimal: solo la frase y una barra de avance (`role="progressbar"`).
 * Estilos: src/styles/components/ai-status-tracker.css.
 */
export const StatusTracker = /* @__PURE__ */ forwardRef<HTMLDivElement, StatusTrackerProps>(function StatusTracker({
  stages,
  current,
  failed = false,
  detail,
  minimal = false,
  label,
  className,
  ...rest
}, ref) {
  const list = isArray(stages) ? stages : []
  if (!isArray(stages)) log.warn('StatusTracker: `stages` debe ser un arreglo; se muestra vacío.')
  if (!isFiniteNumber(current)) log.warn(`StatusTracker: current debe ser un número (recibido: ${String(current)}).`)
  const index = Math.max(0, Math.min(list.length, isFiniteNumber(current) ? Math.trunc(current) : 0))
  const finished = list.length > 0 && index >= list.length
  const stage = list[Math.min(index, list.length - 1)]
  const name = stage ? stageText(stage.label) : ''
  const sentence = finished
    ? 'Listo: todas las etapas terminaron.'
    : failed
      ? `Falló la etapa ${index + 1} de ${list.length}${name ? `: ${name}` : ''}.`
      : `Etapa ${index + 1} de ${list.length}${name ? `: ${name}` : ''}.`
  const percent = list.length ? Math.round((index / list.length) * 100) : 0

  return (
    <div {...rest} ref={ref} className={cx('gcu-ai-tracker', minimal && 'gcu-ai-tracker--minimal', failed && 'gcu-ai-tracker--failed', className)}>
      <p className="gcu-ai-tracker__status" role="status">
        <span className="gcu-ai-tracker__sentence gcu-tabular">{sentence}</span>
        {detail !== undefined && detail !== null && <span className="gcu-ai-tracker__detail"> {detail}</span>}
      </p>
      {minimal ? (
        <div className="gcu-ai-tracker__bar" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
          <span className="gcu-ai-tracker__fill" style={{ inlineSize: `${percent}%` }} />
        </div>
      ) : (
        <ProcessSteps
          label={label}
          orientation="vertical"
          current={index}
          failed={failed}
          steps={list.map((item) => ({ key: item.key, label: item.label }))}
        />
      )}
    </div>
  )
})
