/**
 * ChatWindow — área principal de chat (header + mensajes + input).
 *
 * Props:
 *   contact  — { name, avatar, online, role }
 *   children — mensajes (ChatBubble) + ChatInputBar al final
 */
export function ChatWindow({ contact, children }) {
  if (!contact) {
    return (
      <div className="flex-grow-1 d-flex align-items-center justify-content-center bg-gray-50">
        <div className="text-center text-muted">
          <i className="feather-message-circle" style={{ fontSize: 48 }}></i>
          <p className="mt-3 fs-14">Selecciona una conversación</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-grow-1 d-flex flex-column" style={{ minHeight: 0 }}>
      {/* Header */}
      <div className="border-bottom px-4 py-3 d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-3">
          <div className="position-relative">
            <div className="avatar-image avatar-md">
              <img
                src={contact.avatar || '/assets/images/avatar/1.png'}
                alt={contact.name}
                className="img-fluid rounded-circle"
              />
            </div>
            {contact.online && (
              <span className="position-absolute bottom-0 end-0 wd-10 ht-10 bg-success rounded-circle border border-2 border-white"></span>
            )}
          </div>
          <div>
            <div className="fw-semibold fs-14">{contact.name}</div>
            <div className="fs-11 text-muted">
              {contact.online ? (
                <span className="text-success">En línea</span>
              ) : (
                contact.role || 'Fuera de línea'
              )}
            </div>
          </div>
        </div>
        <div className="d-flex align-items-center gap-2">
          <button className="avatar-text avatar-sm bg-transparent border-0 text-muted">
            <i className="feather-phone"></i>
          </button>
          <button className="avatar-text avatar-sm bg-transparent border-0 text-muted">
            <i className="feather-video"></i>
          </button>
          <button className="avatar-text avatar-sm bg-transparent border-0 text-muted">
            <i className="feather-more-vertical"></i>
          </button>
        </div>
      </div>

      {/* Messages + Input — children debe ser [...ChatBubble, ChatInputBar] */}
      <div className="flex-grow-1 d-flex flex-column" style={{ minHeight: 0 }}>
        <div className="flex-grow-1 p-4" style={{ overflowY: 'auto' }}>
          {Array.isArray(children)
            ? children.slice(0, -1)
            : children
          }
        </div>
        {Array.isArray(children) && children[children.length - 1]}
      </div>
    </div>
  )
}
