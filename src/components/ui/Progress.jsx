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
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  const accessibleName =
    (label && String(label).trim()) ||
    `${Math.round(Number(value))} de ${max}`

  const barClasses = [
    'progress-bar',
    `bg-${variant}`,
    striped ? 'progress-bar-striped' : '',
    animated ? 'progress-bar-animated' : '',
  ].filter(Boolean).join(' ')

  return (
    <div
      className={['progress', className].filter(Boolean).join(' ')}
      style={height ? { height } : undefined}
    >
      <div
        className={barClasses}
        role="progressbar"
        style={{ width: `${pct}%` }}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={accessibleName}
      >
        {showValue ? `${Math.round(pct)}%` : null}
      </div>
    </div>
  )
}
