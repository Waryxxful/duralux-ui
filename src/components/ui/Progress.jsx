import { normalizeProgress } from './internal/progress.js'

const CSS_LENGTH_PATTERN = /^(?:0|(?:\d+|\d*\.\d+)(?:px|rem|em|ex|ch|vw|vh|vmin|vmax|cm|mm|in|pt|pc|%))$/i

function normalizeHeight(height) {
  if (height === undefined || height === null || height === '') return undefined
  if (typeof height === 'number') return Number.isFinite(height) && height >= 0 ? height : undefined
  if (typeof height !== 'string') return undefined
  const value = height.trim()
  return CSS_LENGTH_PATTERN.test(value) ? value : undefined
}

/**
 * Progress — barra de progreso Bootstrap.
 *
 * Props:
 *   value     — valor actual (requerido)
 *   max       — valor máximo (default: 100)
 *   variant   — "primary" | "secondary" | "success" | "danger" | "warning" | "info"
 *   striped   — agrega rayas a la barra
 *   animated  — anima las rayas (requiere striped)
 *   label     — nombre accesible (aria-label). Si se omite, se genera desde value/max.
 *               No se pinta como texto visible (usar showValue para el %).
 *   showValue — muestra el porcentaje dentro de la barra
 *   height    — altura en px de la barra contenedora
 *   className — clases adicionales al contenedor
 */
export function Progress({
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
}) {
  const normalized = normalizeProgress(value, max)
  const safeHeight = normalizeHeight(height)
  const labelText = typeof label === 'string' || typeof label === 'number'
    ? String(label).trim()
    : ''
  const accessibleName = labelText || `${Math.round(normalized.value)} de ${normalized.max}`
  const computedAriaLabel = ariaLabel !== undefined
    ? ariaLabel
    : ariaLabelledBy !== undefined
      ? undefined
      : accessibleName

  const barClasses = [
    'progress-bar',
    `bg-${variant}`,
    striped ? 'progress-bar-striped' : '',
    animated ? 'progress-bar-animated' : '',
  ].filter(Boolean).join(' ')

  return (
    <div
      {...rest}
      className={['progress', className].filter(Boolean).join(' ')}
      style={safeHeight !== undefined ? { ...(style || {}), height: safeHeight } : style}
    >
      <div
        className={barClasses}
        role="progressbar"
        style={{ width: `${normalized.percentage}%` }}
        aria-valuenow={normalized.value}
        aria-valuemin={0}
        aria-valuemax={normalized.max}
        aria-label={computedAriaLabel}
        aria-labelledby={ariaLabelledBy}
      >
        {showValue ? `${Math.round(normalized.percentage)}%` : null}
      </div>
    </div>
  )
}
