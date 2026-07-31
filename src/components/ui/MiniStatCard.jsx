/**
 * MiniStatCard — tarjeta estadística pequeña con borde punteado.
 * Usada en analytics / KPIs compactos (col-xxl-2 grid).
 *
 * Estilos: scss/themes/components/_widgets-ui.scss (`.gcu-mini-stat`).
 * Dark: soft-avatar gana a html.app-skin-dark .avatar-text; .text-dark
 * se reescribe a blanco vía theme-options-dark + refuerzo gcu.
 *
 * Props:
 *   icon    — feather class string o BI class
 *   value   — número/texto principal
 *   label   — etiqueta descriptiva
 *   color   — "primary" | "success" | "warning" | "danger" | "info" | "teal" | "indigo" | …
 */
export function MiniStatCard({ icon, value, label, color = 'primary' }) {
  return (
    <div className="card stretch stretch-full border border-dashed border-gray-5 gcu-mini-stat">
      <div className="card-body rounded-3 text-center py-4">
        <div className={`avatar-text avatar-lg bg-soft-${color} text-${color} mx-auto mb-3`}>
          <i className={icon}></i>
        </div>
        <div className="fs-4 fw-bolder text-dark mb-1">{value}</div>
        <p className="fs-12 fw-medium text-muted mb-0 text-truncate-1-line">{label}</p>
      </div>
    </div>
  )
}
