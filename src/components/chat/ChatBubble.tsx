import { forwardRef } from 'react'
import { cx } from '../../utils/cx'
import { log } from '../../utils/log'
import { toDate } from '../../utils/format'
import { isFunction, isObject, isString } from '../../utils/typeGuards'
import { Avatar } from '../ui/Avatar'
import { MessageBubble } from '../conversation/MessageBubble'
import type {
  ChatBubbleProps,
  ChatDaySeparatorProps,
  ChatDeliveryStatus,
  ChatMessage,
  ChatTypingIndicatorProps,
} from '../../public/types'
import {
  formatChatDay,
  normalizeDisplayText,
  normalizeImageSource,
  normalizeLabelText,
  readProperty,
} from './chatModel'

const KNOWN_STATUSES = {
  sending: true,
  sent: true,
  delivered: true,
  read: true,
  failed: true,
} satisfies Record<ChatDeliveryStatus, true>

/** El tipo promete un estado conocido; en runtime puede llegar otra cosa y se descarta. */
function normalizeStatus(value: ChatDeliveryStatus | undefined): ChatDeliveryStatus | undefined {
  return isString(value) && Object.prototype.hasOwnProperty.call(KNOWN_STATUSES, value) ? value : undefined
}

function normalizeMessage(message: ChatMessage | null | undefined) {
  const source: ChatMessage = isObject(message) ? message : {}
  const senderValue = readProperty(source, 'sender')
  const sender: NonNullable<ChatMessage['sender']> = isObject(senderValue) ? senderValue : {}

  return {
    text: normalizeDisplayText(readProperty(source, 'text')),
    time: normalizeLabelText(readProperty(source, 'time'), ''),
    senderName: normalizeLabelText(readProperty(sender, 'name'), 'Contacto'),
    senderAvatar: normalizeImageSource(readProperty(sender, 'avatar')),
    mine: readProperty(source, 'mine') === true,
    system: readProperty(source, 'system') === true,
    status: normalizeStatus(readProperty(source, 'status')),
  }
}

/**
 * ChatBubble — un mensaje de la conversación: avatar y autor (salvo si va agrupado), burbuja y meta.
 *
 * - message: { id, text, time, date, sender: { id, name, avatar }, mine, status, system }.
 * - grouped: continuación del mismo autor (usa `groupChatMessages`): sin avatar ni nombre repetidos.
 * - status "failed" + onRetry: el error se lee como texto y ofrece «Reintentar envío».
 * - La burbuja es un MessageBubble (entrante en superficie elevada, saliente en primario con texto AA).
 */
export const ChatBubble = /* @__PURE__ */ forwardRef<HTMLDivElement, ChatBubbleProps>(function ChatBubble({
  message,
  grouped = false,
  onRetry,
  retryLabel = 'Reintentar envío',
  className,
}, ref) {
  const { text, time, senderName, senderAvatar, mine, system, status } = normalizeMessage(message)

  if (system) {
    return (
      <MessageBubble ref={ref} variant="system" className={cx('gcu-chat-message--system', className)}>
        {text}
      </MessageBubble>
    )
  }

  const side = mine ? 'outgoing' : 'incoming'
  const failed = mine && status === 'failed'
  const canRetry = failed && isFunction(onRetry)

  return (
    <div
      ref={ref}
      className={cx(
        'single-chat-item',
        'gcu-chat-message',
        `gcu-chat-message--${side}`,
        grouped && 'gcu-chat-message--grouped',
        failed && 'gcu-chat-message--failed',
        className,
      )}
    >
      {grouped ? null : (
        <div className="gcu-chat-message__head">
          <Avatar src={senderAvatar} name={senderName} size="sm" />
          <span className="gcu-chat-message__author">{senderName}</span>
        </div>
      )}
      <MessageBubble
        variant={side}
        grouped={grouped}
        className="chat-bubble-content"
        time={time || undefined}
        status={mine ? status : undefined}
      >
        <p className="gcu-message-bubble__text">{text}</p>
      </MessageBubble>
      {canRetry ? (
        <button type="button" className="gcu-chat-message__retry" onClick={() => onRetry(message)}>
          <i className="feather-rotate-ccw" aria-hidden="true" />
          {retryLabel}
        </button>
      ) : null}
    </div>
  )
})

/**
 * ChatTypingIndicator — «Ana está escribiendo» con tres puntos. Se anuncia con `role="status"`;
 * los puntos son decorativos y se detienen con `prefers-reduced-motion`.
 */
export const ChatTypingIndicator = /* @__PURE__ */ forwardRef<HTMLDivElement, ChatTypingIndicatorProps>(function ChatTypingIndicator({
  name,
  className,
}, ref) {
  const normalizedName = normalizeLabelText(name, 'Alguien')

  return (
    <div
      ref={ref}
      className={cx('chat-typing-indicator', 'gcu-chat-typing', className)}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <Avatar name={normalizedName} size="sm" />
      <div className="gcu-chat-typing__bubble">
        <span className="gcu-chat-typing__label">{normalizedName} está escribiendo</span>
        <span className="gcu-chat-typing__dots" aria-hidden="true">
          <span className="chat-typing-dot" aria-hidden="true" />
          <span className="chat-typing-dot" aria-hidden="true" />
          <span className="chat-typing-dot" aria-hidden="true" />
        </span>
      </div>
    </div>
  )
})

/** ChatDaySeparator — separador de día en la conversación: «Hoy», «Ayer» o dd-mm-aaaa. */
export const ChatDaySeparator = /* @__PURE__ */ forwardRef<HTMLDivElement, ChatDaySeparatorProps>(function ChatDaySeparator({
  date,
  now,
  className,
}, ref) {
  const parsed = toDate(date)
  if (!parsed) {
    log.warn('ChatDaySeparator: fecha inválida; se omite el separador.')
    return null
  }
  const iso = `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}`

  return (
    <div ref={ref} className={cx('gcu-chat-day', className)}>
      <time className="gcu-chat-day__label" dateTime={iso}>{formatChatDay(parsed, now)}</time>
    </div>
  )
})
