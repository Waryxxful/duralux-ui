import { forwardRef, useEffect, useId } from 'react'
import { cx } from '../../utils/cx'
import { log } from '../../utils/log'
import { isFunction } from '../../utils/typeGuards'
import type { AiErrorStateProps } from '../../public/types'
import { Button } from '../ui/Button'

/**
 * AiErrorState — falla de generación: qué pasó, la pregunta original conservada y reintentar.
 *
 * - La pregunta se muestra tal cual para reintentar sin reescribirla (`onEditPrompt` la devuelve
 *   al compositor). Nunca va a logs: el log solo registra que hubo una falla.
 * - `role="alert"`; variant `inline` para dentro de un hilo (una línea), `card` para el panel.
 * Estilos: src/styles/components/ai-error-state.css.
 */
export const AiErrorState = /* @__PURE__ */ forwardRef<HTMLDivElement, AiErrorStateProps>(function AiErrorState({
  title = 'El asistente no alcanzó a responder',
  description = 'Se agotó el tiempo antes de terminar. Tu pregunta quedó guardada.',
  prompt,
  onRetry,
  retrying = false,
  onEditPrompt,
  variant = 'card',
  className,
  ...rest
}, ref) {
  const titleId = useId()
  useEffect(() => {
    log.warn('AiErrorState: la generación falló; se ofrece reintentar.')
  }, [])
  const isCard = variant === 'card'
  return (
    <div
      {...rest}
      ref={ref}
      role="alert"
      aria-labelledby={titleId}
      className={cx('gcu-ai-error', 'gcu-container', `gcu-ai-error--${variant}`, className)}
    >
      <span className="gcu-ai-error__icon"><i className="feather-alert-triangle" aria-hidden="true" /></span>
      <div className="gcu-ai-error__body">
        <p id={titleId} className="gcu-ai-error__title">{title}</p>
        {isCard && description && <p className="gcu-ai-error__text">{description}</p>}
        {isCard && prompt && (
          <blockquote className="gcu-ai-error__prompt">
            <span className="visually-hidden">Tu pregunta: </span>«{prompt}»
          </blockquote>
        )}
      </div>
      <div className="gcu-ai-error__actions">
        {isFunction(onEditPrompt) && (
          <Button variant="light-brand" size="sm" onClick={onEditPrompt}>Editar pregunta</Button>
        )}
        <Button variant="light-brand" size="sm" startIcon="refresh-cw" loading={retrying} onClick={onRetry}>Reintentar</Button>
      </div>
    </div>
  )
})
