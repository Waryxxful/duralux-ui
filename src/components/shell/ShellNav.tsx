import React, { useEffect, useId, useState } from 'react';
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
function hasActiveItem(item: ShellNavItem): boolean {
  return Boolean(item.active || item.children?.some(hasActiveItem));
}

function navItemIdentifier(item: ShellNavItem): string {
  return `${item.href ?? 'group'}:${item.label}`;
}

function navSectionIdentifier(section: ShellNavSection): string {
  if (section.caption) return `caption:${section.caption}`;
  return `section:${section.items.map(navItemIdentifier).sort().join('|')}`;
}

function NavItemRow({
  item,
  onNavigate,
}: {
  item: ShellNavItem;
  onNavigate: (href: string, e: React.MouseEvent) => void;
}) {
  const submenuId = useId();
  const active = hasActiveItem(item);
  const [open, setOpen] = useState(active);

  useEffect(() => {
    if (active) setOpen(true);
  }, [active]);

  if (item.children && item.children.length > 0) {
    return (
      <li className={`nxl-item nxl-hasmenu${active ? ' active' : ''}${open ? ' nxl-trigger' : ''}`}>
        <button
          type="button"
          className="nxl-link gcu-nav-group"
          aria-label={item.label}
          aria-expanded={open}
          aria-controls={submenuId}
          onClick={() => setOpen((value) => !value)}
        >
          <span className="nxl-micon">
            <Icon name={item.icon} />
          </span>
          <span className="nxl-mtext">{item.label}</span>
          <span className="nxl-arrow">
            <Icon name="chevron-right" />
          </span>
        </button>
        {open && (
          <ul id={submenuId} className="nxl-submenu">
            {item.children.map((child) => (
              <NavItemRow key={navItemIdentifier(child)} item={child} onNavigate={onNavigate} />
            ))}
          </ul>
        )}
      </li>
    );
  }

  if (!item.href) {
    return (
      <li className="nxl-item disabled">
        <span className="nxl-link" aria-disabled="true">
          <span className="nxl-micon">
            <Icon name={item.icon} />
          </span>
          <span className="nxl-mtext">{item.label}</span>
        </span>
      </li>
    );
  }

  return (
    <li className={`nxl-item${item.active ? ' active' : ''}`}>
      <a
        href={item.href}
        onClick={(e) => onNavigate(item.href!, e)}
        className={`nxl-link${item.active ? ' active' : ''}`}
        aria-label={item.label}
        aria-current={item.active ? 'page' : undefined}
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
            {sections.map((section) => (
              <React.Fragment key={navSectionIdentifier(section)}>
                {section.caption && (
                  <li className="nxl-item nxl-caption">
                    <label>{section.caption}</label>
                  </li>
                )}
                {section.items.map((item) => (
                  <NavItemRow key={navItemIdentifier(item)} item={item} onNavigate={onNavigate} />
                ))}
              </React.Fragment>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}
