import { useState } from 'react'

/**
 * DataTable — tabla con checkboxes, ordenamiento, paginación y acciones.
 *
 * Props:
 *   columns — [{ key, label, sortable, render: (value, row) => JSX }]
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

  const sorted = sortKey
    ? [...data].sort((a, b) => {
        const av = a[sortKey] ?? ''
        const bv = b[sortKey] ?? ''
        const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true })
        return sortDir === 'asc' ? cmp : -cmp
      })
    : data

  const totalPages = Math.ceil(sorted.length / pageSize)
  const pageData = sorted.slice((page - 1) * pageSize, page * pageSize)

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
    if (selected.size === pageData.length) {
      setSelected(new Set())
      onSelectionChange?.([])
    } else {
      const ids = new Set(pageData.map((r) => r[rowKey]))
      setSelected(ids)
      onSelectionChange?.(Array.from(ids))
    }
  }

  const allSelected = pageData.length > 0 && pageData.every((r) => selected.has(r[rowKey]))

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
                      type="checkbox"
                      className="custom-control-input"
                      checked={allSelected}
                      onChange={toggleAll}
                      id="chk-all"
                    />
                    <label className="custom-control-label" htmlFor="chk-all"></label>
                  </div>
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={col.sortable ? () => toggleSort(col.key) : undefined}
                  style={col.sortable ? { cursor: 'pointer', userSelect: 'none' } : undefined}
                >
                  {col.label}
                  {col.sortable && sortKey === col.key && (
                    <i className={`feather-chevron-${sortDir === 'asc' ? 'up' : 'down'} ms-1 fs-11`}></i>
                  )}
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
            {pageData.map((row) => {
              const id = row[rowKey]
              return (
                <tr key={id} className="single-item">
                  {selectable && (
                    <td>
                      <div className="custom-control custom-checkbox ms-1">
                        <input
                          type="checkbox"
                          className="custom-control-input"
                          checked={selected.has(id)}
                          onChange={() => toggleRow(id)}
                          id={`chk-${id}`}
                        />
                        <label className="custom-control-label" htmlFor={`chk-${id}`}></label>
                      </div>
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.key}>
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
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
            Página {page} de {totalPages} — {data.length} registros
          </span>
          <ul className="pagination pagination-sm mb-0">
            <li className={`page-item${page === 1 ? ' disabled' : ''}`}>
              <button className="page-link" onClick={() => setPage((p) => p - 1)}>&laquo;</button>
            </li>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <li key={p} className={`page-item${p === page ? ' active' : ''}`}>
                <button className="page-link" onClick={() => setPage(p)}>{p}</button>
              </li>
            ))}
            <li className={`page-item${page === totalPages ? ' disabled' : ''}`}>
              <button className="page-link" onClick={() => setPage((p) => p + 1)}>&raquo;</button>
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}
