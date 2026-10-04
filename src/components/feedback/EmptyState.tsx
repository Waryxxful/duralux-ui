import { forwardRef } from 'react'
import { cx } from '../../utils/cx'
import { renderIconSlot } from '../../utils/iconSlot'
import type { EmptyStateProps } from '../../public/types'

/**
 * EmptyState — qué pasó y qué hacer cuando no hay datos: ícono, título, una línea de
 * explicación y la acción siguiente. Nunca una tabla o lista vacía muda.
 *
 * - icon: nombre Feather (`"inbox"`) o icono Tabler (`<IconInbox />`).
 * - action / secondaryAction: acción siguiente (primaria) y alternativa.
 * - compact: menos aire vertical (dentro de cards o celdas de tabla).
 * Las acciones se apilan en contenedores angostos y van en fila desde 28rem (container query).
 */
export const EmptyState = /* @__PURE__ */ forwardRef<HTMLDivElement, EmptyStateProps>(function EmptyState({
  icon = 'inbox',
  title = 'No hay elementos todavía',
  message = 'Cuando haya elementos disponibles, aparecerán aquí.',
  action,
  secondaryAction,
  compact = false,
  className,
  ...rest
}, ref) {
  const iconNode = renderIconSlot(icon, { size: 'lg' })
  const hasActions = Boolean(action || secondaryAction)
  return (
    <div {...rest} ref={ref} className={cx('gcu-state', 'gcu-state--empty', compact && 'gcu-state--compact', className)}>
      {iconNode && <span className="gcu-state__icon">{iconNode}</span>}
      {title && <p className="gcu-state__title">{title}</p>}
      {message && <p className="gcu-state__message">{message}</p>}
      {hasActions && (
        <div className="gcu-state__actions">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  )
})
