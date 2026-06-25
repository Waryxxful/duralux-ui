/**
 * LoadingState — estado de carga con spinner Bootstrap y mensaje.
 *
 * Props:
 *   message   — texto descriptivo (default: 'Cargando...')
 *   className — clases adicionales
 */
export function LoadingState({
  message = 'Cargando...',
  className,
}) {
  return (
    <div className={['d-flex flex-column align-items-center justify-content-center text-center py-5', className].filter(Boolean).join(' ')}>
      <div className="spinner-border text-primary mb-3" role="status" style={{ width: '2.5rem', height: '2.5rem' }}>
        <span className="visually-hidden">{message}</span>
      </div>
      {message && <p className="text-muted">{message}</p>}
    </div>
  )
}
