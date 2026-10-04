import { useCallback, useEffect, useId, useMemo, useRef } from 'react'
import type * as React from 'react'
import { useTable } from '@tanstack/react-table'
import type { SortingState, Updater } from '@tanstack/react-table'
import { useState } from 'react'
import { Table } from '../Table'
import { DataTableToolbar } from '../DataTableToolbar'
import { ErrorState } from '../../feedback/ErrorState'
import {
  createRowEntries,
  createSafeDomId,
  isObjectLike,
  readProperty,
  resolveRowKey,
  safeString,
  validateRowEntries,
  warnOnce,
} from '../tableModel'
import { EMPTY_ARRAY } from '../dataTableToolbarModel'
import { cx } from '../../../utils/cx'
import { log } from '../../../utils/log'
import { isArray, isFiniteNumber, isFunction, isString } from '../../../utils/typeGuards'
import type { DataTableProps, DataTableToolbarContext, KeyLike, TableColumn } from '../../../public/types'
import { normalizeAction } from './dataTableActionsModel'
import {
  createColumnDefs,
  dataTableFeatures,
  describeSorting,
  normalizeColumns,
  rowHeightFor,
} from './dataTableModel'
import type { DataTableEntry } from './dataTableModel'
import { DataTableBody } from './DataTableBody'
import type { DataTableBodyRow } from './DataTableBody'
import { DataTableBulkBar } from './DataTableBulkBar'
import { DataTableColumnMenu } from './DataTableColumnMenu'
import { DataTableFooter } from './DataTableFooter'
import { DataTableHead } from './DataTableHead'
import { useColumnVisibility } from './useColumnVisibility'
import { useDataTablePaging } from './useDataTablePaging'
import { useDataTableSearch } from './useDataTableSearch'
import { useDataTableSelection } from './useDataTableSelection'

type AnyRow = Record<string, string | number | boolean | null | undefined>

function defaultGetRowLabel<T>(row: T, index: number): string {
  const candidate = readProperty(row, 'name') ?? readProperty(row, 'label') ?? readProperty(row, 'title') ?? readProperty(row, 'id')
  if (candidate !== null && candidate !== undefined) {
    const label = safeString(candidate).trim()
    if (label) return label
  }
  return `Fila ${index + 1}`
}

/** Recorre el orden visible y avisa si un `rowKey` función devuelve otra clave para la misma fila. */
function useStableRowKeyCheck<T extends object>(
  rowKey: string | ((row: T, index: number) => KeyLike | undefined),
  displayRows: ReadonlyArray<DataTableEntry<T>>,
  warningsRef: React.MutableRefObject<Set<string>>,
) {
  const historyRef = useRef(new Map<T, { value: unknown }>())
  useEffect(() => {
    if (!isFunction(rowKey)) return
    displayRows.forEach((entry, displayIndex) => {
      const nextValue = resolveRowKey(rowKey, entry.row, displayIndex)
      if (!isObjectLike(entry.row)) return
      const previous = historyRef.current.get(entry.row)
      if (previous && !Object.is(previous.value, nextValue)) {
        warnOnce(
          warningsRef,
          `unstable-${entry.index}-${displayIndex}`,
          `DataTable: rowKey debe ser estable para la misma fila; cambió de "${safeString(previous.value)}" a "${safeString(nextValue)}".`,
        )
      }
      historyRef.current.set(entry.row, { value: nextValue })
    })
  }, [displayRows, rowKey, warningsRef])
}

/**
 * DataTable — tabla de datos sobre TanStack Table (headless) con la presentación de Table
 * (`.table.table-hover`, densidad, encabezado fijo, skeleton, EmptyState/ErrorState).
 *
 * - Orden por columna (`sortable`); Mayús + clic agrega columnas al orden.
 * - Búsqueda local por fila (`filterResolver`/`filterPredicate`) o manual (`filterMode="manual"`).
 * - Paginación con selector de filas; `virtualized` reemplaza la paginación por filas virtuales.
 * - Selección por página con nombre por fila (`getRowLabel`) y acciones masivas (`renderBulkActions`).
 * - Columnas visibles (`columnVisibility`/`defaultColumnVisibility`) con menú «Columnas».
 * - Anuncia total, página y orden en una región `aria-live="polite"`.
 */
