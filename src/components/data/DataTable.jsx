import { useEffect, useId, useRef, useState } from 'react'

/**
 * DataTable — tabla con checkboxes, ordenamiento, paginación y acciones.
 *
 * Props:
 *   columns — [{ key, label, sortable, render: (row, value, rowIndex) => JSX }]
 *   data    — array of objects
 *   actions — [{ label, icon, onClick: (row) => void }]
 *   pageSize — rows per page (default 10)
 *   selectable — show checkboxes
 *   onSelectionChange — (selectedIds) => void
 *   rowKey  — field name for row identity (default "id")
 */
export function DataTable({
  columns = [],
  data = [],
  actions = [],
  pageSize = 10,
  selectable,
  onSelectionChange,
  rowKey = 'id',
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
    setPage((current) => Math.min(Math.max(current, 1), Math.max(totalPages, 1)))
  }, [totalPages])

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
        <table className="table table-hover">
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
                    <label className="custom-control-label" htmlFor={`${checkboxId}-all`}></label>
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
                        <label className="custom-control-label" htmlFor={rowCheckboxId}></label>
                      </div>
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.key}>
                      {col.render ? col.render(row, row[col.key], rowIndex) : row[col.key]}
                    </td>
                  ))}
                  {actions.length > 0 && (
                    <td>
                      <div className="hstack gap-2 justify-content-end">
                        {actions.map((action, i) => (
                          <button
                            key={i}
                            type="button"
                            className="avatar-text avatar-md btn-link border-0 bg-transparent"
                            title={action.label}
                            onClick={() => action.onClick(row)}
                          >
                            <i className={action.icon}></i>
                          </button>
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
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={currentPage === 1}
                aria-label="Página anterior"
              >
                &laquo;
              </button>
            </li>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <li key={p} className={`page-item${p === currentPage ? ' active' : ''}`}>
                <button type="button" className="page-link" onClick={() => setPage(p)}>{p}</button>
              </li>
            ))}
            <li className={`page-item${currentPage === totalPages ? ' disabled' : ''}`}>
              <button
                type="button"
                className="page-link"
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
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
