import { Button } from '../../ui/Button'
import { Checkbox } from '../../form/Checkbox'
import { Dropdown, DropdownMenu } from '../../ui/Dropdown'
import { createSafeDomId } from '../tableModel'
import type { DataTableColumnInfo } from './dataTableModel'

interface DataTableColumnMenuProps<T> {
  columns: ReadonlyArray<DataTableColumnInfo<T>>
  visibleIds: ReadonlySet<string>
  onToggle: (columnId: string, visible: boolean) => void
  instanceId: string
}

/**
 * Menú «Columnas» (Dropdown): una casilla por columna ocultable. La última columna visible
 * queda bloqueada y el menú explica por qué.
 */
export function DataTableColumnMenu<T>({ columns, visibleIds, onToggle, instanceId }: DataTableColumnMenuProps<T>) {
  const hideable = columns.filter(column => column.hideable)
  const visibleCount = columns.filter(column => visibleIds.has(column.id)).length
  const lastVisible = visibleCount <= 1
  const hintId = `${instanceId}-columns-hint`

  return (
    <Dropdown
      align="end"
      className="dropdown gcu-data-table__columns"
      trigger={props => (
        <Button {...props} variant="light-brand" size="sm" startIcon="columns">Columnas</Button>
      )}
    >
      <DropdownMenu closeOnSelect={false} className="gcu-data-table__column-menu">
        <p className="dropdown-header mb-0">Columnas visibles</p>
        {hideable.map((column) => {
          const visible = visibleIds.has(column.id)
          const locked = visible && lastVisible
          return (
            <Checkbox
              key={column.id}
              id={createSafeDomId(`${instanceId}-column`, column.id)}
              className="gcu-data-table__column-option"
              label={column.label ?? column.plainLabel}
              checked={visible}
              disabled={locked}
              aria-describedby={locked ? hintId : undefined}
              onChange={event => onToggle(column.id, event.currentTarget.checked)}
            />
          )
        })}
        {lastVisible ? (
          <p id={hintId} className="gcu-data-table__column-hint mb-0">Al menos una columna debe quedar visible.</p>
        ) : null}
      </DropdownMenu>
    </Dropdown>
  )
}
