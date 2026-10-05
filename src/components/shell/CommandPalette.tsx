import { forwardRef, useEffect, useId, useRef, useState } from 'react';
import type * as React from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '../ui/Icon';
import { Kbd } from '../ui/Kbd';
import { cx } from '../../utils/cx';
import { log } from '../../utils/log';
import { assignRef } from '../../utils/assignRef';
import { safeHref } from '../../utils/safeHref';
import { registerDismissableLayer } from '../../utils/dismissableLayer';
import { useThemeBoundaryMode } from '../../theme/themeBoundary';
import type { CommandPaletteItem, CommandPaletteProps } from '../../public/types';
import { useControllableOpen } from './internal/useDesktopHover';
import { buildSections, DEFAULT_RECENTS_KEY, pushRecent, readRecents } from './commandPaletteModel';

function defaultEmpty(query: string): React.ReactNode {
  return <>Sin resultados para «{query}». Prueba con otra palabra.</>;
}

function optionDomId(listId: string, itemId: string): string {
  return `${listId}-${itemId.replace(/[^a-zA-Z0-9_-]/g, '-')}`;
}

/**
 * CommandPalette — paleta de comandos y navegación (Ctrl/Cmd + K).
 *
 * - Patrón APG combobox + listbox: el campo tiene `role="combobox"` con `aria-activedescendant`;
 *   flechas arriba/abajo (con vuelta), Inicio/Fin, Enter ejecuta, Esc cierra.
 * - Búsqueda difusa sin tildes sobre nombre, sinónimos, grupo y descripción.
 * - Sin búsqueda muestra «Recientes» (localStorage, tolerante a almacenamiento bloqueado) y los grupos.
 * - Diálogo modal en portal con el tema del contenedor; al cerrar devuelve el foco.
 * - `href` solo http/https o rutas relativas (`safeHref`). El ref apunta al diálogo.
 */
