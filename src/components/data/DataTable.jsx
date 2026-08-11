import { isValidElement, memo, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { Checkbox } from '../form/Checkbox'
import {
  createRowEntries,
  createSafeDomId,
  isUsableRowKey,
  resolveRowKey,
  Table,
  validateRowEntries,
} from './Table'
import { DataTableToolbar, normalizePageSizeOptions } from './DataTableToolbar'
import { Pagination } from './Pagination'

const EMPTY_ARRAY = Object.freeze([])
const DEFAULT_FILTER_MODE = 'local'

function isDevelopment() {
  return typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production'
}

function safeString(value, fallback = '') {
  try {
    return String(value)
  } catch {
    return fallback
  }
}

function readProperty(target, property) {
  if (target === null || target === undefined) return undefined

  try {
    return target[property]
  } catch {
    return undefined
  }
}

function warnOnce(warningsRef, key, message) {
  if (!isDevelopment() || warningsRef.current.has(key)) return
  warningsRef.current.add(key)
  console.warn(`[duralux/ui] ${message}`)
}

function normalizeSearchValue(value) {
  if (value === null || value === undefined) return ''
  return safeString(value).trim()
}

function normalizePageSize(pageSize) {
  return Number.isFinite(pageSize) && pageSize > 0
    ? Math.max(1, Math.floor(pageSize))
    : 10
}

function clampPage(page, totalPages) {
  const normalizedPage = Number.isFinite(page) ? Math.floor(page) : 1
  return Math.min(Math.max(normalizedPage, 1), Math.max(totalPages, 1))
}

function sameSelection(left, right) {
  if (left.size !== right.size) return false
  for (const value of left) {
    if (!right.has(value)) return false
  }
  return true
}

function isSortableKey(key) {
  return (typeof key === 'string' && key.length > 0) || typeof key === 'number'
}

function sortableColumn(column) {
  return Boolean(readProperty(column, 'sortable'))
    && isSortableKey(readProperty(column, 'key'))
}

function isObjectLike(value) {
  return value !== null && (typeof value === 'object' || typeof value === 'function')
}

function normalizeAccessibleLabel(value, fallback) {
  if (typeof value === 'string' || typeof value === 'number') {
    const label = safeString(value).trim()
    if (label) return label
  }
  return fallback
}

function defaultGetRowLabel(row, index) {
  const candidate = readProperty(row, 'name')
    ?? readProperty(row, 'label')
    ?? readProperty(row, 'title')
    ?? readProperty(row, 'id')

  if (candidate !== null && candidate !== undefined) {
    const label = safeString(candidate).trim()
    if (label) return label
  }

  return `Fila ${index + 1}`
}

function resolveAccessibleRowLabel(resolveRowLabel, row, index, warningsRef) {
  try {
    return normalizeAccessibleLabel(
      resolveRowLabel(row, index),
      `Fila ${index + 1}`,
    )
  } catch {
    warnOnce(
      warningsRef,
      `row-label-${index}`,
      `DataTable: getRowLabel falló para la fila ${index + 1}; se usará un nombre de fallback.`,
    )
    return `Fila ${index + 1}`
  }
}

function normalizeActionLabel(value, fallback) {
  if (typeof value === 'string' || typeof value === 'number') {
    const label = safeString(value).trim()
    if (label) return { accessibleLabel: label, visibleLabel: label }
  }

  if (isValidElement(value)) {
    return { accessibleLabel: fallback, visibleLabel: value }
  }

  return { accessibleLabel: fallback, visibleLabel: fallback }
}

function normalizeAction(action, index, warningsRef) {
  if (action === null || (typeof action !== 'object' && typeof action !== 'function')) {
    warnOnce(
      warningsRef,
      `action-invalid-${index}`,
      `DataTable: la acción ${index + 1} no es válida y se omitirá.`,
    )
    return null
  }

  const onClick = readProperty(action, 'onClick')
  if (typeof onClick !== 'function') {
    warnOnce(
      warningsRef,
      `action-callback-${index}`,
      `DataTable: la acción ${index + 1} no tiene un callback onClick y se omitirá.`,
    )
    return null
  }

  const fallbackLabel = `Acción ${index + 1}`
  const { accessibleLabel, visibleLabel } = normalizeActionLabel(
    readProperty(action, 'label'),
    fallbackLabel,
  )
  const iconValue = readProperty(action, 'icon')
  const icon = typeof iconValue === 'string' && iconValue.trim()
    ? iconValue.trim()
    : ''
  const requestedVariant = readProperty(action, 'variant')
  const variant = requestedVariant === 'button' ? 'button' : 'icon'
  const effectiveVariant = variant === 'icon' && !icon ? 'button' : variant
  const buttonVariantValue = readProperty(action, 'buttonVariant')
  const buttonVariant = typeof buttonVariantValue === 'string'
    && /^[A-Za-z0-9_-]+$/.test(buttonVariantValue.trim())
    ? buttonVariantValue.trim()
    : 'light-brand'

  return {
    index,
    onClick,
    icon,
    variant: effectiveVariant,
    buttonVariant,
    accessibleLabel,
    visibleLabel,
  }
}

function renderActionControl(action, row) {
  if (action.variant === 'button') {
    return (
      <button
        key={`action-${action.index}`}
        type="button"
        className={`btn btn-sm btn-${action.buttonVariant}`}
        aria-label={action.accessibleLabel}
        onClick={() => action.onClick(row)}
      >
        {action.icon ? (
          <i className={`${action.icon} me-1`} aria-hidden="true" />
        ) : null}
        {action.visibleLabel}
      </button>
    )
  }

  return (
    <button
      key={`action-${action.index}`}
      type="button"
      className="btn btn-icon btn-light-brand btn-sm"
      title={action.accessibleLabel}
      aria-label={action.accessibleLabel}
      onClick={() => action.onClick(row)}
    >
      <i className={action.icon} aria-hidden="true" />
    </button>
  )
}

function defaultFilterResolver(row) {
  if (row === null || row === undefined) return row
  if (typeof row !== 'object') return row

  try {
    return Object.keys(row).map(key => readProperty(row, key))
  } catch {
    return row
  }
}

function filterText(value, seen = new Set()) {
  if (value === null || value === undefined) return ''
  if (typeof value !== 'object') return safeString(value)
  if (seen.has(value)) return ''
  seen.add(value)

  if (Array.isArray(value)) return value.map(item => filterText(item, seen)).join(' ')

  try {
    return Object.keys(value)
      .map(key => filterText(readProperty(value, key), seen))
      .join(' ')
  } catch {
    return safeString(value)
  }
}

function matchesFilter(entry, searchValue, filterResolver, filterPredicate, warningsRef) {
  try {
    if (typeof filterPredicate === 'function') {
      return Boolean(filterPredicate(entry.row, searchValue, entry.index))
    }

    const resolved = typeof filterResolver === 'function'
      ? filterResolver(entry.row, entry.index)
      : defaultFilterResolver(entry.row)
    return filterText(resolved).toLocaleLowerCase().includes(searchValue.toLocaleLowerCase())
  } catch {
    const mode = typeof filterPredicate === 'function' ? 'predicate' : 'resolver'
    warnOnce(
      warningsRef,
      `filter-${mode}-${entry.index}`,
      `DataTable: el ${mode} de filtro falló para la fila ${entry.index + 1}; se omitirá esa fila.`,
    )
    return false
  }
}

function compareEntries(left, right, sortKey, sortDir) {
  const leftValue = readProperty(left.row, sortKey) ?? ''
  const rightValue = readProperty(right.row, sortKey) ?? ''
  const leftText = safeString(leftValue)
  const rightText = safeString(rightValue)
  let comparison = 0

  try {
    comparison = leftText.localeCompare(rightText, undefined, { numeric: true })
  } catch {
    comparison = 0
  }

  return sortDir === 'asc' ? comparison : -comparison
}

const DataTableCell = memo(function DataTableCell({ entry, column, pageRowIndex }) {
  const key = readProperty(column, 'key')
  const render = readProperty(column, 'render')
  const value = readProperty(entry.row, key)

  return (
    <td>
      {typeof render === 'function'
        ? render(entry.row, value, pageRowIndex)
        : value}
    </td>
  )
})

const DataTableRow = memo(function DataTableRow({
  entry,
  pageRowIndex,
  normalizedColumns,
  validActions,
  selectable,
  selected,
  loading,
  resolveRowLabel,
  warningsRef,
  instanceId,
  toggleRow,
}) {
  const rowLabel = selectable
    ? resolveAccessibleRowLabel(
      resolveRowLabel,
      entry.row,
      entry.displayIndex ?? entry.index,
      warningsRef,
    )
    : ''
  const checkboxLabel = `Seleccionar fila ${rowLabel}`
  const rowCheckboxId = createSafeDomId(`${instanceId}-row`, entry.identity)

  return (
    <tr className={`single-item${selected ? ' selected' : ''}`}>
      {selectable ? (
        <td>
          <Checkbox
            id={rowCheckboxId}
            className="ms-1"
            label={<span className="visually-hidden">{checkboxLabel}</span>}
            aria-label={checkboxLabel}
            checked={selected}
            disabled={loading}
            onChange={() => toggleRow(entry.identity)}
          />
        </td>
      ) : null}
      {normalizedColumns.map((column, columnIndex) => (
        <DataTableCell
          key={`data-cell-${columnIndex}`}
          entry={entry}
          column={column}
          pageRowIndex={pageRowIndex}
        />
      ))}
      {validActions.length > 0 ? (
        <td className="gcu-table-actions-cell">
          <div className="hstack gap-2 justify-content-end gcu-table-actions">
            {validActions.map(action => renderActionControl(action, entry.row))}
          </div>
        </td>
      ) : null}
    </tr>
  )
})

const numericPageAriaLabel = pageNumber => String(pageNumber)

/**
 * DataTable — tabla con checkboxes, ordenamiento, paginación, filtering and actions.
 * Filtering is opt-in through searchable. Local mode filters the supplied
 * collection; manual mode only reports the query and leaves data untouched.
 */
export function DataTable({
  columns,
  data,
  actions,
  pageSize = 10,
  selectable = false,
  onSelectionChange,
  rowKey = 'id',
  getRowLabel = defaultGetRowLabel,
  autoWidth = false,
  loading = false,
  emptyMessage = 'Sin datos',
  noResultsMessage = 'Sin resultados',
  responsive = true,
  wrapperClassName,
  caption,
  className,
  hover = true,
  searchable = false,
  searchValue,
  defaultSearchValue,
  onSearchChange,
  searchLabel = 'Buscar registros',
  searchPlaceholder = 'Buscar...',
  filterMode = DEFAULT_FILTER_MODE,
  filterResolver,
  filterPredicate,
  pageSizeOptions,
  onPageSizeChange,
  pageSizeLabel = 'Filas por página',
  totalItems,
  toolbar,
  renderToolbar,
  search,
  defaultSearch,
  onSearch,
  searchResolver,
  searchPredicate,
  manualFiltering = false,
  totalCount,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  ...tableProps
}) {
  const normalizedColumns = Array.isArray(columns) ? columns : EMPTY_ARRAY
  const normalizedData = Array.isArray(data) ? data : EMPTY_ARRAY
  const normalizedActions = Array.isArray(actions) ? actions : EMPTY_ARRAY
  const resolvedOnSelectionChange = typeof onSelectionChange === 'function'
    ? onSelectionChange
    : undefined
  const resolvedOnPageSizeChange = typeof onPageSizeChange === 'function'
    ? onPageSizeChange
    : undefined
  const resolvedSearchValue = searchValue !== undefined ? searchValue : search
  const resolvedDefaultSearchValue = defaultSearchValue !== undefined
    ? defaultSearchValue
    : defaultSearch
  const resolvedOnSearchChange = typeof onSearchChange === 'function'
    ? onSearchChange
    : typeof onSearch === 'function'
      ? onSearch
      : undefined
  const resolvedFilterResolver = typeof filterResolver === 'function'
    ? filterResolver
    : searchResolver
  const resolvedFilterPredicate = typeof filterPredicate === 'function'
    ? filterPredicate
    : searchPredicate
  const resolvedFilterMode = manualFiltering
    || filterMode === 'manual'
    || filterMode === 'remote'
    ? 'manual'
    : 'local'
  const resolvedTotalItems = totalItems !== undefined ? totalItems : totalCount
  const hasRemoteTotal = resolvedFilterMode === 'manual'
    && Number.isFinite(resolvedTotalItems)
    && resolvedTotalItems >= 0
  const remoteTotal = hasRemoteTotal ? Math.floor(resolvedTotalItems) : null
  const searchEnabled = searchable === true
    || resolvedSearchValue !== undefined
    || resolvedDefaultSearchValue !== undefined
    || typeof resolvedOnSearchChange === 'function'
  const resolveRowLabel = typeof getRowLabel === 'function'
    ? getRowLabel
    : defaultGetRowLabel
  const normalizedRequestedPageSize = normalizePageSize(pageSize)
  const [internalPageSize, setInternalPageSize] = useState(normalizedRequestedPageSize)
  const pageSizePropRef = useRef(normalizedRequestedPageSize)
  const pageSizeControlled = typeof resolvedOnPageSizeChange === 'function'
  const effectivePageSize = pageSizeControlled
    ? normalizedRequestedPageSize
    : internalPageSize
  const normalizedOptions = useMemo(
    () => normalizePageSizeOptions(pageSizeOptions, effectivePageSize),
    [pageSizeOptions, effectivePageSize],
  )
  const [internalSearch, setInternalSearch] = useState(
    () => normalizeSearchValue(resolvedDefaultSearchValue),
  )
  const searchControlled = resolvedSearchValue !== undefined
  const effectiveSearch = searchControlled
    ? normalizeSearchValue(resolvedSearchValue)
    : internalSearch
  const activeSearch = effectiveSearch
  const hasActiveSearch = activeSearch.length > 0
  const [sortKey, setSortKey] = useState(null)
  const [sortDir, setSortDir] = useState('asc')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState(() => new Set())
  const selectedRef = useRef(selected)
  const rowKeyHistoryRef = useRef(new WeakMap())
  const warningsRef = useRef(new Set())
  const instanceId = createSafeDomId('duralux-table', useId())

  const validActions = useMemo(
    () => normalizedActions.flatMap((action, index) => {
      const normalized = normalizeAction(action, index, warningsRef)
      return normalized ? [normalized] : []
    }),
    [normalizedActions],
  )

  const allRowEntries = useMemo(
    () => createRowEntries(normalizedData, rowKey),
    [normalizedData, rowKey],
  )

  useEffect(() => {
    validateRowEntries(
      allRowEntries,
      'DataTable',
      rowKeyHistoryRef,
      warningsRef,
    )
  }, [allRowEntries])

  const filteredEntries = useMemo(() => {
    if (resolvedFilterMode === 'manual' || !hasActiveSearch) return allRowEntries

    return allRowEntries.filter(entry => matchesFilter(
      entry,
      activeSearch,
      resolvedFilterResolver,
      resolvedFilterPredicate,
      warningsRef,
    ))
  }, [activeSearch, allRowEntries, hasActiveSearch, resolvedFilterMode, resolvedFilterResolver, resolvedFilterPredicate])

  const sortedEntries = useMemo(() => {
    if (sortKey === null) return filteredEntries
    return [...filteredEntries].sort((left, right) => compareEntries(left, right, sortKey, sortDir))
  }, [filteredEntries, sortDir, sortKey])

  const displayEntries = useMemo(
    () => sortedEntries.map((entry, displayIndex) => ({ ...entry, displayIndex })),
    [sortedEntries],
  )

  useEffect(() => {
    if (typeof rowKey !== 'function') return

    displayEntries.forEach((entry, displayIndex) => {
      const nextValue = resolveRowKey(rowKey, entry.row, displayIndex)
      if (!isObjectLike(entry.row)) return

      const previous = rowKeyHistoryRef.current.get(entry.row)
      if (previous && !Object.is(previous.value, nextValue)) {
        warnOnce(
          warningsRef,
          `unstable-${entry.index}-${displayIndex}`,
          `DataTable: rowKey debe ser estable para la misma fila; cambió de "${safeString(previous.value)}" a "${safeString(nextValue)}".`,
        )
      }
      rowKeyHistoryRef.current.set(entry.row, { value: nextValue, index: displayIndex })
    })
  }, [displayEntries, rowKey])

  const totalPages = hasRemoteTotal
    ? Math.ceil(remoteTotal / effectivePageSize)
    : Math.ceil(displayEntries.length / effectivePageSize)
  const pageCount = Math.max(totalPages, 1)
  const currentPage = clampPage(page, pageCount)
  const pageEntries = useMemo(
    () => displayEntries.slice(
      (currentPage - 1) * effectivePageSize,
      currentPage * effectivePageSize,
    ),
    [currentPage, displayEntries, effectivePageSize],
  )
  const pageRows = useMemo(
    () => pageEntries.map(entry => entry.row),
    [pageEntries],
  )

  useEffect(() => {
    const nextPageSize = normalizedRequestedPageSize
    if (pageSizePropRef.current === nextPageSize) return
    pageSizePropRef.current = nextPageSize
    if (!pageSizeControlled) setInternalPageSize(nextPageSize)
  }, [normalizedRequestedPageSize, pageSizeControlled])

  useEffect(() => {
    setPage(current => {
      const nextPage = clampPage(current, pageCount)
      return current === nextPage ? current : nextPage
    })
  }, [pageCount])

  useEffect(() => {
    setPage(current => (current === 1 ? current : 1))
  }, [activeSearch, resolvedFilterMode])

  const availableSelectionKeys = useMemo(
    () => new Set(allRowEntries.map(entry => entry.identity)),
    [allRowEntries],
  )
  const publicKeyByIdentity = useMemo(
    () => new Map(allRowEntries.map(entry => [
      entry.identity,
      isUsableRowKey(entry.rawKey) && entry.identity === entry.rawKey
        ? entry.rawKey
        : entry.identity,
    ])),
    [allRowEntries],
  )
  const selectionValues = useCallback(selection => (
    Array.from(selection, identity => publicKeyByIdentity.get(identity) ?? identity)
  ), [publicKeyByIdentity])

  useEffect(() => {
    const current = selectedRef.current
    const next = new Set(
      Array.from(current).filter(identity => availableSelectionKeys.has(identity)),
    )

    if (sameSelection(current, next)) return

    selectedRef.current = next
    setSelected(next)
    resolvedOnSelectionChange?.(selectionValues(next))
  }, [availableSelectionKeys, resolvedOnSelectionChange, selectionValues])

  useEffect(() => {
    selectedRef.current = selected
  }, [selected])

  const allSelected = selectable && pageEntries.length > 0 && pageEntries.every(
    entry => selected.has(entry.identity),
  )
  const someSelected = selectable && pageEntries.some(
    entry => selected.has(entry.identity),
  )
  const selectionIsMixed = someSelected && !allSelected

  const toggleSort = useCallback((key) => {
    if (!isSortableKey(key)) return

    if (sortKey === key) {
      setSortDir(current => (current === 'asc' ? 'desc' : 'asc'))
      return
    }
    setSortKey(key)
    setSortDir('asc')
  }, [sortKey])

  const commitSelection = useCallback((next) => {
    selectedRef.current = next
    setSelected(next)
    resolvedOnSelectionChange?.(selectionValues(next))
  }, [resolvedOnSelectionChange, selectionValues])

  const toggleRow = useCallback((identity) => {
    const next = new Set(selectedRef.current)
    if (next.has(identity)) next.delete(identity)
    else next.add(identity)
    commitSelection(next)
  }, [commitSelection])

  const toggleAll = useCallback(() => {
    const next = new Set(selectedRef.current)
    if (allSelected) {
      pageEntries.forEach(entry => next.delete(entry.identity))
    } else {
      pageEntries.forEach(entry => next.add(entry.identity))
    }
    commitSelection(next)
  }, [allSelected, commitSelection, pageEntries])

  const changePage = useCallback((nextPage) => {
    if (!Number.isFinite(nextPage)) return
    const normalizedNextPage = Math.floor(nextPage)
    if (normalizedNextPage < 1 || normalizedNextPage > pageCount) return
    setPage(normalizedNextPage)
  }, [pageCount])

  const changePageSize = useCallback((nextPageSize) => {
    const normalizedNextPageSize = normalizePageSize(nextPageSize)
    if (normalizedOptions.length > 0 && !normalizedOptions.includes(normalizedNextPageSize)) return
    if (!pageSizeControlled) setInternalPageSize(normalizedNextPageSize)
    resolvedOnPageSizeChange?.(normalizedNextPageSize)
    setPage(1)
  }, [normalizedOptions, pageSizeControlled, resolvedOnPageSizeChange])

  const columnCount = normalizedColumns.length + (selectable ? 1 : 0) + (
    validActions.length > 0 ? 1 : 0
  )
  const emptyColSpan = Math.max(columnCount, 1)
  const tableColumns = useMemo(() => [
    ...(selectable ? [{ key: '__duralux_selection__', header: '' }] : []),
    ...normalizedColumns,
    ...(validActions.length > 0 ? [{ key: '__duralux_actions__', header: 'Acciones' }] : []),
  ], [normalizedColumns, selectable, validActions.length])
  const tableClassName = [
    autoWidth ? 'table-auto-width' : '',
    typeof className === 'string' ? className : '',
  ].filter(Boolean).join(' ')
  const selectAllId = `${instanceId}-select-all`

  const renderHead = useCallback(() => (
    <tr>
      {selectable ? (
        <th className="wd-30" scope="col">
          <Checkbox
            id={selectAllId}
            className="ms-1"
            label={(
              <span className="visually-hidden">
                Seleccionar todas las filas de la página actual
              </span>
            )}
            aria-label="Seleccionar todas las filas de la página actual"
            aria-checked={selectionIsMixed ? 'mixed' : allSelected ? 'true' : 'false'}
            checked={allSelected}
            indeterminate={selectionIsMixed}
            disabled={loading || pageEntries.length === 0}
            onChange={toggleAll}
          />
        </th>
      ) : null}
      {normalizedColumns.map((column, columnIndex) => {
        const key = readProperty(column, 'key')
        const label = readProperty(column, 'label') ?? readProperty(column, 'header')
        const isSortable = sortableColumn(column)
        const isCurrent = sortKey === key
        const sortValue = isCurrent
          ? (sortDir === 'asc' ? 'ascending' : 'descending')
          : 'none'

        return (
          <th
            key={`data-column-${columnIndex}`}
            scope="col"
            aria-sort={isSortable ? sortValue : undefined}
            style={isSortable ? { cursor: 'pointer', userSelect: 'none' } : undefined}
          >
            {isSortable ? (
              <button
                type="button"
                className="border-0 bg-transparent p-0"
                style={{ color: 'inherit', font: 'inherit' }}
                onClick={() => toggleSort(key)}
              >
                {label}
                {isCurrent ? (
                  <i
                    className={`feather-chevron-${sortDir === 'asc' ? 'up' : 'down'} ms-1 fs-11`}
                    aria-hidden="true"
                  />
                ) : null}
              </button>
            ) : label}
          </th>
        )
      })}
      {validActions.length > 0 ? (
        <th scope="col" className="text-end">Acciones</th>
      ) : null}
    </tr>
  ), [
    allSelected,
    loading,
    normalizedColumns,
    pageEntries.length,
    selectable,
    selectAllId,
    selectionIsMixed,
    sortDir,
    sortKey,
    toggleAll,
    toggleSort,
    validActions.length,
  ])

  const renderBody = useCallback(() => {
    if (loading) {
      return (
        <tr>
          <td colSpan={emptyColSpan} className="text-center text-muted py-4">
            <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
            <span role="status" aria-live="polite">Cargando...</span>
          </td>
        </tr>
      )
    }

    if (pageEntries.length === 0) {
      return (
        <tr>
          <td colSpan={emptyColSpan} className="text-center text-muted py-4">
            {hasActiveSearch ? noResultsMessage : emptyMessage}
          </td>
        </tr>
      )
    }

    return pageEntries.map((entry, rowIndex) => (
      <DataTableRow
        key={entry.reactKey}
        entry={entry}
        pageRowIndex={rowIndex}
        normalizedColumns={normalizedColumns}
        validActions={validActions}
        selectable={selectable}
        selected={selected.has(entry.identity)}
        loading={loading}
        resolveRowLabel={resolveRowLabel}
        warningsRef={warningsRef}
        instanceId={instanceId}
        toggleRow={toggleRow}
      />
    ))
  }, [
    emptyColSpan,
    emptyMessage,
    hasActiveSearch,
    instanceId,
    loading,
    noResultsMessage,
    normalizedColumns,
    pageEntries,
    resolveRowLabel,
    selected,
    selectable,
    toggleRow,
    validActions,
  ])

  const pageRowKey = useCallback((_, index) => pageEntries[index]?.identity, [pageEntries])
  const countLabel = hasActiveSearch
    ? `${sortedEntries.length} de ${hasRemoteTotal ? remoteTotal : normalizedData.length} registros`
    : `${hasRemoteTotal ? remoteTotal : sortedEntries.length} registros`
  const showSummary = totalPages > 1 || hasActiveSearch
  const toolbarRenderer = toolbar !== undefined ? toolbar : renderToolbar
  const toolbarContext = useMemo(() => ({
    searchValue: effectiveSearch,
    onSearchChange: value => {
      const nextValue = normalizeSearchValue(value)
      if (!searchControlled) setInternalSearch(nextValue)
      resolvedOnSearchChange?.(nextValue)
      setPage(1)
    },
    pageSize: effectivePageSize,
    pageSizeOptions: normalizedOptions,
    onPageSizeChange: changePageSize,
  }), [
    changePageSize,
    effectivePageSize,
    effectiveSearch,
    normalizedOptions,
    resolvedOnSearchChange,
    searchControlled,
  ])
  const defaultToolbar = searchEnabled || normalizedOptions.length > 1 ? (
    <DataTableToolbar
      searchable={searchEnabled}
      searchValue={effectiveSearch}
      onSearchChange={toolbarContext.onSearchChange}
      searchLabel={searchLabel}
      searchPlaceholder={searchPlaceholder}
      pageSize={effectivePageSize}
      pageSizeOptions={normalizedOptions}
      onPageSizeChange={changePageSize}
      pageSizeLabel={pageSizeLabel}
    />
  ) : null
  const toolbarContent = toolbarRenderer === undefined
    ? defaultToolbar
    : typeof toolbarRenderer === 'function'
      ? toolbarRenderer(toolbarContext)
      : toolbarRenderer

  return (
    <div>
      {toolbarContent}
      <Table
        {...tableProps}
        columns={tableColumns}
        rows={pageRows}
        rowKey={pageRowKey}
        loading={loading}
        emptyMessage={emptyMessage}
        className={tableClassName}
        hover={hover}
        responsive={responsive}
        wrapperClassName={wrapperClassName}
        caption={caption}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        head={renderHead}
        body={renderBody}
      />

      {showSummary ? (
        <div className="d-flex align-items-center justify-content-between px-3 py-3 border-top">
          <span className="fs-12 text-muted">
            Página {currentPage} de {Math.max(totalPages, 1)} — {countLabel}
          </span>
          {totalPages > 1 ? (
            <Pagination
              page={currentPage}
              totalPages={totalPages}
              onPageChange={changePage}
              className="pagination-sm mb-0"
              pageAriaLabel={numericPageAriaLabel}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
