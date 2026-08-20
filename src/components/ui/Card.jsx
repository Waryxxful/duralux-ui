import { Fragment } from 'react'
import { CardLoader } from './CardLoader'
import { isArray, isFunction, isString } from '../../utils/typeGuards'

function hasContent(value) {
  if (value === null || value === undefined || value === false || value === true) return false
  if (isString(value)) return value.trim() !== ''
  if (isArray(value)) return value.some(hasContent)
  return true
}

function callbackAction(callback, node, label, icon) {
  const action = isFunction(callback) ? callback : node
  if (isFunction(action)) {
    return (
      <button type="button" className="btn btn-sm btn-light-brand" aria-label={label} onClick={action}>
        <i className={`feather-${icon}`} aria-hidden="true"></i>
      </button>
    )
  }
  return hasContent(action) ? action : null
}

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
 *   loading     — controlled loading overlay
 *   loadingLabel — accessible name for the loading status
 *   onRefresh/onRemove/onExpand — optional accessible generic actions
 *   className   — extra classes for the card
 *   elementRef  — ref al div raíz
 */
export function Card({
  title,
  subtitle,
  actions,
  headerRight,
  footer,
  stretch,
  noPadding,
  noPad,
  loading = false,
  loadingLabel = 'Cargando',
  onRefresh,
  onRemove,
  onExpand,
  refresh = undefined,
  remove = undefined,
  expand = undefined,
  refreshLabel = 'Refresh',
  removeLabel = 'Remove',
  expandLabel = 'Expand',
  bodyClassName = '',
  className = '',
  elementRef,
  children,
  ...rest
}) {
  const right = actions ?? headerRight
  const flush = noPadding ?? noPad
  const genericActions = [
    callbackAction(onRefresh, refresh, refreshLabel, 'refresh-cw'),
    callbackAction(onRemove, remove, removeLabel, 'trash-2'),
    callbackAction(onExpand, expand, expandLabel, 'maximize-2'),
  ].filter(Boolean).map((action, index) => <Fragment key={`card-action-${index}`}>{action}</Fragment>)
  const composedRight = [right, genericActions].some(hasContent)
    ? <>{hasContent(right) && right}{genericActions}</>
    : null
  const showHeader = hasContent(title) || hasContent(subtitle) || hasContent(composedRight)
  const isLoading = Boolean(loading)
  return (
    <div
      ref={elementRef}
      className={`card${stretch ? ' stretch stretch-full' : ''}${isLoading ? ' card-loading' : ''}${className ? ` ${className}` : ''}`}
      aria-busy={isLoading ? 'true' : undefined}
      {...rest}
    >
      {showHeader && (
        <div className="card-header">
          <div className="min-w-0">
            {/* h2 semántico (tras page h1); clase .h5 conserva tipografía Duralux */}
            {hasContent(title) && <h2 className="h5 card-title mb-0">{title}</h2>}
            {hasContent(subtitle) && <div className="text-muted fs-12 mt-1">{subtitle}</div>}
          </div>
          {hasContent(composedRight) && <div className="card-header-action">{composedRight}</div>}
        </div>
      )}
      <div className={`card-body${flush ? ' p-0' : ''}${bodyClassName ? ` ${bodyClassName}` : ''}`}>
        {children}
      </div>
      {hasContent(footer) && <div className="card-footer">{footer}</div>}
      <CardLoader loading={isLoading} label={loadingLabel} />
    </div>
  )
}
