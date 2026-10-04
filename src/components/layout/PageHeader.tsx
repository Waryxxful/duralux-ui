import { forwardRef, useEffect, useRef, useState } from 'react'
import type * as React from 'react'
import { isArray, isFiniteNumber, isFunction, isNonEmptyString, isString } from '../../utils/typeGuards'
import { assignRef } from '../../utils/assignRef'
import { cx } from '../../utils/cx'
import { log } from '../../utils/log'
import type { PageHeaderBreadcrumb, PageHeaderProps } from '../../public/types'

function hasContent(value: unknown): boolean {
  if (value === null || value === undefined || value === false || value === true) return false
  if (isString(value)) return value.trim() !== ''
  if (isArray(value)) return value.some(hasContent)
  return true
}

function hasActionContent(value: unknown): boolean {
  // Numeric zero is a valid React child in general, but it is not an action
  // and should not create an empty action toolbar.
  return !isFiniteNumber(value) && hasContent(value)
}

function safeKey(value: unknown, fallback: string): string {
  let token: string
  try {
    token = String(value ?? '')
  } catch {
    token = ''
  }
  token = token.replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48)
  return token || fallback
}

type CrumbWithIdentity = PageHeaderBreadcrumb & { id?: unknown; key?: unknown }

function breadcrumbKeys(items: ReadonlyArray<CrumbWithIdentity>): string[] {
  const seen = new Map<string, number>()
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
 * Observa un centinela justo encima de la barra: cuando sale por arriba (por debajo del `top`
 * sticky), la barra quedó pegada y se marca con `data-stuck`. Sin IntersectionObserver no hay
 * sombra (fallback silencioso con log de depuración).
 */
function useStuck(enabled: boolean, sentinel: React.RefObject<HTMLDivElement | null>, bar: React.RefObject<HTMLDivElement | null>): boolean {
  const [stuck, setStuck] = useState(false)

  useEffect(() => {
    const sentinelElement = sentinel.current
    if (!enabled || !sentinelElement) return undefined
    if (typeof IntersectionObserver === 'undefined') {
      log.debug('PageHeader: sin IntersectionObserver; la sombra al hacer scroll queda desactivada.')
      return undefined
    }
    const barElement = bar.current
    const top = barElement ? Number.parseFloat(getComputedStyle(barElement).top) : 0
    const offset = Number.isFinite(top) ? top : 0
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry) return
      const rootTop = entry.rootBounds?.top ?? offset
      setStuck(!entry.isIntersecting && entry.boundingClientRect.top < rootTop)
    }, { rootMargin: `-${offset + 1}px 0px 0px 0px`, threshold: 0 })
    observer.observe(sentinelElement)
    return () => observer.disconnect()
  }, [bar, enabled, sentinel])

  return enabled && stuck
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
 * - Sticky por defecto (`sticky={false}` lo desactiva); la sombra aparece solo cuando la barra
 *   queda pegada al hacer scroll. Quien ya pasa `className="sticky-top"` obtiene lo mismo.
 * - Acciones a la derecha: máximo una primaria.
 * - `subtitle` NO va dentro del page-header (rompe la fila del theme): va debajo como lead.
 * - El ref apunta a la barra `.page-header`.
 */
export const PageHeader = /* @__PURE__ */ forwardRef<HTMLDivElement, PageHeaderProps>(function PageHeader({
  title,
  subtitle,
  breadcrumbs = [],
  actions,
  className = '',
  children,
  sticky = true,
}, forwardedRef) {
  const right = actions ?? children
  const items: ReadonlyArray<CrumbWithIdentity> = isArray(breadcrumbs) ? breadcrumbs : []
  const keys = breadcrumbKeys(items)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const barRef = useRef<HTMLDivElement | null>(null)
  const stuck = useStuck(sticky, sentinelRef, barRef)

  return (
    <>
      {sticky && <div ref={sentinelRef} className="gcu-page-header__sentinel" aria-hidden="true" />}
      <div
        ref={(node) => {
          barRef.current = node
          assignRef(forwardedRef, node)
        }}
        className={cx('page-header', sticky && 'gcu-page-header--sticky', className)}
        data-stuck={stuck ? '' : undefined}
      >
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
                  const onClick = isFunction(crumb?.onClick) ? crumb.onClick : undefined
                  if (isNonEmptyString(crumb?.href) && !isLast) {
                    return (
                      <li key={keys[i]} className="breadcrumb-item">
                        <a href={crumb.href} onClick={onClick}>{crumb.label}</a>
                      </li>
                    )
                  }
                  return (
                    <li
                      key={keys[i]}
                      className="breadcrumb-item"
                      aria-current={isLast ? 'page' : undefined}
                    >
                      {isNonEmptyString(crumb?.href) && isLast
                        ? <a href={crumb.href} onClick={onClick} aria-current="page">{crumb.label}</a>
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
})
