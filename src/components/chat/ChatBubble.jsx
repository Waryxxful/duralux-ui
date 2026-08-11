import { PLACEHOLDER_AVATAR } from '../../assets/placeholders'

function isRecord(value) {
  if (value === null || typeof value !== 'object') return false

  try {
    return !Array.isArray(value)
  } catch {
    return false
  }
}

function readProperty(value, key) {
  if (value === null || value === undefined) return undefined

  try {
    return value[key]
  } catch {
    return undefined
  }
}

function normalizeDisplayText(value, fallback = '') {
  if (typeof value === 'string') return value
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  return fallback
}

function normalizeLabelText(value, fallback) {
  const text = normalizeDisplayText(value).trim()
  return text || fallback
}

function normalizeImageSource(value) {
  const source = normalizeDisplayText(value).trim()
  return source || PLACEHOLDER_AVATAR
}

function normalizeMessage(message) {
  const source = isRecord(message) ? message : {}
  const senderValue = readProperty(source, 'sender')
  const sender = isRecord(senderValue) ? senderValue : {}

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
