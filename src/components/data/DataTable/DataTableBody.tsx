import type * as React from 'react'
import { DataTableRow } from './DataTableRow'
import type { DataTableRowProps } from './DataTableRow'
import type { DataTableEntry } from './dataTableModel'

// ponytail: import estático a propósito. Un import() en la librería hace que Vite meta su helper de
// precarga (base "/") en el chunk compartido por Module Federation y rompe el CSS de los remotos.
import DataTableVirtualRows from './DataTableVirtualRows'

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

  return (
    <DataTableVirtualRows
        count={rows.length}
        getScrollElement={virtual.getScrollElement}
        rowHeight={virtual.rowHeight}
        colSpan={virtual.colSpan}
        getItemKey={index => rows[index].entry.reactKey}
        renderRow={renderRow}
      />
  )
}
