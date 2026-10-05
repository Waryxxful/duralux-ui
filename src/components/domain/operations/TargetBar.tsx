import { forwardRef, useId } from 'react'
import { cx } from '../../../utils/cx'
import { log } from '../../../utils/log'
import { isFiniteNumber } from '../../../utils/typeGuards'
import type { TargetBarProps } from '../../../public/types'
import { formatPercent } from '../../../utils/format'
import { Severity } from '../../ui/Severity'
import { TARGET_SEVERITY, scalePercent, targetStatus, targetStatusLabel } from './operationsModel'

/**
 * TargetBar — cifra contra su meta: barra con la marca de la meta, valor tabular y estado
 * en texto con forma (Severity): «Cumple la meta», «Cerca del umbral», «Bajo la meta».
 *
 * - higherIsWorse: abandono, TMO, tiempo en cola; la meta es un máximo («Sobre el máximo»).
 * - warningMargin: banda de advertencia como fracción de la meta (10 % por defecto).
 * - `role="meter"` con nombre (la etiqueta) y `aria-valuetext` («72 %, meta 80 %, bajo la meta»).
 * Estilos: src/styles/components/target-bar.css.
 */
export const TargetBar = /* @__PURE__ */ forwardRef<HTMLDivElement, TargetBarProps>(function TargetBar({
  label,
  value,
  target,
  max: maxProp = 100,
  higherIsWorse = false,
  warningMargin = 0.1,
  format = formatPercent,
  hint,
  className,
  ...rest
}, ref) {
  const labelId = useId()
  const max = isFiniteNumber(maxProp) && maxProp > 0 ? maxProp : 100
  if (max !== maxProp) log.warn(`TargetBar: max debe ser mayor que 0 (recibido: ${String(maxProp)}); se usa 100.`)
  const safeValue = isFiniteNumber(value) ? value : 0
  if (!isFiniteNumber(value)) log.warn(`TargetBar: valor no numérico "${String(value)}"; se muestra 0.`)
  const status = targetStatus(safeValue, target, higherIsWorse, warningMargin)
  const statusText = targetStatusLabel(status, higherIsWorse)
  const goalWord = higherIsWorse ? 'máximo' : 'meta'

  return (
    <div {...rest} ref={ref} className={cx('gcu-target', `gcu-target--${status}`, className)} data-status={status}>
      <div className="gcu-target__head">
        <span id={labelId} className="gcu-target__label">{label}</span>
        <span className="gcu-target__value gcu-tabular">{format(safeValue)}</span>
      </div>
      <div
        className="gcu-target__track"
        role="meter"
        aria-labelledby={labelId}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={Math.min(max, Math.max(0, safeValue))}
        aria-valuetext={`${format(safeValue)}, ${goalWord} ${format(target)}, ${statusText.toLowerCase()}`}
      >
        <span className="gcu-target__fill" style={{ width: `${scalePercent(safeValue, max)}%` }} />
        <span className="gcu-target__goal" style={{ insetInlineStart: `${scalePercent(target, max)}%` }} aria-hidden="true" />
      </div>
      <div className="gcu-target__foot">
        <Severity level={TARGET_SEVERITY[status]} label={statusText} size="sm" />
        <span className="gcu-target__goal-text gcu-tabular">
          {higherIsWorse ? 'Máximo' : 'Meta'} {format(target)}
        </span>
        {hint && <span className="gcu-target__hint">{hint}</span>}
      </div>
    </div>
  )
})
