import { Fragment, forwardRef, useEffect, useId, useRef, useState } from 'react';
import type * as React from 'react';
import type { AppManifestEntry } from '../../contract';
import { topLevelApps } from '../../contract';
import { Icon } from '../ui/Icon';
import { Badge } from '../ui/Badge';
import { assignRef } from '../../utils/assignRef';
import { cx } from '../../utils/cx';
import { groupAppsByCategory } from './shellHeaderModel';
import { safeHref } from '../../utils/safeHref';
import { useControllableOpen, useDesktopHover } from './internal/useDesktopHover';

export interface AppSwitcherProps {
  /** Manifest completo; las apps anidadas bajo otra app no se listan (se navegan desde su padre). */
  apps: AppManifestEntry[];
  appHref: (app: AppManifestEntry) => string;
  onOpenApp: (e: React.MouseEvent, app: AppManifestEntry) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Abre las categorías al pasar el puntero (por defecto: escritorio con puntero fino). */
  desktopHover?: boolean;
  /** Texto del disparador. */
  label?: string;
  className?: string;
}

function AppStatusBadge({ estado }: { estado: AppManifestEntry['estado'] }) {
  if (estado === 'montaje') return <Badge variant="warning" className="text-dark ms-auto fs-10">Montaje</Badge>;
  if (estado === 'caido') return <Badge variant="danger" className="ms-auto fs-10">Caído</Badge>;
  return null;
}

function AppMenuItem({
  app,
  appHref,
  onSelect,
  focusable = true,
}: {
  app: AppManifestEntry;
  appHref: (app: AppManifestEntry) => string;
  onSelect: (e: React.MouseEvent, app: AppManifestEntry) => void;
  focusable?: boolean;
}) {
  const external = app.modo === 'external_link';
  return (
    <a
      href={safeHref(appHref(app))}
      className="dropdown-item"
      tabIndex={focusable ? undefined : -1}
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
  parentOpen,
}: {
  category: string;
  apps: AppManifestEntry[];
  appHref: (app: AppManifestEntry) => string;
  onSelect: (e: React.MouseEvent, app: AppManifestEntry) => void;
  desktopHover: boolean;
  parentOpen: boolean;
}) {
  const menuId = useId();
  const [open, setOpen] = useState(false);
  const [prevParentOpen, setPrevParentOpen] = useState(parentOpen);
  if (prevParentOpen !== parentOpen) {
    setPrevParentOpen(parentOpen);
    if (!parentOpen) setOpen(false);
  }
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const wasVisible = useRef(false);

  const visible = parentOpen && open;
  const menuInertProps = visible ? {} : { inert: '' };
  const closeCategory = (event?: React.KeyboardEvent) => {
    event?.preventDefault();
    event?.stopPropagation();
    setOpen(false);
    triggerRef.current?.focus();
  };

  useEffect(() => {
    if (wasVisible.current && !visible && parentOpen && menuRef.current?.contains(document.activeElement)) {
      triggerRef.current?.focus();
    }
    wasVisible.current = visible;
  }, [parentOpen, visible]);

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
        ref={triggerRef}
        type="button"
        className={`dropdown-item d-flex align-items-center ${open ? 'show' : ''}`}
        aria-controls={menuId}
        aria-expanded={visible}
        tabIndex={parentOpen ? undefined : -1}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(value => !value);
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowRight') {
            event.preventDefault();
            event.stopPropagation();
            if (!open) setOpen(true);
          } else if ((event.key === 'ArrowLeft' || event.key === 'Escape') && open) {
            closeCategory(event);
          }
        }}
      >
        <span className="hstack">
          <Icon name="grid" className="me-2" />
          <span>{category}</span>
        </span>
        <Icon name="chevron-right" className="ms-auto me-0" />
      </button>
      <div
        ref={menuRef}
        id={menuId}
        className={`dropdown-menu nxl-h-dropdown ${visible ? 'show' : ''}`}
        aria-hidden={!visible}
        {...menuInertProps}
        onKeyDown={(event) => {
          if ((event.key === 'ArrowLeft' || event.key === 'Escape') && visible) {
            closeCategory(event);
          }
        }}
      >
        {apps.map(app => (
          <AppMenuItem
            key={app.id}
            app={app}
            appHref={appHref}
            onSelect={onSelect}
            focusable={visible}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * AppSwitcher — mega-menú «Módulos» del header: apps del manifest agrupadas por categoría.
 *
 * - Disclosure APG: el disparador expone `aria-expanded`/`aria-controls`; Esc y clic fuera cierran
 *   y devuelven el foco al disparador.
 * - Cada categoría es un disclosure anidado (→ abre, ← o Esc cierra sin cerrar el padre).
 * - En pantallas ≤ 1024 px el menú ocupa la pantalla y el foco va a «Volver».
 * - El ref apunta al contenedor `.nxl-drp-link`.
 */
export const AppSwitcher = /* @__PURE__ */ forwardRef<HTMLDivElement, AppSwitcherProps>(function AppSwitcher({
  apps,
  appHref,
  onOpenApp,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  desktopHover: desktopHoverProp,
  label = 'MÓDULOS',
  className,
}, forwardedRef) {
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useControllableOpen(openProp, defaultOpen, onOpenChange);
  const desktopHover = useDesktopHover(desktopHoverProp);
  const appsByCategory = groupAppsByCategory(topLevelApps(apps));
  const menuInertProps = open ? {} : { inert: '' };
  // El efecto de documento lee la última versión sin re-suscribirse en cada render.
  const setOpenRef = useRef(setOpen);
  useEffect(() => {
    setOpenRef.current = setOpen;
  });

  useEffect(() => {
    if (!open) return;
    if (!globalThis.window?.matchMedia) return undefined;
    const mediaQuery = window.matchMedia('(max-width: 1024px)');
    const moveFocusForLayout = () => {
      if (mediaQuery.matches) {
        backRef.current?.focus();
      } else if (backRef.current?.contains(document.activeElement)) {
        triggerRef.current?.focus();
      }
    };

    moveFocusForLayout();
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', moveFocusForLayout);
      return () => mediaQuery.removeEventListener('change', moveFocusForLayout);
    }
    mediaQuery.addListener?.(moveFocusForLayout);
    return () => mediaQuery.removeListener?.(moveFocusForLayout);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (!menuRef.current?.contains(target) && !triggerRef.current?.contains(target)) {
        setOpenRef.current(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      setOpenRef.current(false);
      triggerRef.current?.focus();
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={(node) => assignRef(forwardedRef, node)} className={cx('nxl-drp-link gcu-modules', className)}>
      <button
        ref={triggerRef}
        type="button"
        className={`btn bg-white border px-3 py-2 fw-semibold fs-12 text-dark d-flex align-items-center gap-2 gcu-modules-trigger${open ? ' is-active' : ''}`}
        aria-label="Módulos"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen(!open)}
      >
        <Icon name="grid" className="text-primary" />
        <span className="gcu-modules-trigger-label">{label}</span>
        <Icon name="chevron-down" />
      </button>
      <div
        ref={menuRef}
        id={menuId}
        className={`dropdown-menu nxl-h-dropdown gcu-modules-menu${open ? ' show' : ''}`}
        aria-hidden={!open}
        {...menuInertProps}
      >
        <button
          ref={backRef}
          type="button"
          className="gcu-modules-back"
          tabIndex={open ? undefined : -1}
          onClick={() => {
            setOpen(false);
            triggerRef.current?.focus();
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
                parentOpen={open}
                onSelect={(e, app) => {
                  setOpen(false);
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
  );
});
