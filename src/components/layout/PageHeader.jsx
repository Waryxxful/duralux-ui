/**
 * PageHeader — markup 1:1 del template Duralux (`page-header`).
 *
 * Plantilla:
 *   .page-header
 *     .page-header-left.d-flex.align-items-center
 *       .page-header-title > h5.m-b-10
 *       ul.breadcrumb
 *     .page-header-right.ms-auto > .page-header-right-items > .page-header-right-items-wrapper
 *
 * `subtitle` es extensión GranCRM: va en fila completa debajo del title+breadcrumb
 * para no romper el flex horizontal del template (evita "usuarios.SA > Cuentas").
 */
export function PageHeader({ title, subtitle, breadcrumbs = [], actions, className = '', children }) {
  const right = actions ?? children
  return (
    <div className={`page-header${className ? ` ${className}` : ''}`}>
      <div className="page-header-left d-flex align-items-center flex-wrap">
        <div className="page-header-title">
          <h5 className="m-b-10 mb-md-0">{title}</h5>
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
        {subtitle != null && subtitle !== false && (
          <p className="text-muted fs-12 m-b-0 w-100 mt-1">{subtitle}</p>
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
  )
}
