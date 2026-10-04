import { forwardRef, useEffect, useId, useMemo, useRef, useState } from 'react'
import type * as React from 'react'
import { safeRead, toSafeDomSegment } from './internal/safeDom.js'
import { cx } from '../../utils/cx'
import { log } from '../../utils/log'
import { isArray, isFiniteNumber, isString } from '../../utils/typeGuards'
import type { TabItem, TabKey, TabsProps } from '../../public/types'

const EMPTY_TABS: ReadonlyArray<TabItem> = []
const DEFAULT_TABLIST_LABEL = 'Pestañas'

interface TabEntry {
  index: number
  key: TabKey | undefined
  label: React.ReactNode
  content: React.ReactNode
  icon: string | null
  disabled: boolean
  reactKey: string
  segment: string
  token: string
}

function sameKey(left: unknown, right: unknown): boolean {
  return Object.is(left, right) || left === right
}

function buildTabEntries(tabs: ReadonlyArray<TabItem>): TabEntry[] {
  const occurrences = new Map<string, number>()
  const usedReactKeys = new Set<string>()

  return tabs.map((tab, index) => {
    const key = safeRead(tab, 'key', undefined)
    const tag = isString(key) ? 'string' : isFiniteNumber(key) ? 'number' : 'other'
    const token = `${tag}:${String(toSafeDomSegment(key))}`
    const occurrence = occurrences.get(token) || 0
    occurrences.set(token, occurrence + 1)
    const baseSegment = `${toSafeDomSegment(key)}-${occurrence}`
    let reactKey = `duralux-tab-${baseSegment}`
    if (usedReactKeys.has(reactKey)) reactKey = `${reactKey}-${index}`
    usedReactKeys.add(reactKey)

    return {
      index,
      key,
      label: safeRead(tab, 'label', null),
      content: safeRead(tab, 'content', null),
      icon: safeRead(tab, 'icon', null),
      disabled: Boolean(safeRead(tab, 'disabled', false)),
      reactKey,
      segment: baseSegment,
      token,
    }
  })
}

function duplicateWarnings(entries: TabEntry[]): string[] {
  const seen = new Map<string, number>()
  const messages: string[] = []
  entries.forEach((entry) => {
    if (!seen.has(entry.token)) {
      seen.set(entry.token, entry.index)
      return
    }
    messages.push(
      `Tabs: la key debe ser única; las pestañas ${seen.get(entry.token) + 1} y ${entry.index + 1} comparten la misma identidad.`,
    )
  })
  return messages
}

