import { useEffect, useState } from 'react'
import { useThemeOptional } from '../../theme/ThemeContext'
import { APEX_CHART_THEME } from './chartPalette'
import { isArray, isFunction, isObject } from '../../utils/typeGuards'

const THEME_MODES = new Set(['light', 'dark'])
const UNSAFE_KEYS = new Set(['__proto__', 'constructor', 'prototype'])

function isThemeMode(value) {
  return THEME_MODES.has(value)
}

function themeModeFromPreference(preference) {
  if (isThemeMode(preference)) return preference
  const mode = readOwnDataValue(preference, 'mode')
  if (isThemeMode(mode)) {
    return mode
  }
  return undefined
}

function readOwnDataValue(value, key) {
  if (value === null || value === undefined) {
    return undefined
  }

  try {
    return value[key]
  } catch {
    return undefined
  }
}

function nearestThemeElement(scopeRef) {
  const node = scopeRef?.current
  if (!node || !isFunction(node.closest)) return null
  return node.closest('[data-gcu-theme], .app-skin-dark')
}

function nearestThemeMode(scopeRef) {
  const localScope = nearestThemeElement(scopeRef)
  return themeModeFromElement(localScope)
}

function themeModeFromElement(localScope) {
  const localMode = localScope?.getAttribute?.('data-gcu-theme')
  if (isThemeMode(localMode)) return localMode
  if (localScope?.classList?.contains('app-skin-dark')) return 'dark'
  return undefined
}

/**
 * Read only the nearest declared scope. There is intentionally no global
 * query for a dark node: a second light/dark scope must not recolor this
 * chart. The document root is used only when the chart has no local scope.
 */
export function readAmbientChartTheme(scopeRef) {
  if (!globalThis.document) return 'light'

  const localMode = nearestThemeMode(scopeRef)
  if (localMode) return localMode

  const root = document.documentElement
  if (root.dataset.gcuTheme === 'dark' || root.classList.contains('app-skin-dark')) return 'dark'
  if (root.dataset.gcuTheme === 'light') return 'light'
  return 'light'
}

export function useChartTheme(preference, scopeRef) {
  const themeContext = useThemeOptional()
  const preferredTheme = themeModeFromPreference(preference)
  const contextMode = themeContext?.mode
  // Stable on server and on the first hydrated render; DOM inspection lives
  // in the effect below.
  const [ambientTheme, setAmbientTheme] = useState('light')
  const [scopeTheme, setScopeTheme] = useState(undefined)
  useEffect(() => {
    if (preferredTheme || !globalThis.document) return undefined

    const update = () => {
      setScopeTheme(nearestThemeMode(scopeRef))
      if (!contextMode) setAmbientTheme(readAmbientChartTheme(scopeRef))
    }
    update()

    if (!globalThis.MutationObserver) return undefined

    // Observe the document tree, not only the current scope. A chart can be
    // moved between light/dark ancestors by a portal, drag/drop surface, or
    // host DOM integration without a React render; childList/subtree catches
    // that move while `nearestThemeMode` still keeps the lookup local.
    const observedNode = document.documentElement
    const observer = new MutationObserver(update)
    observer.observe(observedNode, {
      attributes: true,
      attributeFilter: ['class', 'data-gcu-theme'],
      childList: true,
      subtree: true,
    })

    return () => observer.disconnect()
  }, [contextMode, preferredTheme, scopeRef])

  return preferredTheme ?? scopeTheme ?? contextMode ?? ambientTheme
}

function isPlainObject(value) {
  if (!isObject(value) || isArray(value)) return false
  try {
    const prototype = Object.getPrototypeOf(value)
    return prototype === Object.prototype || prototype === null
  } catch {
    return false
  }
}

function cloneChartValue(value, seen = new WeakMap()) {
  if (Array.isArray(value)) {
    if (seen.has(value)) return seen.get(value)
    const clone = []
    seen.set(value, clone)
    const length = readOwnDataValue(value, 'length') || 0
    for (let index = 0; index < length; index += 1) {
      const item = readOwnDataValue(value, index)
      clone.push(cloneChartValue(item, seen))
    }
    return clone
  }

  if (!isPlainObject(value)) return value
  if (seen.has(value)) return seen.get(value)

  const clone = {}
  seen.set(value, clone)
  let keys = []
  try {
    keys = Object.keys(value)
  } catch {
    return clone
  }
  keys.forEach((key) => {
    if (UNSAFE_KEYS.has(key)) return
    const item = readOwnDataValue(value, key)
    if (item !== undefined || Object.prototype.hasOwnProperty.call(value, key)) {
      clone[key] = cloneChartValue(item, seen)
    }
  })
  return clone
}

/** Deep merge that never writes into caller-owned Apex options. */
export function mergeChartOptions(base, override) {
  const result = isPlainObject(base) ? cloneChartValue(base) : {}
  if (!isPlainObject(override)) return result

  let keys = []
  try {
    keys = Object.keys(override)
  } catch {
    return result
  }
  keys.forEach((key) => {
    if (UNSAFE_KEYS.has(key)) return
    const value = readOwnDataValue(override, key)
    const current = readOwnDataValue(result, key)
    if (isPlainObject(current) && isPlainObject(value)) {
      result[key] = mergeChartOptions(current, value)
    } else {
      result[key] = cloneChartValue(value)
    }
  })
  return result
}

export function getApexOptionThemeMode(options) {
  const optionsTheme = readOwnDataValue(options, 'theme')
  const mode = readOwnDataValue(optionsTheme, 'mode')
  return isThemeMode(mode) ? mode : undefined
}

function removeInvalidTooltipStyleFields(options) {
  const tooltip = readOwnDataValue(options, 'tooltip')
  const style = readOwnDataValue(tooltip, 'style')
  if (!isPlainObject(style)) return options

  const cleanStyle = cloneChartValue(style)
  delete cleanStyle.background
  delete cleanStyle.color
  if (Object.keys(cleanStyle).length) {
    tooltip.style = cleanStyle
  } else {
    delete tooltip.style
  }
  return options
}

export function buildApexOptions({
  options,
  type,
  height,
  width,
  mode = 'light',
  theme,
  reducedMotion = false,
}) {
  const resolvedMode = isThemeMode(mode) ? mode : 'light'
  const literalTheme = APEX_CHART_THEME[resolvedMode]
  const defaults = {
    // Apex must receive actual colors. Recharts uses the CSS-aware palette.
    colors: [...literalTheme.series],
    chart: {
      type,
      height,
      width,
      background: literalTheme.background,
      foreColor: literalTheme.text,
      animations: { enabled: !reducedMotion },
    },
    theme: { mode: resolvedMode },
    grid: { borderColor: literalTheme.border },
    xaxis: {
      labels: { style: { colors: literalTheme.muted } },
      axisBorder: { color: literalTheme.border },
      axisTicks: { color: literalTheme.border },
    },
    yaxis: {
      labels: { style: { colors: literalTheme.muted } },
    },
    tooltip: {
      theme: resolvedMode,
    },
    legend: { labels: { colors: literalTheme.text } },
  }
  const withPropTheme = theme && isObject(theme)
    ? mergeChartOptions(defaults, { theme })
    : defaults

  // Direct Apex options are the legacy escape hatch, so their explicit
  // values win over ambient/component defaults. Reduced motion is the one
  // accessibility invariant that remains enforced after that merge.
  const resolved = mergeChartOptions(withPropTheme, isPlainObject(options) ? options : {})
  if (reducedMotion) {
    resolved.chart = mergeChartOptions(resolved.chart, { animations: { enabled: false } })
  }
  return removeInvalidTooltipStyleFields(resolved)
}
