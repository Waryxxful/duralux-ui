import type { NormalizedRowAction } from './dataTableActionsModel'

interface RowActionButtonProps<T> {
  action: NormalizedRowAction<T>
  row: T
}

/** Botón de acción de fila: solo ícono (con nombre accesible y title) o botón con texto. */
export function RowActionButton<T>({ action, row }: RowActionButtonProps<T>) {
  if (action.variant === 'button') {
    return (
      <button
        type="button"
        className={`btn btn-sm btn-${action.buttonVariant}`}
        aria-label={action.accessibleLabel}
        onClick={() => action.onClick(row)}
      >
        {action.icon ? <i className={`${action.icon} me-1`} aria-hidden="true" /> : null}
        {action.visibleLabel}
      </button>
    )
  }

  return (
    <button
      type="button"
      className="btn btn-icon btn-light-brand btn-sm"
      title={action.accessibleLabel}
      aria-label={action.accessibleLabel}
      onClick={() => action.onClick(row)}
    >
      <i className={action.icon} aria-hidden="true" />
    </button>
  )
}
