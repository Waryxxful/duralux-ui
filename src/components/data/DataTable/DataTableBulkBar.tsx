import type * as React from 'react'
import { Button } from '../../ui/Button'

interface DataTableBulkBarProps {
  count: number
  onClear: () => void
  children: React.ReactNode
}

/**
 * Barra de acciones masivas: cuántas filas hay seleccionadas, las acciones de quien llama
 * (`renderBulkActions`) y «Limpiar selección». Slot provisorio hasta que BulkBar (lote N2) exista.
 */
export function DataTableBulkBar({ count, onClear, children }: DataTableBulkBarProps) {
  return (
    <div className="gcu-data-table__bulk">
      <span className="gcu-data-table__bulk-count">
        {count === 1 ? '1 seleccionada' : `${count} seleccionadas`}
      </span>
      <div className="gcu-data-table__bulk-actions">{children}</div>
      <Button variant="light-brand" size="sm" startIcon="x" onClick={onClear}>Limpiar selección</Button>
    </div>
  )
}