export function DataTable<T extends object = AnyRow>(props: DataTableProps<T>) {
  const {
    columns, data, actions, pageSize = 10, selectable = false, onSelectionChange, rowKey = 'id',
    getRowLabel = defaultGetRowLabel, autoWidth = false, loading = false, emptyMessage = 'Sin datos',
    noResultsMessage = 'Sin resultados', responsive = true, wrapperClassName, caption, className, hover = true,
    searchable = false, searchValue, defaultSearchValue, onSearchChange, searchLabel = 'Buscar registros',
    searchPlaceholder = 'Buscar...', filterMode = 'local', filterResolver, filterPredicate, pageSizeOptions,
    onPageSizeChange, pageSizeLabel = 'Filas por página', totalItems, toolbar, renderToolbar, search, defaultSearch,
    onSearch, searchResolver, searchPredicate, manualFiltering = false, totalCount, density, stickyHeader = false,
    maxHeight, emptyState, loadingRows, error, onRetry, columnVisibility, defaultColumnVisibility,
    onColumnVisibilityChange, columnMenu, renderBulkActions, virtualized = false,
    'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledBy, ...tableProps
  } = props
  const warningsRef = useRef(new Set<string>())
  const rowKeyHistoryRef = useRef(new Map())
  const tableRef = useRef<HTMLTableElement>(null)
  const instanceId = createSafeDomId('duralux-table', useId())
  const manual = manualFiltering || filterMode === 'manual' || filterMode === 'remote'
  const resolvedTotal = totalItems !== undefined ? totalItems : totalCount
  const remoteTotal = manual && isFiniteNumber(resolvedTotal) && resolvedTotal >= 0 ? Math.floor(resolvedTotal) : null
  const resolveRowLabel = isFunction(getRowLabel) ? getRowLabel : defaultGetRowLabel

  const normalizedColumns = isArray(columns) ? columns : EMPTY_ARRAY
  const normalizedData: ReadonlyArray<T> = isArray(data) ? data : EMPTY_ARRAY
  const normalizedActions = isArray(actions) ? actions : EMPTY_ARRAY
  const columnInfos = useMemo(() => normalizeColumns<T, (typeof normalizedColumns)[number]>(normalizedColumns, warningsRef), [normalizedColumns])
  const columnDefs = useMemo(() => createColumnDefs(columnInfos), [columnInfos])
  const validActions = useMemo(
    () => normalizedActions.flatMap((action, index) => {
      const normalized = normalizeAction<T>(action, index, warningsRef)
      return normalized ? [normalized] : []
    }),
    [normalizedActions],
  )

  const allEntries: ReadonlyArray<DataTableEntry<T>> = useMemo(() => createRowEntries(normalizedData, rowKey), [normalizedData, rowKey])
  useEffect(() => {
    validateRowEntries(allEntries, 'DataTable', rowKeyHistoryRef, warningsRef)
  }, [allEntries])

  const searchState = useDataTableSearch<T>({
    entries: allEntries,
    searchable: searchable === true,
    searchValue: searchValue !== undefined ? searchValue : search,
    defaultSearchValue: defaultSearchValue !== undefined ? defaultSearchValue : defaultSearch,
    onSearchChange: isFunction(onSearchChange) ? onSearchChange : isFunction(onSearch) ? onSearch : undefined,
    manual,
    filterResolver: isFunction(filterResolver) ? filterResolver : searchResolver,
    filterPredicate: isFunction(filterPredicate) ? filterPredicate : searchPredicate,
    warningsRef,
  })
  const paging = useDataTablePaging({
    pageSize,
    pageSizeOptions,
    onPageSizeChange: isFunction(onPageSizeChange) ? onPageSizeChange : undefined,
    rowCount: searchState.filteredEntries.length,
    remoteTotal: virtualized ? null : remoteTotal,
  })
  const selection = useDataTableSelection<T>(allEntries, isFunction(onSelectionChange) ? onSelectionChange : undefined)
  const visibility = useColumnVisibility<T>({
    columns: columnInfos,
    columnVisibility,
    defaultColumnVisibility,
    onColumnVisibilityChange: isFunction(onColumnVisibilityChange) ? onColumnVisibilityChange : undefined,
  })
  const [sorting, setSorting] = useState<SortingState>(() => [])
  const onSortingChange = useCallback((updater: Updater<SortingState>) => {
    setSorting(previous => (isFunction<Updater<SortingState>, (old: SortingState) => SortingState>(updater) ? updater(previous) : updater))
  }, [])

  const pagination = useMemo(() => ({
    pageIndex: virtualized ? 0 : paging.page - 1,
    pageSize: virtualized ? Math.max(searchState.filteredEntries.length, 1) : paging.pageSize,
  }), [paging.page, paging.pageSize, searchState.filteredEntries.length, virtualized])

  const table = useTable({
    features: dataTableFeatures(),
    data: searchState.filteredEntries,
    columns: columnDefs,
    getRowId: (entry: DataTableEntry<T>) => entry.reactKey,
    state: {
      sorting,
      pagination,
      rowSelection: selection.rowSelection,
      columnVisibility: visibility.tableVisibility,
    },
    onSortingChange,
    onPaginationChange: () => undefined,
    onRowSelectionChange: selection.onRowSelectionChange,
    onColumnVisibilityChange: visibility.onTableVisibilityChange,
    enableRowSelection: selectable,
    enableSortingRemoval: false,
    sortDescFirst: false,
    enableMultiSort: true,
    autoResetPageIndex: false,
  })

  const displayRows = table.getPrePaginatedRowModel().rows
  const displayEntries = useMemo(() => displayRows.map(row => row.original), [displayRows])
  useStableRowKeyCheck(rowKey, displayEntries, warningsRef)

  const pageRows = table.getRowModel().rows
  const bodyRows: DataTableBodyRow<T>[] = pageRows.map(row => ({
    entry: row.original,
    displayIndex: row.getDisplayIndex(),
    selected: selection.selected.has(row.original.identity),
  }))
  const pageEntries = useMemo(() => pageRows.map(row => row.original.row), [pageRows])
  const pageRowKey = useCallback((_: T, index: number) => pageRows[index]?.original.identity, [pageRows])

  const handleSort = useCallback((columnId: string, multi: boolean) => {
    const column = table.getColumn(columnId)
    if (!column) {
      log.warn(`DataTable: no existe la columna «${columnId}» para ordenar.`)
      return
    }
    column.toggleSorting(undefined, multi)
  }, [table])

  const changeSearch = useCallback((value: string) => {
    searchState.setValue(value)
    paging.setPage(1)
  }, [paging, searchState])

  const menuEnabled = columnMenu === true
    || columnVisibility !== undefined
    || defaultColumnVisibility !== undefined
    || isFunction(onColumnVisibilityChange)
  const visibleIds = useMemo(() => new Set(visibility.visibleColumns.map(column => column.id)), [visibility.visibleColumns])
  const columnMenuNode = menuEnabled ? (
    <DataTableColumnMenu
      columns={columnInfos}
      visibleIds={visibleIds}
      instanceId={instanceId}
      onToggle={(columnId, visible) => table.getColumn(columnId)?.toggleVisibility(visible)}
    />
  ) : null

  const hasRows = pageRows.length > 0
  const showError = !loading && error !== undefined && error !== null && error !== false
  const allPageSelected = hasRows && table.getIsAllPageRowsSelected()
  const selectAll = selectable ? {
    id: `${instanceId}-select-all`,
    checked: allPageSelected,
    mixed: hasRows && !allPageSelected && table.getIsSomePageRowsSelected(),
    disabled: loading || !hasRows || showError,
    onToggle: () => table.toggleAllPageRowsSelected(),
  } : null
  const sortHintId = `${instanceId}-sort-hint`
  const hasSortable = visibility.visibleColumns.some(column => column.sortable)

  const tableColumns: TableColumn<T>[] = useMemo(() => [
    ...(selectable ? [{ key: '__duralux_selection__', header: '' }] : []),
    ...visibility.visibleColumns.map(column => ({ key: column.id, header: column.label, numeric: column.numeric })),
    ...(validActions.length > 0 ? [{ key: '__duralux_actions__', header: 'Acciones' }] : []),
  ], [selectable, validActions.length, visibility.visibleColumns])

  const virtual = virtualized ? {
    getScrollElement: () => tableRef.current?.parentElement ?? null,
    rowHeight: rowHeightFor(density),
    colSpan: Math.max(tableColumns.length, 1),
  } : null
  if (virtualized && !responsive) log.warn('DataTable: `virtualized` necesita el contenedor propio de Table; se ignora responsive={false}.')

  const head = (
    <DataTableHead
      columns={visibility.visibleColumns}
      sorting={sorting}
      onSort={handleSort}
      selectAll={selectAll}
      hasActions={validActions.length > 0}
      sortHintId={sortHintId}
    />
  )
  const body = hasRows && !loading && !showError ? (
    <DataTableBody
      rows={bodyRows}
      virtual={virtual}
      rowProps={{
        columns: visibility.visibleColumns,
        actions: validActions,
        selectable,
        getRowLabel: resolveRowLabel,
        warningsRef,
        instanceId,
        onToggle: selection.toggleRow,
      }}
    />
  ) : undefined

  const filteredCount = searchState.filteredEntries.length
  const countLabel = searchState.active
    ? `${filteredCount} de ${remoteTotal ?? normalizedData.length} registros`
    : `${remoteTotal ?? filteredCount} registros`
  const showSummary = !showError && ((!virtualized && paging.totalPages > 1) || searchState.active)
  const announcement = [
    loading ? '' : `Registros visibles: ${remoteTotal ?? filteredCount}.`,
    !virtualized && paging.totalPages > 1 ? `Página actual: ${paging.page} de ${paging.totalPages}.` : '',
    describeSorting(sorting, columnInfos),
    selectable && selection.selected.size > 0 ? `Filas seleccionadas: ${selection.selected.size}.` : '',
  ].filter(Boolean).join(' ')

  const toolbarContext: DataTableToolbarContext = {
    searchValue: searchState.value,
    onSearchChange: changeSearch,
    pageSize: paging.pageSize,
    pageSizeOptions: paging.pageSizeOptions,
    onPageSizeChange: paging.setPageSize,
    columnMenu: columnMenuNode,
  }
  const pageSizeSelectable = !virtualized && paging.pageSizeOptions.length > 1
  const defaultToolbar = searchState.enabled || pageSizeSelectable || columnMenuNode ? (
    <DataTableToolbar
      searchable={searchState.enabled}
      searchValue={searchState.value}
      onSearchChange={changeSearch}
      searchLabel={searchLabel}
      searchPlaceholder={searchPlaceholder}
      pageSize={paging.pageSize}
      pageSizeOptions={pageSizeSelectable ? paging.pageSizeOptions : EMPTY_ARRAY}
      onPageSizeChange={paging.setPageSize}
      pageSizeLabel={pageSizeLabel}
    >
      {columnMenuNode ?? undefined}
    </DataTableToolbar>
  ) : null
  const toolbarRenderer = toolbar !== undefined ? toolbar : renderToolbar
  const toolbarContent = toolbarRenderer === undefined
    ? defaultToolbar
    : isFunction<typeof toolbarRenderer, (context: DataTableToolbarContext) => React.ReactNode>(toolbarRenderer)
      ? toolbarRenderer(toolbarContext)
      : toolbarRenderer

  return (
    <div className="gcu-data-table">
      {toolbarContent}
      {isFunction(renderBulkActions) && selection.selected.size > 0 ? (
        <DataTableBulkBar count={selection.selected.size} onClear={selection.clear}>
          {renderBulkActions(selection.selectedRows, { count: selection.selected.size, clearSelection: selection.clear })}
        </DataTableBulkBar>
      ) : null}
      {hasSortable ? (
        <span id={sortHintId} hidden>Mayús + clic agrega la columna al orden.</span>
      ) : null}
      <Table
        {...tableProps}
        ref={tableRef}
        columns={tableColumns}
        rows={hasRows && !showError ? pageEntries : EMPTY_ARRAY}
        rowKey={pageRowKey}
        loading={loading}
        loadingRows={loadingRows}
        emptyMessage={searchState.active ? noResultsMessage : emptyMessage}
        emptyState={showError ? <ErrorState compact error={error} onRetry={onRetry} /> : emptyState}
        className={cx(autoWidth && 'table-auto-width', isString(className) && className) || undefined}
        hover={hover}
        responsive={virtualized ? true : responsive}
        wrapperClassName={wrapperClassName}
        caption={caption}
        density={density}
        stickyHeader={virtualized || stickyHeader}
        maxHeight={maxHeight}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-rowcount={virtualized ? filteredCount + 1 : undefined}
        head={head}
        body={body}
      />
      <div className="visually-hidden" aria-live="polite" aria-atomic="true">{announcement}</div>
      {showSummary ? (
        <DataTableFooter
          page={paging.page}
          totalPages={virtualized ? 1 : paging.totalPages}
          countLabel={countLabel}
          onPageChange={paging.setPage}
          ariaLabel={ariaLabel}
        />
      ) : null}
    </div>
  )
}
