import { useEffect, useRef, useState } from 'react'
import { Dropdown, DropdownMenu } from '../ui/Dropdown'
import { isFiniteNumber, isFunction, isString } from '../../utils/typeGuards'

function listIdentity(value, fallback) {
  const tag = isString(value) ? 'string' : isFiniteNumber(value) ? 'number' : 'fallback'
  return isString(value) || isFiniteNumber(value)
    ? `${tag}:${String(value)}`
    : fallback
}

function withUniqueKeys(items, prefix, getIdentity) {
  const occurrences = new Map()
  return items.map((item) => {
    const identity = listIdentity(getIdentity(item), prefix)
    const occurrence = (occurrences.get(identity) ?? 0) + 1
    occurrences.set(identity, occurrence)
    return { item, key: `${identity}~${occurrence}` }
  })
}

function NotificationItem({ notification, onNotificationClick, focusable = true }) {
  const itemCallback = isFunction(notification.onClick)
    ? notification.onClick
    : onNotificationClick
  const content = (
    <div className="d-flex align-items-center gap-3">
      <div className={`avatar-text avatar-md bg-soft-${notification.color || 'primary'} text-${notification.color || 'primary'}`}>
        <i className={notification.icon || 'feather-bell'} aria-hidden="true"></i>
      </div>
      <div>
        <div className="fs-13 fw-semibold">{notification.title}</div>
        <div className="fs-12 text-muted">{notification.time}</div>
      </div>
    </div>
  )

  if (notification.href && notification.href !== '#') {
    return (
      <a
        href={notification.href}
        className="dropdown-item py-3"
        tabIndex={focusable ? undefined : -1}
        onClick={itemCallback ? (event) => itemCallback(event, notification) : undefined}
      >
        {content}
      </a>
    )
  }

  if (itemCallback) {
    return (
      <button
        type="button"
        className="dropdown-item py-3"
        tabIndex={focusable ? undefined : -1}
        onClick={(event) => itemCallback(event, notification)}
      >
        {content}
      </button>
    )
  }

  return <div className="dropdown-item py-3">{content}</div>
}

function NotifDropdown({ notifications, onMarkAllRead, onNotificationClick, open }) {
  const entries = withUniqueKeys(
    notifications,
    'notification',
    notification => notification?.id ?? notification?.href ?? notification?.title,
  )

  return (
    <DropdownMenu className="nxl-h-dropdown" inert={open ? undefined : ''}>
      <div className="d-flex align-items-center justify-content-between px-4 ht-60 border-bottom">
        <h6 className="mb-0">Notificaciones</h6>
        {notifications.length > 0 && onMarkAllRead && (
          <button
            type="button"
            className="fs-12 text-muted gcu-link-button"
            tabIndex={open ? undefined : -1}
            onClick={onMarkAllRead}
          >
            Marcar todas como leídas
          </button>
        )}
      </div>
      <div style={{ maxHeight: 300, overflowY: 'auto' }}>
        {notifications.length === 0 && (
          <p className="text-center text-muted py-4 mb-0 fs-12">Sin notificaciones</p>
        )}
        {entries.map(({ item: notification, key }) => (
          <NotificationItem
            key={key}
            notification={notification}
            onNotificationClick={onNotificationClick}
            focusable={open}
          />
        ))}
      </div>
    </DropdownMenu>
  )
}

function UserDropdown({ user, open }) {
  const entries = withUniqueKeys(
    user.menuItems || [],
    'user-menu-item',
    item => item?.key ?? item?.href ?? item?.label ?? item?.icon,
  )

  return (
    <DropdownMenu className="nxl-h-dropdown" style={{ minWidth: 200 }} inert={open ? undefined : ''}>
      <div className="d-flex align-items-center gap-3 px-3 py-3 border-bottom">
        {user.avatar
          ? <img src={user.avatar} alt="" className="rounded-circle" style={{ width: 40, height: 40, objectFit: 'cover' }} />
          : <div className="avatar-text avatar-md" aria-hidden="true">{(user.name || 'U')[0]}</div>
        }
        <div>
          <div className="fw-semibold fs-13">{user.name}</div>
          <div className="fs-12 text-muted">{user.email}</div>
        </div>
      </div>
      {entries.map(({ item, key }) => {
        if (item.divider) return <div key={`divider-${key}`} className="dropdown-divider"></div>

        const content = (
          <>
            {item.icon && <i className={`${item.icon} me-2`} aria-hidden="true"></i>}
            {item.label}
          </>
        )

        if (item.href && item.href !== '#') {
          return <a key={key} href={item.href} className="dropdown-item" tabIndex={open ? undefined : -1} onClick={item.onClick}>{content}</a>
        }

        if (isFunction(item.onClick)) {
          return <button key={key} type="button" className="dropdown-item" tabIndex={open ? undefined : -1} onClick={item.onClick}>{content}</button>
        }

        return <div key={key} className="dropdown-item">{content}</div>
      })}
    </DropdownMenu>
  )
}

