import { useState } from 'react'
import { NavLink, useMatch } from 'react-router-dom'

// Duralux pinta el fondo "pill" del item activo vía `.nxl-item.active > .nxl-link`
// (ver theme.min.css) — la clase `active` tiene que ir en el <li>, no solo en el <a>.
function NavItem({ item, openKey, setOpenKey }) {
  const isOpen = openKey === item._key
  const match = useMatch({ path: item.to || '', end: item.end !== false })

  if (item.type === 'caption') {
    return (
      <li className="nxl-item nxl-caption">
        <label>{item.label}</label>
      </li>
    )
  }

  if (item.children) {
    return (
      <li className={`nxl-item nxl-hasmenu${isOpen ? ' nxl-trigger' : ''}`}>
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
            {item.children.map((child, i) => (
              <SubNavItem key={i} item={child} />
            ))}
          </ul>
        )}
      </li>
    )
  }

  if (item.to) {
    return (
      <li className={`nxl-item${match ? ' active' : ''}`}>
        <NavLink
          to={item.to}
          className={({ isActive }) => `nxl-link${isActive ? ' active' : ''}`}
          end={item.end}
        >
          {item.icon && <span className="nxl-micon"><i className={item.icon}></i></span>}
          <span className="nxl-mtext">{item.label}</span>
        </NavLink>
      </li>
    )
  }

  return (
    <li className="nxl-item">
      <a className="nxl-link" href={item.href || '#'}>
        {item.icon && <span className="nxl-micon"><i className={item.icon}></i></span>}
        <span className="nxl-mtext">{item.label}</span>
      </a>
    </li>
  )
}

function SubNavItem({ item }) {
  const [open, setOpen] = useState(false)
  const match = useMatch({ path: item.to || '', end: item.end !== false })

  if (item.children) {
    return (
      <li className={`nxl-item nxl-hasmenu${open ? ' nxl-trigger' : ''}`}>
        <a href="#" className="nxl-link" onClick={(e) => { e.preventDefault(); setOpen((o) => !o) }}>
          <span className="nxl-mtext">{item.label}</span>
          <span className="nxl-arrow"><i className="feather-chevron-right"></i></span>
        </a>
        {open && (
          <ul className="nxl-submenu">
            {item.children.map((c, i) => <SubNavItem key={i} item={c} />)}
          </ul>
        )}
      </li>
    )
  }

  if (item.to) {
    return (
      <li className={`nxl-item${match ? ' active' : ''}`}>
        <NavLink
          to={item.to}
          className={({ isActive }) => `nxl-link${isActive ? ' active' : ''}`}
        >
          {item.label}
        </NavLink>
      </li>
    )
  }

  return (
    <li className="nxl-item">
      <a className="nxl-link" href={item.href || '#'}>
        {item.label}
      </a>
    </li>
  )
}

function assignKeys(items, prefix = '') {
  return items.map((item, i) => ({
    ...item,
    _key: `${prefix}${i}`,
    children: item.children ? assignKeys(item.children, `${prefix}${i}-`) : undefined,
  }))
}

export function Sidebar({ navItems = [], logo, logoAbbr, promoCard }) {
  const [openKey, setOpenKey] = useState(null)
  const keyed = assignKeys(navItems)

  return (
    <nav className="nxl-navigation">
      <div className="navbar-wrapper">
        <div className="m-header">
          <a href="/" className="b-brand">
            {logo && <img src={logo} alt="Logo" className="logo logo-lg" />}
            {logoAbbr && <img src={logoAbbr} alt="" className="logo logo-sm" />}
          </a>
        </div>
        <div className="navbar-content">
          <ul className="nxl-navbar">
            {keyed.map((item, i) => (
              <NavItem
                key={i}
                item={item}
                openKey={openKey}
                setOpenKey={setOpenKey}
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
