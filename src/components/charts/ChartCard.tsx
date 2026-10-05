import { createElement, forwardRef, useId } from 'react'
import type * as React from 'react'
import { Dropdown, DropdownMenu } from '../ui/Dropdown'
import {
  ChartCardTitleContext,
  readChartDataValue,
  safeIdPart,
} from './chartA11yModel'
import { ChartState } from './chartA11y'
import { cx } from '../../utils/cx'
import { log } from '../../utils/log'
import {
  isArray,
  isFiniteNumber,
  isFunction,
  isNonEmptyString,
  isObject,
  isString,
} from '../../utils/typeGuards'
import type { ChartCardAction, ChartCardHeadingLevel, ChartCardProps } from '../../public/chart-types'

const HEADING_TAGS = { 2: 'h2', 3: 'h3', 4: 'h4', 5: 'h5', 6: 'h6' } as const
const DEFAULT_HEADING_LEVEL: ChartCardHeadingLevel = 3

interface NormalizedAction {
  key: string
  label: React.ReactNode
  onClick: React.MouseEventHandler<HTMLButtonElement>
}

function hasMeaningfulTitle(value: React.ReactNode): boolean {
  if (isString(value)) return value.trim() !== ''
  return value !== undefined && value !== null && value !== false
}

function actionIdentity(id: ChartCardAction['id'], label: React.ReactNode): string {
  const candidate = isString(id) || isFiniteNumber(id)
    ? id
    : isString(label) || isFiniteNumber(label)
      ? label
      : 'action'
  const tag = isString(candidate) ? 'string' : isFiniteNumber(candidate) ? 'number' : 'object'
  return `${tag}:${String(candidate)}`
}

function normalizeActions(actions: ReadonlyArray<ChartCardAction> | undefined): NormalizedAction[] {
  if (!isArray(actions)) return []
  const length = readChartDataValue(actions, 'length')
  if (!Number.isSafeInteger(length) || length <= 0) return []

  const normalized: NormalizedAction[] = []
  const occurrences = new Map<string, number>()
  for (let index = 0; index < length; index += 1) {
    const action = readChartDataValue(actions, index)
    if (!action || !isObject(action)) continue

    const onClick = readChartDataValue(action, 'onClick')
    const label = readChartDataValue(action, 'label')
    if (!isFunction(onClick) || !hasMeaningfulTitle(label)) continue

    const baseKey = actionIdentity(readChartDataValue(action, 'id'), label)
    const occurrence = (occurrences.get(baseKey) ?? 0) + 1
    occurrences.set(baseKey, occurrence)
    normalized.push({ key: `${baseKey}~${occurrence}`, label, onClick })
  }

  return normalized
}

function resolveHeadingTag(level: ChartCardHeadingLevel | undefined) {
  if (level === undefined) return HEADING_TAGS[DEFAULT_HEADING_LEVEL]
  const tag = HEADING_TAGS[level]
  if (tag) return tag
  log.warn(`ChartCard: headingLevel=${String(level)} no es válido (usa 2–6); se usa h3.`)
  return HEADING_TAGS[DEFAULT_HEADING_LEVEL]
}

/**
 * ChartCard — card para gráficos con título, subtítulo y menú de acciones.
 *
 * - headingLevel: nivel del título (2–6, por defecto 3) para respetar el orden de encabezados
 *   del contenedor (DX-006); la tipografía de título de card no cambia con el nivel.
 * - El título nombra la sección y también la figura del gráfico que va dentro.
 * - actions: [{ id?, label, onClick }] en un menú; las inválidas se descartan.
 * - noPadding: cuerpo a ras.
 * - loading / empty / error: skeleton, EmptyState y ErrorState con reintento.
 * Estilos: src/styles/components/chart.css.
 */
export const ChartCard = /* @__PURE__ */ forwardRef<HTMLElement, ChartCardProps>(function ChartCard({
  title,
  subtitle,
  actions = [],
  noPadding,
  headingLevel,
  children,
  loading = false,
  empty = false,
  error,
  onRetry,
  fallback,
  loadingMessage,
  emptyTitle,
  emptyMessage,
  errorTitle,
  errorMessage,
  className,
  style,
}, ref) {
  const titleId = `chart-card-title-${safeIdPart(useId())}`
  const hasTitle = hasMeaningfulTitle(title)
  const normalizedActions = normalizeActions(actions)
  const state = loading ? 'loading' : error ? 'error' : empty ? 'empty' : null
  const headingTag = resolveHeadingTag(headingLevel)

  return (
    <ChartCardTitleContext.Provider value={hasTitle ? titleId : null}>
      <section
        ref={ref}
        className={cx('card', 'stretch', 'stretch-full', 'gcu-chart-card', className)}
        style={style}
        aria-labelledby={hasTitle ? titleId : undefined}
      >
        <div className="card-header gcu-chart-card__header">
          <div className="gcu-chart-card__head">
            {hasTitle && createElement(headingTag, { id: titleId, className: 'h5 card-title gcu-chart-card__title mb-0' }, title)}
            {subtitle && <p className="gcu-chart-card__subtitle">{subtitle}</p>}
          </div>
          {normalizedActions.length > 0 && (
            <Dropdown
              align="end"
              trigger={(triggerProps, { open }) => (
                <button
                  {...triggerProps}
                  type="button"
                  className={cx('gcu-chart-card__menu', open && 'show')}
                  aria-label={isNonEmptyString(title) ? `Acciones de ${title.trim()}` : 'Acciones del gráfico'}
                >
                  <i className="feather-more-vertical" aria-hidden="true"></i>
                </button>
              )}
            >
              <DropdownMenu as="ul">
                {normalizedActions.map((action) => (
                  <li key={action.key}>
                    <button type="button" className="dropdown-item" onClick={action.onClick}>
                      {action.label}
                    </button>
                  </li>
                ))}
              </DropdownMenu>
            </Dropdown>
          )}
        </div>
        <div
          className={cx('card-body', 'gcu-chart-card__body', noPadding && 'p-0')}
          aria-busy={loading || undefined}
        >
          {state ? (
            <ChartState
              state={state}
              fallback={fallback}
              loadingMessage={loadingMessage}
              emptyTitle={emptyTitle}
              emptyMessage={emptyMessage}
              error={error}
              errorTitle={errorTitle}
              errorMessage={errorMessage}
              onRetry={onRetry}
            />
          ) : children}
        </div>
      </section>
    </ChartCardTitleContext.Provider>
  )
})
