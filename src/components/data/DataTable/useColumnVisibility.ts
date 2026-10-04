import { useCallback, useMemo, useState } from 'react'
import type { Updater, ColumnVisibilityState } from '@tanstack/react-table'
import { log } from '../../../utils/log'
import { isFunction } from '../../../utils/typeGuards'
import type { DataTableColumnVisibility } from '../../../public/types'
import { fromTableVisibility, toTableVisibility } from './dataTableModel'
import type { DataTableColumnInfo } from './dataTableModel'

const EMPTY_VISIBILITY: DataTableColumnVisibility = Object.freeze({})

export interface ColumnVisibilityOptions<T> {
  columns: ReadonlyArray<DataTableColumnInfo<T>>
  columnVisibility: DataTableColumnVisibility | undefined
  defaultColumnVisibility: DataTableColumnVisibility | undefined
  onColumnVisibilityChange: ((visibility: DataTableColumnVisibility) => void) | undefined
}

export interface ColumnVisibility<T> {
  /** Estado para TanStack (por id de columna). */
  tableVisibility: ColumnVisibilityState
  onTableVisibilityChange: (updater: Updater<ColumnVisibilityState>) => void
  /** Columnas visibles en orden (referencia estable mientras la visibilidad no cambie). */
  visibleColumns: DataTableColumnInfo<T>[]
}

/**
 * Columnas visibles: controladas (`columnVisibility` + `onColumnVisibilityChange`) o internas
 * (`defaultColumnVisibility`). Nunca quedan todas ocultas: si el cambio las ocultaría, se ignora.
 */
export function useColumnVisibility<T>(options: ColumnVisibilityOptions<T>): ColumnVisibility<T> {
  const { columns, columnVisibility, defaultColumnVisibility, onColumnVisibilityChange } = options
  const [internal, setInternal] = useState<DataTableColumnVisibility>(() => defaultColumnVisibility ?? EMPTY_VISIBILITY)
  const controlled = columnVisibility !== undefined
  const visibility = controlled ? columnVisibility : internal

  const tableVisibility = useMemo(() => toTableVisibility(columns, visibility), [columns, visibility])
  const visibleColumns = useMemo(
    () => columns.filter(column => tableVisibility[column.id] !== false),
    [columns, tableVisibility],
  )

  const onTableVisibilityChange = useCallback((updater: Updater<ColumnVisibilityState>) => {
    const nextState = isFunction<Updater<ColumnVisibilityState>, (old: ColumnVisibilityState) => ColumnVisibilityState>(updater)
      ? updater(tableVisibility)
      : updater
    if (columns.length > 0 && columns.every(column => nextState[column.id] === false)) {
      log.warn('DataTable: no se pueden ocultar todas las columnas; se mantiene la última visible.')
      return
    }
    const next = fromTableVisibility(columns, nextState)
    if (!controlled) setInternal(next)
    onColumnVisibilityChange?.(next)
  }, [columns, controlled, onColumnVisibilityChange, tableVisibility])

  return { tableVisibility, onTableVisibilityChange, visibleColumns }
}
