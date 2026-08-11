import { useId, useMemo, useState } from 'react'

const EMPTY_ARRAY = Object.freeze([])
const MAX_PAGE_SIZE_OPTIONS = 20

function safeString(value, fallback = '') {
  try {
    return String(value)
  } catch {
    return fallback
  }
}

function normalizeText(value) {
  if (value === null || value === undefined) return ''
  return safeString(value).trim()
}

function normalizePageSize(value) {
  if (!Number.isFinite(value) || value <= 0) return null
  return Math.max(1, Math.floor(value))
}

/**
 * Page-size options are deliberately bounded: a hostile or accidentally
 * generated list cannot create an unbounded select. Values are finite,
 * positive integers, sorted, and unique; at most twenty are rendered.
 */
export function normalizePageSizeOptions(options, includeValue) {
  const values = []
  const source = Array.isArray(options) ? options : EMPTY_ARRAY

  source.forEach(value => {
    const normalized = normalizePageSize(value)
    if (normalized !== null) values.push(normalized)
  })

  const included = normalizePageSize(includeValue)
  if (included !== null) values.push(included)

  const unique = Array.from(new Set(values)).sort((left, right) => left - right)
  if (unique.length <= MAX_PAGE_SIZE_OPTIONS) return unique

  const limited = unique.slice(0, MAX_PAGE_SIZE_OPTIONS)
  if (included !== null && !limited.includes(included)) {
    limited[limited.length - 1] = included
    limited.sort((left, right) => left - right)
  }
  return limited
}

export function DataTableToolbar({
  searchable = true,
  searchValue,
  defaultSearchValue = '',
  onSearchChange,
  searchLabel = 'Buscar registros',
  searchPlaceholder = 'Buscar...',
  searchId,
  pageSize,
  pageSizeOptions = EMPTY_ARRAY,
  onPageSizeChange,
  pageSizeLabel = 'Filas por página',
  pageSizeId,
  className,
  children,
}) {
  const generatedSearchId = useId()
  const generatedPageSizeId = useId()
  const resolvedSearchId = searchId || `duralux-data-search-${generatedSearchId}`
  const resolvedPageSizeId = pageSizeId || `duralux-data-page-size-${generatedPageSizeId}`
  const [internalSearch, setInternalSearch] = useState(() => normalizeText(defaultSearchValue))
  const [internalPageSize, setInternalPageSize] = useState(
    () => normalizePageSize(pageSize) ?? 10,
  )
  const controlledSearch = searchValue !== undefined
  const visibleSearch = controlledSearch
    ? normalizeText(searchValue)
    : internalSearch
  const normalizedOptions = useMemo(
    () => normalizePageSizeOptions(pageSizeOptions, pageSize),
    [pageSizeOptions, pageSize],
  )
  const hasSearch = searchable !== false
  const hasPageSize = normalizedOptions.length > 1
  const controlledPageSize = typeof onPageSizeChange === 'function' && pageSize !== undefined
  const normalizedPageSize = normalizePageSize(pageSize)
  const visiblePageSize = controlledPageSize
    ? (normalizedPageSize ?? normalizedOptions[0] ?? 10)
    : (normalizedOptions.includes(internalPageSize)
      ? internalPageSize
      : normalizedOptions[0] ?? internalPageSize)
  const safeSearchLabel = normalizeText(searchLabel) || 'Buscar registros'
  const safeSearchPlaceholder = normalizeText(searchPlaceholder) || 'Buscar...'
  const safePageSizeLabel = normalizeText(pageSizeLabel) || 'Filas por página'

  if (!hasSearch && !hasPageSize && children === undefined) return null

  const handleSearchChange = event => {
    const nextValue = event.currentTarget.value
    if (!controlledSearch) setInternalSearch(nextValue)
    if (typeof onSearchChange === 'function') onSearchChange(nextValue)
  }

  const handlePageSizeChange = event => {
    const nextValue = Number(event.currentTarget.value)
    if (!Number.isFinite(nextValue)) return
    const nextPageSize = normalizePageSize(nextValue)
    if (nextPageSize === null) return
    if (!controlledPageSize) setInternalPageSize(nextPageSize)
    if (typeof onPageSizeChange === 'function') onPageSizeChange(nextPageSize)
  }

  return (
    <div className={['data-table-toolbar', typeof className === 'string' ? className : '']
      .filter(Boolean)
      .join(' ')}>
      {hasSearch ? (
        <div className="data-table-toolbar__search">
          <label htmlFor={resolvedSearchId}>{safeSearchLabel}</label>
          <input
            id={resolvedSearchId}
            type="text"
            className="form-control"
            value={visibleSearch}
            placeholder={safeSearchPlaceholder}
            aria-label={safeSearchLabel}
            onChange={handleSearchChange}
          />
        </div>
      ) : null}

      {hasPageSize ? (
        <div className="data-table-toolbar__page-size">
          <label htmlFor={resolvedPageSizeId}>{safePageSizeLabel}</label>
          <select
            id={resolvedPageSizeId}
            className="form-select"
            value={String(visiblePageSize)}
            aria-label={safePageSizeLabel}
            onChange={handlePageSizeChange}
          >
            {normalizedOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      ) : null}

      {children}
    </div>
  )
}
