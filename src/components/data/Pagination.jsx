import { useEffect, useRef } from 'react'

// Three siblings on either side keeps the rendered window bounded at thirteen
// buttons (including previous/next), even if a caller passes a huge sibling.
const MAX_SIBLING_COUNT = 3

function normalizeTotalPages(totalPages) {
  if (!Number.isFinite(totalPages)) return 0
  return Math.max(0, Math.floor(totalPages))
}

function normalizePage(page, totalPages) {
  const candidate = Number.isFinite(page) ? Math.floor(page) : 1
  return Math.min(Math.max(candidate, 1), Math.max(totalPages, 1))
}

function normalizeSibling(sibling) {
  if (!Number.isFinite(sibling)) return 1
  return Math.min(Math.max(0, Math.floor(sibling)), MAX_SIBLING_COUNT)
}

function normalizeLabel(value, fallback) {
  if (typeof value !== 'string') return fallback
  const label = value.trim()
  return label || fallback
}

function pageLabelFor(pageAriaLabel, pageNumber) {
  try {
    const label = typeof pageAriaLabel === 'function'
      ? pageAriaLabel(pageNumber)
      : undefined
    return normalizeLabel(
      typeof label === 'string' ? label : String(label ?? ''),
      `Página ${pageNumber}`,
    )
  } catch {
    return `Página ${pageNumber}`
  }
}

function pageWindow(currentPage, totalPages, siblingCount) {
  const left = Math.max(1, currentPage - siblingCount)
  const right = Math.min(totalPages, currentPage + siblingCount)
  const items = []

  if (left > 2) {
    items.push({ type: 'page', page: 1, key: 'page-1' })
    items.push({ type: 'ellipsis', key: 'ellipsis-left' })
  } else {
    for (let value = 1; value < left; value += 1) {
      items.push({ type: 'page', page: value, key: `page-${value}` })
    }
  }

  for (let value = left; value <= right; value += 1) {
    items.push({ type: 'page', page: value, key: `page-${value}` })
  }

  if (right < totalPages - 1) {
    items.push({ type: 'ellipsis', key: 'ellipsis-right' })
    items.push({ type: 'page', page: totalPages, key: `page-${totalPages}` })
  } else {
    for (let value = right + 1; value <= totalPages; value += 1) {
      items.push({ type: 'page', page: value, key: `page-${value}` })
    }
  }

  return items
}

function PageItem({ pageNumber, page, emitPageChange, pageAriaLabel, buttonRef }) {
  const isCurrent = page === pageNumber

  return (
    <li className={`page-item${isCurrent ? ' active' : ''}`}>
      <button
        ref={buttonRef}
        type="button"
        className="page-link"
        onClick={() => emitPageChange(pageNumber)}
        aria-current={isCurrent ? 'page' : undefined}
        aria-label={pageLabelFor(pageAriaLabel, pageNumber)}
      >
        {pageNumber}
      </button>
    </li>
  )
}

function Ellipsis({ itemKey }) {
  return (
    <li key={itemKey} className="page-item disabled" aria-hidden="true">
      <span className="page-link">…</span>
    </li>
  )
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  sibling = 1,
  className,
  pageAriaLabel,
  'aria-label': label = 'Paginación',
}) {
  const normalizedTotalPages = normalizeTotalPages(totalPages)
  const pageButtonRefs = useRef(new Map())
  const focusCurrentPageRef = useRef(false)
  const currentPage = normalizePage(page, normalizedTotalPages)
  const siblingCount = normalizeSibling(sibling)

  useEffect(() => {
    if (normalizedTotalPages <= 1 || !focusCurrentPageRef.current) return
    focusCurrentPageRef.current = false
    pageButtonRefs.current.get(currentPage)?.focus()
  }, [currentPage, normalizedTotalPages])

  if (normalizedTotalPages <= 1) return null

  const items = pageWindow(currentPage, normalizedTotalPages, siblingCount)
  const navLabel = normalizeLabel(label, 'Paginación')
  const safeClassName = typeof className === 'string' ? className : ''

  const emitPageChange = nextPage => {
    if (typeof onPageChange !== 'function') return
    if (!Number.isFinite(nextPage)) return

    const normalizedNextPage = Math.floor(nextPage)
    if (normalizedNextPage < 1 || normalizedNextPage > normalizedTotalPages) return

    focusCurrentPageRef.current = true
    onPageChange(normalizedNextPage)
  }

  const registerPageButton = pageNumber => node => {
    if (node) pageButtonRefs.current.set(pageNumber, node)
    else pageButtonRefs.current.delete(pageNumber)
  }

  return (
    <nav aria-label={navLabel}>
      <ul className={['pagination', safeClassName].filter(Boolean).join(' ')}>
        <li className={`page-item${currentPage === 1 ? ' disabled' : ''}`}>
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
          <Ellipsis key={item.key} itemKey={item.key} />
        ) : (
          <PageItem
            key={item.key}
            pageNumber={item.page}
            page={currentPage}
            emitPageChange={emitPageChange}
            pageAriaLabel={pageAriaLabel}
            buttonRef={registerPageButton(item.page)}
          />
        ))}

        <li className={`page-item${currentPage === normalizedTotalPages ? ' disabled' : ''}`}>
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
}
