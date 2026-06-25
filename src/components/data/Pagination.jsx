import React from 'react';

function range(start, end) {
  const result = [];
  for (let i = start; i <= end; i++) result.push(i);
  return result;
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  sibling = 1,
  className,
  'aria-label': label = 'Paginación',
}) {
  if (totalPages <= 1) return null;

  const left = Math.max(1, page - sibling);
  const right = Math.min(totalPages, page + sibling);
  const pages = range(left, right);
  const showLeftDots = left > 2;
  const showRightDots = right < totalPages - 1;

  function Item({ p }) {
    return (
      <li className={`page-item${page === p ? ' active' : ''}`}>
        <button
          type="button"
          className="page-link"
          onClick={() => onPageChange(p)}
          aria-current={page === p ? 'page' : undefined}
          aria-label={`Página ${p}`}
        >
          {p}
        </button>
      </li>
    );
  }

  return (
    <nav aria-label={label}>
      <ul className={['pagination', className].filter(Boolean).join(' ')}>
        <li className={`page-item${page === 1 ? ' disabled' : ''}`}>
          <button
            type="button"
            className="page-link"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            aria-label="Página anterior"
          >
            <i className="feather-chevron-left" aria-hidden />
          </button>
        </li>

        {left > 1 && <Item p={1} />}
        {showLeftDots && (
          <li className="page-item disabled">
            <span className="page-link">…</span>
          </li>
        )}
        {pages.map(p => <Item key={p} p={p} />)}
        {showRightDots && (
          <li className="page-item disabled">
            <span className="page-link">…</span>
          </li>
        )}
        {right < totalPages && <Item p={totalPages} />}

        <li className={`page-item${page === totalPages ? ' disabled' : ''}`}>
          <button
            type="button"
            className="page-link"
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
            aria-label="Página siguiente"
          >
            <i className="feather-chevron-right" aria-hidden />
          </button>
        </li>
      </ul>
    </nav>
  );
}
