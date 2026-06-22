/**
 * ColoredStatCard — tarjeta de estadística con fondo de color sólido.
 *
 * Props:
 *   icon     — feather class string
 *   value    — número/texto principal
 *   label    — etiqueta
 *   trend    — string e.g. "+12%"
 *   trendUp  — boolean
 *   bg       — clase de color: "bg-primary" | "bg-success" | "bg-warning" | "bg-danger" | "bg-info"
 *   chart    — JSX de un mini gráfico opcional (abajo del card)
 */
export function ColoredStatCard({ icon, value, label, trend, trendUp, bg = 'bg-primary', chart }) {
  return (
    <div className={`card stretch stretch-full ${bg} text-white`}>
      <div className="card-body">
        <div className="d-flex align-items-start justify-content-between mb-3">
          <div>
            {trend && (
              <span className="badge bg-white bg-opacity-25 text-white mb-2">
                <i className={`feather-arrow-${trendUp ? 'up' : 'down'} me-1 fs-10`}></i>
                {trend}
              </span>
            )}
            <div className="fs-4 fw-bolder">{value}</div>
            <p className="fs-13 mb-0 opacity-75">{label}</p>
          </div>
          {icon && (
            <div className="avatar-text avatar-lg bg-white bg-opacity-25 text-white">
              <i className={icon}></i>
            </div>
          )}
        </div>
      </div>
      {chart && <div className="pb-0">{chart}</div>}
    </div>
  )
}
