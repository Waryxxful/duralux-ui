import { Fragment, useEffect, useState } from 'react';
import type { AppManifestEntry } from '../../contract';
import { Icon } from '../ui/Icon';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';

// El template original abre TODOS los dropdowns del header con hover (además de
// click), vía un listener en DOMContentLoaded que en el shell nunca dispara sobre
// nada real (el header recién existe después del fetch de sesión). Se porta el
// mismo comportamiento como efecto de React. Solo el nivel superior (.nxl-h-item):
// las categorías anidadas del mega-menu ya manejan su propio hover con estado React.
function useHeaderDropdownHover() {
  useEffect(() => {
    if (window.innerWidth <= 992) return;
    const items = document.querySelectorAll<HTMLElement>('.nxl-header .header-wrapper .dropdown.nxl-h-item');
    const cleanups: Array<() => void> = [];
    items.forEach((item) => {
      const trigger = item.querySelector<HTMLElement>('a[data-bs-toggle]');
      const menu = trigger?.nextElementSibling as HTMLElement | null;
      if (!trigger || !menu) return;
      const onEnter = () => { trigger.classList.add('show'); menu.classList.add('show'); };
      const onLeave = () => { trigger.classList.remove('show'); menu.classList.remove('show'); };
      item.addEventListener('mouseenter', onEnter);
      item.addEventListener('mouseleave', onLeave);
      cleanups.push(() => {
        item.removeEventListener('mouseenter', onEnter);
        item.removeEventListener('mouseleave', onLeave);
      });
    });
    return () => cleanups.forEach((fn) => fn());
  }, []);
}

// ─── Sub-components (ported from shell/src/Layout.tsx) ───────────────────────

function AppStatusBadge({ estado }: { estado: AppManifestEntry['estado'] }) {
  if (estado === 'montaje') return <Badge variant="warning" className="text-dark ms-auto fs-10">Montaje</Badge>;
  if (estado === 'caido') return <Badge variant="danger" className="ms-auto fs-10">Caído</Badge>;
  return null;
}

function AppMenuItem({
  app,
  appHref,
  onSelect,
}: {
  app: AppManifestEntry;
  appHref: (app: AppManifestEntry) => string;
  onSelect: (e: React.MouseEvent, app: AppManifestEntry) => void;
}) {
  const external = app.modo === 'external_link';
  return (
    <a
      href={appHref(app)}
      className="dropdown-item"
      onClick={(e) => onSelect(e, app)}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
    >
      <i className="wd-5 ht-5 bg-gray-500 rounded-circle me-3"></i>
      <span>{app.nombre}</span>
      <AppStatusBadge estado={app.estado} />
    </a>
  );
}

