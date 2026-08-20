import { isArray, isFiniteNumber, isFunction, isNonEmptyString, isString } from '../../utils/typeGuards'

function hasContent(value) {
  if (value === null || value === undefined || value === false || value === true) return false
  if (isString(value)) return value.trim() !== ''
  if (isArray(value)) return value.some(hasContent)
  return true
}

function hasActionContent(value) {
  // Numeric zero is a valid React child in general, but it is not an action
  // and should not create an empty action toolbar.
  return !isFiniteNumber(value) && hasContent(value)
}

function hasHref(value) {
  return isNonEmptyString(value)
}

function safeKey(value, fallback) {
  let token
  try {
    token = String(value ?? '')
  } catch {
    token = ''
  }
  token = token.replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48)
  return token || fallback
}

function breadcrumbKeys(items) {
  const seen = new Map()
  return items.map((crumb, index) => {
    const identity = crumb?.id ?? crumb?.key ?? crumb?.href ?? crumb?.label
    const base = identity === undefined || identity === null || identity === ''
      ? `index-${index}`
      : safeKey(identity, `index-${index}`)
    const occurrence = seen.get(base) ?? 0
    seen.set(base, occurrence + 1)
    return `breadcrumb-${base}-${occurrence}`
  })
}

/**
 * PageHeader — estructura React adaptada al patrón Duralux (`page-header`).
 *
 * Plantilla (una sola fila, min-height 65px):
 *   .page-header
 *     .page-header-left.d-flex.align-items-center
 *       .page-header-title > h1.h5  (h1 semántico, look h5 del theme)
 *       ul.breadcrumb[aria-label]
 *     .page-header-right.ms-auto > ...actions
 *
 * `subtitle` NO va dentro del page-header (rompe la fila del theme).
 * Si se pasa, se renderiza debajo como lead (fuera de la barra sticky/bar).
 */
export function PageHeader({ title, subtitle, breadcrumbs = [], actions, className = '', children }) {
  const right = actions ?? children
  const items = isArray(breadcrumbs) ? breadcrumbs : []
  const keys = breadcrumbKeys(items)
  return (
    <>
      <div className={`page-header${className ? ` ${className}` : ''}`}>
        <div className="page-header-left d-flex align-items-center">
          <div className="page-header-title">
            {/* h1 semántico + clase .h5 para conservar tipografía del theme */}
            {hasContent(title) && <h1 className="h5 m-b-10 mb-0">{title}</h1>}
          </div>
          {items.length > 0 && (
            <nav aria-label="Miga de pan">
              <ul className="breadcrumb">
                {items.map((crumb, i) => {
                  const isLast = i === items.length - 1
                  if (hasHref(crumb?.href) && !isLast) {
                    return (
                      <li key={keys[i]} className="breadcrumb-item">
                        <a href={crumb.href} onClick={isFunction(crumb.onClick) ? crumb.onClick : undefined}>{crumb.label}</a>
                      </li>
                    )
                  }
                  return (
                    <li
                      key={keys[i]}
                      className="breadcrumb-item"
                      aria-current={isLast ? 'page' : undefined}
                    >
                      {hasHref(crumb?.href) && isLast
                        ? <a href={crumb.href} onClick={isFunction(crumb.onClick) ? crumb.onClick : undefined} aria-current="page">{crumb.label}</a>
                        : crumb?.label}
                    </li>
                  )
                })}
              </ul>
            </nav>
          )}
        </div>
        {hasActionContent(right) && (
          <div className="page-header-right ms-auto">
            <div className="page-header-right-items page-header-right-open">
              <div className="d-flex align-items-center gap-2 page-header-right-items-wrapper">
                {right}
              </div>
            </div>
          </div>
        )}
      </div>
      {hasContent(subtitle) && (
        <div className="px-4 pt-2">
          <p className="text-muted fs-13 mb-0">{subtitle}</p>
        </div>
      )}
    </>
  )
}
