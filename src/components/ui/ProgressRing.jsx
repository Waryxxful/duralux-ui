import { normalizeProgress } from './internal/progress.js'
import { isFiniteNumber, isString } from '../../utils/typeGuards'

const DEFAULT_PROGRESS_COLOR = 'var(--gcu-primary, #3454d1)'
const MAX_RING_SIZE = 1000

function positiveFinite(value, fallback, maximum = MAX_RING_SIZE) {
  try {
    const number = Number(value)
    return isFiniteNumber(number) && number > 0
      ? Math.min(number, maximum)
      : fallback
  } catch {
    return fallback
  }
}

/**
 * ProgressRing — anillo de progreso SVG circular.
 *
 * Props:
 *   value   — valor actual
 *   max     — valor máximo (default 100)
 *   size    — diámetro en px (default 80)
 *   stroke  — grosor del trazo (default 8)
 *   color   — color del progreso (default $primary)
 *   label   — texto central (default muestra el porcentaje)
 */
export function ProgressRing({
  value = 0,
  max = 100,
  size = 80,
  stroke = 8,
  color = DEFAULT_PROGRESS_COLOR,
  label,
  className = '',
  style,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  ...rest
}) {
  const normalized = normalizeProgress(value, max)
  const safeSize = positiveFinite(size, 80)
  const safeStroke = Math.min(positiveFinite(stroke, 8), safeSize / 2)
  const radius = (safeSize - safeStroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (normalized.percentage / 100) * circumference
  const visibleLabel = label ?? `${Math.round(normalized.percentage)}%`
  const indicatorColor = color || DEFAULT_PROGRESS_COLOR
  const labelText = isString(label) || isFiniteNumber(label)
    ? String(label).trim()
    : ''
  const accessibleName = labelText || `${Math.round(normalized.percentage)}%`

  return (
    <div
      {...rest}
      className={['position-relative d-inline-flex align-items-center justify-content-center', className].filter(Boolean).join(' ')}
      style={style}
      role="progressbar"
      aria-valuenow={normalized.value}
      aria-valuemin={0}
      aria-valuemax={normalized.max}
      aria-label={ariaLabel !== undefined ? ariaLabel : ariaLabelledBy !== undefined ? undefined : accessibleName}
      aria-labelledby={ariaLabelledBy}
    >
      <svg width={safeSize} height={safeSize} style={{ transform: 'rotate(-90deg)' }} aria-hidden="true" focusable="false">
        <circle cx={safeSize / 2} cy={safeSize / 2} r={radius} fill="none" stroke="var(--gcu-border, #eff0f6)" strokeWidth={safeStroke} />
        <circle
          className="gcu-progress-ring__indicator"
          cx={safeSize / 2}
          cy={safeSize / 2}
          r={radius}
          fill="none"
          stroke={indicatorColor}
          strokeWidth={safeStroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span
        className="position-absolute fw-bold"
        style={{ fontSize: safeSize * 0.22, color: indicatorColor }}
      >
        {visibleLabel}
      </span>
    </div>
  )
}
