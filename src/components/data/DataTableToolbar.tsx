import { forwardRef, useId, useMemo, useState } from 'react'
import type * as React from 'react'
import {
  EMPTY_ARRAY,
  normalizePageSize,
  normalizePageSizeOptions,
  normalizeText,
} from './dataTableToolbarModel'
import { cx } from '../../utils/cx'
import { log } from '../../utils/log'
import { isFiniteNumber, isFunction, isString } from '../../utils/typeGuards'
import type { DataTableToolbarProps } from '../../public/types'

/**
 * DataTableToolbar — barra sobre una tabla: búsqueda (landmark `search`), filas por página y
 * acciones propias (`children`) en una misma fila con controles de igual altura.
 *
 * - Controlada (`searchValue`, `pageSize` + `onPageSizeChange`) o no controlada.
 * - Responde a su contenedor (container query): en menos de 36rem cada bloque ocupa el ancho.
 * - Sin búsqueda, sin selector de filas y sin acciones no se renderiza.
 */
export const DataTableToolbar = /* @__PURE__ */ forwardRef<HTMLDivElement, DataTableToolbarProps>(function DataTableToolbar({
  searchable = true,
  searchValue,
  defaultSearchValue = '',
  onSearchChange,
  searchLabel = 'Buscar registros',
  searchPlaceholder = 'Buscar...',
  searchId,
  pageSize,
  pageSizeOptions = EMPTY_ARRAY,
  onPageSizeChange,
  pageSizeLabel = 'Filas por página',
  pageSizeId,
  className,
  children,
}, ref) {
  const generatedSearchId = useId()
  const generatedPageSizeId = useId()
  const resolvedSearchId = searchId || `duralux-data-search-${generatedSearchId}`
  const resolvedPageSizeId = pageSizeId || `duralux-data-page-size-${generatedPageSizeId}`
  const [internalSearch, setInternalSearch] = useState(() => normalizeText(defaultSearchValue))
  const [internalPageSize, setInternalPageSize] = useState(() => normalizePageSize(pageSize) ?? 10)
  const controlledSearch = searchValue !== undefined
  const visibleSearch = controlledSearch ? normalizeText(searchValue) : internalSearch
  const normalizedOptions: number[] = useMemo(
    () => normalizePageSizeOptions(pageSizeOptions, pageSize),
    [pageSizeOptions, pageSize],
  )
  const hasSearch = searchable !== false
  const hasPageSize = normalizedOptions.length > 1
  const controlledPageSize = isFunction(onPageSizeChange) && pageSize !== undefined
  const normalizedPageSize = normalizePageSize(pageSize)
  const visiblePageSize = controlledPageSize
    ? (normalizedPageSize ?? normalizedOptions[0] ?? 10)
    : (normalizedOptions.includes(internalPageSize) ? internalPageSize : normalizedOptions[0] ?? internalPageSize)
  const safeSearchLabel = normalizeText(searchLabel) || 'Buscar registros'
  const safeSearchPlaceholder = normalizeText(searchPlaceholder) || 'Buscar...'
  const safePageSizeLabel = normalizeText(pageSizeLabel) || 'Filas por página'

  if (!hasSearch && !hasPageSize && children === undefined) return null

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.currentTarget.value
    if (!controlledSearch) setInternalSearch(nextValue)
    if (isFunction(onSearchChange)) onSearchChange(nextValue)
  }

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextValue = Number(event.currentTarget.value)
    const nextPageSize = isFiniteNumber(nextValue) ? normalizePageSize(nextValue) : null
    if (nextPageSize === null) {
      log.warn(`DataTableToolbar: tamaño de página inválido (${event.currentTarget.value}); se ignora.`)
      return
    }
    if (!controlledPageSize) setInternalPageSize(nextPageSize)
    if (isFunction(onPageSizeChange)) onPageSizeChange(nextPageSize)
  }

  return (
    <div ref={ref} className={cx('data-table-toolbar', 'gcu-table-toolbar', isString(className) && className)}>
      {hasSearch ? (
        // role="search" y no <search>: React 18 no reconoce la etiqueta y los navegadores soportados aún no la mapean.
        <div className="data-table-toolbar__search" role="search" aria-label={safeSearchLabel}>
          <label htmlFor={resolvedSearchId}>{safeSearchLabel}</label>
          <input
            id={resolvedSearchId}
            type="text"
            className="form-control"
            value={visibleSearch}
            placeholder={safeSearchPlaceholder}
            aria-label={safeSearchLabel}
            onChange={handleSearchChange}
          />
        </div>
      ) : null}

      {hasPageSize ? (
        <div className="data-table-toolbar__page-size">
          <label htmlFor={resolvedPageSizeId}>{safePageSizeLabel}</label>
          <select
            id={resolvedPageSizeId}
            className="form-select"
            value={String(visiblePageSize)}
            aria-label={safePageSizeLabel}
            onChange={handlePageSizeChange}
          >
            {normalizedOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      ) : null}

      {children !== undefined ? <div className="gcu-table-toolbar__actions">{children}</div> : null}
    </div>
  )
})
