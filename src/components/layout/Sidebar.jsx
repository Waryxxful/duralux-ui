import { useEffect, useState } from 'react'
import { matchPath, NavLink, useLocation } from 'react-router-dom'

function navItemIdentifier(item) {
  return String(item.key ?? item.id ?? item.to ?? item.href ?? item.label ?? item.type ?? 'item')
}

function assignInternalKeys(items, parentKey = '') {
  const occurrences = new Map()

  return items.map((item) => {
    const base = navItemIdentifier(item)
    const occurrence = (occurrences.get(base) || 0) + 1
    occurrences.set(base, occurrence)

    const suffix = occurrence > 1 ? `#${occurrence}` : ''
    const segment = `${base.length}:${base}${suffix}`
    const internalKey = parentKey ? `${parentKey}/${segment}` : segment

    return {
      ...item,
      _key: internalKey,
      children: item.children ? assignInternalKeys(item.children, internalKey) : item.children,
    }
  })
}

function routeEnds(item) {
  return item.end ?? (item.to === '/')
}

function routeMatches(item, pathname) {
  return Boolean(
    item.to && matchPath({ path: item.to, end: routeEnds(item) }, pathname),
  )
}

function activeRouteSpecificity(item, pathname) {
  let specificity = routeMatches(item, pathname) ? item.to.length : -1

  for (const child of item.children || []) {
    specificity = Math.max(specificity, activeRouteSpecificity(child, pathname))
  }

  return specificity
}

function hasActiveItem(item, pathname) {
  return activeRouteSpecificity(item, pathname) >= 0
}

// Duralux pinta el fondo "pill" del item activo vía `.nxl-item.active > .nxl-link`
// (ver theme.min.css) — la clase `active` tiene que ir en el <li>, no solo en el <a>.
function NavItem({ item, pathname, openKey, setOpenKey, onNavigate }) {
  const active = hasActiveItem(item, pathname)
  const isOpen = openKey === item._key

  if (item.type === 'caption') {
    return (
      <li className="nxl-item nxl-caption">
        <label>{item.label}</label>
      </li>
    )
  }

  if (item.children?.length) {
    return (
      <li className={`nxl-item nxl-hasmenu${active ? ' active' : ''}${isOpen ? ' nxl-trigger' : ''}`}>
        <a
          href="#"
          className="nxl-link"
          onClick={(e) => {
            e.preventDefault()
            setOpenKey(isOpen ? null : item._key)
          }}
        >
          {item.icon && <span className="nxl-micon"><i className={item.icon}></i></span>}
          <span className="nxl-mtext">{item.label}</span>
          <span className="nxl-arrow"><i className="feather-chevron-right"></i></span>
        </a>
        {isOpen && (
          <ul className="nxl-submenu">
            {item.children.map((child) => (
              <SubNavItem
                key={child._key}
                item={child}
                pathname={pathname}
                onNavigate={onNavigate}
              />
            ))}
          </ul>
        )}
      </li>
    )
  }

  if (item.to) {
    return (
      <li className={`nxl-item${active ? ' active' : ''}`}>
        <NavLink
          to={item.to}
          className={`nxl-link${active ? ' active' : ''}`}
          end={routeEnds(item)}
          onClick={onNavigate}
        >
          {item.icon && <span className="nxl-micon"><i className={item.icon}></i></span>}
          <span className="nxl-mtext">{item.label}</span>
        </NavLink>
      </li>
    )
  }

  return (
    <li className="nxl-item">
      <a className="nxl-link" href={item.href || '#'} onClick={onNavigate}>
        {item.icon && <span className="nxl-micon"><i className={item.icon}></i></span>}
        <span className="nxl-mtext">{item.label}</span>
      </a>
    </li>
  )
}

function SubNavItem({ item, pathname, onNavigate }) {
  const active = hasActiveItem(item, pathname)
  const [open, setOpen] = useState(active)

  useEffect(() => {
    if (active) setOpen(true)
  }, [active])

  if (item.children?.length) {
    return (
      <li className={`nxl-item nxl-hasmenu${active ? ' active' : ''}${open ? ' nxl-trigger' : ''}`}>
        <a href="#" className="nxl-link" onClick={(e) => { e.preventDefault(); setOpen((o) => !o) }}>
          <span className="nxl-mtext">{item.label}</span>
          <span className="nxl-arrow"><i className="feather-chevron-right"></i></span>
        </a>
        {open && (
          <ul className="nxl-submenu">
            {item.children.map((child) => (
              <SubNavItem
                key={child._key}
                item={child}
                pathname={pathname}
                onNavigate={onNavigate}
              />
            ))}
          </ul>
        )}
      </li>
    )
  }

  if (item.to) {
    return (
      <li className={`nxl-item${active ? ' active' : ''}`}>
        <NavLink
          to={item.to}
          className={`nxl-link${active ? ' active' : ''}`}
          end={routeEnds(item)}
          onClick={onNavigate}
        >
          {item.label}
        </NavLink>
      </li>
    )
  }

  return (
    <li className="nxl-item">
      <a className="nxl-link" href={item.href || '#'} onClick={onNavigate}>
        {item.label}
      </a>
    </li>
  )
}

export function Sidebar({ navItems = [], logo, logoAbbr, promoCard, mobileOpen = false, onNavigate }) {
  const { pathname } = useLocation()
  const keyedItems = assignInternalKeys(navItems)
  let activeItem = null
  let activeSpecificity = -1

  for (const item of keyedItems) {
    const specificity = activeRouteSpecificity(item, pathname)
    if (specificity > activeSpecificity) {
      activeItem = item
      activeSpecificity = specificity
    }
  }

  const activeKey = activeItem?._key ?? null
  const [openKey, setOpenKey] = useState(activeKey)

  useEffect(() => {
    if (activeKey) setOpenKey(activeKey)
  }, [activeKey])

  return (
    <nav className={`nxl-navigation${mobileOpen ? ' mob-navigation-active' : ''}`}>
      <div className="navbar-wrapper">
        <div className="m-header">
          <a href="/" className="b-brand">
            {logo && <img src={logo} alt="Logo" className="logo logo-lg" />}
            {logoAbbr && <img src={logoAbbr} alt="" className="logo logo-sm" />}
          </a>
        </div>
        <div className="navbar-content">
          <ul className="nxl-navbar">
            {keyedItems.map((item) => (
              <NavItem
                key={item._key}
                item={item}
                pathname={pathname}
                openKey={openKey}
                setOpenKey={setOpenKey}
                onNavigate={onNavigate}
              />
            ))}
          </ul>
          {promoCard && (
            <div className="card text-center">
              <div className="card-body">{promoCard}</div>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
