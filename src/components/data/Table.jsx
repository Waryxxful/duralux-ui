import React from 'react';

export function Table({
  columns,
  rows,
  rowKey,
  emptyMessage = 'Sin registros.',
  loading,
  className,
  striped = true,
  hover = true,
}) {
  const tableCls = [
    'table',
    striped ? 'table-striped' : '',
    hover ? 'table-hover' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <table className={tableCls}>
      <thead>
        <tr>
          {columns.map(col => (
            <th
              key={col.key}
              scope="col"
              className={col.headerClassName || undefined}
              style={col.width ? { width: col.width } : undefined}
            >
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {loading ? (
          <tr>
            <td colSpan={columns.length} className="text-center py-3">
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
              Cargando...
            </td>
          </tr>
        ) : rows.length === 0 ? (
          <tr>
            <td colSpan={columns.length} className="text-center py-3 text-muted">
              {emptyMessage}
            </td>
          </tr>
        ) : (
          rows.map((row, i) => (
            <tr key={rowKey(row, i)}>
              {columns.map(col => (
                <td
                  key={col.key}
                  className={col.cellClassName || undefined}
                >
                  {col.render(row, i)}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
