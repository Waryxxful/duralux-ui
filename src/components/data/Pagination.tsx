import { forwardRef, useEffect, useRef } from 'react'
import type * as React from 'react'
import { cx } from '../../utils/cx'
import { log } from '../../utils/log'
import { isFiniteNumber, isFunction, isString } from '../../utils/typeGuards'
import type { PaginationProps } from '../../public/types'

// Tres vecinos por lado acotan la ventana a trece botones (con anterior y siguiente),
// aunque quien llama pase un `sibling` enorme.
const MAX_SIBLING_COUNT = 3

function normalizeTotalPages(totalPages: unknown) {
  if (!isFiniteNumber(totalPages)) return 0
  return Math.max(0, Math.floor(totalPages))
}

function normalizePage(page: unknown, totalPages: number) {
  const candidate = isFiniteNumber(page) ? Math.floor(page) : 1
  return Math.min(Math.max(candidate, 1), Math.max(totalPages, 1))
}

function normalizeSibling(sibling: unknown) {
  if (!isFiniteNumber(sibling)) return 1
  return Math.min(Math.max(0, Math.floor(sibling)), MAX_SIBLING_COUNT)
}

function normalizeLabel(value: unknown, fallback: string) {
  if (!isString(value)) return fallback
  const label = value.trim()
  return label || fallback
}

function pageLabelFor(pageAriaLabel: PaginationProps['pageAriaLabel'], pageNumber: number) {
  try {
    const label = isFunction(pageAriaLabel) ? pageAriaLabel(pageNumber) : undefined
    return normalizeLabel(isString(label) ? label : String(label ?? ''), `Página ${pageNumber}`)
  } catch (error) {
    log.warn('Pagination: `pageAriaLabel` lanzó un error; se usa la etiqueta por defecto.', error)
    return `Página ${pageNumber}`
  }
}

type PageWindowItem = { type: 'page', page: number, key: string } | { type: 'ellipsis', key: string }

function pageWindow(currentPage: number, totalPages: number, siblingCount: number): PageWindowItem[] {
  const left = Math.max(1, currentPage - siblingCount)
  const right = Math.min(totalPages, currentPage + siblingCount)
  const items: PageWindowItem[] = []

  if (left > 2) {
    items.push({ type: 'page', page: 1, key: 'page-1' })
    items.push({ type: 'ellipsis', key: 'ellipsis-left' })
  } else {
    for (let value = 1; value < left; value += 1) items.push({ type: 'page', page: value, key: `page-${value}` })
  }

  for (let value = left; value <= right; value += 1) items.push({ type: 'page', page: value, key: `page-${value}` })

  if (right < totalPages - 1) {
    items.push({ type: 'ellipsis', key: 'ellipsis-right' })
    items.push({ type: 'page', page: totalPages, key: `page-${totalPages}` })
  } else {
    for (let value = right + 1; value <= totalPages; value += 1) items.push({ type: 'page', page: value, key: `page-${value}` })
  }

  return items
}

const formatCount = (value: number) => value.toLocaleString('es-CL')

/** Valida el rango opcional; devuelve null (y la causa) si no se puede mostrar. */
function resolveRange(page: number, pageSize: unknown, totalItems: unknown): { text: string | null, problem: string | null } {
  if (pageSize === undefined || totalItems === undefined) return { text: null, problem: null }
  if (!isFiniteNumber(pageSize) || pageSize < 1) return { text: null, problem: `pageSize inválido (${String(pageSize)})` }
  if (!isFiniteNumber(totalItems) || totalItems < 0) return { text: null, problem: `totalItems inválido (${String(totalItems)})` }
  const size = Math.floor(pageSize)
  const total = Math.floor(totalItems)
  if (total === 0) return { text: null, problem: null }
  const from = Math.min((page - 1) * size + 1, total)
  const to = Math.min(page * size, total)
  return { text: `${formatCount(from)}–${formatCount(to)} de ${formatCount(total)}`, problem: null }
}

interface PageItemProps {
  pageNumber: number
  current: boolean
  onSelect: (page: number) => void
  pageAriaLabel: PaginationProps['pageAriaLabel']
  buttonRef: (node: HTMLButtonElement | null) => void
}

