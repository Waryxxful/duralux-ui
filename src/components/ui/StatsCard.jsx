/**
 * StatsCard — tarjeta KPI con ícono, número, label y progreso/trend.
 *
 * Props:
 *   icon      — feather class string, e.g. "feather-dollar-sign"
 *   iconBg    — background class, e.g. "bg-gray-200" | "bg-primary-100"
 *   value     — string or number to display big
 *   label     — description text
 *   trend     — { value: "36.85%", up: true } (optional)
 *   progress  — { value: 56, color: "primary" } (optional bar)
 *   footer    — link text shown below the card
 *   onFooter  — click handler for footer link
 */
export function StatsCard({ icon, iconBg = 'bg-gray-200', value, label, trend, progress, footer, onFooter }) {
  return (
    <div className="card stretch stretch-full">
      <div className="card-body">
        <div className="d-flex align-items-start justify-content-between mb-4">
          <div className="d-flex gap-4 align-items-center">
            <div className={`avatar-text avatar-lg ${iconBg}`}>
              <i className={icon}></i>
            </div>
            <div>
              <div className="fs-4 fw-bold text-dark">{value}</div>
              <h3 className="fs-13 fw-semibold text-truncate-1-line">{label}</h3>
            </div>
          </div>
          {trend && (
            <span className={`fs-12 fw-semibold text-${trend.up ? 'success' : 'danger'}`}>
              <i className={`feather-arrow-${trend.up ? 'up' : 'down'} fs-10 me-1`}></i>
              {trend.value}
            </span>
          )}
        </div>

        {progress && (
          <div className="pt-2">
            <div className="d-flex align-items-center justify-content-between mb-1">
              <span className="fs-12 text-muted">{progress.label}</span>
              <span className="fs-12 text-dark">{progress.value}%</span>
            </div>
            <div className="progress ht-3">
              <div
                className={`progress-bar bg-${progress.color || 'primary'}`}
                style={{ width: `${progress.value}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
      {footer && (
        <a
          href="#"
          className="card-footer fs-11 fw-bold text-uppercase text-center py-4"
          onClick={(e) => { e.preventDefault(); onFooter?.() }}
        >
          {footer}
        </a>
      )}
    </div>
  )
}
