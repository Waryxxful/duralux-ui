import { forwardRef, useEffect, useState } from 'react'
import { cx } from '../../utils/cx'
import { log } from '../../utils/log'
import { isFunction } from '../../utils/typeGuards'
import type { AiFeedbackValue, MessageActionsProps } from '../../public/types'
import { IconButton } from '../ui/Button'

const COPIED_MS = 1400

/**
 * MessageActions — copiar, regenerar y valorar una respuesta del asistente.
 *
 * - Copiar usa el portapapeles; confirma con «Respuesta copiada» (aria-live) y el ícono cambia.
 *   Si falla, se avisa a la vista y por log sin el texto (nunca contenido de mensajes en logs).
 * - Regenerar y valorar solo emiten la intención; la app decide qué hacer.
 * - Valoración con `aria-pressed`; controlada con `feedback` o recordada por el componente.
 * Estilos: src/styles/components/ai-message.css.
 */
export const MessageActions = /* @__PURE__ */ forwardRef<HTMLDivElement, MessageActionsProps>(function MessageActions(
  { text, onCopy, onRegenerate, onFeedback, feedback, variant = 'ghost', className, ...rest },
  ref,
) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle')
  const [innerVote, setInnerVote] = useState<AiFeedbackValue | null>(null)
  const vote = feedback === undefined ? innerVote : feedback

  useEffect(() => {
    if (status === 'idle') return undefined
    const timer = setTimeout(() => setStatus('idle'), COPIED_MS)
    return () => clearTimeout(timer)
  }, [status])

  const copy = () => {
    const clipboard = globalThis.navigator?.clipboard
    if (!clipboard || !isFunction(clipboard.writeText)) {
      log.warn('MessageActions: el navegador no permite copiar al portapapeles.')
      setStatus('failed')
      return
    }
    clipboard.writeText(text).then(() => {
      setStatus('copied')
      onCopy?.()
    }).catch(() => {
      log.warn('MessageActions: no se pudo copiar la respuesta.')
      setStatus('failed')
    })
  }

  const rate = (value: AiFeedbackValue) => {
    if (feedback === undefined) setInnerVote(value)
    onFeedback?.(value)
  }

  return (
    <div
      {...rest}
      ref={ref}
      role="toolbar"
      aria-label={rest['aria-label'] ?? 'Acciones de la respuesta'}
      className={cx('gcu-ai-actions', variant === 'pill' && 'gcu-ai-actions--pill', className)}
    >
      <IconButton
        size="sm"
        className="gcu-ai-actions__btn"
        icon={status === 'copied' ? 'check' : 'copy'}
        label={status === 'copied' ? 'Copiada' : 'Copiar respuesta'}
        onClick={copy}
      />
      {isFunction(onRegenerate) && (
        <IconButton size="sm" className="gcu-ai-actions__btn" icon="refresh-cw" label="Regenerar respuesta" onClick={onRegenerate} />
      )}
      {isFunction(onFeedback) && (
        <>
          <IconButton size="sm" className="gcu-ai-actions__btn" icon="thumbs-up" label="Respuesta útil" aria-pressed={vote === 'up'} onClick={() => rate('up')} />
          <IconButton size="sm" className="gcu-ai-actions__btn" icon="thumbs-down" label="Respuesta no útil" aria-pressed={vote === 'down'} onClick={() => rate('down')} />
        </>
      )}
      <span className="visually-hidden" aria-live="polite">
        {status === 'copied' ? 'Respuesta copiada' : status === 'failed' ? 'No se pudo copiar la respuesta' : ''}
      </span>
    </div>
  )
})
