import { Fragment, useEffect, useId, useRef, useState } from 'react';
import type { AppManifestEntry, Notificacion } from '../../contract';
import { Icon } from '../ui/Icon';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Dropdown, DropdownMenu } from '../ui/Dropdown';

function tiempoRelativo(iso: string): string {
  const segundos = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (segundos < 60) return 'hace un momento';
  const minutos = Math.floor(segundos / 60);
  if (minutos < 60) return `hace ${minutos} min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `hace ${horas} h`;
  return `hace ${Math.floor(horas / 24)} d`;
}

const DESKTOP_MEDIA_QUERY = '(hover: hover) and (min-width: 1024.01px)';

function useDesktopHover() {
  const [enabled, setEnabled] = useState(() => (
    typeof window !== 'undefined' && window.matchMedia(DESKTOP_MEDIA_QUERY).matches
  ));

  useEffect(() => {
    const mediaQuery = window.matchMedia(DESKTOP_MEDIA_QUERY);
    const onChange = () => setEnabled(mediaQuery.matches);
    onChange();
    mediaQuery.addEventListener('change', onChange);
    return () => mediaQuery.removeEventListener('change', onChange);
  }, []);

  return enabled;
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
  desktopHover,
}: {
  category: string;
  apps: AppManifestEntry[];
  appHref: (app: AppManifestEntry) => string;
  onSelect: (e: React.MouseEvent, app: AppManifestEntry) => void;
  desktopHover: boolean;
}) {
  const menuId = useId();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!desktopHover) setOpen(false);
  }, [desktopHover]);

  return (
    <div
      className="dropdown nxl-level-menu"
      onMouseEnter={() => {
        if (desktopHover) setOpen(true);
      }}
      onMouseLeave={() => {
        if (desktopHover) setOpen(false);
      }}
    >
      <button
        type="button"
        className={`dropdown-item d-flex align-items-center ${open ? 'show' : ''}`}
        aria-controls={menuId}
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(value => !value);
        }}
      >
        <span className="hstack">
          <Icon name="grid" className="me-2" />
          <span>{category}</span>
        </span>
        <Icon name="chevron-right" className="ms-auto me-0" />
      </button>
      <div id={menuId} className={`dropdown-menu nxl-h-dropdown ${open ? 'show' : ''}`}>
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
  notifications?: Notificacion[];
  onMarkAllRead?: () => void;
  onNotificationClick?: (e: React.MouseEvent, n: Notificacion) => void;
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
  onMarkAllRead,
  onNotificationClick,
}: ShellHeaderProps) {
  const noLeidas = notifications.filter(n => !n.leida).length;
  const modulesMenuId = useId();
  const searchMenuId = useId();
  const modulesTriggerRef = useRef<HTMLButtonElement>(null);
  const modulesMenuRef = useRef<HTMLDivElement>(null);
  const modulesBackRef = useRef<HTMLButtonElement>(null);
  const searchTriggerRef = useRef<HTMLButtonElement>(null);
  const searchMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [modulesOpen, setModulesOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const desktopHover = useDesktopHover();

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
  const notificationsApp = apps.find((app) => app.route_prefix.replace(/\/$/, '') === '/notificaciones');
  const notificationsHref = notificationsApp ? appHref(notificationsApp) : '/notificaciones';

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    if (!modulesOpen) return;
    const mediaQuery = window.matchMedia('(max-width: 1024px)');
    const moveFocusForLayout = () => {
      if (mediaQuery.matches) {
        modulesBackRef.current?.focus();
      } else if (modulesBackRef.current?.contains(document.activeElement)) {
        modulesTriggerRef.current?.focus();
      }
    };

    moveFocusForLayout();
    mediaQuery.addEventListener('change', moveFocusForLayout);
    return () => mediaQuery.removeEventListener('change', moveFocusForLayout);
  }, [modulesOpen]);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        modulesOpen
        && !modulesMenuRef.current?.contains(target)
        && !modulesTriggerRef.current?.contains(target)
      ) {
        setModulesOpen(false);
      }
      if (
        searchOpen
        && !searchMenuRef.current?.contains(target)
        && !searchTriggerRef.current?.contains(target)
      ) {
        setSearchOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (!searchOpen && !modulesOpen) return;
      event.preventDefault();
      setSearchOpen(false);
      setModulesOpen(false);
      (searchOpen ? searchTriggerRef : modulesTriggerRef).current?.focus();
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [modulesOpen, searchOpen]);

  return (
    <header className="nxl-header">
      <div className="header-wrapper">

        {/* ── LEFT ─────────────────────────────────────────────────────── */}
        <div className="header-left d-flex align-items-center gap-4">

          {/* Mobile hamburger (Duralux nxl-head-mobile-toggler) */}
          <button
            type="button"
            className="nxl-head-mobile-toggler gcu-header-icon-button"
            id="mobile-collapse"
            onClick={onToggleMobileNav}
            aria-label="Abrir navegación móvil"
          >
            <div className="hamburger hamburger--arrowturn">
              <div className="hamburger-box">
                <div className="hamburger-inner"></div>
              </div>
            </div>
          </button>

          {/* Sidebar toggle: dos controles (mini/expand), visibilidad ligada a `mini`
              — en el template original esto lo hacía jQuery a mano; acá es el estado. */}
          <div className="nxl-navigation-toggle">
            <button
              type="button"
              id="menu-mini-button"
              className="gcu-header-icon-button"
              onClick={onToggleMini}
              aria-label="Colapsar menú"
              style={{ display: mini ? 'none' : undefined }}
            >
              <Icon name="align-left" />
            </button>
            <button
              type="button"
              id="menu-expend-button"
              className="gcu-header-icon-button"
              onClick={onToggleMini}
              aria-label="Expandir menú"
              style={{ display: mini ? undefined : 'none' }}
            >
              <Icon name="arrow-right" />
            </button>
          </div>

          {/* Mega-menu dropdown with MÓDULOS button */}
          <div className="nxl-drp-link gcu-modules">
            <button
              ref={modulesTriggerRef}
              type="button"
              className="btn bg-white border px-3 py-2 fw-semibold fs-12 text-dark d-flex align-items-center gap-2 gcu-modules-trigger"
              aria-expanded={modulesOpen}
              aria-controls={modulesMenuId}
              onClick={() => {
                setSearchOpen(false);
                setModulesOpen((value) => !value);
              }}
            >
              <Icon name="grid" className="text-primary" />
              <span className="gcu-modules-trigger-label">MÓDULOS</span>
              <Icon name="chevron-down" />
            </button>
            <div
              ref={modulesMenuRef}
              id={modulesMenuId}
              className={`dropdown-menu nxl-h-dropdown gcu-modules-menu${modulesOpen ? ' show' : ''}`}
            >
              <button
                ref={modulesBackRef}
                type="button"
                className="gcu-modules-back"
                onClick={() => {
                  setModulesOpen(false);
                  modulesTriggerRef.current?.focus();
                }}
              >
                <Icon name="chevron-left" />
                <span>Volver</span>
              </button>
              <div className="gcu-modules-list">
                {[...appsByCategory.entries()].map(([category, categoryApps], index) => (
                  <Fragment key={category}>
                    <AppCategoryMenu
                      category={category}
                      apps={categoryApps}
                      appHref={appHref}
                      desktopHover={desktopHover}
                      onSelect={(e, app) => {
                        setModulesOpen(false);
                        onOpenApp(e, app);
                      }}
                    />
                    {index < appsByCategory.size - 1 && <div className="dropdown-divider"></div>}
                  </Fragment>
                ))}
                {appsByCategory.size === 0 && (
                  <p className="fs-12 text-muted px-3 py-2 mb-0">Sin módulos disponibles</p>
                )}
              </div>
            </div>
          </div>

          {/* SA client selector */}
          {(rol === 'admin_ti' || viewAsSa) && (
            <Dropdown
              className="dropdown nxl-h-item"
              desktopHover={desktopHover}
              trigger={(triggerProps, { open }) => (
                <button
                  {...triggerProps}
                  className={`btn border px-3 py-2 fw-semibold fs-12 d-flex align-items-center gap-2 ${
                    viewAsSa ? 'text-warning border-warning bg-warning-subtle' : 'text-dark bg-white'
                  }${open ? ' show' : ''}`}
                  aria-label={viewAsSa ? `Cliente actual: ${cuentaNombre}` : 'Elegir cliente'}
                >
                  <Icon name="eye" />
                  <span className="gcu-client-selector-label">{viewAsSa ? cuentaNombre : 'Elegir cliente'}</span>
                  <Icon name="chevron-down" />
                </button>
              )}
            >
              <DropdownMenu className="nxl-h-dropdown" style={{ minWidth: 220 }}>
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
                  <button
                    key={c.slug}
                    type="button"
                    onClick={() => onSelectCuenta(c.slug)}
                    className={`dropdown-item d-flex align-items-center gap-2 py-2 ${
                      cuentaNombre === c.nombre ? 'fw-bold text-warning' : ''
                    }`}
                  >
                    <Icon name="database" size="sm" className="text-muted" />
                    <span className="fs-13">{c.nombre}</span>
                    {cuentaNombre === c.nombre && (
                      <Icon name="check" size="sm" className="ms-auto text-warning" />
                    )}
                  </button>
                ))}
                {viewAsSa && (
                  <>
                    <div className="dropdown-divider my-1"></div>
                    <button
                      type="button"
                      onClick={onVolverSa}
                      className="dropdown-item d-flex align-items-center gap-2 py-2 text-secondary"
                    >
                      <Icon name="shield" size={14} />
                      <span className="fs-13">Volver al Panel SA</span>
                    </button>
                  </>
                )}
              </DropdownMenu>
            </Dropdown>
          )}
        </div>

        {/* ── RIGHT ────────────────────────────────────────────────────── */}
        <div className="header-right ms-auto">
          <div className="d-flex align-items-center">

            {/* Search — controlled input that actually filters */}
            <div className="dropdown nxl-h-item nxl-header-search">
              <button
                ref={searchTriggerRef}
                type="button"
                onClick={() => {
                  setModulesOpen(false);
                  setSearchOpen((value) => !value);
                }}
                className="nxl-head-link me-0 gcu-header-icon-button"
                aria-label="Buscar módulo"
                aria-expanded={searchOpen}
                aria-controls={searchMenuId}
              >
                <Icon name="search" />
              </button>
              <div
                ref={searchMenuRef}
                id={searchMenuId}
                className={`dropdown-menu dropdown-menu-end nxl-h-dropdown nxl-search-dropdown${searchOpen ? ' show' : ''}`}
              >
                <div className="input-group search-form">
                  <span className="input-group-text">
                    <Icon name="search" size="sm" className="text-muted" />
                  </span>
                  <input
                    ref={searchInputRef}
                    type="text"
                    name="module-search"
                    autoComplete="off"
                    className="form-control search-input-field"
                    placeholder="Buscar módulo…"
                    aria-label="Buscar módulo"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <span className="input-group-text">
                    <button
                      type="button"
                      className="gcu-search-close"
                      aria-label="Cerrar búsqueda"
                      onClick={() => {
                        setSearchOpen(false);
                        searchTriggerRef.current?.focus();
                      }}
                    >
                      <Icon name="x" />
                    </button>
                  </span>
                </div>
                <div className="dropdown-divider mt-0"></div>
                <div className="searching-for gcu-search-results px-4 py-2">
                  <p className="fs-11 fw-medium text-muted mb-2">Módulos disponibles</p>
                  <div className="d-flex flex-wrap gap-1">
                    {filteredApps.map(app => (
                      <a
                        key={app.id}
                        href={appHref(app)}
                        onClick={(e) => {
                          setSearchOpen(false);
                          onOpenApp(e, app);
                        }}
                        className="flex-fill border rounded py-1 px-2 text-center fs-11 fw-semibold"
                      >
                        {app.nombre}
                      </a>
                    ))}
                    {filteredApps.length === 0 && (
                      <p className="w-100 fs-12 text-muted text-center py-3 mb-0" role="status">
                        {search ? `Sin resultados para “${search}”` : 'Sin módulos disponibles'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Dark mode toggle — Duralux .dark-button/.light-button pattern */}
            <div className="nxl-h-item dark-light-theme">
              {!dark && (
                <button
                  type="button"
                  onClick={onToggleDark}
                  className="nxl-head-link me-0 dark-button gcu-header-icon-button"
                  aria-label="Activar modo oscuro"
                >
                  <Icon name="moon" />
                </button>
              )}
              {dark && (
                <button
                  type="button"
                  onClick={onToggleDark}
                  className="nxl-head-link me-0 light-button gcu-header-icon-button"
                  aria-label="Activar modo claro"
                >
                  <Icon name="sun" />
                </button>
              )}
            </div>

            {/* Notifications — no hardcoded badge; empty state when no notifications */}
            <Dropdown
              align="end"
              className="dropdown nxl-h-item"
              desktopHover={desktopHover}
              trigger={(triggerProps, { open }) => (
                <button
                  {...triggerProps}
                  className={`nxl-head-link me-0 gcu-header-icon-button${open ? ' show' : ''}`}
                  aria-label={`Notificaciones${noLeidas > 0 ? `, ${noLeidas} sin leer` : ''}`}
                >
                  <Icon name="bell" />
                  {noLeidas > 0 && (
                    <Badge variant="danger" className="nxl-h-badge">{noLeidas > 99 ? '99+' : noLeidas}</Badge>
                  )}
                </button>
              )}
            >
              <DropdownMenu className="nxl-h-dropdown nxl-notifications-menu" closeOnSelect={false}>
                <div className="d-flex justify-content-between align-items-center notifications-head">
                  <h6 className="fw-bold text-dark mb-0">Notificaciones</h6>
                  {noLeidas > 0 && (
                    <button
                      type="button"
                      onClick={onMarkAllRead}
                      className="fs-11 text-success text-end ms-auto gcu-link-button"
                    >
                      <Icon name="check" />
                      <span> Marcar como leído</span>
                    </button>
                  )}
                </div>
                <div className="gcu-notifications-list">
                  {notifications.length === 0 ? (
                    <div className="notifications-item">
                      <Avatar name="I" variant="primary" size="md" className="me-3" style={{ borderRadius: '50%' }} />
                      <div className="notifications-desc">
                        <p className="font-body text-body text-truncate-2-line mb-0">
                          Sin notificaciones nuevas.
                        </p>
                      </div>
                    </div>
                  ) : (
                    notifications.map((n) => {
                      const hasMatchingSpaApp = apps.some(
                        app => app.modo !== 'external_link' && app.nombre === n.aplicacion_nombre,
                      );

                      return (
                        <div key={n.id} className={`notifications-item ${n.leida ? '' : 'fw-semibold'}`}>
                          <Avatar
                            name={(n.aplicacion_nombre ?? 'N').charAt(0)}
                            variant={n.leida ? 'secondary' : 'primary'}
                            size="md"
                            className="me-3"
                            style={{ borderRadius: '50%' }}
                          />
                          <div className="notifications-desc">
                            <a
                              href={n.url || notificationsHref}
                              onClick={onNotificationClick && hasMatchingSpaApp ? (e) => {
                                if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
                                e.preventDefault();
                                onNotificationClick(e, n);
                              } : undefined}
                              className="font-body text-body text-truncate-2-line"
                            >
                              {n.mensaje}
                            </a>
                            <div className="fs-11 text-muted">{tiempoRelativo(n.creada_en)}</div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                <div className="notifications-footer text-center">
                  <a href={notificationsHref} className="fs-12 fw-semibold">
                    Ver todas las notificaciones
                  </a>
                </div>
              </DropdownMenu>
            </Dropdown>

            {/* User + logout */}
            <Dropdown
              align="end"
              className="dropdown nxl-h-item ms-2"
              desktopHover={desktopHover}
              trigger={(triggerProps, { open }) => (
                <button
                  {...triggerProps}
                  className={`d-flex align-items-center gap-2 nxl-head-link me-0 gcu-header-icon-button gcu-avatar-trigger${open ? ' show' : ''}`}
                  aria-label="Menú de usuario"
                >
                  <Avatar name={nombre} size="md" variant="primary" className="gcu-header-avatar" />
                </button>
              )}
            >
              <DropdownMenu className="nxl-h-dropdown nxl-user-dropdown" closeOnSelect={false}>
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
              </DropdownMenu>
            </Dropdown>

          </div>
        </div>

      </div>
    </header>
  );
}