export function Header({
  user = {},
  notifications = [],
  onToggleMini,
  mini = false,
  onToggleMobile,
  mobileOpen = false,
  mobileNavId = 'duralux-sidebar',
  onMarkAllRead,
  onNotificationClick,
  // Standalone Header historically restored focus whenever a controlled mobile
  // close arrived. AppLayout supplies a reason so navigation/route changes do
  // not steal focus from the activating link or programmatic control.
  mobileCloseReason = 'dismiss',
}) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const mobileTriggerRef = useRef(null)
  const searchTriggerRef = useRef(null)
  const searchInputRef = useRef(null)
  const wasMobileOpen = useRef(mobileOpen)

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus()
  }, [searchOpen])

  useEffect(() => {
    const dismissive = mobileCloseReason === 'dismiss'
      || mobileCloseReason === 'escape'
      || mobileCloseReason === 'overlay'
      || mobileCloseReason === 'toggle'
    if (wasMobileOpen.current && !mobileOpen && dismissive) mobileTriggerRef.current?.focus()
    wasMobileOpen.current = mobileOpen
  }, [mobileCloseReason, mobileOpen])

  return (
    <header className="nxl-header">
      <div className="header-wrapper">
        <div className="header-left d-flex align-items-center gap-4">
          {isFunction(onToggleMobile) && (
            <button
              ref={mobileTriggerRef}
              type="button"
              className={`nxl-head-mobile-toggler gcu-header-icon-button${mobileOpen ? ' is-active' : ''}`}
              onClick={onToggleMobile}
              aria-label={mobileOpen ? 'Cerrar navegación móvil' : 'Abrir navegación móvil'}
              aria-expanded={mobileOpen}
              aria-controls={mobileNavId}
            >
              <div className={`hamburger hamburger--arrowturn${mobileOpen ? ' is-active' : ''}`}>
                <div className="hamburger-box">
                  <div className="hamburger-inner"></div>
                </div>
              </div>
            </button>
          )}

          <div className="nxl-navigation-toggle">
            {isFunction(onToggleMini) && (
              <button
                type="button"
                id="menu-mini-button"
                className="gcu-header-icon-button"
                onClick={onToggleMini}
                aria-label={mini ? 'Expandir menú' : 'Colapsar menú'}
                aria-pressed={mini}
                aria-expanded={!mini}
                aria-controls={mobileNavId}
              >
                <i className={mini ? 'feather-arrow-right' : 'feather-align-left'} aria-hidden="true"></i>
              </button>
            )}
          </div>
        </div>

        <div className="header-right ms-auto d-flex align-items-center">
          <Dropdown
            align="end"
            className="dropdown nxl-h-item nxl-header-search"
            open={searchOpen}
            onOpenChange={setSearchOpen}
            trigger={(triggerProps, { open }) => (
              <button
                {...triggerProps}
                ref={(node) => {
                  triggerProps.ref(node)
                  searchTriggerRef.current = node
                }}
                type="button"
                className={`nxl-head-link me-0 gcu-header-icon-button${open ? ' is-active' : ''}`}
                aria-label="Buscar"
                aria-expanded={open}
              >
                <i className="feather-search" aria-hidden="true"></i>
              </button>
            )}
          >
            <DropdownMenu className="nxl-h-dropdown" closeOnSelect={false} inert={searchOpen ? undefined : ''}>
              <div className="input-group search-form px-3 py-2">
                <span className="input-group-text border-0 bg-transparent">
                  <i className="feather-search" aria-hidden="true"></i>
                </span>
                <input
                  ref={searchInputRef}
                  type="search"
                  name="header-search"
                  className="form-control border-0 bg-transparent"
                  placeholder="Buscar..."
                  aria-label="Buscar"
                  tabIndex={searchOpen ? undefined : -1}
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Cerrar búsqueda"
                  tabIndex={searchOpen ? undefined : -1}
                  onClick={() => {
                    setSearchOpen(false)
                    searchTriggerRef.current?.focus()
                  }}
                ></button>
              </div>
            </DropdownMenu>
          </Dropdown>

          <Dropdown
            align="end"
            className="dropdown nxl-h-item"
            open={notificationsOpen}
            onOpenChange={setNotificationsOpen}
            trigger={(triggerProps, { open }) => (
              <button
                {...triggerProps}
                type="button"
                className={`nxl-head-link me-0 gcu-header-icon-button${open ? ' is-active' : ''}`}
                aria-label={`Notificaciones${notifications.length ? `, ${notifications.length} disponibles` : ''}`}
                aria-expanded={open}
              >
                <i className="feather-bell" aria-hidden="true"></i>
                {notifications.length > 0 && <span className="badge bg-danger nxl-h-badge">{notifications.length}</span>}
              </button>
            )}
          >
            <NotifDropdown
              notifications={notifications}
              onMarkAllRead={onMarkAllRead}
              onNotificationClick={onNotificationClick}
              open={notificationsOpen}
            />
          </Dropdown>

          <Dropdown
            align="end"
            className="dropdown nxl-h-item"
            open={userOpen}
            onOpenChange={setUserOpen}
            trigger={(triggerProps, { open }) => (
              <button
                {...triggerProps}
                type="button"
                className={`d-flex align-items-center gap-2 gcu-header-icon-button${open ? ' is-active' : ''}`}
                aria-label="Menú de usuario"
                aria-expanded={open}
              >
                {user.avatar
                  ? <img src={user.avatar} alt="" className="rounded-circle" style={{ width: 36, height: 36, objectFit: 'cover' }} />
                  : <div className="avatar-text avatar-md" aria-hidden="true">{(user.name || 'U')[0]}</div>
                }
                <span className="d-none d-md-block fs-13 fw-semibold">{user.name}</span>
                <i className="feather-chevron-down d-none d-md-block fs-12" aria-hidden="true"></i>
              </button>
            )}
          >
            <UserDropdown user={user} open={userOpen} />
          </Dropdown>
        </div>
      </div>
    </header>
  )
}
