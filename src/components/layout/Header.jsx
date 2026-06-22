import { useRef, useState } from 'react'
import { useClickOutside } from '../../hooks/useClickOutside'

function NotifDropdown({ notifications, onClose }) {
  return (
    <div className="dropdown-menu dropdown-menu-end nxl-h-dropdown show" style={{ display: 'block' }}>
      <div className="d-flex align-items-center justify-content-between px-4 ht-60 border-bottom">
        <h6 className="mb-0">Notifications</h6>
        <a href="#" className="fs-12 text-muted" onClick={(e) => { e.preventDefault(); onClose() }}>
          Mark all as read
        </a>
      </div>
      <div style={{ maxHeight: 300, overflowY: 'auto' }}>
        {notifications.length === 0 && (
          <p className="text-center text-muted py-4 mb-0 fs-12">No notifications</p>
        )}
        {notifications.map((n, i) => (
          <a key={i} href={n.href || '#'} className="dropdown-item py-3">
            <div className="d-flex align-items-center gap-3">
              <div className={`avatar-text avatar-md bg-${n.color || 'primary'}-100 text-${n.color || 'primary'}`}>
                <i className={n.icon || 'feather-bell'}></i>
              </div>
              <div>
                <div className="fs-13 fw-semibold">{n.title}</div>
                <div className="fs-12 text-muted">{n.time}</div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}

function UserDropdown({ user, onClose }) {
  return (
    <div className="dropdown-menu dropdown-menu-end nxl-h-dropdown show" style={{ display: 'block', minWidth: 200 }}>
      <div className="d-flex align-items-center gap-3 px-3 py-3 border-bottom">
        {user.avatar
          ? <img src={user.avatar} alt="" className="rounded-circle" style={{ width: 40, height: 40, objectFit: 'cover' }} />
          : <div className="avatar-text avatar-md">{(user.name || 'U')[0]}</div>
        }
        <div>
          <div className="fw-semibold fs-13">{user.name}</div>
          <div className="fs-12 text-muted">{user.email}</div>
        </div>
      </div>
      {(user.menuItems || []).map((item, i) =>
        item.divider
          ? <div key={i} className="dropdown-divider"></div>
          : (
            <a key={i} href={item.href || '#'} className="dropdown-item" onClick={item.onClick}>
              {item.icon && <i className={`${item.icon} me-2`}></i>}
              {item.label}
            </a>
          )
      )}
    </div>
  )
}

export function Header({ user = {}, notifications = [], onToggleMini, onToggleMobile }) {
  const [notifOpen, setNotifOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const notifRef = useRef(null)
  const userRef = useRef(null)

  useClickOutside(notifRef, () => setNotifOpen(false))
  useClickOutside(userRef, () => setUserOpen(false))

  return (
    <header className="nxl-header">
      <div className="header-wrapper">
        <div className="header-left d-flex align-items-center gap-4">
          <a href="#" className="nxl-head-mobile-toggler" onClick={(e) => { e.preventDefault(); onToggleMobile?.() }}>
            <div className="hamburger hamburger--arrowturn">
              <div className="hamburger-box">
                <div className="hamburger-inner"></div>
              </div>
            </div>
          </a>
          <div className="nxl-navigation-toggle">
            <a href="#" onClick={(e) => { e.preventDefault(); onToggleMini?.() }}>
              <i className="feather-align-left"></i>
            </a>
          </div>
        </div>

        <div className="header-right ms-auto d-flex align-items-center">
          {/* Search */}
          <div className="nxl-h-item">
            <a
              href="#"
              className="nxl-head-link me-0"
              onClick={(e) => { e.preventDefault(); setSearchOpen((o) => !o) }}
            >
              <i className="feather-search"></i>
            </a>
            {searchOpen && (
              <div className="dropdown-menu dropdown-menu-end nxl-h-dropdown show" style={{ display: 'block', width: 300 }}>
                <div className="input-group search-form px-3 py-2">
                  <span className="input-group-text border-0 bg-transparent">
                    <i className="feather-search"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-0 bg-transparent"
                    placeholder="Buscar..."
                    autoFocus
                  />
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setSearchOpen(false)}
                  ></button>
                </div>
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="dropdown nxl-h-item" ref={notifRef}>
            <a
              href="#"
              className="nxl-head-link me-0"
              onClick={(e) => { e.preventDefault(); setNotifOpen((o) => !o) }}
            >
              <i className="feather-bell"></i>
              {notifications.length > 0 && (
                <span className="badge bg-danger nxl-h-badge">{notifications.length}</span>
              )}
            </a>
            {notifOpen && (
              <NotifDropdown notifications={notifications} onClose={() => setNotifOpen(false)} />
            )}
          </div>

          {/* User menu */}
          <div className="dropdown nxl-h-item" ref={userRef}>
            <a
              href="#"
              className="d-flex align-items-center gap-2"
              onClick={(e) => { e.preventDefault(); setUserOpen((o) => !o) }}
            >
              {user.avatar
                ? <img src={user.avatar} alt="" className="rounded-circle" style={{ width: 36, height: 36, objectFit: 'cover' }} />
                : <div className="avatar-text avatar-md">{(user.name || 'U')[0]}</div>
              }
              <span className="d-none d-md-block fs-13 fw-semibold">{user.name}</span>
              <i className="feather-chevron-down d-none d-md-block fs-12"></i>
            </a>
            {userOpen && (
              <UserDropdown user={user} onClose={() => setUserOpen(false)} />
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
