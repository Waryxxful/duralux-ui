import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { clampPage, normalizePageSize } from '../dataTablePaginationModel'
import { normalizePageSizeOptions } from '../dataTableToolbarModel'
import { log } from '../../../utils/log'
import { isFiniteNumber, isFunction } from '../../../utils/typeGuards'

export interface DataTablePagingOptions {
  pageSize: number | undefined
  pageSizeOptions: ReadonlyArray<number> | undefined
  onPageSizeChange: ((pageSize: number) => void) | undefined
  /** Filas disponibles tras la búsqueda (modo local). */
  rowCount: number
  /** Total informado por el servidor (modo manual con `totalItems`), o null. */
  remoteTotal: number | null
}

export interface DataTablePaging {
  pageSize: number
  pageSizeOptions: number[]
  /** Página visible (1-based), acotada al total de páginas. */
  page: number
  /** Páginas reales (0 si no hay filas). */
  totalPages: number
  setPage: (page: number) => void
  setPageSize: (pageSize: number) => void
}

/**
 * Paginación propia de DataTable (1-based). La página se acota en cada render en vez de
 * reiniciarse: si cambia `pageSize` o los datos, la persona sigue lo más cerca posible de donde estaba.
 */
export function useDataTablePaging(options: DataTablePagingOptions): DataTablePaging {
  const { pageSize, pageSizeOptions, onPageSizeChange, rowCount, remoteTotal } = options
  const requestedPageSize = normalizePageSize(pageSize)
  const controlled = isFunction(onPageSizeChange)
  const [internalPageSize, setInternalPageSize] = useState(requestedPageSize)
  const pageSizePropRef = useRef(requestedPageSize)
  const effectivePageSize = controlled ? requestedPageSize : internalPageSize
  const normalizedOptions: number[] = useMemo(
    () => normalizePageSizeOptions(pageSizeOptions, effectivePageSize),
    [pageSizeOptions, effectivePageSize],
  )
  const [page, setPageState] = useState(1)

  // La prop `pageSize` manda cuando cambia, aunque la tabla no esté controlada.
  useEffect(() => {
    if (pageSizePropRef.current === requestedPageSize) return
    pageSizePropRef.current = requestedPageSize
    if (!controlled) setInternalPageSize(requestedPageSize)
  }, [controlled, requestedPageSize])

  const total = remoteTotal ?? rowCount
  const totalPages = Math.ceil(total / effectivePageSize)
  const pageCount = Math.max(totalPages, 1)
  const currentPage = clampPage(page, pageCount)

  const setPage = useCallback((nextPage: number) => {
    if (!isFiniteNumber(nextPage)) return
    const normalized = Math.floor(nextPage)
    if (normalized < 1 || normalized > pageCount) {
      log.debug(`DataTable: página ${normalized} fuera de rango (1–${pageCount}); se ignora.`)
      return
    }
    setPageState(normalized)
  }, [pageCount])

  const setPageSize = useCallback((nextPageSize: number) => {
    const normalized = normalizePageSize(nextPageSize)
    if (normalizedOptions.length > 0 && !normalizedOptions.includes(normalized)) {
      log.warn(`DataTable: ${normalized} filas por página no está entre las opciones; se ignora.`)
      return
    }
    if (!controlled) setInternalPageSize(normalized)
    onPageSizeChange?.(normalized)
    setPageState(1)
  }, [controlled, normalizedOptions, onPageSizeChange])

  return {
    pageSize: effectivePageSize,
    pageSizeOptions: normalizedOptions,
    page: currentPage,
    totalPages,
    setPage,
    setPageSize,
  }
}
