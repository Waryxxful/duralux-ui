/**
 * LoadingState — estado de carga con spinner Bootstrap y mensaje.
 *
 * Props:
 *   message   — texto descriptivo (default: 'Cargando...')
 *   className — clases adicionales
 */
import { cx } from '../../utils/cx'

export function LoadingState({
  message = 'Cargando...',
  className,
}) {
  return (
    <div className={cx('d-flex flex-column align-items-center justify-content-center text-center py-5', className)}>
      <div className="spinner-border text-primary mb-3" role="status" style={{ width: '2.5rem', height: '2.5rem' }}>
        <span className="visually-hidden">{message}</span>
      </div>
      {message && <p className="text-muted">{message}</p>}
    </div>
  )
}
