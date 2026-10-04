import React, { createContext, useContext } from 'react'
import { isArray, isFunction, isObject, isString } from '../../utils/typeGuards'

export const ChartCardTitleContext = createContext(null)

export function useChartCardTitleId() {
  return useContext(ChartCardTitleContext)
}

export function safeIdPart(value) {
  try {
    return String(value).replace(/[^A-Za-z0-9_-]+/g, '-')
  } catch {
    return 'chart'
  }
}

export function hasValue(value) {
  if (isString(value)) return value.trim() !== ''
  return value !== undefined && value !== null && value !== false
}

export function ownDescriptor(value, key) {
  if (value === null || value === undefined) return undefined
  if (!isObject(value) && !isArray(value) && !isFunction(value)) return undefined
  try {
    return Object.getOwnPropertyDescriptor(value, key)
  } catch {
    return undefined
  }
}

export function hasOwnDataValue(value, key) {
  const descriptor = ownDescriptor(value, key)
  return Boolean(descriptor && Object.prototype.hasOwnProperty.call(descriptor, 'value'))
}

export function readChartDataValue(value, key) {
  if (value === null || value === undefined) return undefined
  try {
    return value[key]
  } catch {
    return undefined
  }
}

export function safeArrayLength(value) {
  const length = readChartDataValue(value, 'length')
  return Number.isSafeInteger(length) && length >= 0 ? length : 0
}

export function safeObjectKeys(value) {
  if (value === null || value === undefined) return []
  try {
    return Object.keys(value)
  } catch {
    return []
  }
}

export function columnHeaderId(tableId, key, index) {
  return `${tableId}-column-${safeIdPart(key)}-${index}`
}

export function resolveErrorValue(error, key) {
  if (!error || !isObject(error) || React.isValidElement(error)) return undefined
  return readChartDataValue(error, key)
}

export function chartErrorMessage(error, explicitMessage) {
  if (hasValue(explicitMessage)) return explicitMessage
  if (error instanceof Error) return error.message
  if (isString(error)) return error
  if (React.isValidElement(error)) return error
  return resolveErrorValue(error, 'message')
}

export function chartErrorTitle(error, explicitTitle) {
  if (hasValue(explicitTitle)) return explicitTitle
  return resolveErrorValue(error, 'title')
}

export function chartRetryHandler(error, onRetry) {
  const errorRetry = resolveErrorValue(error, 'onRetry')
  if (isFunction(errorRetry)) return errorRetry
  return isFunction(onRetry) ? onRetry : undefined
}

/** Resolve the shared accessible-table contract: false disables it, true uses the default table, and a node replaces it. */
export function resolveChartAlternative(value, fallback) {
  if (value === false) return false
  if (value === true || value === undefined) return fallback
  return value
}

export function safeDisplayValue(value, seen = new WeakSet(), depth = 0) {
  if (value === undefined || value === null || value === '') return '—'
  if (!isObject(value) && !isArray(value)) {
    try {
      return String(value)
    } catch {
      return '[objeto]'
    }
  }
  if (depth >= 3 || seen.has(value)) return '[objeto]'
  seen.add(value)

  if (isArray(value)) {
    const values = []
    for (let index = 0; index < safeArrayLength(value); index += 1) {
      values.push(safeDisplayValue(readChartDataValue(value, index), seen, depth + 1))
    }
    return `[${values.join(', ')}]`
  }

  const entries = {}
  safeObjectKeys(value).forEach((key) => {
    if (!hasOwnDataValue(value, key)) return
    entries[key] = safeDisplayValue(readChartDataValue(value, key), seen, depth + 1)
  })
  try {
    return JSON.stringify(entries)
  } catch {
    return '[objeto]'
  }
}

export function formatAlternativeValue(value) {
  return safeDisplayValue(value)
}

export function tableCaption(title, fallback) {
  return hasValue(title) ? title : fallback
}

export function normalizeCartesianData(data) {
  if (!isArray(data)) return []
  return Array.from({ length: safeArrayLength(data) }, (_, index) => {
    const row = readChartDataValue(data, index)
    if (!isObject(row) || hasOwnDataValue(row, 'name') || !hasOwnDataValue(row, 'x')) return row

    const copy = {}
    safeObjectKeys(row).forEach((key) => {
      if (hasOwnDataValue(row, key)) copy[key] = readChartDataValue(row, key)
    })
    copy.name = readChartDataValue(row, 'x')
    return copy
  })
}

export function firstDefinedValue(value, keys) {
  for (const key of keys) {
    if (!hasOwnDataValue(value, key)) continue
    const candidate = readChartDataValue(value, key)
    if (candidate !== undefined && candidate !== null && candidate !== '') return candidate
  }
  return undefined
}
