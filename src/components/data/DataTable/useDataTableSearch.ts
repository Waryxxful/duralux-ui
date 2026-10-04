import { useCallback, useMemo, useState } from 'react'
import { matchesFilter, normalizeSearchValue } from '../dataTablePaginationModel'
import { isFunction } from '../../../utils/typeGuards'
import type { DataTableEntry, WarningsRef } from './dataTableModel'

type SearchText = string | number | undefined

export interface DataTableSearchOptions<T> {
  entries: ReadonlyArray<DataTableEntry<T>>
  searchable: boolean
  searchValue: SearchText
  defaultSearchValue: SearchText
  onSearchChange: ((value: string) => void) | undefined
  manual: boolean
  filterResolver: ((row: T, index: number) => string | number | boolean | null | undefined) | undefined
  filterPredicate: ((row: T, query: string, index: number) => boolean) | undefined
  warningsRef: WarningsRef
}

export interface DataTableSearch<T> {
  enabled: boolean
  value: string
  active: boolean
  /** Entradas que pasan la búsqueda (en modo manual, todas: filtra quien llama). */
  filteredEntries: ReadonlyArray<DataTableEntry<T>>
  setValue: (value: string) => void
}

/**
 * Búsqueda de DataTable: controlada (`searchValue`) o interna, filtro local por fila
 * (`filterPredicate` o `filterResolver`) o manual (solo informa la consulta).
 *
 * El filtro se aplica antes de TanStack a propósito: el contrato público es por fila
 * (resolver/predicado con índice original y errores tolerados), no por columna.
 */
export function useDataTableSearch<T>(options: DataTableSearchOptions<T>): DataTableSearch<T> {
  const {
    entries, searchable, searchValue, defaultSearchValue, onSearchChange,
    manual, filterResolver, filterPredicate, warningsRef,
  } = options
  const [internalValue, setInternalValue] = useState(() => normalizeSearchValue(defaultSearchValue))
  const controlled = searchValue !== undefined
  const value = controlled ? normalizeSearchValue(searchValue) : internalValue
  const active = value.length > 0
  const enabled = searchable
    || searchValue !== undefined
    || defaultSearchValue !== undefined
    || isFunction(onSearchChange)

  const filteredEntries = useMemo(() => {
    if (manual || !active) return entries
    return entries.filter(entry => matchesFilter(entry, value, filterResolver, filterPredicate, warningsRef))
  }, [active, entries, filterPredicate, filterResolver, manual, value, warningsRef])

  const setValue = useCallback((nextValue: string) => {
    const normalized = normalizeSearchValue(nextValue)
    if (!controlled) setInternalValue(normalized)
    onSearchChange?.(normalized)
  }, [controlled, onSearchChange])

  return { enabled, value, active, filteredEntries, setValue }
}
