import { forwardRef } from 'react'
import { normalizeProgress } from './internal/progress.js'
import { resolveTone } from './internal/tones'
import { cx } from '../../utils/cx'
import { formatPercent } from '../../utils/format'
import { isFiniteNumber, isString } from '../../utils/typeGuards'
import type { ProgressProps } from '../../public/types'

const CSS_LENGTH_PATTERN = /^(?:0|(?:\d+|\d*\.\d+)(?:px|rem|em|ex|ch|vw|vh|vmin|vmax|cm|mm|in|pt|pc|%))$/i

function normalizeHeight(height: number | string | null | undefined): number | string | undefined {
  if (height === undefined || height === null || height === '') return undefined
  if (isFiniteNumber(height)) return height >= 0 ? height : undefined
  if (!isString(height)) return undefined
  const value = height.trim()
  return CSS_LENGTH_PATTERN.test(value) ? value : undefined
}

/**
 * Progress — barra de progreso con `role="progressbar"` y valor en texto.
 *
 * - value / max: se normalizan (finitos, acotados) para la barra y ARIA.
 * - variant: tono de la barra; relleno `--gcu-status-{tono}` (AA con el valor visible).
 * - label: nombre accesible; si se omite se genera «N de M». No se pinta.
 * - showValue: muestra el porcentaje («84 %», cifras tabulares) dentro de la barra.
 * - striped / animated / height: como Bootstrap; la animación respeta reduced-motion.
 */
export const Progress = forwardRef<HTMLDivElement, ProgressProps>(function Progress({
  value,
  max = 100,
  variant = 'primary',
  striped,
  animated,
  label,
  showValue,
  height,
  className,
  style,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  ...rest
}, ref) {
  const normalized = normalizeProgress(value, max)
  const { tone } = resolveTone(variant, 'Progress')
  const safeHeight = normalizeHeight(height)
  const labelText = isString(label) || isFiniteNumber(label) ? String(label).trim() : ''
  const accessibleName = labelText || `${Math.round(normalized.value)} de ${normalized.max}`
  const computedAriaLabel = ariaLabel !== undefined
    ? ariaLabel
    : ariaLabelledBy !== undefined ? undefined : accessibleName
  const percentText = formatPercent(normalized.percentage)

  return (
    <div
      {...rest}
      ref={ref}
      className={cx('progress', 'gcu-progress', className)}
      style={safeHeight !== undefined ? { ...(style || {}), height: safeHeight } : style}
    >
      <div
        className={cx(
          'progress-bar',
          'gcu-progress__bar',
          `gcu-progress__bar--${tone}`,
          striped && 'progress-bar-striped',
          animated && 'progress-bar-animated',
        )}
        role="progressbar"
        style={{ width: `${normalized.percentage}%` }}
        aria-valuenow={normalized.value}
        aria-valuemin={0}
        aria-valuemax={normalized.max}
        aria-valuetext={percentText}
        aria-label={computedAriaLabel}
        aria-labelledby={ariaLabelledBy}
      >
        {showValue ? percentText : null}
      </div>
    </div>
  )
})
