import { isArray, isFiniteNumber, isFunction, isObject, isString } from '../../utils/typeGuards'
import { readProperty, safeString } from './tableModel'

export function normalizeSearchValue(value) {
  if (value === null || value === undefined) return ''
  return safeString(value).trim()
}

export function normalizePageSize(pageSize) {
  return isFiniteNumber(pageSize) && pageSize > 0
    ? Math.max(1, Math.floor(pageSize))
    : 10
}

export function clampPage(page, totalPages) {
  const normalizedPage = isFiniteNumber(page) ? Math.floor(page) : 1
  return Math.min(Math.max(normalizedPage, 1), Math.max(totalPages, 1))
}

export function sameSelection(left, right) {
  if (!left || !right || left.size !== right.size) return false
  for (const value of left) {
    if (!right.has(value)) return false
  }
  return true
}

export function isSortableKey(key) {
  return (isString(key) && key.length > 0) || isFiniteNumber(key)
}

export function sortableColumn(column) {
  return Boolean(readProperty(column, 'sortable'))
    && isSortableKey(readProperty(column, 'key'))
}

export function defaultFilterResolver(row) {
  if (row === null || row === undefined) return row
  if (!isObject(row)) return row

  try {
    return Object.keys(row).map(key => readProperty(row, key))
  } catch {
    return row
  }
}

export function filterText(value, seen = new Set()) {
  if (value === null || value === undefined) return ''
  if (!isObject(value) && !isArray(value)) return safeString(value)
  if (seen.has(value)) return ''
  seen.add(value)

  if (isArray(value)) return value.map(item => filterText(item, seen)).join(' ')

  try {
    return Object.keys(value)
      .map(key => filterText(readProperty(value, key), seen))
      .join(' ')
  } catch {
    return safeString(value)
  }
}

export function matchesFilter(
  entry,
  searchValue,
  filterResolver,
  filterPredicate,
  warningsRef,
) {
  try {
    if (isFunction(filterPredicate)) {
      return Boolean(filterPredicate(entry.row, searchValue, entry.index))
    }

    const resolved = isFunction(filterResolver)
      ? filterResolver(entry.row, entry.index)
      : defaultFilterResolver(entry.row)

    const searchTarget = filterText(resolved).toLowerCase()
    return searchTarget.includes(searchValue.toLowerCase())
  } catch {
    if (warningsRef && !warningsRef.current.has(`filter-error-${entry.index}`)) {
      warningsRef.current.add(`filter-error-${entry.index}`)
      console.warn(`[duralux/ui] DataTable: error al filtrar la fila ${entry.index + 1}.`)
    }
    return false
  }
}

export function sortEntries(
  entries,
  sortKey,
  sortDir,
) {
  if (!isSortableKey(sortKey)) return entries

  return [...entries].sort((a, b) => {
    const aVal = readProperty(a.row, sortKey)
    const bVal = readProperty(b.row, sortKey)

    if (aVal === bVal) return 0
    if (aVal === null || aVal === undefined) return 1
    if (bVal === null || bVal === undefined) return -1

    if (isFiniteNumber(aVal) && isFiniteNumber(bVal)) {
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal
    }

    const aStr = safeString(aVal).toLowerCase()
    const bStr = safeString(bVal).toLowerCase()
    const comparison = aStr.localeCompare(bStr)
    return sortDir === 'asc' ? comparison : -comparison
  })
}
