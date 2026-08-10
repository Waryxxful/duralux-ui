import { useEffect, useId, useRef, useState } from 'react'

/**
 * Ventana de números de página con elipsis (siempre primera, última, actual ±1).
 * Sin esto, un dataset real (decenas de páginas) desborda el `.pagination` del card.
 */
function pageWindow(current, total, delta = 1) {
  const pages = []
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
      pages.push(i)
    }
  }
  const withDots = []
  let last
  for (const p of pages) {
    if (last != null && p - last > 1) withDots.push('…')
    withDots.push(p)
    last = p
  }
  return withDots
}

/**
 * DataTable — tabla con checkboxes, ordenamiento, paginación y acciones.
 *
 * Props:
 *   columns — [{ key, label, sortable, render: (row, value, rowIndex) => JSX }]
 *   data    — array of objects
 *   actions — [{ label, icon, onClick: (row) => void, variant?: 'icon' | 'button', buttonVariant?: string }]
 *             variant "icon" (default) — botón solo-ícono, label como tooltip (compacto).
 *             variant "button" — botón con ícono + texto visible (label), clase btn-{buttonVariant || 'light-brand'}.
 *   pageSize — rows per page (default 10)
 *   selectable — show checkboxes
 *   onSelectionChange — (selectedIds) => void
 *   rowKey  — field name for row identity (default "id")
 *   autoWidth — la tabla se encoge a su contenido en vez de estirarse al 100%
 *               del contenedor (evita columnas muy separadas cuando hay pocas
 *               columnas con texto corto).
 */
const EMPTY_COLUMNS = []
const EMPTY_DATA = []
const EMPTY_ACTIONS = []

