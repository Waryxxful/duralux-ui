import { forwardRef } from 'react'
import { cx } from '../../utils/cx'
import type { AiMessageProps } from '../../public/types'
import { Avatar } from '../ui/Avatar'
import { AiAvatar } from './AiAvatar'

/**
 * AiMessage — un turno de la conversación con el asistente.
 *
 * - sender `user`: a la derecha, burbuja de superficie hundida, avatar con iniciales.
 * - sender `assistant`: a la izquierda, AiAvatar y contenido a todo el ancho (respuestas largas).
 * - Lectores de pantalla: el nombre visible (o «Tú» / «Asistente») abre el turno.
 * - actions: normalmente `MessageActions`, bajo el contenido.
 * Estilos: src/styles/components/ai-message.css.
 */
export const AiMessage = /* @__PURE__ */ forwardRef<HTMLDivElement, AiMessageProps>(function AiMessage(
  { sender, name, time, actions, avatar, className, children, ...rest },
  ref,
) {
  const isUser = sender === 'user'
  const author = name ?? (isUser ? 'Tú' : 'Asistente')
  return (
    <div {...rest} ref={ref} className={cx('gcu-ai-message', `gcu-ai-message--${isUser ? 'user' : 'assistant'}`, className)}>
      <span className="gcu-ai-message__avatar">
        {isUser ? (avatar ?? <Avatar name={author} size="sm" aria-hidden="true" />) : <AiAvatar size="sm" />}
      </span>
      <div className="gcu-ai-message__body">
        <p className="gcu-ai-message__meta">
          <span className="gcu-ai-message__author">{author}</span>
          {time && <span className="gcu-ai-message__time"> · {time}</span>}
        </p>
        <div className="gcu-ai-message__content">{children}</div>
        {actions}
      </div>
    </div>
  )
})
