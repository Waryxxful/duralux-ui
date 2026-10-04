import { lazy, Suspense } from 'react'
import type * as React from 'react'
import { DataTableRow } from './DataTableRow'
import type { DataTableRowProps } from './DataTableRow'
import type { DataTableEntry } from './dataTableModel'

// Chunk aparte: @tanstack/react-virtual solo se carga si alguna tabla usa `virtualized`.
const DataTableVirtualRows = /* @__PURE__ */ lazy(() => import('./DataTableVirtualRows'))

/** Filas que se pintan mientras llega el chunk virtual (llenan la vista sin montar miles). */
const VIRTUAL_FALLBACK_ROWS = 30

export interface DataTableBodyRow<T> {
  entry: DataTableEntry<T>
  displayIndex: number
  selected: boolean
}

type SharedRowProps<T> = Omit<DataTableRowProps<T>, 'entry' | 'displayIndex' | 'pageRowIndex' | 'selected' | 'ariaRowIndex'>

interface DataTableBodyProps<T> {
  rows: ReadonlyArray<DataTableBodyRow<T>>
  rowProps: SharedRowProps<T>
  virtual: {
    getScrollElement: () => HTMLElement | null
    rowHeight: number
    colSpan: number
  } | null
}

/** Cuerpo con filas: paginado (todas las de la página) o virtualizado (solo las visibles). */
export function DataTableBody<T>({ rows, rowProps, virtual }: DataTableBodyProps<T>) {
  const renderRow = (index: number): React.ReactNode => {
    const row = rows[index]
    return (
      <DataTableRow
        key={row.entry.reactKey}
        {...rowProps}
        entry={row.entry}
        displayIndex={row.displayIndex}
        pageRowIndex={index}
        selected={row.selected}
        // En virtual, la fila 1 es el encabezado: los datos empiezan en 2.
        ariaRowIndex={virtual ? row.displayIndex + 2 : undefined}
      />
    )
  }

  if (!virtual) return <>{rows.map((_, index) => renderRow(index))}</>

  const fallback = rows.slice(0, VIRTUAL_FALLBACK_ROWS).map((_, index) => renderRow(index))
  return (
    <Suspense fallback={fallback}>
      <DataTableVirtualRows
        count={rows.length}
        getScrollElement={virtual.getScrollElement}
        rowHeight={virtual.rowHeight}
        colSpan={virtual.colSpan}
        getItemKey={index => rows[index].entry.reactKey}
        renderRow={renderRow}
      />
    </Suspense>
  )
}
