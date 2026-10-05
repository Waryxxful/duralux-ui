import { useEffect, useId, useRef, useState } from 'react';
import type * as React from 'react';
import type { AppManifestEntry } from '../../../contract';
import { Icon } from '../../ui/Icon';
import { safeHref } from '../../../utils/safeHref';

/**
 * Buscador de módulos del header (interno de ShellHeader): filtra las apps por nombre.
 * Disclosure con Esc y clic fuera; al abrir enfoca el campo.
 */
export function ModuleSearch({
  apps,
  appHref,
  onOpenApp,
  open,
  onOpenChange,
}: {
  apps: AppManifestEntry[];
  appHref: (app: AppManifestEntry) => string;
  onOpenApp: (e: React.MouseEvent, app: AppManifestEntry) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState('');
  const onOpenChangeRef = useRef(onOpenChange);
  useEffect(() => {
    onOpenChangeRef.current = onOpenChange;
  });
  const filteredApps = search
    ? apps.filter(app => app.nombre.toLowerCase().includes(search.toLowerCase()))
    : apps;
  const inertProps = open ? {} : { inert: '' };

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (!menuRef.current?.contains(target) && !triggerRef.current?.contains(target)) {
        onOpenChangeRef.current(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      onOpenChangeRef.current(false);
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
    <div className="dropdown nxl-h-item nxl-header-search">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => onOpenChange(!open)}
        className={`nxl-head-link me-0 gcu-header-icon-button${open ? ' is-active' : ''}`}
        aria-label="Buscar módulo"
        aria-expanded={open}
        aria-controls={menuId}
      >
        <Icon name="search" />
      </button>
      <div
        ref={menuRef}
        id={menuId}
        className={`dropdown-menu dropdown-menu-end nxl-h-dropdown nxl-search-dropdown${open ? ' show' : ''}`}
        aria-hidden={!open}
        {...inertProps}
      >
        <div className="input-group search-form">
          <span className="input-group-text">
            <Icon name="search" size="sm" className="text-muted" />
          </span>
          <input
            ref={inputRef}
            type="text"
            name="module-search"
            autoComplete="off"
            className="form-control search-input-field"
            placeholder="Buscar módulo…"
            aria-label="Buscar módulo"
            tabIndex={open ? undefined : -1}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="input-group-text">
            <button
              type="button"
              className="gcu-search-close"
              aria-label="Cerrar búsqueda"
              tabIndex={open ? undefined : -1}
              onClick={() => {
                onOpenChange(false);
                triggerRef.current?.focus();
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
                href={safeHref(appHref(app))}
                onClick={(e) => {
                  onOpenChange(false);
                  onOpenApp(e, app);
                }}
                className="flex-fill border rounded py-1 px-2 text-center fs-11 fw-semibold"
                tabIndex={open ? undefined : -1}
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
  );
}
