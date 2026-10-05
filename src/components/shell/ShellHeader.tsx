import { useEffect, useRef, useState } from 'react';
import type * as React from 'react';
import type { AppManifestEntry, Notificacion } from '../../contract';
import { topLevelApps } from '../../contract';
import { Icon } from '../ui/Icon';
import { AppSwitcher } from './AppSwitcher';
import { TenantSwitcher } from './TenantSwitcher';
import { NotificationsMenu } from './NotificationsMenu';
import { ProfileMenu } from './ProfileMenu';
import { ThemeToggle } from './ThemeToggle';
import { ModuleSearch } from './internal/ModuleSearch';
import { useDesktopHover } from './internal/useDesktopHover';
import { resolveNotificationsHref } from './shellHeaderModel';

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
  /** Controlled mobile state shared with ShellNav for accessible labels. */
  mobileOpen?: boolean;
  /** ID of ShellNav, used by the mobile trigger's `aria-controls`. */
  mobileNavId?: string;
  /** Internal close reason; only dismissive closures restore trigger focus. */
  mobileCloseReason?: 'dismiss' | 'escape' | 'overlay' | 'toggle' | 'navigation' | 'programmatic' | 'open';
  onOpenApp: (e: React.MouseEvent, app: AppManifestEntry) => void;
  onSelectCuenta: (slug: string) => void;
  onVolverSa: () => void;
  appHref: (app: AppManifestEntry) => string;
  csrfToken: string;
  avatarUrl?: string | null;
  profileHref?: string;
  onNavigateProfile?: () => void;
  notifications?: Notificacion[];
  onMarkAllRead?: () => void;
  onNotificationClick?: (e: React.MouseEvent, n: Notificacion) => void;
  /**
   * Menú de tema de cuatro modos (claro / oscuro / azul marino / sistema) en vez del botón
   * sol / luna. Requiere `ThemeProvider`. Por defecto false (comportamiento 2.5).
   */
  themeMenu?: boolean;
}

const NO_NOTIFICATIONS: Notificacion[] = [];

// ─── ShellHeader Component ────────────────────────────────────────────────────

/**
 * ShellHeader — header del shell GranCRM. Compone las piezas exportadas `AppSwitcher`,
 * `TenantSwitcher`, `NotificationsMenu`, `ProfileMenu` y `ThemeToggle`, más el botón móvil,
 * el colapso del menú lateral y el buscador de módulos.
 *
 * Módulos y búsqueda se excluyen entre sí (abrir uno cierra el otro).
 */
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
  mobileOpen = false,
  mobileNavId = 'shell-navigation',
  mobileCloseReason = 'dismiss',
  onOpenApp,
  onSelectCuenta,
  onVolverSa,
  appHref,
  csrfToken,
  avatarUrl,
  profileHref,
  onNavigateProfile,
  notifications = NO_NOTIFICATIONS,
  onMarkAllRead,
  onNotificationClick,
  themeMenu = false,
}: ShellHeaderProps) {
  const mobileTriggerRef = useRef<HTMLButtonElement>(null);
  const wasMobileOpen = useRef(mobileOpen);
  const [modulesOpen, setModulesOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [clientOpen, setClientOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const desktopHover = useDesktopHover();

  // Apps anidadas bajo otra app del mismo manifest (ej. wsp_demo bajo wsp_platform)
  // no salen en el mega-menú ni en el buscador — ya se navegan desde dentro de la
  // app padre. `apps` completo se sigue usando para lookups que no son de listado.
  const visibleApps = topLevelApps(apps);

  useEffect(() => {
    const dismissive = mobileCloseReason === 'dismiss'
      || mobileCloseReason === 'escape'
      || mobileCloseReason === 'overlay'
      || mobileCloseReason === 'toggle';
    if (wasMobileOpen.current && !mobileOpen && dismissive) mobileTriggerRef.current?.focus();
    wasMobileOpen.current = mobileOpen;
  }, [mobileCloseReason, mobileOpen]);

  return (
    <header className="nxl-header">
      <div className="header-wrapper">

        {/* ── LEFT ─────────────────────────────────────────────────────── */}
        <div className="header-left d-flex align-items-center gap-4">

          {/* Mobile hamburger (Duralux nxl-head-mobile-toggler) */}
          <button
            ref={mobileTriggerRef}
            type="button"
            className={`nxl-head-mobile-toggler gcu-header-icon-button${mobileOpen ? ' is-active' : ''}`}
            id="mobile-collapse"
            onClick={onToggleMobileNav}
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

          {/* Sidebar toggle: dos controles (mini/expand), visibilidad ligada a `mini`. */}
          <div className="nxl-navigation-toggle">
            <button
              type="button"
              id="menu-mini-button"
              className="gcu-header-icon-button"
              onClick={onToggleMini}
              aria-label="Colapsar menú"
              aria-pressed={!mini}
              aria-expanded={!mini}
              aria-controls={mobileNavId}
              aria-hidden={mini}
              tabIndex={mini ? -1 : undefined}
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
              aria-pressed={mini}
              aria-expanded={mini}
              aria-controls={mobileNavId}
              aria-hidden={!mini}
              tabIndex={mini ? undefined : -1}
              style={{ display: mini ? undefined : 'none' }}
            >
              <Icon name="arrow-right" />
            </button>
          </div>

          <AppSwitcher
            apps={apps}
            appHref={appHref}
            onOpenApp={onOpenApp}
            desktopHover={desktopHover}
            open={modulesOpen}
            onOpenChange={(next) => {
              if (next) setSearchOpen(false);
              setModulesOpen(next);
            }}
          />

          {(rol === 'admin_ti' || viewAsSa) && (
            <TenantSwitcher
              viewAsSa={viewAsSa}
              cuentaNombre={cuentaNombre}
              cuentas={cuentas}
              onSelectCuenta={onSelectCuenta}
              onVolverSa={onVolverSa}
              desktopHover={desktopHover}
              open={clientOpen}
              onOpenChange={setClientOpen}
            />
          )}
        </div>

        {/* ── RIGHT ────────────────────────────────────────────────────── */}
        <div className="header-right ms-auto">
          <div className="d-flex align-items-center">

            <ModuleSearch
              apps={visibleApps}
              appHref={appHref}
              onOpenApp={onOpenApp}
              open={searchOpen}
              onOpenChange={(next) => {
                if (next) setModulesOpen(false);
                setSearchOpen(next);
              }}
            />

            {themeMenu
              ? <ThemeToggle desktopHover={false} />
              : <ThemeToggle dark={dark} onToggleDark={onToggleDark} />}

            <NotificationsMenu
              notifications={notifications}
              onMarkAllRead={onMarkAllRead}
              onNotificationClick={onNotificationClick}
              apps={apps}
              notificationsHref={resolveNotificationsHref(apps, appHref)}
              desktopHover={desktopHover}
              open={notificationsOpen}
              onOpenChange={setNotificationsOpen}
            />

            <ProfileMenu
              nombre={nombre}
              email={email}
              avatarUrl={avatarUrl}
              profileHref={profileHref}
              onNavigateProfile={onNavigateProfile}
              csrfToken={csrfToken}
              desktopHover={desktopHover}
              open={userOpen}
              onOpenChange={setUserOpen}
            />

          </div>
        </div>

      </div>
    </header>
  );
}
