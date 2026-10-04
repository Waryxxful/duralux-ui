import { memo } from 'react'
import { Checkbox } from '../../form/Checkbox'
import { createSafeDomId, readProperty, safeString, warnOnce } from '../tableModel'
import { cx } from '../../../utils/cx'
import { isFiniteNumber, isFunction, isString } from '../../../utils/typeGuards'
import type { KeyLike } from '../../../public/types'
import { RowActionButton } from './RowActionButton'
import type { NormalizedRowAction } from './dataTableActionsModel'
import { columnReactKey } from './dataTableModel'
import type { DataTableColumnInfo, DataTableEntry, WarningsRef } from './dataTableModel'

export type RowLabelResolver<T> = (row: T, index: number) => string | number

function fallbackLabel(index: number) {
  return `Fila ${index + 1}`
}

/** Nombre de la fila para su checkbox; si `getRowLabel` falla o devuelve vacío, «Fila N». */
function resolveRowLabel<T>(resolver: RowLabelResolver<T>, row: T, index: number, warningsRef: WarningsRef) {
  try {
    const value = resolver(row, index)
    if (isString(value) || isFiniteNumber(value)) {
      const label = safeString(value).trim()
      if (label) return label
    }
    return fallbackLabel(index)
  } catch {
    warnOnce(
      warningsRef,
      `row-label-${index}`,
      `DataTable: getRowLabel falló para la fila ${index + 1}; se usará un nombre de fallback.`,
    )
    return fallbackLabel(index)
  }
}

interface DataTableCellProps<T> {
  entry: DataTableEntry<T>
  column: DataTableColumnInfo<T>
  pageRowIndex: number
}

/**
 * Celda memoizada: seleccionar una fila no vuelve a llamar a los `render` de las columnas
 * (la fila cambia de clase; sus celdas conservan las mismas props).
 */
const DataTableCellBase = function DataTableCell<T>({ entry, column, pageRowIndex }: DataTableCellProps<T>) {
  const value = readProperty(entry.row, column.key)
  return (
    <td className={column.numeric ? 'text-end' : undefined}>
      {isFunction(column.render) ? column.render(entry.row, value, pageRowIndex) : value}
    </td>
  )
}
// SAFETY: memo conserva el componente; solo se restituye el genérico que React.memo no propaga.
const DataTableCell = /* @__PURE__ */ memo(DataTableCellBase) as typeof DataTableCellBase

export interface DataTableRowProps<T> {
  entry: DataTableEntry<T>
  /** Posición en el orden visible completo (filtrado + ordenado, antes de paginar). */
  displayIndex: number
  /** Posición dentro de la página (tercer argumento de `render`). */
  pageRowIndex: number
  columns: ReadonlyArray<DataTableColumnInfo<T>>
  actions: ReadonlyArray<NormalizedRowAction<T>>
  selectable: boolean
  selected: boolean
  getRowLabel: RowLabelResolver<T>
  warningsRef: WarningsRef
  instanceId: string
  onToggle: (identity: KeyLike) => void
  /** Posición 1-based para `aria-rowindex` (solo en tablas virtualizadas). */
  ariaRowIndex?: number
}

/** Fila de DataTable: checkbox con nombre propio, celdas memoizadas y acciones. */
const DataTableRowBase = function DataTableRow<T>({
  entry,
  displayIndex,
  pageRowIndex,
  columns,
  actions,
  selectable,
  selected,
  getRowLabel,
  warningsRef,
  instanceId,
  onToggle,
  ariaRowIndex,
}: DataTableRowProps<T>) {
  const checkboxLabel = selectable
    ? `Seleccionar fila ${resolveRowLabel(getRowLabel, entry.row, displayIndex, warningsRef)}`
    : ''

  return (
    <tr className={cx('single-item', selected && 'selected')} aria-rowindex={ariaRowIndex}>
      {selectable ? (
        <td>
          <Checkbox
            id={createSafeDomId(`${instanceId}-row`, entry.identity)}
            className="ms-1"
            label={<span className="visually-hidden">{checkboxLabel}</span>}
            aria-label={checkboxLabel}
            checked={selected}
            onChange={() => onToggle(entry.identity)}
          />
        </td>
      ) : null}
      {columns.map(column => (
        <DataTableCell key={columnReactKey(column)} entry={entry} column={column} pageRowIndex={pageRowIndex} />
      ))}
      {actions.length > 0 ? (
        <td className="gcu-table-actions-cell">
          <div className="hstack gap-2 justify-content-end gcu-table-actions">
            {actions.map(action => <RowActionButton key={`action-${action.index}`} action={action} row={entry.row} />)}
          </div>
        </td>
      ) : null}
    </tr>
  )
}

export const DataTableRow =
  // SAFETY: memo conserva el componente; solo se restituye el genérico que React.memo no propaga.
  /* @__PURE__ */ memo(DataTableRowBase) as typeof DataTableRowBase
