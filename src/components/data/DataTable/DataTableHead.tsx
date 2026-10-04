import type { SortingState } from '@tanstack/react-table'
import { Checkbox } from '../../form/Checkbox'
import { cx } from '../../../utils/cx'
import { columnReactKey } from './dataTableModel'
import type { DataTableColumnInfo } from './dataTableModel'

const SELECT_PAGE_LABEL = 'Seleccionar todas las filas de la página actual'

export interface SelectAllState {
  id: string
  checked: boolean
  mixed: boolean
  disabled: boolean
  onToggle: () => void
}

interface DataTableHeadProps<T> {
  columns: ReadonlyArray<DataTableColumnInfo<T>>
  sorting: SortingState
  /** Alterna el orden de una columna; `multi` agrega la columna al orden (Mayús + clic). */
  onSort: (columnId: string, multi: boolean) => void
  selectAll: SelectAllState | null
  hasActions: boolean
  /** Id del texto que explica el orden múltiple (aria-describedby de cada botón de orden). */
  sortHintId: string
}

function ariaSortFor(direction: false | 'asc' | 'desc') {
  if (direction === 'asc') return 'ascending'
  if (direction === 'desc') return 'descending'
  return 'none'
}

/**
 * Encabezado de DataTable: «seleccionar página», columnas visibles con orden accesible
 * (`aria-sort` en el `th`, botón con el nombre de la columna) y la columna de acciones.
 */
export function DataTableHead<T>({ columns, sorting, onSort, selectAll, hasActions, sortHintId }: DataTableHeadProps<T>) {
  const multiSorted = sorting.length > 1

  return (
    <tr>
      {selectAll ? (
        <th className="wd-30" scope="col">
          <Checkbox
            id={selectAll.id}
            className="ms-1"
            label={<span className="visually-hidden">{SELECT_PAGE_LABEL}</span>}
            aria-label={SELECT_PAGE_LABEL}
            aria-checked={selectAll.mixed ? 'mixed' : selectAll.checked ? 'true' : 'false'}
            checked={selectAll.checked}
            indeterminate={selectAll.mixed}
            disabled={selectAll.disabled}
            onChange={selectAll.onToggle}
          />
        </th>
      ) : null}
      {columns.map((column) => {
        const sortIndex = sorting.findIndex(sort => sort.id === column.id)
        const direction = sortIndex === -1 ? false : (sorting[sortIndex].desc ? 'desc' : 'asc')

        return (
          <th
            key={columnReactKey(column)}
            scope="col"
            aria-sort={column.sortable ? ariaSortFor(direction) : undefined}
            className={cx(column.numeric && 'text-end') || undefined}
            style={column.width !== undefined ? { width: column.width } : undefined}
          >
            {column.sortable ? (
              <button
                type="button"
                className={cx('gcu-data-table__sort', direction && 'is-sorted')}
                aria-describedby={sortHintId}
                onClick={event => onSort(column.id, event.shiftKey)}
              >
                {column.label}
                {direction ? (
                  <i className={`feather-chevron-${direction === 'asc' ? 'up' : 'down'} fs-11`} aria-hidden="true" />
                ) : null}
                {direction && multiSorted ? (
                  <span className="gcu-data-table__sort-priority" aria-hidden="true">{sortIndex + 1}</span>
                ) : null}
              </button>
            ) : column.label}
          </th>
        )
      })}
      {hasActions ? <th scope="col" className="text-end">Acciones</th> : null}
    </tr>
  )
}
