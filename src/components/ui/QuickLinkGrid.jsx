/**
 * QuickLinkGrid — grid de tiles ícono+label clicables (patrón
 * ConversionStatusMiscellaneous/TrafficSourceMiscellaneous de Duralux v2).
 *
 * Props:
 *   items   — [{ icon, label, href?, onClick?, color? }] (color: variante bg-soft-*, ej. "primary")
 *   columns — cols por fila en md+ (default 4; usa col-6 col-md-{12/columns})
 */
export function QuickLinkGrid({ items = [], columns = 4 }) {
  const mdCol = Math.max(1, Math.floor(12 / columns))
  return (
    <div className="row g-3">
      {items.map((it, i) => {
        const color = it.color || 'primary'
        const body = (
          <div className="card stretch stretch-full border h-100">
            <div className="card-body text-center py-4">
              <div className={`avatar-text avatar-lg bg-soft-${color} text-${color} mx-auto mb-2`}>
                <i className={it.icon}></i>
              </div>
              <p className="fs-13 fw-medium text-dark mb-0">{it.label}</p>
            </div>
          </div>
        )
        return (
          <div className={`col-6 col-md-${mdCol}`} key={i}>
            {it.href ? (
              <a href={it.href} className="text-decoration-none" onClick={it.onClick}>
                {body}
              </a>
            ) : (
              <button
                type="button"
                className="p-0 border-0 bg-transparent w-100 text-start"
                onClick={it.onClick}
              >
                {body}
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
