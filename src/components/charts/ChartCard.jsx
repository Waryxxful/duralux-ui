import { useId } from 'react'
import { Dropdown, DropdownMenu } from '../ui/Dropdown'
import {
  ChartCardTitleContext,
  ChartState,
  readChartDataValue,
} from './chartA11y'

function safeIdPart(value) {
  return String(value).replace(/[^A-Za-z0-9_-]+/g, '-')
}

function hasMeaningfulTitle(value) {
  if (typeof value === 'string') return value.trim() !== ''
  return value !== undefined && value !== null && value !== false
}

function actionIdentity(id, label) {
  const candidate = typeof id === 'string' || typeof id === 'number'
    ? id
    : typeof label === 'string' || typeof label === 'number'
      ? label
      : 'action'
  return `${typeof candidate}:${String(candidate)}`
}

function normalizeActions(actions) {
  if (!Array.isArray(actions)) return []
  const length = readChartDataValue(actions, 'length')
  if (!Number.isSafeInteger(length) || length <= 0) return []

  const normalized = []
  const occurrences = new Map()
  for (let index = 0; index < length; index += 1) {
    const action = readChartDataValue(actions, index)
    if (!action || typeof action !== 'object') continue

    const onClick = readChartDataValue(action, 'onClick')
    const label = readChartDataValue(action, 'label')
    if (typeof onClick !== 'function' || !hasMeaningfulTitle(label)) continue

    const id = readChartDataValue(action, 'id')
    const baseKey = actionIdentity(id, label)
    const occurrence = (occurrences.get(baseKey) ?? 0) + 1
    occurrences.set(baseKey, occurrence)
    normalized.push({
      id,
      key: `${baseKey}~${occurrence}`,
      label,
      onClick,
    })
  }

  return normalized
}

/**
 * ChartCard — card wrapper para gráficos con header de acciones estilo Duralux.
 *
 * Props:
 *   title      — título del card
 *   subtitle   — subtítulo o período
 *   actions    — [{ label, onClick }] para el dropdown
 *   children   — el gráfico
 *   noPad      — p-0 en el body (para gráficos flush)
 *   loading/empty/error — estados opcionales; los defaults viven en feedback/
 *   fallback   — alternativa renderizable para un estado o SSR
 */
export function ChartCard({
  title,
  subtitle,
  actions = [],
  noPad,
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
}) {
  const titleId = `chart-card-title-${safeIdPart(useId())}`
  const hasTitle = hasMeaningfulTitle(title)
  const normalizedActions = normalizeActions(actions)
  const state = loading ? 'loading' : error ? 'error' : empty ? 'empty' : null

  return (
    <ChartCardTitleContext.Provider value={hasTitle ? titleId : null}>
      <section
        className="card stretch stretch-full"
        aria-labelledby={hasTitle ? titleId : undefined}
      >
        <div className="card-header d-flex align-items-center justify-content-between">
          <div>
            {hasTitle && <h5 id={titleId} className="card-title mb-0">{title}</h5>}
            {subtitle && <p className="fs-12 text-muted mb-0 mt-1">{subtitle}</p>}
          </div>
          {normalizedActions.length > 0 && (
            <Dropdown
              align="end"
              trigger={(triggerProps, { open }) => (
                <button
                  {...triggerProps}
                  className={`avatar-text avatar-sm bg-transparent border-0 text-muted${open ? ' show' : ''}`}
                  aria-label={typeof title === 'string' && title.trim() ? `Acciones de ${title.trim()}` : 'Acciones del gráfico'}
                  aria-haspopup="menu"
                >
                  <i className="feather-more-vertical" aria-hidden="true"></i>
                </button>
              )}
            >
              <DropdownMenu as="ul">
                {normalizedActions.map((a) => (
                  <li key={a.key}>
                    <button type="button" className="dropdown-item" onClick={a.onClick}>
                      {a.label}
                    </button>
                  </li>
                ))}
              </DropdownMenu>
            </Dropdown>
          )}
        </div>
        <div
          className={`card-body${noPad ? ' p-0' : ''}`}
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
}