export function DataTable({
  columns = EMPTY_COLUMNS,
  data = EMPTY_DATA,
  actions = EMPTY_ACTIONS,
  pageSize = 10,
  selectable,
  onSelectionChange,
  rowKey = 'id',
  autoWidth = false,
}) {
  const [sortKey, setSortKey] = useState(null)
  const [sortDir, setSortDir] = useState('asc')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState(new Set())
  const checkboxId = useId()
  const selectAllRef = useRef(null)
  const normalizedPageSize = Number.isFinite(pageSize) && pageSize > 0
    ? Math.max(1, Math.floor(pageSize))
    : 10

  const sorted = sortKey
    ? [...data].sort((a, b) => {
        const av = a[sortKey] ?? ''
        const bv = b[sortKey] ?? ''
        const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true })
        return sortDir === 'asc' ? cmp : -cmp
      })
    : data

  const totalPages = Math.ceil(sorted.length / normalizedPageSize)
  const currentPage = Math.min(Math.max(page, 1), Math.max(totalPages, 1))
  const pageData = sorted.slice(
    (currentPage - 1) * normalizedPageSize,
    currentPage * normalizedPageSize,
  )
  const allSelected = pageData.length > 0 && pageData.every((row) => selected.has(row[rowKey]))
  const someSelected = pageData.some((row) => selected.has(row[rowKey]))

  useEffect(() => {
    const dataIds = new Set(data.map((row) => row[rowKey]))
    const next = new Set(Array.from(selected).filter((id) => dataIds.has(id)))

    if (next.size === selected.size) return

    setSelected(next)
    onSelectionChange?.(Array.from(next))
  }, [data, rowKey, selected, onSelectionChange])

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someSelected && !allSelected
    }
  }, [allSelected, someSelected])

  function toggleSort(key) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('asc') }
  }

  function toggleRow(id) {
    const next = new Set(selected)
    next.has(id) ? next.delete(id) : next.add(id)
    setSelected(next)
    onSelectionChange?.(Array.from(next))
  }

  function toggleAll() {
    const next = new Set(selected)

    if (allSelected) {
      pageData.forEach((row) => next.delete(row[rowKey]))
    } else {
      pageData.forEach((row) => next.add(row[rowKey]))
    }

    setSelected(next)
    onSelectionChange?.(Array.from(next))
  }

  return (
    <div>
      <div className="table-responsive">
        <table className={`table table-hover${autoWidth ? ' table-auto-width' : ''}`}>
          <thead>
            <tr>
              {selectable && (
                <th className="wd-30">
                  <div className="custom-control custom-checkbox ms-1">
                    <input
                      ref={selectAllRef}
                      type="checkbox"
                      className="custom-control-input"
                      checked={allSelected}
                      onChange={toggleAll}
                      id={`${checkboxId}-all`}
                    />
                    <label className="custom-control-label" htmlFor={`${checkboxId}-all`}>
                      <span className="visually-hidden">Seleccionar todo</span>
                    </label>
                  </div>
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  aria-sort={col.sortable
                    ? (sortKey === col.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none')
                    : undefined}
                  style={col.sortable ? { cursor: 'pointer', userSelect: 'none' } : undefined}
                >
                  {col.sortable ? (
                    <button
                      type="button"
                      className="border-0 bg-transparent p-0"
                      style={{ color: 'inherit', font: 'inherit' }}
                      onClick={() => toggleSort(col.key)}
                    >
                      {col.label}
                      {sortKey === col.key && (
                        <i
                          className={`feather-chevron-${sortDir === 'asc' ? 'up' : 'down'} ms-1 fs-11`}
                          aria-hidden="true"
                        ></i>
                      )}
                    </button>
                  ) : col.label}
                </th>
              ))}
              {actions.length > 0 && <th className="text-end">Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {pageData.length === 0 && (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0) + (actions.length ? 1 : 0)} className="text-center text-muted py-4">
                  Sin datos
                </td>
              </tr>
            )}
            {pageData.map((row, rowIndex) => {
              const id = row[rowKey]
              const rowCheckboxId = `${checkboxId}-row-${id}`
              return (
                <tr key={id} className={`single-item${selected.has(id) ? ' selected' : ''}`}>
                  {selectable && (
                    <td>
                      <div className="custom-control custom-checkbox ms-1">
                        <input
                          type="checkbox"
                          className="custom-control-input"
                          checked={selected.has(id)}
                          onChange={() => toggleRow(id)}
                          id={rowCheckboxId}
                        />
                        <label className="custom-control-label" htmlFor={rowCheckboxId}>
                          <span className="visually-hidden">Seleccionar fila</span>
                        </label>
                      </div>
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.key}>
                      {col.render ? col.render(row, row[col.key], rowIndex) : row[col.key]}
                    </td>
                  ))}
                  {actions.length > 0 && (
                    <td className="gcu-table-actions-cell">
                      <div className="hstack gap-2 justify-content-end gcu-table-actions">
                        {actions.map((action) => (
                          action.variant === 'button' ? (
                            <button
                              key={action.key || action.label}
                              type="button"
                              className={`btn btn-sm btn-${action.buttonVariant || 'light-brand'}`}
                              onClick={() => action.onClick(row)}
                            >
                              {action.icon && <i className={`${action.icon} me-1`} aria-hidden="true"></i>}
                              {action.label}
                            </button>
                          ) : (
                            <button
                              key={action.key || action.label}
                              type="button"
                              className="btn btn-icon btn-light-brand btn-sm"
                              title={action.label}
                              aria-label={action.label}
                              onClick={() => action.onClick(row)}
                            >
                              <i className={action.icon} aria-hidden="true"></i>
                            </button>
                          )
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="d-flex align-items-center justify-content-between px-3 py-3 border-top">
          <span className="fs-12 text-muted">
            Página {currentPage} de {totalPages} — {data.length} registros
          </span>
          <ul className="pagination pagination-sm mb-0">
            <li className={`page-item${currentPage === 1 ? ' disabled' : ''}`}>
              <button
                type="button"
                className="page-link"
                onClick={() => setPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                aria-label="Página anterior"
              >
                &laquo;
              </button>
            </li>
            {pageWindow(currentPage, totalPages).map((p, i) =>
              p === '…' ? (
                <li key={`dots-${i}`} className="page-item disabled">
                  <span className="page-link">…</span>
                </li>
              ) : (
                <li key={p} className={`page-item${p === currentPage ? ' active' : ''}`}>
                  <button type="button" className="page-link" onClick={() => setPage(p)}>{p}</button>
                </li>
              )
            )}
            <li className={`page-item${currentPage === totalPages ? ' disabled' : ''}`}>
              <button
                type="button"
                className="page-link"
                onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                aria-label="Página siguiente"
              >
                &raquo;
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}