function TabsInner<K extends TabKey = TabKey>({
  tabs = EMPTY_TABS as ReadonlyArray<TabItem<K>>,
  className = '',
  tabClassName = '',
  activeKey,
  defaultActiveKey,
  onChange,
  ariaLabel,
  'aria-label': ariaLabelProp,
  'aria-labelledby': ariaLabelledBy,
}: TabsProps<K>, ref: React.ForwardedRef<HTMLDivElement>) {
  const normalizedTabs = isArray(tabs) ? tabs : EMPTY_TABS
  const isControlled = activeKey !== undefined
  // Solo se guarda la clave pedida; la pestaña activa se deriva en render (DX-016).
  const [requestedKey, setRequestedKey] = useState<TabKey | undefined>(defaultActiveKey)
  const entries = useMemo(() => buildTabEntries(normalizedTabs), [normalizedTabs])
  const wantedKey = isControlled ? activeKey : requestedKey
  const requestedTab = entries.find((entry) => sameKey(entry.key, wantedKey))
  const hasRequestedActiveTab = Boolean(requestedTab && !requestedTab.disabled)
  const activeEntry = hasRequestedActiveTab ? requestedTab : entries.find((entry) => !entry.disabled)
  const idPrefix = useId()
  const safeIdPrefix = useMemo(() => `duralux-tabs-${toSafeDomSegment(idPrefix)}`, [idPrefix])
  const tablistLabel = ariaLabelledBy ? undefined : ariaLabelProp ?? ariaLabel ?? DEFAULT_TABLIST_LABEL
  const tabRefs = useRef(new Map<string, HTMLButtonElement>())
  const warnedRef = useRef(new Set<string>())
  const invalidControlledKey = isControlled && entries.length > 0 && !hasRequestedActiveTab ? activeKey : undefined

  // Efecto solo de diagnóstico: no toca estado ni notifica al padre.
  useEffect(() => {
    const messages = duplicateWarnings(entries)
    if (invalidControlledKey !== undefined) {
      messages.push(
        `Tabs: activeKey "${String(invalidControlledKey)}" no corresponde a una pestaña habilitada; se muestra la primera disponible. Actualiza activeKey desde el padre.`,
      )
    }
    messages.forEach((message) => {
      if (warnedRef.current.has(message)) return
      warnedRef.current.add(message)
      log.warn(message)
    })
  }, [entries, invalidControlledKey])

  const selectTab = (entry: TabEntry | undefined) => {
    if (!entry || entry.disabled || entry.reactKey === activeEntry?.reactKey) return
    if (!isControlled) setRequestedKey(entry.key)
    onChange?.(entry.key as K)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, entry: TabEntry) => {
    if (!entry || entry.disabled) return
    const enabledEntries = entries.filter((candidate) => !candidate.disabled)
    if (enabledEntries.length === 0) return
    const currentPosition = enabledEntries.findIndex((candidate) => candidate.reactKey === entry.reactKey)
    if (currentPosition === -1) return

    let nextPosition: number
    switch (event.key) {
      case 'ArrowRight':
        nextPosition = (currentPosition + 1) % enabledEntries.length
        break
      case 'ArrowLeft':
        nextPosition = (currentPosition - 1 + enabledEntries.length) % enabledEntries.length
        break
      case 'Home':
        nextPosition = 0
        break
      case 'End':
        nextPosition = enabledEntries.length - 1
        break
      default:
        return
    }

    event.preventDefault()
    const nextEntry = enabledEntries[nextPosition]
    tabRefs.current.get(nextEntry.reactKey)?.focus()
    selectTab(nextEntry)
  }

  const getTabId = (entry: TabEntry) => `${safeIdPrefix}-tab-${entry.segment}`
  const getPanelId = (entry: TabEntry) => `${safeIdPrefix}-panel-${entry.segment}`
  const isActiveEntry = (entry: TabEntry) => activeEntry?.reactKey === entry.reactKey

  return (
    <div ref={ref} className="gcu-tabs-root">
      <div className="gcu-tabs-viewport">
        <ul
          className={cx('nav', 'nav-tabs', 'gcu-tabs', className)}
          role="tablist"
          aria-label={tablistLabel}
          aria-labelledby={ariaLabelledBy}
          aria-orientation="horizontal"
        >
          {entries.map((entry) => (
            <li key={entry.reactKey} className={cx('nav-item', tabClassName)} role="presentation">
              <button
                ref={(node) => {
                  if (node) tabRefs.current.set(entry.reactKey, node)
                  else tabRefs.current.delete(entry.reactKey)
                }}
                id={getTabId(entry)}
                className={cx('nav-link', 'gcu-tabs__tab', isActiveEntry(entry) && 'active')}
                onClick={() => selectTab(entry)}
                onKeyDown={(event) => handleKeyDown(event, entry)}
                type="button"
                role="tab"
                disabled={entry.disabled}
                aria-controls={getPanelId(entry)}
                aria-selected={isActiveEntry(entry)}
                aria-disabled={entry.disabled ? 'true' : undefined}
                tabIndex={entry.disabled ? -1 : isActiveEntry(entry) ? 0 : -1}
              >
                {entry.icon && <i className={`${entry.icon} me-2`} aria-hidden="true"></i>}
                {entry.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="tab-content">
        {entries.map((entry) => (
          <div
            key={entry.reactKey}
            id={getPanelId(entry)}
            className={cx('tab-pane', 'fade', isActiveEntry(entry) && 'show active')}
            role="tabpanel"
            aria-labelledby={getTabId(entry)}
            hidden={!isActiveEntry(entry)}
          >
            {isActiveEntry(entry) && entry.content}
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Tabs — patrón APG de pestañas con activación automática.
 *
 * - Flechas izquierda/derecha, Home y End mueven foco y selección (saltan las deshabilitadas).
 * - Controlado (`activeKey` + `onChange`) o no controlado (`defaultActiveKey`); la pestaña activa se
 *   deriva en render. Un `activeKey` inválido muestra la primera habilitada y avisa por `log.warn`,
 *   sin notificar al padre: `onChange` solo sale de una acción del usuario.
 * - Indicador de la pestaña activa animado por transform (reduced-motion lo deja instantáneo).
 * - Pista con scroll horizontal en contenedores angostos (container query).
 */
export const Tabs = forwardRef(TabsInner) as <K extends TabKey = TabKey>(
  props: TabsProps<K> & { ref?: React.Ref<HTMLDivElement> },
) => React.ReactElement