function PageItem({ pageNumber, current, onSelect, pageAriaLabel, buttonRef }: PageItemProps) {
  return (
    <li className={cx('page-item', current && 'active')}>
      <button
        ref={buttonRef}
        type="button"
        className="page-link"
        onClick={() => onSelect(pageNumber)}
        aria-current={current ? 'page' : undefined}
        aria-label={pageLabelFor(pageAriaLabel, pageNumber)}
      >
        {pageNumber}
      </button>
    </li>
  )
}

function Ellipsis() {
  return (
    <li className="page-item disabled" aria-hidden="true">
      <span className="page-link">…</span>
    </li>
  )
}

/**
 * Pagination — navegación entre páginas con ventana acotada (patrón APG: `nav` con nombre,
 * página actual con `aria-current="page"`, anterior y siguiente nombrados).
 *
 * - Botones de 32 px alineados y números tabulares (no saltan al cambiar de página).
 * - pageSize + totalItems: muestra el rango visible («11–20 de 248», miles es-CL).
 * - Al cambiar de página el foco queda en el botón de la página nueva.
 * - Con una página o menos no se renderiza.
 */
export const Pagination = forwardRef<HTMLElement, PaginationProps>(function Pagination({
  page,
  totalPages,
  onPageChange,
  sibling = 1,
  className,
  pageAriaLabel,
  pageSize,
  totalItems,
  'aria-label': label = 'Paginación',
}, ref) {
  const normalizedTotalPages = normalizeTotalPages(totalPages)
  const pageButtonRefs = useRef(new Map<number, HTMLButtonElement>())
  const focusCurrentPageRef = useRef(false)
  const currentPage = normalizePage(page, normalizedTotalPages)
  const siblingCount = normalizeSibling(sibling)
  const range = resolveRange(currentPage, pageSize, totalItems)

  useEffect(() => {
    if (range.problem) log.warn(`Pagination: ${range.problem}; se omite el rango visible.`)
  }, [range.problem])

  useEffect(() => {
    if (normalizedTotalPages <= 1 || !focusCurrentPageRef.current) return
    focusCurrentPageRef.current = false
    pageButtonRefs.current.get(currentPage)?.focus()
  }, [currentPage, normalizedTotalPages])

  if (normalizedTotalPages <= 1) return null

  const items = pageWindow(currentPage, normalizedTotalPages, siblingCount)
  const navLabel = normalizeLabel(label, 'Paginación')

  const emitPageChange = (nextPage: number) => {
    if (!isFunction(onPageChange)) {
      log.warn('Pagination: falta `onPageChange`; el cambio de página se ignora.')
      return
    }
    if (!isFiniteNumber(nextPage)) return

    const normalizedNextPage = Math.floor(nextPage)
    if (normalizedNextPage < 1 || normalizedNextPage > normalizedTotalPages) return

    focusCurrentPageRef.current = true
    onPageChange(normalizedNextPage)
  }

  const registerPageButton = (pageNumber: number) => (node: HTMLButtonElement | null) => {
    if (node) pageButtonRefs.current.set(pageNumber, node)
    else pageButtonRefs.current.delete(pageNumber)
  }

  return (
    <nav ref={ref} className="gcu-pagination" aria-label={navLabel}>
      {range.text ? <span className="gcu-pagination__range">{range.text}</span> : null}
      <ul className={cx('pagination', isString(className) && className)}>
        <li className={cx('page-item', currentPage === 1 && 'disabled')}>
          <button
            type="button"
            className="page-link"
            onClick={() => emitPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Página anterior"
          >
            <i className="feather-chevron-left" aria-hidden="true" />
          </button>
        </li>

        {items.map(item => item.type === 'ellipsis' ? (
          <Ellipsis key={item.key} />
        ) : (
          <PageItem
            key={item.key}
            pageNumber={item.page}
            current={item.page === currentPage}
            onSelect={emitPageChange}
            pageAriaLabel={pageAriaLabel}
            buttonRef={registerPageButton(item.page)}
          />
        ))}

        <li className={cx('page-item', currentPage === normalizedTotalPages && 'disabled')}>
          <button
            type="button"
            className="page-link"
            onClick={() => emitPageChange(currentPage + 1)}
            disabled={currentPage === normalizedTotalPages}
            aria-label="Página siguiente"
          >
            <i className="feather-chevron-right" aria-hidden="true" />
          </button>
        </li>
      </ul>
    </nav>
  )
})