export const CommandPalette = /* @__PURE__ */ forwardRef<HTMLDivElement, CommandPaletteProps>(function CommandPalette({
  items,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  onSelect,
  hotkey = true,
  label = 'Paleta de comandos',
  placeholder = 'Busca un comando o una página…',
  emptyMessage = defaultEmpty,
  recentsKey = DEFAULT_RECENTS_KEY,
  maxRecents = 5,
  maxResults = 50,
  className,
}, forwardedRef) {
  const baseId = useId().replace(/:/g, '');
  const listId = `gcu-cmdk-list-${baseId}`;
  const themeMode = useThemeBoundaryMode();
  const [open, setOpen] = useControllableOpen(openProp, defaultOpen, onOpenChange);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [recentIds, setRecentIds] = useState<string[]>(() => readRecents(recentsKey));
  const [prevOpen, setPrevOpen] = useState(open);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const openRef = useRef(open);
  const setOpenRef = useRef(setOpen);
  useEffect(() => {
    openRef.current = open;
    setOpenRef.current = setOpen;
  });

  // Al abrir: búsqueda vacía y primer resultado activo (ajuste en render, sin efecto).
  if (prevOpen !== open) {
    setPrevOpen(open);
    if (open) {
      setQuery('');
      setActiveIndex(0);
    }
  }

  const sections = buildSections(items, query, recentIds, maxResults);
  const flat = sections.flatMap(section => section.items);
  const safeIndex = flat.length ? Math.min(activeIndex, flat.length - 1) : -1;
  const activeItem = safeIndex >= 0 ? flat[safeIndex] : undefined;

  // Atajo global Ctrl/Cmd + K.
  useEffect(() => {
    if (!hotkey) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.repeat || event.altKey) return;
      if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== 'k') return;
      event.preventDefault();
      setOpenRef.current(!openRef.current);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [hotkey]);

  // Foco: guardar el de origen, enfocar el campo y devolverlo al cerrar. Esc por la pila de capas.
  useEffect(() => {
    if (!open) return undefined;
    const active = globalThis.document?.activeElement;
    returnFocusRef.current = active instanceof HTMLElement ? active : null;
    inputRef.current?.focus();
    const unregister = registerDismissableLayer({
      element: dialogRef.current,
      onEscape: () => setOpenRef.current(false),
      onPointerDownOutside: () => setOpenRef.current(false),
    });
    return () => {
      unregister();
      returnFocusRef.current?.focus?.();
    };
  }, [open]);

  useEffect(() => {
    if (!open || !activeItem) return;
    const option = globalThis.document?.getElementById(optionDomId(listId, activeItem.id));
    option?.scrollIntoView?.({ block: 'nearest' });
  }, [activeItem, listId, open]);

  const select = (item: CommandPaletteItem | undefined) => {
    if (!item || item.disabled) return;
    setRecentIds(current => pushRecent(recentsKey, current, item.id, maxRecents));
    setOpen(false);
    log.info(`CommandPalette: comando «${item.id}» ejecutado.`);
    item.onSelect?.();
    onSelect?.(item);
    if (!item.onSelect && !onSelect && item.href) {
      const href = safeHref(item.href);
      if (href) globalThis.location?.assign(href);
    }
  };

  const onInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const count = flat.length;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!count) return;
      const step = event.key === 'ArrowDown' ? 1 : -1;
      setActiveIndex((Math.max(safeIndex, 0) + step + count) % count);
    } else if (event.key === 'Home' && count) {
      event.preventDefault();
      setActiveIndex(0);
    } else if (event.key === 'End' && count) {
      event.preventDefault();
      setActiveIndex(count - 1);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      select(activeItem);
    } else if (event.key === 'Tab') {
      // Diálogo modal con un solo control: el foco no sale.
      event.preventDefault();
    }
  };

  if (!open || !globalThis.document?.body) return null;

  let position = -1;
  return createPortal(
    <div className={cx('gcu-command-palette__backdrop', themeMode && 'gcu-theme')} data-gcu-theme={themeMode}>
      <div
        ref={(node) => {
          dialogRef.current = node;
          assignRef(forwardedRef, node);
        }}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        data-gcu-modal-layer="command-palette"
        className={cx('gcu-command-palette', className)}
      >
        <div className="gcu-command-palette__search">
          <Icon name="search" className="gcu-command-palette__search-icon" />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={activeItem ? optionDomId(listId, activeItem.id) : undefined}
            aria-label={label}
            autoComplete="off"
            spellCheck={false}
            className="gcu-command-palette__input"
            placeholder={placeholder}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={onInputKeyDown}
          />
          <Kbd>Esc</Kbd>
        </div>
        <div id={listId} role="listbox" aria-label="Resultados" className="gcu-command-palette__list">
          {sections.map(section => {
            const headingId = `${listId}-${section.id.replace(/[^a-zA-Z0-9_-]/g, '-')}-label`;
            return (
              <ul key={section.id} role="group" aria-labelledby={section.label ? headingId : undefined} className="gcu-command-palette__group">
                {section.label && (
                  <li role="presentation" id={headingId} className="gcu-command-palette__group-label">{section.label}</li>
                )}
                {section.items.map(item => {
                  position += 1;
                  const index = position;
                  const selected = index === safeIndex;
                  return (
                    <li
                      key={item.id}
                      id={optionDomId(listId, item.id)}
                      role="option"
                      aria-selected={selected}
                      aria-disabled={item.disabled || undefined}
                      data-active={selected ? '' : undefined}
                      className="gcu-command-palette__option"
                      onPointerMove={() => {
                        if (!selected) setActiveIndex(index);
                      }}
                      onMouseDown={event => event.preventDefault()}
                      onClick={() => select(item)}
                    >
                      {item.icon && <Icon name={item.icon} className="gcu-command-palette__option-icon" />}
                      <span className="gcu-command-palette__option-text">
                        <span className="gcu-command-palette__option-label">{item.label}</span>
                        {item.description && <span className="gcu-command-palette__option-description">{item.description}</span>}
                      </span>
                      {section.id === 'results' && item.group && (
                        <span className="gcu-command-palette__option-group">{item.group}</span>
                      )}
                      {item.shortcut && item.shortcut.length > 0 && <Kbd keys={item.shortcut} />}
                    </li>
                  );
                })}
              </ul>
            );
          })}
        </div>
        {flat.length === 0 && (
          <p role="status" className="gcu-command-palette__empty">
            {query.trim() ? emptyMessage(query.trim()) : 'No hay comandos disponibles.'}
          </p>
        )}
        <div className="gcu-command-palette__footer" aria-hidden="true">
          <span><Kbd>↑</Kbd><Kbd>↓</Kbd> para moverte</span>
          <span><Kbd>Enter</Kbd> para abrir</span>
          <span><Kbd>Esc</Kbd> para cerrar</span>
        </div>
      </div>
    </div>,
    document.body,
  );
});
