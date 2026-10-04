import { forwardRef, useId } from 'react'
import type * as React from 'react'
import { cx } from '../../utils/cx'
import { log } from '../../utils/log'
import { isFunction } from '../../utils/typeGuards'
import type { ConnectionCardProps } from '../../public/types'

/**
 * ConnectionCard — integración con switch on/off (markup de duralux-admin/customers-view.html,
 * sección .development-connections), con superficie y borde punteado desde tokens.
 *
 * - El switch se nombra con «Activar conexión» + el título de la integración.
 * - disabledReason: explica por qué está deshabilitado (aria-describedby).
 * - Responde a su contenedor: en celdas angostas la descripción ocupa dos líneas en vez de truncarse.
 * Estilos: src/styles/components/connection-card.css (el switch usa form-check.css).
 */
export const ConnectionCard = /* @__PURE__ */ forwardRef<HTMLDivElement, ConnectionCardProps>(function ConnectionCard({
  icon,
  title,
  description,
  checked,
  onChange,
  disabled,
  disabledReason,
  className,
  ...rest
}, ref) {
  const titleId = useId()
  const switchId = useId()
  const switchLabelId = useId()
  const reasonId = useId()
  const hasReason = Boolean(disabled) && disabledReason !== undefined && disabledReason !== null && disabledReason !== ''

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isFunction(onChange)) onChange(event.target.checked)
    else log.error('ConnectionCard: falta `onChange`; el switch no puede cambiar de estado.')
  }

  return (
    <div {...rest} ref={ref} className={cx('gcu-connection-card', 'gcu-container', className)}>
      <div className="gcu-connection-card__inner">
        <div className="gcu-connection-card__main">
          <div className="gcu-connection-card__icon">{icon}</div>
          <div className="gcu-connection-card__text">
            <div id={titleId} className="gcu-connection-card__title">{title}</div>
            {description != null && <div className="gcu-connection-card__description">{description}</div>}
            {hasReason && <p id={reasonId} className="gcu-connection-card__reason">{disabledReason}</p>}
          </div>
        </div>
        <div className="form-check form-switch form-switch-sm gcu-connection-card__switch">
          <label id={switchLabelId} className="form-check-label c-pointer" htmlFor={switchId}>
            <span className="visually-hidden">Activar conexión</span>
          </label>
          <input
            className="form-check-input c-pointer"
            type="checkbox"
            id={switchId}
            checked={checked}
            disabled={disabled}
            aria-labelledby={`${switchLabelId} ${titleId}`}
            aria-describedby={hasReason ? reasonId : undefined}
            onChange={handleChange}
          />
        </div>
      </div>
    </div>
  )
})
