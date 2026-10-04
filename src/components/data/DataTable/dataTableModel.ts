import {
  columnVisibilityFeature,
  createPaginatedRowModel,
  createSortedRowModel,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  tableFeatures,
} from '@tanstack/react-table'
import type { ColumnDef, Row, SortingState } from '@tanstack/react-table'
import type * as React from 'react'
import { readProperty, safeString, toSafeDomSegment, warnOnce } from '../tableModel'
import { isFiniteNumber, isString } from '../../../utils/typeGuards'
import type { DataTableColumnVisibility, KeyLike, TableDensity, TableRowEntry } from '../../../public/types'

/** Fila tal como la ve TanStack: la entrada con identidad segura de `tableModel` (no la fila cruda). */
export type DataTableEntry<T> = TableRowEntry<T>

/** Registro mutable de avisos ya emitidos (un aviso por clave). */
export type WarningsRef = React.MutableRefObject<Set<string>>

/** Columna normalizada: lo que la tabla necesita de cada `DataTableColumn` pública. */
export interface DataTableColumnInfo<T> {
  /** Id de columna en TanStack (único aunque dos columnas compartan `key`). */
  id: string
  key: KeyLike
  /** Clave pública de visibilidad: `String(key)`. */
  visibilityKey: string
  label: React.ReactNode
  /** Nombre en texto plano para anuncios y el menú «Columnas». */
  plainLabel: string
  sortable: boolean
  numeric: boolean
  hideable: boolean
  width?: number | string
  render?: (row: T, value: T[keyof T], rowIndex: number) => React.ReactNode
}

/** Fila de la tabla en TanStack. */
export type DataTableRowModelRow<T> = Row<DataTableFeatures, DataTableEntry<T>>

function buildFeatures() {
  return tableFeatures({
    rowSortingFeature,
    sortedRowModel: createSortedRowModel(),
    rowPaginationFeature,
    paginatedRowModel: createPaginatedRowModel(),
    rowSelectionFeature,
    columnVisibilityFeature,
  })
}

export type DataTableFeatures = ReturnType<typeof buildFeatures>

let features: DataTableFeatures | undefined

/**
 * Funcionalidades de TanStack que usa DataTable. Se crean al primer uso (no a nivel de módulo)
 * para que una app que no renderiza DataTable no evalúe nada de TanStack (tree-shaking).
 */
export function dataTableFeatures(): DataTableFeatures {
  features ??= buildFeatures()
  return features
}

/** Comparador ascendente con orden natural («Fila 2» antes que «Fila 10»); TanStack invierte en desc. */
export function compareCellText<V>(left: V, right: V): number {
  const leftText = safeString(left ?? '')
  const rightText = safeString(right ?? '')
  try {
    return leftText.localeCompare(rightText, undefined, { numeric: true })
  } catch {
    return 0
  }
}

/** Alto estimado de fila por densidad (coincide con `--gcu-table-row-h` en table.css). */
export function rowHeightFor(density: TableDensity | undefined): number {
  if (density === 'compact') return 40
  if (density === 'comfortable') return 56
  return 48
}

function isSortableKey(key: KeyLike | undefined): key is KeyLike {
  return (isString(key) && key.length > 0) || isFiniteNumber(key)
}

function plainText(value: React.ReactNode, fallback: string): string {
  if (isString(value) || isFiniteNumber(value)) {
    const text = safeString(value).trim()
    if (text) return text
  }
  return fallback
}

interface PublicColumnShape<T> {
  key?: KeyLike
  label?: React.ReactNode
  header?: React.ReactNode
  sortable?: boolean
  numeric?: boolean
  hideable?: boolean
  width?: number | string
  render?: DataTableColumnInfo<T>['render']
}

/** Normaliza las columnas públicas (defensivo: columnas inválidas se omiten con aviso). */
export function normalizeColumns<T, C extends PublicColumnShape<T>>(
  columns: ReadonlyArray<C>,
  warningsRef: WarningsRef,
): DataTableColumnInfo<T>[] {
  const seenIds = new Set<string>()
  const infos: DataTableColumnInfo<T>[] = []

  columns.forEach((column, index) => {
    const key: KeyLike | undefined = readProperty(column, 'key')
    if (!isSortableKey(key)) {
      warnOnce(warningsRef, `column-key-${index}`, `DataTable: la columna ${index + 1} no tiene una key válida; se omite.`)
      return
    }
    const visibilityKey = safeString(key)
    const baseId = visibilityKey || `columna-${index}`
    const id = seenIds.has(baseId) ? `${baseId}__${index}` : baseId
    seenIds.add(id)
    const label: React.ReactNode = readProperty(column, 'label') ?? readProperty(column, 'header')
    const render = readProperty(column, 'render')
    const width = readProperty(column, 'width')

    infos.push({
      id,
      key,
      visibilityKey,
      label,
      plainLabel: plainText(label, `Columna ${index + 1}`),
      sortable: Boolean(readProperty(column, 'sortable')),
      numeric: readProperty(column, 'numeric') === true,
      hideable: readProperty(column, 'hideable') !== false,
      width: isFiniteNumber(width) || isString(width) ? width : undefined,
      render,
    })
  })

  return infos
}

/** Definiciones de columna para TanStack: valor leído de la fila original y orden natural. */
export function createColumnDefs<T>(
  infos: ReadonlyArray<DataTableColumnInfo<T>>,
): Array<ColumnDef<DataTableFeatures, DataTableEntry<T>>> {
  return infos.map((info) => ({
    id: info.id,
    accessorFn: (entry: DataTableEntry<T>) => readProperty(entry.row, info.key),
    enableSorting: info.sortable,
    enableHiding: info.hideable,
    sortFn: (left: DataTableRowModelRow<T>, right: DataTableRowModelRow<T>, columnId: string) => (
      compareCellText(left.getValue(columnId), right.getValue(columnId))
    ),
  }))
}

/** Visibilidad pública (por `String(key)`) → estado de TanStack (por id de columna). */
export function toTableVisibility<T>(
  infos: ReadonlyArray<DataTableColumnInfo<T>>,
  visibility: DataTableColumnVisibility,
): Record<string, boolean> {
  const state: Record<string, boolean> = {}
  infos.forEach((info) => {
    state[info.id] = !info.hideable || visibility[info.visibilityKey] !== false
  })
  return state
}

/** Estado de TanStack → visibilidad pública. */
export function fromTableVisibility<T>(
  infos: ReadonlyArray<DataTableColumnInfo<T>>,
  state: Readonly<Record<string, boolean>>,
): DataTableColumnVisibility {
  const visibility: Record<string, boolean> = {}
  infos.forEach((info) => {
    visibility[info.visibilityKey] = state[info.id] !== false
  })
  return visibility
}

/** Texto del anuncio de orden: «Orden: Nombre, ascendente; Monto, descendente.» */
export function describeSorting<T>(
  sorting: SortingState,
  infos: ReadonlyArray<DataTableColumnInfo<T>>,
): string {
  const parts = sorting.flatMap((sort) => {
    const info = infos.find(candidate => candidate.id === sort.id)
    return info ? [`${info.plainLabel}, ${sort.desc ? 'descendente' : 'ascendente'}`] : []
  })
  return parts.length > 0 ? `Orden: ${parts.join('; ')}.` : ''
}

export function columnReactKey<T>(info: DataTableColumnInfo<T>): string {
  return `data-column-${toSafeDomSegment(info.id)}`
}
