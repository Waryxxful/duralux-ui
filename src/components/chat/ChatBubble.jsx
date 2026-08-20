import { PLACEHOLDER_AVATAR } from '../../assets/placeholders'
import {
  normalizeDisplayText,
  normalizeImageSource,
  normalizeLabelText,
  readProperty,
} from './chatModel'
import { isObject } from '../../utils/typeGuards'

function normalizeMessage(message) {
  const source = isObject(message) ? message : {}
  const senderValue = readProperty(source, 'sender')
  const sender = isObject(senderValue) ? senderValue : {}

  return {
    text: normalizeDisplayText(readProperty(source, 'text')),
    time: normalizeLabelText(readProperty(source, 'time'), ''),
    senderName: normalizeLabelText(readProperty(sender, 'name'), 'Contacto'),
    senderAvatar: normalizeImageSource(readProperty(sender, 'avatar')),
    mine: readProperty(source, 'mine') === true,
  }
}

/**
 * ChatBubble — burbuja de mensaje individual.
 *
 * Props:
 *   message  — { id, text, time, sender: { name, avatar }, mine }
 *   mine     — boolean (true = mensaje propio, derecha)
 */
export function ChatBubble({ message }) {
  const {
    text,
    time,
    senderName,
    senderAvatar,
    mine,
  } = normalizeMessage(message)

  return (
    <div className={`single-chat-item mb-4 d-flex flex-column${mine ? ' align-items-end' : ''}`}>
      <div className={`d-flex align-items-center gap-2 mb-2${mine ? ' flex-row-reverse' : ''}`}>
        <div className="avatar-image avatar-sm">
          <img
            src={senderAvatar}
            alt=""
            className="img-fluid rounded-circle"
          />
        </div>
        <span className="fs-13 fw-semibold">{senderName}</span>
        {time ? (
          <>
            <span className="wd-5 ht-5 bg-gray-400 rounded-circle" aria-hidden="true"></span>
            <span className="fs-11 text-muted">{time}</span>
          </>
        ) : null}
      </div>
      <div
        className={`chat-bubble-content p-3 rounded-4${mine ? ' bg-primary text-white ms-auto' : ' bg-gray-100'}`}
      >
        <p className="mb-0 fs-13">{text}</p>
      </div>
    </div>
  )
}

/**
 * ChatTypingIndicator — indicador de "escribiendo..."
 */
export function ChatTypingIndicator({ name }) {
  const normalizedName = normalizeLabelText(name, 'Alguien')

  return (
    <div className="chat-typing-indicator d-flex align-items-center gap-2 mb-4" role="status" aria-live="polite" aria-atomic="true">
      <div className="avatar-image avatar-sm">
        <img src={PLACEHOLDER_AVATAR} alt="" className="img-fluid rounded-circle" />
      </div>
      <div className="p-3 rounded-4 bg-gray-100 d-flex align-items-center gap-2">
        <span className="fs-12 text-muted">{normalizedName} está escribiendo</span>
        <span className="d-flex gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="chat-typing-dot bg-muted rounded-circle"
              aria-hidden="true"
            />
          ))}
        </span>
      </div>
    </div>
  )
}
