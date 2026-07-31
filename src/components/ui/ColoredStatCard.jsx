/**
 * ColoredStatCard — tarjeta de estadística con fondo de color sólido.
 *
 * Patrón Duralux v2 (SocilMediaStatistics / StatusMiscellaneous headers).
 * Estilos: scss/themes/components/_widgets-ui.scss (`.gcu-colored-stat`).
 * Dark: `html.app-skin-dark` (ThemeProvider) — el vidrio blanco semitransparente
 * se mantiene sobre el color sólido; no depende de .bg-white / .avatar-text
 * genéricos (el theme los pinta sólidos en light y dark).
 *
 * Props:
 *   icon     — feather class string
 *   value    — número/texto principal
 *   label    — etiqueta
 *   trend    — string e.g. "+12%"
 *   trendUp  — boolean
 *   bg       — clase de color: "bg-primary" | "bg-success" | "bg-warning" | "bg-danger" | "bg-info" | "bg-teal"
 *   chart    — JSX de un mini gráfico opcional (abajo del card)
 */
export function ColoredStatCard({ icon, value, label, trend, trendUp, bg = 'bg-primary', chart }) {
  return (
    <div className={`card stretch stretch-full gcu-colored-stat ${bg} text-white`}>
      <div className="card-body">
        <div className="d-flex align-items-start justify-content-between mb-3">
          <div>
            {trend && (
              <span className="badge gcu-colored-stat__glass mb-2">
                <i className={`feather-arrow-${trendUp ? 'up' : 'down'} me-1 fs-10`}></i>
                {trend}
              </span>
            )}
            <div className="fs-4 fw-bolder">{value}</div>
            <p className="fs-13 mb-0 opacity-75">{label}</p>
          </div>
          {icon && (
            <div className="avatar-text avatar-lg gcu-colored-stat__glass">
              <i className={icon}></i>
            </div>
          )}
        </div>
      </div>
      {chart && <div className="pb-0">{chart}</div>}
    </div>
  )
}
