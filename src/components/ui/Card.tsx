import { Fragment, forwardRef, useCallback } from 'react'
import type * as React from 'react'
import { CardLoader } from './CardLoader'
import { IconButton } from './Button'
import { cx } from '../../utils/cx'
import { deprecate } from '../../utils/log'
import { isArray, isFunction, isString } from '../../utils/typeGuards'
import type { CardProps } from '../../public/types'

function hasContent(value: unknown): boolean {
  if (value === null || value === undefined || value === false || value === true) return false
  if (isString(value)) return value.trim() !== ''
  if (isArray(value)) return value.some(hasContent)
  return true
}

function callbackAction(
  callback: (() => void) | undefined,
  node: React.ReactNode | (() => void),
  label: string,
  icon: string,
): React.ReactNode {
  const action = isFunction(callback) ? callback : node
  if (isFunction(action)) {
    return <IconButton icon={icon} label={label} size="sm" onClick={action as () => void} />
  }
  return hasContent(action) ? (action as React.ReactNode) : null
}

function assignRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (typeof ref === 'function') ref(value)
  else if (ref) (ref as React.MutableRefObject<T | null>).current = value
}

function SkeletonBody({ rows }: { rows: number }) {
  const count = Math.max(1, Math.min(12, Math.floor(rows) || 3))
  return (
    <div className="gcu-card__skeleton" aria-hidden="true">
      {Array.from({ length: count }, (_, row) => (
        // Las filas del skeleton son posicionales y nunca se reordenan.
        <span key={`skeleton-row-${row}`} className="gcu-skeleton gcu-skeleton--text" />
      ))}
    </div>
  )
}

/**
 * Card — superficie Duralux con elevación 1 (2 en hover si es interactiva).
 *
 * - title / subtitle / actions: cabecera; título y acciones se apilan en contenedores angostos.
 * - footer, noPadding (tablas a ras), bodyClassName, stretch (alto completo).
 * - loading: overlay con CardLoader; con `loadingVariant="skeleton"` el cuerpo muestra filas skeleton.
 * - onRefresh / onRemove / onExpand: acciones genéricas (IconButton con nombre en español).
 * - interactive: hover con elevación 2 (solo con puntero real) y cursor de acción.
 * - Deprecados: headerRight (usa actions), noPad (usa noPadding), elementRef (usa ref).
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(function Card({
  title,
  subtitle,
  actions,
  headerRight,
  footer,
  stretch,
  noPadding,
  noPad,
  interactive = false,
  loading = false,
  loadingVariant = 'overlay',
  skeletonRows = 3,
  loadingLabel = 'Cargando',
  onRefresh,
  onRemove,
  onExpand,
  refresh = undefined,
  remove = undefined,
  expand = undefined,
  refreshLabel = 'Actualizar',
  removeLabel = 'Quitar',
  expandLabel = 'Expandir',
  bodyClassName = '',
  className = '',
  elementRef,
  children,
  ...rest
}, ref) {
  if (headerRight !== undefined) deprecate('card-headerRight', 'la prop `headerRight` de Card; usa `actions`.')
  if (noPad !== undefined) deprecate('card-noPad', 'la prop `noPad` de Card; usa `noPadding`.')
  if (elementRef !== undefined) deprecate('card-elementRef', 'la prop `elementRef` de Card; usa `ref`.')

  const setRoot = useCallback((node: HTMLDivElement | null) => {
    assignRef(ref, node)
    assignRef(elementRef, node)
  }, [ref, elementRef])

  const right = actions ?? headerRight
  const flush = noPadding ?? noPad
  const genericActions = [
    callbackAction(onRefresh, refresh, refreshLabel, 'refresh-cw'),
    callbackAction(onRemove, remove, removeLabel, 'trash-2'),
    callbackAction(onExpand, expand, expandLabel, 'maximize-2'),
  ].filter(Boolean).map((action, index) => <Fragment key={`card-action-${index}`}>{action}</Fragment>)
  const showActions = hasContent(right) || genericActions.length > 0
  const showHeader = hasContent(title) || hasContent(subtitle) || showActions
  const isLoading = Boolean(loading)
  const skeleton = isLoading && loadingVariant === 'skeleton'

  return (
    <div
      {...rest}
      ref={setRoot}
      className={cx(
        'card',
        'gcu-card',
        stretch && 'stretch stretch-full',
        isLoading && 'card-loading',
        interactive && 'gcu-card--interactive',
        className,
      )}
      aria-busy={isLoading ? 'true' : undefined}
    >
      {showHeader && (
        <div className="card-header">
          <div className="gcu-card__header">
            <div className="gcu-card__heading">
              {/* h2 semántico (tras el h1 de la página); la clase .h5 conserva la tipografía Duralux */}
              {hasContent(title) && <h2 className="h5 card-title gcu-card__title mb-0">{title}</h2>}
              {hasContent(subtitle) && <div className="gcu-card__subtitle">{subtitle}</div>}
            </div>
            {showActions && (
              <div className="card-header-action">
                {hasContent(right) && right}
                {genericActions}
              </div>
            )}
          </div>
        </div>
      )}
      <div className={cx('card-body', flush && 'p-0', bodyClassName)}>
        {skeleton ? <SkeletonBody rows={skeletonRows} /> : children}
      </div>
      {hasContent(footer) && <div className="card-footer">{footer}</div>}
      {skeleton
        ? <span className="visually-hidden" role="status">{loadingLabel}</span>
        // SAFETY: CardLoader normaliza la etiqueta (string, número o su texto por defecto).
        : <CardLoader loading={isLoading} label={loadingLabel as string} />}
    </div>
  )
})
