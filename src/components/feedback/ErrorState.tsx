import { forwardRef, useEffect, useId } from 'react'
import type * as React from 'react'
import { Button } from '../ui/Button'
import { cx } from '../../utils/cx'
import { log } from '../../utils/log'
import { isArray, isFunction, isObject, isString } from '../../utils/typeGuards'
import type { ErrorStateProps } from '../../public/types'

function hasContent(value: unknown): boolean {
  if (value === null || value === undefined || value === false || value === true) return false
  if (isString(value)) return value.trim() !== ''
  return true
}

function normalizeMessage(value: unknown): React.ReactNode {
  if (value instanceof Error) return value.message || 'Error desconocido'
  if (value && isObject(value) && !hasContent(value)) return null
  if (value && isObject(value) && 'message' in value && !isArray(value)) return (value as { message: React.ReactNode }).message
  return value as React.ReactNode
}

/**
 * ErrorState — qué pasó, qué hacer y botón para reintentar. Se anuncia como `alert`.
 *
 * - error: valor recibido (Error u objeto con `message`); reemplaza a `message` y se registra con `log.error`.
 * - onRetry / retryLabel / retrying: reintento con su etiqueta y estado de carga.
 * - action: acción alternativa (p. ej. «Contactar soporte»).
 */
export const ErrorState = forwardRef<HTMLDivElement, ErrorStateProps>(function ErrorState({
  title = 'Ocurrió un error',
  message = 'No se pudo cargar la información. Intenta nuevamente.',
  error = undefined,
  onRetry,
  retryLabel = 'Reintentar',
  retrying = false,
  action,
  compact = false,
  className,
  ...rest
}, ref) {
  const titleId = useId()
  const hasTitle = hasContent(title)
  const resolvedMessage = normalizeMessage(error === undefined ? message : error)
  const canRetry = isFunction(onRetry)

  useEffect(() => {
    if (error !== undefined && error !== null) log.error('ErrorState: se muestra un error al usuario.', error)
  }, [error])

  return (
    <div
      {...rest}
      ref={ref}
      className={cx('gcu-state', 'gcu-state--error', compact && 'gcu-state--compact', className)}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      aria-labelledby={hasTitle ? titleId : undefined}
      aria-label={hasTitle ? undefined : 'Error'}
    >
      <span className="gcu-state__icon"><i className="feather-alert-circle" aria-hidden="true" /></span>
      {hasTitle && <h2 id={titleId} className="gcu-state__title">{title}</h2>}
      {hasContent(resolvedMessage) && <p className="gcu-state__message">{resolvedMessage}</p>}
      {(canRetry || action) && (
        <div className="gcu-state__actions">
          {canRetry && (
            <Button variant="light-brand" size="sm" startIcon="refresh-cw" loading={retrying} onClick={onRetry}>
              {retryLabel}
            </Button>
          )}
          {action}
        </div>
      )}
    </div>
  )
})
