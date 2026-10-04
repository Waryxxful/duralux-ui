import { forwardRef } from 'react'
import { cx } from '../../utils/cx'
import { log } from '../../utils/log'
import type { SeverityProps } from '../../public/types'
import { SEVERITY_LABEL, toSeverityLevel } from './internal/severity'

/**
 * Severity — marcador de severidad cuya forma dice lo mismo que el color:
 * rombo (crítico), anillo (advertencia) y punto (normal). Se entiende en escala de grises.
 *
 * - label: texto visible («SLA vencido»); por defecto el nombre del nivel. Con `label={false}`
 *   queda solo el marcador, como imagen con nombre accesible (para celdas muy angostas).
 * - Úsalo con `severityOf(valor, umbrales)` para derivar el nivel de una cifra.
 * Estilos: src/styles/components/severity.css.
 */
export const Severity = /* @__PURE__ */ forwardRef<HTMLSpanElement, SeverityProps>(function Severity({
  level,
  label,
  size = 'md',
  className,
  ...rest
}, ref) {
  const resolvedLevel = toSeverityLevel(level) ?? 'normal'
  if (resolvedLevel !== level) log.warn(`Severity: nivel desconocido "${String(level)}"; se usa "normal".`)
  const levelName = SEVERITY_LABEL[resolvedLevel]
  const markerOnly = label === false
  const text = markerOnly ? null : (label ?? levelName)

  return (
    <span
      role={markerOnly ? 'img' : undefined}
      aria-label={markerOnly ? levelName : undefined}
      {...rest}
      ref={ref}
      className={cx('gcu-severity', `gcu-severity--${resolvedLevel}`, `gcu-severity--${size}`, className)}
      data-level={resolvedLevel}
    >
      <span className="gcu-severity__marker" aria-hidden="true" />
      {text !== null && (
        <span className="gcu-severity__label">
          {label !== undefined && <span className="visually-hidden">{levelName}: </span>}
          {text}
        </span>
      )}
    </span>
  )
})
