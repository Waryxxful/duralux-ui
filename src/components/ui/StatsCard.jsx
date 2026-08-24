import { normalizeProgress } from './internal/progress.js'
import { isFiniteNumber, isFunction, isString } from '../../utils/typeGuards'

/**
 * StatsCard — tarjeta KPI con ícono, número, label y progreso/trend.
 *
 * Estilos: scss/themes/components/_widgets-ui.scss (`.gcu-stats-card`).
 * Dark: soft iconBg gana a html.app-skin-dark .avatar-text.
 *
 * Props:
 *   icon      — feather class string, e.g. "feather-dollar-sign"
 *   iconBg    — background class, e.g. "bg-gray-200" | "bg-soft-primary text-primary"
 *   value     — string or number to display big
 *   label     — description text
 *   trend     — { value: "36.85%", up: true } (optional)
 *   progress  — { value: 56, color: "primary", label? } (optional bar)
 *   footer    — link text shown below the card
 *   onFooter  — click handler for footer link
 */
export function StatsCard({
  icon,
  iconBg = 'bg-gray-200',
  value,
  label,
  trend = undefined,
  progress = undefined,
  footer = undefined,
  onFooter = undefined,
}) {
  const hasFooterAction = isFunction(onFooter)
  const hasFooter = footer !== undefined && footer !== null && footer !== false
  const normalizedProgress = progress
    ? normalizeProgress(progress.value, progress.max)
    : null
  const progressLabel = progress && (isString(progress.label) || isFiniteNumber(progress.label))
    ? String(progress.label).trim()
    : ''

  return (
    <div className="card stretch stretch-full gcu-stats-card">
      <div className="card-body">
        <div className="d-flex align-items-start justify-content-between mb-4">
          <div className="d-flex gap-4 align-items-center">
            <div className={`avatar-text avatar-lg ${iconBg}`}>
              <i className={icon} aria-hidden="true"></i>
            </div>
            <div>
              <div className="fs-4 fw-bold text-dark">{value}</div>
              <h3 className="fs-13 fw-semibold text-truncate-1-line">{label}</h3>
            </div>
          </div>
          {trend && (
            <div
              className={`badge bg-soft-${trend.up ? 'success' : 'danger'} text-${trend.up ? 'success' : 'danger'}`}
              aria-label={`${trend.up ? 'Sube' : 'Baja'} ${trend.value}`}
            >
              <i className={`feather-arrow-${trend.up ? 'up' : 'down'} fs-10 me-1`} aria-hidden="true"></i>
              <span aria-hidden="true">{trend.value}</span>
            </div>
          )}
        </div>

        {progress && normalizedProgress && (
          <div className="pt-2">
            <div className="d-flex align-items-center justify-content-between mb-1">
              <span className="fs-12 text-muted">{progress.label}</span>
              <span className="fs-12 text-dark">{Math.round(normalizedProgress.percentage)}%</span>
            </div>
            <div className="progress ht-3">
              <div
                className={`progress-bar bg-${progress.color || 'primary'}`}
                style={{ width: `${normalizedProgress.percentage}%` }}
                role="progressbar"
                aria-valuenow={normalizedProgress.value}
                aria-valuemin={0}
                aria-valuemax={normalizedProgress.max}
                aria-label={progressLabel || `${Math.round(normalizedProgress.value)} de ${normalizedProgress.max}`}
              ></div>
            </div>
          </div>
        )}
      </div>
      {hasFooter && (
        hasFooterAction
          ? (
            <button
              type="button"
              className="card-footer btn border-0 fs-11 fw-bold text-uppercase text-center py-4 gcu-stats-card__footer"
              onClick={onFooter}
            >
              {footer}
            </button>
          )
          : (
            <div className="card-footer fs-11 fw-bold text-uppercase text-center py-4 gcu-stats-card__footer">
              {footer}
            </div>
          )
      )}
    </div>
  )
}
