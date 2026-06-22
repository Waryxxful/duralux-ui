/**
 * Card — wrapper con las clases Duralux.
 *
 * Props:
 *   title      — header title
 *   headerRight — content for the right side of the header
 *   footer     — footer content
 *   stretch    — adds "stretch stretch-full" for full-height cards
 *   noPad      — p-0 on card-body (for tables flush to edge)
 *   className  — extra classes for the card
 */
export function Card({ title, headerRight, footer, stretch, noPad, className = '', children }) {
  return (
    <div className={`card${stretch ? ' stretch stretch-full' : ''} ${className}`}>
      {title && (
        <div className="card-header">
          <h5 className="card-title">{title}</h5>
          {headerRight && <div className="card-header-action">{headerRight}</div>}
        </div>
      )}
      <div className={`card-body${noPad ? ' p-0' : ''}`}>
        {children}
      </div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  )
}
