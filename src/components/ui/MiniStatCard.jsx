/**
 * MiniStatCard — tarjeta estadística pequeña con borde punteado.
 * Usada en la página de analytics (col-xxl-2 grid).
 *
 * Props:
 *   icon    — feather class string o BI class
 *   value   — número/texto principal
 *   label   — etiqueta descriptiva
 *   color   — "primary" | "success" | "warning" | "danger" | "info"
 */
export function MiniStatCard({ icon, value, label, color = 'primary' }) {
  return (
    <div className={`card stretch stretch-full border border-dashed border-gray-5`}>
      <div className="card-body rounded-3 text-center py-4">
        <div className={`avatar-text avatar-lg bg-${color}-100 text-${color} mx-auto mb-3`}>
          <i className={icon}></i>
        </div>
        <div className="fs-4 fw-bolder text-dark mb-1">{value}</div>
        <p className="fs-12 fw-medium text-muted mb-0 text-truncate-1-line">{label}</p>
      </div>
    </div>
  )
}
