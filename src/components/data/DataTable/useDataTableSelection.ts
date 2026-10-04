import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type * as React from 'react'
import type { RowSelectionState, Updater } from '@tanstack/react-table'
import { isUsableRowKey } from '../tableModel'
import { sameSelection } from '../dataTablePaginationModel'
import { isFunction } from '../../../utils/typeGuards'
import type { KeyLike } from '../../../public/types'
import type { DataTableEntry } from './dataTableModel'

export interface DataTableSelection<T> {
  /** Identidades seleccionadas en orden de selección (incluye filas ocultas por la búsqueda). */
  selected: ReadonlySet<KeyLike>
  /** El mismo estado en el formato de TanStack (`id de fila → true`). */
  rowSelection: RowSelectionState
  selectedRows: T[]
  toggleRow: (identity: KeyLike) => void
  /** Recibe los cambios que propone TanStack (p. ej. «seleccionar la página»). */
  onRowSelectionChange: (updater: Updater<RowSelectionState>) => void
  clear: () => void
}

/**
 * Selección de DataTable. El Set de identidades es la fuente de verdad (conserva el orden en que la
 * persona seleccionó y las filas ocultas por un filtro); TanStack lo recibe como `rowSelection`.
 * `onSelectionChange` recibe las claves públicas (el `rowKey` original cuando es válido).
 */
export function useDataTableSelection<T>(
  entries: ReadonlyArray<DataTableEntry<T>>,
  onSelectionChange: ((selectedIds: React.Key[]) => void) | undefined,
): DataTableSelection<T> {
  const [selected, setSelected] = useState<ReadonlySet<KeyLike>>(() => new Set())
  const selectedRef = useRef(selected)

  const lookup = useMemo(() => {
    const byIdentity = new Map<KeyLike, DataTableEntry<T>>()
    const identityByRowId = new Map<string, KeyLike>()
    entries.forEach((entry) => {
      byIdentity.set(entry.identity, entry)
      identityByRowId.set(entry.reactKey, entry.identity)
    })
    return { byIdentity, identityByRowId }
  }, [entries])

  const publicKeys = useCallback((selection: ReadonlySet<KeyLike>): React.Key[] => (
    Array.from(selection, (identity) => {
      const entry = lookup.byIdentity.get(identity)
      return entry && isUsableRowKey(entry.rawKey) && entry.identity === entry.rawKey ? entry.rawKey : identity
    })
  ), [lookup])

  const commit = useCallback((next: ReadonlySet<KeyLike>) => {
    selectedRef.current = next
    setSelected(next)
    if (isFunction(onSelectionChange)) onSelectionChange(publicKeys(next))
  }, [onSelectionChange, publicKeys])

  // Filas que ya no están en `data` dejan de estar seleccionadas (y se informa el cambio).
  useEffect(() => {
    const current = selectedRef.current
    const next = new Set(Array.from(current).filter(identity => lookup.byIdentity.has(identity)))
    if (sameSelection(current, next)) return
    commit(next)
  }, [commit, lookup])

  const toggleRow = useCallback((identity: KeyLike) => {
    const next = new Set(selectedRef.current)
    if (next.has(identity)) next.delete(identity)
    else next.add(identity)
    commit(next)
  }, [commit])

  const rowSelection = useMemo(() => {
    const state: RowSelectionState = {}
    selected.forEach((identity) => {
      const entry = lookup.byIdentity.get(identity)
      if (entry) state[entry.reactKey] = true
    })
    return state
  }, [lookup, selected])

  const onRowSelectionChange = useCallback((updater: Updater<RowSelectionState>) => {
    const previous: RowSelectionState = {}
    selectedRef.current.forEach((identity) => {
      const entry = lookup.byIdentity.get(identity)
      if (entry) previous[entry.reactKey] = true
    })
    const nextState = isFunction<Updater<RowSelectionState>, (old: RowSelectionState) => RowSelectionState>(updater)
      ? updater(previous)
      : updater
    // Conserva el orden: primero lo que sigue seleccionado, luego lo nuevo en el orden de TanStack.
    const next = new Set<KeyLike>()
    selectedRef.current.forEach((identity) => {
      const entry = lookup.byIdentity.get(identity)
      if (entry && nextState[entry.reactKey]) next.add(identity)
    })
    Object.keys(nextState).forEach((rowId) => {
      const identity = lookup.identityByRowId.get(rowId)
      if (nextState[rowId] && identity !== undefined) next.add(identity)
    })
    commit(next)
  }, [commit, lookup])

  const clear = useCallback(() => commit(new Set()), [commit])

  const selectedRows = useMemo(
    () => Array.from(selected).flatMap((identity) => {
      const entry = lookup.byIdentity.get(identity)
      return entry ? [entry.row] : []
    }),
    [lookup, selected],
  )

  return { selected, rowSelection, selectedRows, toggleRow, onRowSelectionChange, clear }
}
