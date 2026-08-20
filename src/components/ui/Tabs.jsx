import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { safeRead, toSafeDomSegment } from './internal/safeDom.js'
import { isArray, isFiniteNumber, isString } from '../../utils/typeGuards'

const EMPTY_TABS = []
const DEFAULT_TABLIST_LABEL = 'Pestañas'

function isDevelopment() {
  const nodeEnvironment = globalThis.process?.env?.NODE_ENV
  if (nodeEnvironment) return nodeEnvironment !== 'production'
  return import.meta.env?.DEV === true
}

function sameKey(left, right) {
  return Object.is(left, right) || left === right
}

function buildTabEntries(tabs) {
  const occurrences = new Map()
  const usedReactKeys = new Set()

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
      tab,
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

function warnDuplicateTabs(entries, warnedRef) {
  if (!isDevelopment()) return
  const seen = new Map()
  entries.forEach((entry) => {
    if (!seen.has(entry.token)) {
      seen.set(entry.token, entry.index)
      return
    }
    const warningKey = `${entry.token}:${seen.get(entry.token)}:${entry.index}`
    if (warnedRef.current.has(warningKey)) return
    warnedRef.current.add(warningKey)
    console.warn(
      `[duralux/ui] Tabs: la key debe ser única; las pestañas ${seen.get(entry.token) + 1} y ${entry.index + 1} comparten la misma identidad.`,
    )
  })
}

export function Tabs({
  tabs = [],
  className = '',
  tabClassName = '',
  activeKey,
  defaultActiveKey,
  onChange,
  ariaLabel,
  'aria-label': ariaLabelProp,
  'aria-labelledby': ariaLabelledBy,
}) {
  const normalizedTabs = isArray(tabs) ? tabs : EMPTY_TABS
  const isControlled = activeKey !== undefined
  const firstEnabledKey = () => {
    const firstEnabled = normalizedTabs.find((tab) => !safeRead(tab, 'disabled', false))
    return safeRead(firstEnabled, 'key', undefined)
  }
  const [uncontrolledActiveKey, setUncontrolledActiveKey] = useState(
    () => defaultActiveKey ?? firstEnabledKey(),
  )
  const entries = useMemo(() => buildTabEntries(normalizedTabs), [normalizedTabs])
  const requestedActiveKey = isControlled ? activeKey : uncontrolledActiveKey
  const requestedTab = entries.find((entry) => sameKey(entry.key, requestedActiveKey))
  const hasRequestedActiveTab = Boolean(requestedTab && !requestedTab.disabled)
  const activeEntry = hasRequestedActiveTab
    ? requestedTab
    : entries.find((entry) => !entry.disabled)
  const active = activeEntry?.key
  const idPrefix = useId()
  const safeIdPrefix = useMemo(() => `duralux-tabs-${toSafeDomSegment(idPrefix)}`, [idPrefix])
  const tablistLabel = ariaLabelledBy ? undefined : ariaLabelProp ?? ariaLabel ?? DEFAULT_TABLIST_LABEL
  const tabRefs = useRef(new Map())
  const reconciliationRef = useRef(null)
  const warnedRef = useRef(new Set())

  useEffect(() => {
    warnDuplicateTabs(entries, warnedRef)
  }, [entries])

  useEffect(() => {
    if (!isControlled && entries.length > 0 && !sameKey(uncontrolledActiveKey, active)) {
      if (active !== undefined) setUncontrolledActiveKey(active)
    }
  }, [active, entries.length, isControlled, uncontrolledActiveKey])

  useEffect(() => {
    const needsReconciliation = isControlled && entries.length > 0 && !hasRequestedActiveTab
    if (!needsReconciliation) {
      reconciliationRef.current = null
      return
    }

    if (active === undefined || !onChange) return

    const previousRequest = reconciliationRef.current
    if (
      previousRequest
      && sameKey(previousRequest.requestedKey, activeKey)
      && sameKey(previousRequest.fallbackKey, active)
    ) {
      return
    }

    reconciliationRef.current = { requestedKey: activeKey, fallbackKey: active }
    onChange(active)
  }, [active, activeKey, entries.length, hasRequestedActiveTab, isControlled, onChange])

  const selectTab = (entry) => {
    if (!entry || entry.disabled || sameKey(entry.key, active)) return
    if (!isControlled) setUncontrolledActiveKey(entry.key)
    onChange?.(entry.key)
  }

  const handleKeyDown = (event, entry) => {
    if (!entry || entry.disabled) return
    const enabledEntries = entries.filter((candidate) => !candidate.disabled)
    if (enabledEntries.length === 0) return

    let nextPosition
    const currentPosition = enabledEntries.findIndex((candidate) => candidate.reactKey === entry.reactKey)
    if (currentPosition === -1) return

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

  const getTabId = (entry) => `${safeIdPrefix}-tab-${entry.segment}`
  const getPanelId = (entry) => `${safeIdPrefix}-panel-${entry.segment}`
  const isActiveEntry = (entry) => activeEntry?.reactKey === entry.reactKey

  return (
    <>
      <div className="gcu-tabs-viewport">
        <ul
          className={`nav nav-tabs gcu-tabs ${className}`.trim()}
          role="tablist"
          aria-label={tablistLabel}
          aria-labelledby={ariaLabelledBy}
          aria-orientation="horizontal"
        >
          {entries.map((entry) => (
            <li key={entry.reactKey} className={`nav-item ${tabClassName}`} role="presentation">
              <button
                ref={(node) => {
                  if (node) tabRefs.current.set(entry.reactKey, node)
                  else tabRefs.current.delete(entry.reactKey)
                }}
                id={getTabId(entry)}
                className={`nav-link${isActiveEntry(entry) ? ' active' : ''}`}
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
                {entry.icon && <i className={`${entry.icon} me-2`} aria-hidden></i>}
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
            className={`tab-pane fade${isActiveEntry(entry) ? ' show active' : ''}`}
            role="tabpanel"
            aria-labelledby={getTabId(entry)}
            hidden={!isActiveEntry(entry)}
          >
            {isActiveEntry(entry) && entry.content}
          </div>
        ))}
      </div>
    </>
  )
}
