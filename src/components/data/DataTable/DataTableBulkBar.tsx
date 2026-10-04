import type * as React from 'react'
import { BulkBar } from '../BulkBar'
import { formatIndicatorNumber } from '../../ui/internal/indicator'

interface DataTableBulkBarProps {
  count: number
  onClear: () => void
  children: React.ReactNode
}

function formatRows(count: number): string {
  return count === 1 ? '1 seleccionada' : `${formatIndicatorNumber(count)} seleccionadas`
}

/**
 * Acciones masivas de DataTable sobre BulkBar: cuántas filas hay seleccionadas, las acciones de
 * quien llama (`renderBulkActions`) y «Limpiar selección». Siempre montada para que la región
 * `status` de BulkBar anuncie también la primera selección y el vaciado.
 */
export function DataTableBulkBar({ count, onClear, children }: DataTableBulkBarProps) {
  return (
    <BulkBar
      className="gcu-data-table__bulk"
      count={count}
      actions={count > 0 ? children : null}
      onClear={onClear}
      clearLabel="Limpiar selección"
      formatCount={formatRows}
    />
  )
}
