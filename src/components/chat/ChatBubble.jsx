/**
 * ChatBubble — burbuja de mensaje individual.
 *
 * Props:
 *   message  — { id, text, time, sender: { name, avatar }, mine }
 *   mine     — boolean (true = mensaje propio, derecha)
 */
export function ChatBubble({ message }) {
  const { text, time, sender, mine } = message

  return (
    <div className={`single-chat-item mb-4 d-flex flex-column${mine ? ' align-items-end' : ''}`}>
      <div className={`d-flex align-items-center gap-2 mb-2${mine ? ' flex-row-reverse' : ''}`}>
        <div className="avatar-image avatar-sm">
          <img
            src={sender?.avatar || '/assets/images/avatar/1.png'}
            alt={sender?.name}
            className="img-fluid rounded-circle"
          />
        </div>
        <span className="fs-13 fw-semibold">{sender?.name}</span>
        <span className="wd-5 ht-5 bg-gray-400 rounded-circle"></span>
        <span className="fs-11 text-muted">{time}</span>
      </div>
      <div
        className={`p-3 rounded-4${mine ? ' bg-primary text-white ms-auto' : ' bg-gray-100'}`}
        style={{ maxWidth: '60%' }}
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
  return (
    <div className="d-flex align-items-center gap-2 mb-4">
      <div className="avatar-image avatar-sm">
        <img src="/assets/images/avatar/2.png" alt="" className="img-fluid rounded-circle" />
      </div>
      <div className="p-3 rounded-4 bg-gray-100 d-flex align-items-center gap-2">
        <span className="fs-12 text-muted">{name} está escribiendo</span>
        <span className="d-flex gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="bg-muted rounded-circle"
              style={{
                width: 6, height: 6,
                display: 'inline-block',
                backgroundColor: '#aaa',
                animation: `bounce 1.2s infinite ${i * 0.2}s`,
              }}
            />
          ))}
        </span>
      </div>
    </div>
  )
}
