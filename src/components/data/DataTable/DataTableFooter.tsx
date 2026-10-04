import { Pagination } from '../Pagination'

const numericPageAriaLabel = (pageNumber: number) => String(pageNumber)

interface DataTableFooterProps {
  page: number
  totalPages: number
  countLabel: string
  onPageChange: (page: number) => void
  ariaLabel: string | undefined
}

/** Pie de DataTable: «Página X de Y — N registros» y la paginación cuando hay más de una página. */
export function DataTableFooter({ page, totalPages, countLabel, onPageChange, ariaLabel }: DataTableFooterProps) {
  return (
    <div className="d-flex align-items-center justify-content-between px-3 py-3 border-top">
      <span className="fs-12 text-muted gcu-tabular">
        Página {page} de {Math.max(totalPages, 1)} — {countLabel}
      </span>
      {totalPages > 1 ? (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={onPageChange}
          className="pagination-sm mb-0"
          aria-label={ariaLabel ? `Paginación de ${ariaLabel}` : 'Paginación de la tabla'}
          pageAriaLabel={numericPageAriaLabel}
        />
      ) : null}
    </div>
  )
}
