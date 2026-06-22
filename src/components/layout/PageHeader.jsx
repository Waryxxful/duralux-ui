/**
 * PageHeader — title + breadcrumb + optional right-side actions.
 *
 * Props:
 *   title       — page title string
 *   breadcrumbs — [{ label, href }] (last item has no href)
 *   children    — right-side actions (buttons, filters, etc.)
 */
export function PageHeader({ title, breadcrumbs = [], children }) {
  return (
    <div className="page-header">
      <div className="page-header-left d-flex align-items-center">
        <div className="page-header-title">
          <h5 className="m-b-10">{title}</h5>
        </div>
        {breadcrumbs.length > 0 && (
          <ul className="breadcrumb">
            {breadcrumbs.map((crumb, i) =>
              crumb.href
                ? <li key={i} className="breadcrumb-item"><a href={crumb.href}>{crumb.label}</a></li>
                : <li key={i} className="breadcrumb-item">{crumb.label}</li>
            )}
          </ul>
        )}
      </div>
      {children && (
        <div className="page-header-right ms-auto">
          <div className="page-header-right-items">
            <div className="d-flex align-items-center gap-2 page-header-right-items-wrapper">
              {children}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
