/**
 * Card — wrapper con las clases Duralux.
 *
 * Props:
 *   title       — header title
 *   actions     — content for the right side of the header (alias legacy: headerRight)
 *   footer      — footer content
 *   noPadding   — p-0 on card-body, para tablas a ras de borde (alias legacy: noPad)
 *   bodyClassName — clases extra en card-body
 *   stretch     — adds "stretch stretch-full" for full-height cards
 *   className   — extra classes for the card
 *   elementRef  — ref al div raíz
 */
export function Card({ title, actions, headerRight, footer, stretch, noPadding, noPad, bodyClassName = '', className = '', elementRef, children, ...rest }) {
  const right = actions ?? headerRight
  const flush = noPadding ?? noPad
  return (
    <div ref={elementRef} className={`card${stretch ? ' stretch stretch-full' : ''} ${className}`} {...rest}>
      {(title || right) && (
        <div className="card-header">
          <h5 className="card-title">{title}</h5>
          {right && <div className="card-header-action">{right}</div>}
        </div>
      )}
      <div className={`card-body${flush ? ' p-0' : ''}${bodyClassName ? ' ' + bodyClassName : ''}`}>
        {children}
      </div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  )
}
