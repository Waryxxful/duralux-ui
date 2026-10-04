import { forwardRef } from 'react'
import { normalizeProgress } from './internal/progress.js'
import { cx } from '../../utils/cx'
import { formatPercent } from '../../utils/format'
import { isFiniteNumber, isString } from '../../utils/typeGuards'
import type { ProgressRingProps } from '../../public/types'

const DEFAULT_PROGRESS_COLOR = 'var(--gcu-primary-text)'
const MAX_RING_SIZE = 1000

function positiveFinite(value: number | string | null | undefined, fallback: number, maximum = MAX_RING_SIZE): number {
  try {
    const number = Number(value)
    return isFiniteNumber(number) && number > 0 ? Math.min(number, maximum) : fallback
  } catch {
    return fallback
  }
}

/**
 * ProgressRing — anillo de progreso SVG con `role="progressbar"` y valor en texto.
 *
 * - value / max: normalizados; `aria-valuetext` y la etiqueta central dicen «N %».
 * - size / stroke: diámetro y grosor en px (acotados).
 * - color: trazo del progreso (token; default `--gcu-primary-text`).
 * - label / labelColor: texto central (default el porcentaje, cifras tabulares).
 */
export const ProgressRing = forwardRef<HTMLDivElement, ProgressRingProps>(function ProgressRing({
  value = 0,
  max = 100,
  size = 80,
  stroke = 8,
  color = DEFAULT_PROGRESS_COLOR,
  label,
  labelColor = 'var(--gcu-text)',
  className = '',
  style,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  ...rest
}, ref) {
  const normalized = normalizeProgress(value, max)
  const safeSize = positiveFinite(size, 80)
  const safeStroke = Math.min(positiveFinite(stroke, 8), safeSize / 2)
  const radius = (safeSize - safeStroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (normalized.percentage / 100) * circumference
  const percentText = formatPercent(normalized.percentage)
  const visibleLabel = label ?? percentText
  const labelText = isString(label) || isFiniteNumber(label) ? String(label).trim() : ''
  const accessibleName = labelText || percentText

  return (
    <div
      {...rest}
      ref={ref}
      className={cx('gcu-progress-ring', className)}
      style={style}
      role="progressbar"
      aria-valuenow={normalized.value}
      aria-valuemin={0}
      aria-valuemax={normalized.max}
      aria-valuetext={percentText}
      aria-label={ariaLabel !== undefined ? ariaLabel : ariaLabelledBy !== undefined ? undefined : accessibleName}
      aria-labelledby={ariaLabelledBy}
    >
      <svg className="gcu-progress-ring__svg" width={safeSize} height={safeSize} aria-hidden="true" focusable="false">
        <circle className="gcu-progress-ring__track" cx={safeSize / 2} cy={safeSize / 2} r={radius} fill="none" strokeWidth={safeStroke} />
        <circle
          className="gcu-progress-ring__indicator"
          cx={safeSize / 2}
          cy={safeSize / 2}
          r={radius}
          fill="none"
          stroke={color || DEFAULT_PROGRESS_COLOR}
          strokeWidth={safeStroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="gcu-progress-ring__label" style={{ fontSize: safeSize * 0.22, color: labelColor }}>
        {visibleLabel}
      </span>
    </div>
  )
})
