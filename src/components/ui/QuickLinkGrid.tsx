import { forwardRef } from 'react'
import type * as React from 'react'
import { cx } from '../../utils/cx'
import { log } from '../../utils/log'
import { isArray, isFiniteNumber, isFunction, isString } from '../../utils/typeGuards'
import type { QuickLinkGridProps, QuickLinkItem } from '../../public/types'
import { resolveTone } from './internal/indicator'
import { IndicatorGlyph } from './internal/IndicatorParts'

const DEFAULT_COLUMNS = 4
const MAX_COLUMNS = 6

function quickLinkIdentity(item: QuickLinkItem | undefined): string {
  const candidate = item?.id ?? item?.href ?? item?.label ?? item?.icon
  if (isString(candidate)) return `string:${candidate}`
  if (isFiniteNumber(candidate)) return `number:${String(candidate)}`
  return 'quick-link'
}

function quickLinkEntries(items: QuickLinkGridProps['items']) {
  const occurrences = new Map<string, number>()
  return (isArray(items) ? items : []).map((item: QuickLinkItem) => {
    const identity = quickLinkIdentity(item)
    const occurrence = (occurrences.get(identity) ?? 0) + 1
    occurrences.set(identity, occurrence)
    return { item, key: `${identity}~${occurrence}` }
  })
}

function resolveColumns(columns: unknown): number {
  if (columns === undefined) return DEFAULT_COLUMNS
  if (isFiniteNumber(columns) && columns >= 1) return Math.min(MAX_COLUMNS, Math.floor(columns))
  log.warn(`QuickLinkGrid: columns debe ser un entero entre 1 y ${MAX_COLUMNS} (recibido: ${String(columns)}); se usan ${DEFAULT_COLUMNS}.`)
  return DEFAULT_COLUMNS
}

function QuickLinkContent({ item }: { item: QuickLinkItem }) {
  const tone = resolveTone('QuickLinkGrid', undefined, item.color, 'primary')
  return (
    <>
      <span className={cx('gcu-stat__icon', `gcu-stat__icon--${tone}`)}>
        <IndicatorGlyph icon={item.icon} />
      </span>
      <span className="gcu-quick-link__text">
        <span className="gcu-quick-link__label">{item.label}</span>
        {item.description !== undefined && item.description !== null && (
          <span className="gcu-quick-link__description gcu-tabular">{item.description}</span>
        )}
      </span>
    </>
  )
}

/**
 * QuickLinkGrid — accesos directos ícono + texto (y una cifra opcional en `description`).
 *
 * - El ítem interactivo es el propio enlace o botón (`.gcu-quick-link--interactive`): hover
 *   instantáneo (Craft), presión y anillo de foco del tema. Sin `href` ni `onClick` no es interactivo.
 * - columns: columnas cuando el contenedor tiene ≥ 36rem; en contenedores angostos bajan a 2.
 *   Responde a su contenedor (`@container`), no al viewport.
 * Estilos: src/styles/components/quick-link-grid.css e indicator.css.
 */
export const QuickLinkGrid = forwardRef<HTMLDivElement, QuickLinkGridProps>(function QuickLinkGrid({
  items = [],
  columns,
  className,
  style,
  ...rest
}, ref) {
  const resolvedColumns = resolveColumns(columns)
  const gridStyle = { ...style, '--gcu-quick-links-columns': String(resolvedColumns) } as React.CSSProperties

  return (
    <div {...rest} ref={ref} className={cx('gcu-quick-links', 'gcu-container', className)} style={gridStyle}>
      <ul className="gcu-quick-links__grid">
        {quickLinkEntries(items).map(({ item, key }) => (
          <li className="gcu-quick-links__item" key={key}>
            {item.href ? (
              <a href={item.href} className="card gcu-quick-link gcu-quick-link--interactive" onClick={item.onClick}>
                <QuickLinkContent item={item} />
              </a>
            ) : isFunction(item.onClick) ? (
              <button type="button" className="card gcu-quick-link gcu-quick-link--interactive" onClick={item.onClick}>
                <QuickLinkContent item={item} />
              </button>
            ) : (
              <div className="card gcu-quick-link">
                <QuickLinkContent item={item} />
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
})
