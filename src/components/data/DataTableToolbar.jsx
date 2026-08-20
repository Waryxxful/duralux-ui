import { useId, useMemo, useState } from 'react'
import {
  EMPTY_ARRAY,
  normalizePageSize,
  normalizePageSizeOptions,
  normalizeText,
} from './dataTableToolbarModel'
import { isFiniteNumber, isFunction, isString } from '../../utils/typeGuards'

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
  const controlledPageSize = isFunction(onPageSizeChange) && pageSize !== undefined
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
    if (isFunction(onSearchChange)) onSearchChange(nextValue)
  }

  const handlePageSizeChange = event => {
    const nextValue = Number(event.currentTarget.value)
    if (!isFiniteNumber(nextValue)) return
    const nextPageSize = normalizePageSize(nextValue)
    if (nextPageSize === null) return
    if (!controlledPageSize) setInternalPageSize(nextPageSize)
    if (isFunction(onPageSizeChange)) onPageSizeChange(nextPageSize)
  }

  return (
    <div className={['data-table-toolbar', isString(className) ? className : '']
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
