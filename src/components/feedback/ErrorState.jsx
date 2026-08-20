/**
 * ErrorState — estado de error con título, mensaje y botón de reintento.
 *
 * Props:
 *   title     — título del error
 *   message   — descripción del error
 *   onRetry   — callback para reintentar; si se pasa, muestra botón "Reintentar"
 *   className — clases adicionales
 */
import { useId } from 'react'
import { Button } from '../ui/Button'
import { isArray, isFunction, isObject, isString } from '../../utils/typeGuards'

function hasContent(value) {
  if (value === null || value === undefined || value === false || value === true) return false
  if (isString(value)) return value.trim() !== ''
  return true
}

function normalizeMessage(value) {
  if (value instanceof Error) return value.message || 'Error desconocido'
  if (value && isObject(value) && !hasContent(value)) return null
  if (value && isObject(value) && 'message' in value && !isArray(value)) return value.message
  return value
}

export function ErrorState({
  title = 'Ocurrió un error',
  message = 'No se pudo cargar la información. Intenta nuevamente.',
  error = undefined,
  onRetry,
  className,
}) {
  const titleId = useId()
  const hasTitle = hasContent(title)
  const resolvedMessage = normalizeMessage(error === undefined ? message : error)
  const canRetry = isFunction(onRetry)

  return (
    <div
      className={['d-flex flex-column align-items-center justify-content-center text-center py-5', className].filter(Boolean).join(' ')}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      aria-labelledby={hasTitle ? titleId : undefined}
      aria-label={hasTitle ? undefined : 'Error'}
    >
      <i className="feather-alert-circle mb-3 text-danger" style={{ fontSize: '3rem' }} aria-hidden="true" />
      {hasTitle && <h2 id={titleId} className="fw-semibold fs-5 mb-1">{title}</h2>}
      {hasContent(resolvedMessage) && <p className="text-muted mb-3">{resolvedMessage}</p>}
      {canRetry && (
        <Button variant="light-brand" size="sm" startIcon="refresh-cw" onClick={onRetry}>
          Reintentar
        </Button>
      )}
    </div>
  )
}
