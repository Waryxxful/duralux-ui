/**
 * PageHeader — markup 1:1 del template Duralux (`page-header`).
 *
 * Plantilla (una sola fila, min-height 65px):
 *   .page-header
 *     .page-header-left.d-flex.align-items-center
 *       .page-header-title > h5
 *       ul.breadcrumb
 *     .page-header-right.ms-auto > ...actions
 *
 * `subtitle` NO va dentro del page-header (rompe la fila del theme).
 * Si se pasa, se renderiza debajo como lead (fuera de la barra sticky/bar).
 */
export function PageHeader({ title, subtitle, breadcrumbs = [], actions, className = '', children }) {
  const right = actions ?? children
  return (
    <>
      <div className={`page-header${className ? ` ${className}` : ''}`}>
        <div className="page-header-left d-flex align-items-center">
          <div className="page-header-title">
            <h5 className="m-b-10 mb-0">{title}</h5>
          </div>
          {breadcrumbs.length > 0 && (
            <ul className="breadcrumb">
              {breadcrumbs.map((crumb, i) =>
                crumb.href
                  ? (
                    <li key={i} className="breadcrumb-item">
                      <a href={crumb.href} onClick={crumb.onClick}>{crumb.label}</a>
                    </li>
                    )
                  : <li key={i} className="breadcrumb-item">{crumb.label}</li>
              )}
            </ul>
          )}
        </div>
        {right && (
          <div className="page-header-right ms-auto">
            <div className="page-header-right-items page-header-right-open">
              <div className="d-flex align-items-center gap-2 page-header-right-items-wrapper">
                {right}
              </div>
            </div>
          </div>
        )}
      </div>
      {subtitle != null && subtitle !== false && (
        <div className="px-4 pt-2">
          <p className="text-muted fs-13 mb-0">{subtitle}</p>
        </div>
      )}
    </>
  )
}
