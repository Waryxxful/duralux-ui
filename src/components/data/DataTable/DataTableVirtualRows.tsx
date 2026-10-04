import { useVirtualizer } from '@tanstack/react-virtual'
import { useRef } from 'react'
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
 * con dos filas espaciadoras.
 */
export default function DataTableVirtualRows({
  count,
  getScrollElement,
  rowHeight,
  colSpan,
  getItemKey,
  renderRow,
}: DataTableVirtualRowsProps) {
  // El ref de <table> se asigna después de los efectos de sus hijos: en el primer render
  // getScrollElement() da null. El espaciador superior (propio) ya está montado y encuentra el contenedor.
  const anchorRef = useRef<HTMLTableRowElement>(null)
  const virtualizer = useVirtualizer({
    count,
    getScrollElement: () => getScrollElement() ?? anchorRef.current?.closest<HTMLElement>('.gcu-table-scroll') ?? null,
    estimateSize: () => rowHeight,
    getItemKey,
    overscan: OVERSCAN,
  })
  const items = virtualizer.getVirtualItems()
  const paddingTop = items.length > 0 ? items[0].start : 0
  const paddingBottom = items.length > 0 ? virtualizer.getTotalSize() - items[items.length - 1].end : 0

  return (
    <>
      <tr ref={anchorRef} className="gcu-data-table__spacer" aria-hidden="true">
        <td colSpan={colSpan} style={{ height: paddingTop }} />
      </tr>
      {items.map(item => renderRow(item.index))}
      {paddingBottom > 0 ? (
        <tr className="gcu-data-table__spacer" aria-hidden="true">
          <td colSpan={colSpan} style={{ height: paddingBottom }} />
        </tr>
      ) : null}
    </>
  )
}
