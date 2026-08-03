/**
 * ErrorState — estado de error con título, mensaje y botón de reintento.
 *
 * Props:
 *   title     — título del error
 *   message   — descripción del error
 *   onRetry   — callback para reintentar; si se pasa, muestra botón "Reintentar"
 *   className — clases adicionales
 */
import { Button } from '../ui/Button'
import { cx } from '../../utils/cx'

export function ErrorState({
  title = 'Ocurrió un error',
  message = 'No se pudo cargar la información. Intenta nuevamente.',
  onRetry,
  className,
}) {
  return (
    <div className={cx('d-flex flex-column align-items-center justify-content-center text-center py-5', className)}>
      <i className="feather-alert-circle mb-3 text-danger" style={{ fontSize: '3rem' }} aria-hidden="true" />
      {title && <p className="fw-semibold fs-5 mb-1">{title}</p>}
      {message && <p className="text-muted mb-3">{message}</p>}
      {onRetry && (
        <Button variant="light-brand" size="sm" startIcon="refresh-cw" onClick={onRetry}>
          Reintentar
        </Button>
      )}
    </div>
  )
}
