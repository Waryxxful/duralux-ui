import { useVirtualizer } from '@tanstack/react-virtual'
import type * as React from 'react'

export interface DataTableVirtualRowsProps {
  count: number
  /** Contenedor que desplaza (el `.gcu-table-scroll` de Table). */
  getScrollElement: () => HTMLElement | null
  /** Alto fijo de fila en px (depende de la densidad). */
  rowHeight: number
  colSpan: number
  getItemKey: (index: number) => string
  renderRow: (index: number) => React.ReactNode
}

const OVERSCAN = 8

/**
 * Cuerpo virtualizado: solo monta las filas visibles (más un margen) y reserva el alto del resto
 * con dos filas espaciadoras. Vive en su propio chunk: @tanstack/react-virtual solo se descarga
 * cuando una tabla usa `virtualized`.
 */
export default function DataTableVirtualRows({
  count,
  getScrollElement,
  rowHeight,
  colSpan,
  getItemKey,
  renderRow,
}: DataTableVirtualRowsProps) {
  const virtualizer = useVirtualizer({
    count,
    getScrollElement,
    estimateSize: () => rowHeight,
    getItemKey,
    overscan: OVERSCAN,
  })
  const items = virtualizer.getVirtualItems()
  const paddingTop = items.length > 0 ? items[0].start : 0
  const paddingBottom = items.length > 0 ? virtualizer.getTotalSize() - items[items.length - 1].end : 0

  return (
    <>
      {paddingTop > 0 ? (
        <tr className="gcu-data-table__spacer" aria-hidden="true">
          <td colSpan={colSpan} style={{ height: paddingTop }} />
        </tr>
      ) : null}
      {items.map(item => renderRow(item.index))}
      {paddingBottom > 0 ? (
        <tr className="gcu-data-table__spacer" aria-hidden="true">
          <td colSpan={colSpan} style={{ height: paddingBottom }} />
        </tr>
      ) : null}
    </>
  )
}
