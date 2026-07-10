import React, { useState } from 'react';
import { Icon } from '../ui/Icon';

// ─── ShellNav Props ───────────────────────────────────────────────────────────

export interface ShellNavBrand {
  href: string;
  logoLg: string;
  logoSm: string;
  alt: string;
}

// Item de nav. `href`/`active` son para items hoja; `children` lo convierte en
// un submenú colapsable (patrón Duralux nxl-hasmenu/nxl-submenu). `active` en
// un item con `children` marca el grupo como activo (algún hijo es la ruta actual).
export interface ShellNavItem {
  label: string;
  icon: string;
  href?: string;
  active?: boolean;
  children?: ShellNavItem[];
}

export interface ShellNavSection {
  caption?: string;
  items: ShellNavItem[];
}

export interface ShellNavProps {
  brand: ShellNavBrand;
  sections: ShellNavSection[];
  onNavigate: (href: string, e: React.MouseEvent) => void;
  /** En móvil desliza el sidebar: clase Duralux .mob-navigation-active sobre el <nav>. */
  mobileOpen?: boolean;
}

// ─── ShellNav Component ───────────────────────────────────────────────────────

// Item de nav: hoja (href) o grupo colapsable (children). Mismo patrón que
// @duralux/ui Sidebar (nxl-hasmenu/nxl-submenu/nxl-arrow, clase nxl-trigger
// mientras está abierto, active en el <li> para el fondo "pill" de Duralux).
function NavItemRow({
  item,
  onNavigate,
}: {
  item: ShellNavItem;
  onNavigate: (href: string, e: React.MouseEvent) => void;
}) {
  const [open, setOpen] = useState(false);

  if (item.children && item.children.length > 0) {
    return (
      <li className={`nxl-item nxl-hasmenu${item.active ? ' active' : ''}${open ? ' nxl-trigger' : ''}`}>
        <a href="#" className="nxl-link" onClick={(e) => { e.preventDefault(); setOpen((o) => !o); }}>
          <span className="nxl-micon">
            <Icon name={item.icon} />
          </span>
          <span className="nxl-mtext">{item.label}</span>
          <span className="nxl-arrow">
            <Icon name="chevron-right" />
          </span>
        </a>
        {open && (
          <ul className="nxl-submenu">
            {item.children.map((child, i) => (
              <NavItemRow key={i} item={child} onNavigate={onNavigate} />
            ))}
          </ul>
        )}
      </li>
    );
  }

  return (
    <li className={`nxl-item${item.active ? ' active' : ''}`}>
      <a
        href={item.href}
        onClick={(e) => onNavigate(item.href ?? '#', e)}
        className={`nxl-link${item.active ? ' active' : ''}`}
      >
        <span className="nxl-micon">
          <Icon name={item.icon} />
        </span>
        <span className="nxl-mtext">{item.label}</span>
      </a>
    </li>
  );
}

export function ShellNav({ brand, sections, onNavigate, mobileOpen = false }: ShellNavProps) {
  return (
    <nav className={`nxl-navigation${mobileOpen ? ' mob-navigation-active' : ''}`}>
      <div className="navbar-wrapper">
        <div className="m-header">
          <a
            href={brand.href}
            className="b-brand"
            onClick={(e) => onNavigate(brand.href, e)}
          >
            <img
              src={brand.logoLg}
              alt={brand.alt}
              className="logo logo-lg"
              style={{ height: 40, width: 'auto', objectFit: 'contain' }}
            />
            <img
              src={brand.logoSm}
              alt={brand.alt}
              className="logo logo-sm"
              style={{ height: 36, width: 'auto', objectFit: 'contain' }}
            />
          </a>
        </div>
        <div className="navbar-content">
          <ul className="nxl-navbar">
            {sections.map((section, sIdx) => (
              <React.Fragment key={sIdx}>
                {section.caption && (
                  <li className="nxl-item nxl-caption">
                    <label>{section.caption}</label>
                  </li>
                )}
                {section.items.map((item, iIdx) => (
                  <NavItemRow key={iIdx} item={item} onNavigate={onNavigate} />
                ))}
              </React.Fragment>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}
