import { forwardRef } from 'react'
import { cx } from '../../utils/cx'
import { log } from '../../utils/log'
import type { AppStatus, AppStatusCardProps, SeverityLevel } from '../../public/types'
import { Severity } from '../ui/Severity'
import { hasIndicatorContent } from '../ui/internal/indicator'
import { IndicatorGlyph } from '../ui/internal/IndicatorParts'

const STATUS: Record<AppStatus, { text: string; level: SeverityLevel }> = {
  activo: { text: 'Operativa', level: 'normal' },
  montaje: { text: 'En montaje', level: 'warning' },
  caido: { text: 'Caída', level: 'critical' },
}

/**
 * AppStatusCard — estado de una app conectada del ecosistema (contrato `AppManifestEntry.estado`).
 *
 * - status `activo` | `montaje` | `caido` → «Operativa», «En montaje», «Caída» con la forma de Severity.
 * - detail: dato que da contexto al estado («Desde 16:42», «Responde en 320 ms»).
 * - action: botón o enlace (p. ej. «Ver incidente»). Angosta, el estado baja bajo el nombre.
 * Estilos: src/styles/components/app-status-card.css.
 */
export const AppStatusCard = /* @__PURE__ */ forwardRef<HTMLDivElement, AppStatusCardProps>(function AppStatusCard({
  name,
  description,
  icon,
  status,
  detail,
  action,
  className,
  ...rest
}, ref) {
  const resolved = STATUS[status] ?? STATUS.montaje
  if (!STATUS[status]) log.warn(`AppStatusCard: estado desconocido "${String(status)}"; se muestra "En montaje".`)

  return (
    <div {...rest} ref={ref} className={cx('gcu-app-status', 'gcu-container', `gcu-app-status--${status}`, className)}>
      <div className="gcu-app-status__inner">
        {icon && <span className="gcu-app-status__icon" aria-hidden="true"><IndicatorGlyph icon={icon} /></span>}
        <div className="gcu-app-status__text">
          <p className="gcu-app-status__name">{name}</p>
          {hasIndicatorContent(description) && <p className="gcu-app-status__description">{description}</p>}
        </div>
        <div className="gcu-app-status__state">
          <Severity level={resolved.level} label={resolved.text} />
          {hasIndicatorContent(detail) && <span className="gcu-app-status__detail gcu-tabular">{detail}</span>}
        </div>
        {hasIndicatorContent(action) && <div className="gcu-app-status__action">{action}</div>}
      </div>
    </div>
  )
})
