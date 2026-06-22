/**
 * ChatSidebar — lista de contactos/conversaciones.
 *
 * Props:
 *   contacts        — [{ id, name, avatar, preview, time, online, unread }]
 *   selectedId      — id del contacto activo
 *   onSelect        — (contact) => void
 *   onSearch        — (query) => void
 */
export function ChatSidebar({ contacts = [], selectedId, onSelect, onSearch }) {
  return (
    <div className="content-sidebar content-sidebar-xl">
      <div className="content-sidebar-header px-4 py-3 border-bottom d-flex align-items-center gap-3">
        <div className="input-group flex-1">
          <span className="input-group-text border-0 bg-transparent ps-0">
            <i className="feather-search text-muted"></i>
          </span>
          <input
            type="text"
            className="form-control border-0 bg-transparent"
            placeholder="Buscar conversación..."
            onChange={(e) => onSearch?.(e.target.value)}
          />
        </div>
        <button className="avatar-text avatar-sm bg-primary text-white border-0 flex-shrink-0">
          <i className="feather-edit"></i>
        </button>
      </div>
      <div className="content-sidebar-body" style={{ overflowY: 'auto', flex: 1 }}>
        <div className="content-sidebar-items">
          {contacts.map((c) => (
            <div
              key={c.id}
              className={`p-4 d-flex position-relative border-bottom c-pointer single-item${selectedId === c.id ? ' active bg-primary-50' : ''}`}
              style={{ cursor: 'pointer' }}
              onClick={() => onSelect?.(c)}
            >
              <div className="position-relative flex-shrink-0">
                <div className="avatar-image avatar-md">
                  <img src={c.avatar || `/assets/images/avatar/1.png`} alt={c.name} className="img-fluid rounded-circle" />
                </div>
                {c.online && (
                  <span className="position-absolute bottom-0 end-0 wd-10 ht-10 bg-success rounded-circle border border-2 border-white"></span>
                )}
              </div>
              <div className="ms-3 flex-grow-1 overflow-hidden">
                <div className="d-flex align-items-center justify-content-between mb-1">
                  <span className="fw-semibold fs-13 text-truncate">{c.name}</span>
                  <span className="fs-10 text-muted flex-shrink-0 ms-2">{c.time}</span>
                </div>
                <div className="d-flex align-items-center justify-content-between">
                  <p className="fs-12 text-muted mb-0 text-truncate">{c.preview}</p>
                  {c.unread > 0 && (
                    <span className="badge bg-primary rounded-pill flex-shrink-0 ms-2">{c.unread}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
