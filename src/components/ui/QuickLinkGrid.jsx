/**
 * QuickLinkGrid — grid de tiles ícono+label clicables (patrón
 * ConversionStatusMiscellaneous/TrafficSourceMiscellaneous de Duralux v2).
 *
 * Estilos: scss/themes/components/_widgets-ui.scss (`.gcu-quick-link`).
 * Dark: soft-avatar gana a html.app-skin-dark .avatar-text.
 *
 * Props:
 *   items   — [{ id?, icon, label, href?, onClick?, color? }] (color: variante soft, ej. "primary")
 *   columns — cols por fila en md+ (default 4; usa col-6 col-md-{12/columns})
 */
function quickLinkIdentity(item) {
  const candidate = item?.id ?? item?.href ?? item?.label ?? item?.icon
  return typeof candidate === 'string' || typeof candidate === 'number'
    ? `${typeof candidate}:${String(candidate)}`
    : 'quick-link'
}

function quickLinkEntries(items) {
  const occurrences = new Map()
  return (Array.isArray(items) ? items : []).map((item) => {
    const identity = quickLinkIdentity(item)
    const occurrence = (occurrences.get(identity) ?? 0) + 1
    occurrences.set(identity, occurrence)
    return { item, key: `${identity}~${occurrence}` }
  })
}

export function QuickLinkGrid({ items = [], columns = 4 }) {
  const mdCol = Math.max(1, Math.floor(12 / columns))
  return (
    <div className="row g-3 gcu-quick-link-grid">
      {quickLinkEntries(items).map(({ item, key }) => {
        const color = item.color || 'primary'
        const body = (
          <div className="card stretch stretch-full border h-100 gcu-quick-link">
            <div className="card-body text-center py-4">
              <div className={`avatar-text avatar-lg bg-soft-${color} text-${color} mx-auto mb-2`}>
                <i className={item.icon}></i>
              </div>
              <p className="fs-13 fw-medium text-dark mb-0">{item.label}</p>
            </div>
          </div>
        )
        return (
          <div className={`col-6 col-md-${mdCol}`} key={key}>
            {item.href ? (
              <a href={item.href} className="text-decoration-none" onClick={item.onClick}>
                {body}
              </a>
            ) : (
              <button
                type="button"
                className="p-0 border-0 bg-transparent w-100 text-start"
                onClick={item.onClick}
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