function AppCategoryMenu({
  category,
  apps,
  appHref,
  onSelect,
}: {
  category: string;
  apps: AppManifestEntry[];
  appHref: (app: AppManifestEntry) => string;
  onSelect: (e: React.MouseEvent, app: AppManifestEntry) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="dropdown nxl-level-menu"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <a
        href="#"
        className={`dropdown-item ${open ? 'show' : ''}`}
        aria-expanded={open}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(value => !value);
        }}
      >
        <span className="hstack">
          <Icon name="grid" className="me-2" />
          <span>{category}</span>
        </span>
        <Icon name="chevron-right" className="ms-auto me-0" />
      </a>
      <div className={`dropdown-menu nxl-h-dropdown ${open ? 'show' : ''}`}>
        {apps.map(app => (
          <AppMenuItem key={app.id} app={app} appHref={appHref} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}

// ─── ShellHeader Props ────────────────────────────────────────────────────────

export interface ShellHeaderProps {
  nombre: string;
  email: string;
  rol: string;
  viewAsSa: boolean;
  cuentaNombre: string | null;
  cuentas: { slug: string; nombre: string }[];
  apps: AppManifestEntry[];
  dark: boolean;
  mini: boolean;
  onToggleDark: () => void;
  onToggleMini: () => void;
  onToggleMobileNav: () => void;
  onOpenApp: (e: React.MouseEvent, app: AppManifestEntry) => void;
  onSelectCuenta: (slug: string) => void;
  onVolverSa: () => void;
  appHref: (app: AppManifestEntry) => string;
  csrfToken: string;
  notifications?: unknown[];
}

// ─── ShellHeader Component ────────────────────────────────────────────────────

export function ShellHeader({
  nombre,
  email,
  rol,
  viewAsSa,
  cuentaNombre,
  cuentas,
  apps,
  dark,
  mini,
  onToggleDark,
  onToggleMini,
  onToggleMobileNav,
  onOpenApp,
  onSelectCuenta,
  onVolverSa,
  appHref,
  csrfToken,
  notifications = [],
}: ShellHeaderProps) {
  useHeaderDropdownHover();

  // Group apps by category
  const appsByCategory = apps.reduce<Map<string, AppManifestEntry[]>>((groups, app) => {
    const category = app.categoria?.trim() || 'Otros';
    const categoryApps = groups.get(category) ?? [];
    categoryApps.push(app);
    groups.set(category, categoryApps);
    return groups;
  }, new Map());

  // Controlled search state (fixes the bug where search didn't filter)
  const [search, setSearch] = useState('');
  const filteredApps = search
    ? apps.filter(app => app.nombre.toLowerCase().includes(search.toLowerCase()))
    : apps;

  return (
    <header className="nxl-header">
      <div className="header-wrapper">

        {/* ── LEFT ─────────────────────────────────────────────────────── */}
        <div className="header-left d-flex align-items-center gap-4">

          {/* Mobile hamburger (Duralux nxl-head-mobile-toggler) */}
          <a
            href="javascript:void(0);"
            className="nxl-head-mobile-toggler"
            id="mobile-collapse"
            onClick={(e) => { e.preventDefault(); onToggleMobileNav(); }}
            aria-label="Abrir navegación móvil"
          >
            <div className="hamburger hamburger--arrowturn">
              <div className="hamburger-box">
                <div className="hamburger-inner"></div>
              </div>
            </div>
          </a>

          {/* Sidebar toggle: dos anchors (mini/expand), visibilidad ligada a `mini`
              — en el template original esto lo hacía jQuery a mano; acá es el estado. */}
          <div className="nxl-navigation-toggle">
            <a
              href="javascript:void(0);"
              id="menu-mini-button"
              onClick={(e) => { e.preventDefault(); onToggleMini(); }}
              aria-label="Colapsar menú"
              style={{ display: mini ? 'none' : undefined }}
            >
              <Icon name="align-left" />
            </a>
            <a
              href="javascript:void(0);"
              id="menu-expend-button"
              onClick={(e) => { e.preventDefault(); onToggleMini(); }}
              aria-label="Expandir menú"
              style={{ display: mini ? undefined : 'none' }}
            >
              <Icon name="arrow-right" />
            </a>
          </div>

          {/* Mega-menu dropdown with MÓDULOS button */}
          <div className="nxl-drp-link nxl-lavel-mega-menu">
            <div className="nxl-lavel-mega-menu-wrapper d-flex gap-3">
              <div className="dropdown nxl-h-item nxl-lavel-menu">
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="btn bg-white border px-3 py-2 fw-semibold fs-12 text-dark d-flex align-items-center gap-2"
                  data-bs-toggle="dropdown"
                  data-bs-auto-close="outside"
                >
                  <Icon name="grid" className="text-primary" />
                  MÓDULOS
                  <Icon name="chevron-down" />
                </a>
                <div className="dropdown-menu nxl-h-dropdown">
                  {[...appsByCategory.entries()].map(([category, categoryApps], index) => (
                    <Fragment key={category}>
                      <AppCategoryMenu
                        category={category}
                        apps={categoryApps}
                        appHref={appHref}
                        onSelect={onOpenApp}
                      />
                      {index < appsByCategory.size - 1 && <div className="dropdown-divider"></div>}
                    </Fragment>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SA client selector */}
          {(rol === 'admin_ti' || viewAsSa) && (
            <div className="dropdown nxl-h-item">
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className={`btn border px-3 py-2 fw-semibold fs-12 d-flex align-items-center gap-2 ${
                  viewAsSa ? 'text-warning border-warning bg-warning-subtle' : 'text-dark bg-white'
                }`}
                data-bs-toggle="dropdown"
                data-bs-auto-close="outside"
              >
                <Icon name="eye" />
                {viewAsSa ? cuentaNombre : 'Elegir cliente'}
                <Icon name="chevron-down" />
              </a>
              <div className="dropdown-menu nxl-h-dropdown" style={{ minWidth: 220 }}>
                {viewAsSa && (
                  <div className="px-3 py-2 border-bottom">
                    <p className="fs-11 text-muted mb-0">Viendo como admin de</p>
                    <p className="fs-13 fw-bold mb-0 text-dark">{cuentaNombre}</p>
                  </div>
                )}
                <div className="px-3 pt-2 pb-1">
                  <p className="fs-11 text-muted mb-0 text-uppercase fw-semibold">Cambiar a cliente</p>
                </div>
                {cuentas.length === 0 && (
                  <p className="fs-12 text-muted px-3 py-2 mb-0">Sin clientes activos</p>
                )}
                {cuentas.map(c => (
                  <a
                    key={c.slug}
                    href="#"
                    onClick={(e) => { e.preventDefault(); onSelectCuenta(c.slug); }}
                    className={`dropdown-item d-flex align-items-center gap-2 py-2 ${
                      cuentaNombre === c.nombre ? 'fw-bold text-warning' : ''
                    }`}
                  >
                    <Icon name="database" size="sm" className="text-muted" />
                    <span className="fs-13">{c.nombre}</span>
                    {cuentaNombre === c.nombre && (
                      <Icon name="check" size="sm" className="ms-auto text-warning" />
                    )}
                  </a>
                ))}
                {viewAsSa && (
                  <>
                    <div className="dropdown-divider my-1"></div>
                    <a
                      href="#"
                      onClick={(e) => { e.preventDefault(); onVolverSa(); }}
                      className="dropdown-item d-flex align-items-center gap-2 py-2 text-secondary"
                    >
                      <Icon name="shield" size={14} />
                      <span className="fs-13">Volver al Panel SA</span>
                    </a>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT ────────────────────────────────────────────────────── */}
        <div className="header-right ms-auto">
          <div className="d-flex align-items-center">

            {/* Search — controlled input that actually filters */}
            <div className="dropdown nxl-h-item nxl-header-search">
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="nxl-head-link me-0"
                data-bs-toggle="dropdown"
                data-bs-auto-close="outside"
                aria-label="Buscar módulo"
              >
                <Icon name="search" />
              </a>
              <div className="dropdown-menu dropdown-menu-end nxl-h-dropdown nxl-search-dropdown">
                <div className="input-group search-form">
                  <span className="input-group-text">
                    <Icon name="search" size="sm" className="text-muted" />
                  </span>
                  <input
                    type="text"
                    className="form-control search-input-field"
                    placeholder="Buscar módulo..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="dropdown-divider mt-0"></div>
                <div className="searching-for px-4 py-2">
                  <p className="fs-11 fw-medium text-muted mb-2">Módulos disponibles</p>
                  <div className="d-flex flex-wrap gap-1">
                    {filteredApps.map(app => (
                      <a
                        key={app.id}
                        href={appHref(app)}
                        onClick={(e) => onOpenApp(e, app)}
                        className="flex-fill border rounded py-1 px-2 text-center fs-11 fw-semibold"
                      >
                        {app.nombre}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Dark mode toggle — Duralux .dark-button/.light-button pattern */}
            <div className="nxl-h-item dark-light-theme">
              {!dark && (
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); onToggleDark(); }}
                  className="nxl-head-link me-0 dark-button"
                  aria-label="Activar modo oscuro"
                >
                  <Icon name="moon" />
                </a>
              )}
              {dark && (
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); onToggleDark(); }}
                  className="nxl-head-link me-0 light-button"
                  aria-label="Activar modo claro"
                >
                  <Icon name="sun" />
                </a>
              )}
            </div>

            {/* Notifications — no hardcoded badge; empty state when no notifications */}
            <div className="dropdown nxl-h-item">
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="nxl-head-link me-0"
                data-bs-toggle="dropdown"
                role="button"
                data-bs-auto-close="outside"
                aria-label="Notificaciones"
              >
                <Icon name="bell" />
                {notifications.length > 0 && (
                  <Badge variant="danger" className="nxl-h-badge">{notifications.length}</Badge>
                )}
              </a>
              <div className="dropdown-menu dropdown-menu-end nxl-h-dropdown nxl-notifications-menu">
                <div className="d-flex justify-content-between align-items-center notifications-head">
                  <h6 className="fw-bold text-dark mb-0">Notificaciones</h6>
                  {notifications.length > 0 && (
                    <a href="#" onClick={(e) => e.preventDefault()} className="fs-11 text-success text-end ms-auto">
                      <Icon name="check" />
                      <span> Marcar como leído</span>
                    </a>
                  )}
                </div>
                {notifications.length === 0 ? (
                  <div className="notifications-item">
                    <Avatar name="I" variant="primary" size="md" className="me-3" style={{ borderRadius: '50%' }} />
                    <div className="notifications-desc">
                      <a href="#" onClick={(e) => e.preventDefault()} className="font-body text-truncate-2-line">
                        Sin notificaciones nuevas.
                      </a>
                    </div>
                  </div>
                ) : (
                  notifications.map((_, i) => (
                    <div key={i} className="notifications-item">
                      <Avatar name="N" variant="primary" size="md" className="me-3" style={{ borderRadius: '50%' }} />
                      <div className="notifications-desc">
                        <a href="#" onClick={(e) => e.preventDefault()} className="font-body text-truncate-2-line">
                          Notificación
                        </a>
                      </div>
                    </div>
                  ))
                )}
                <div className="text-center notifications-footer">
                  <a href="#" onClick={(e) => e.preventDefault()} className="fs-13 fw-semibold text-dark">
                    Ver todas las notificaciones
                  </a>
                </div>
              </div>
            </div>

            {/* User + logout */}
            <div className="dropdown nxl-h-item ms-2">
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="d-flex align-items-center gap-2 nxl-head-link me-0"
                data-bs-toggle="dropdown"
                role="button"
                data-bs-auto-close="outside"
                aria-label="Menú de usuario"
              >
                <Avatar name={nombre} size="md" variant="primary" />
              </a>
              <div className="dropdown-menu dropdown-menu-end nxl-h-dropdown nxl-user-dropdown">
                <div className="dropdown-header border-bottom pb-3 mb-1">
                  <div className="d-flex align-items-center gap-3">
                    <Avatar name={nombre} size="lg" variant="primary" />
                    <div style={{ minWidth: 0 }}>
                      <h6 className="text-dark mb-0 fs-13 fw-bold text-truncate">{nombre}</h6>
                      <span className="fs-11 text-muted text-truncate d-block">{email}</span>
                    </div>
                  </div>
                </div>
                <div className="dropdown-divider my-1"></div>
                <form method="post" action="/logout/">
                  <input type="hidden" name="csrfmiddlewaretoken" value={csrfToken} />
                  <button type="submit" className="dropdown-item d-flex align-items-center gap-2 py-2 text-danger">
                    <Icon name="log-out" size={14} />
                    <span className="fs-13">Cerrar sesión</span>
                  </button>
                </form>
              </div>
            </div>

          </div>
        </div>

      </div>
    </header>
  );
}
