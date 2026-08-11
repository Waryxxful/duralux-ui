import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Icon } from '../ui/Icon';

/**
 * The navigation seam is deliberately small: adapters prepare destinations
 * and route scores, while NavCore owns the tree renderer and all disclosure
 * behaviour. A caller never has to know how a nested row is rendered.
 */
export interface NavCoreItem {
  /** Optional caller identity. Duplicate identities are disambiguated below. */
  key?: string;
  label: React.ReactNode;
  icon?: string;
  href?: string;
  linkKind?: 'router' | 'anchor';
  action?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  children?: NavCoreItem[];
  /** -1 means that this item does not match the adapter's current route. */
  routeScore?: number;
  /** Legacy active state, used when an adapter has no current pathname. */
  active?: boolean;
  disabled?: boolean;
  type?: 'caption' | 'item';
}

export interface NavCoreSection {
  key?: string;
  caption?: string;
  items: NavCoreItem[];
}

export interface NavCoreBrand {
  href: string;
  logoLg: string;
  logoSm: string;
  alt: string;
}

export interface NavCoreLinkProps {
  item: NavCoreItem;
  href: string;
  className: string;
  ariaLabel: string;
  ariaCurrent?: 'page';
  tabIndex?: number;
  onClick: (event: React.MouseEvent<HTMLAnchorElement>) => void;
  children: React.ReactNode;
}

export interface NavCoreAdapter {
  /** True when routeScore values, rather than legacy active flags, are authoritative. */
  routeMode: boolean;
  /** Adapter-owned brand semantics: standalone Router Link or gateway anchor. */
  brandLinkKind?: 'router' | 'anchor';
  renderLink: (props: NavCoreLinkProps) => React.ReactElement;
  onNavigate?: (event: React.MouseEvent, item: NavCoreItem) => void;
}

export interface NavCoreProps {
  brand?: NavCoreBrand;
  sections: NavCoreSection[];
  adapter: NavCoreAdapter;
  mobileOpen?: boolean;
  navigationId?: string;
  promoCard?: React.ReactNode;
}

const MOBILE_NAV_MEDIA_QUERY = '(max-width: 1024px)';

function useMobileViewport(): boolean | null {
  // Keep the first client render identical to SSR; the viewport is a
  // progressive enhancement once effects are allowed to run.
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return undefined;

    const mediaQuery = window.matchMedia(MOBILE_NAV_MEDIA_QUERY);
    const update = (event?: MediaQueryListEvent) => {
      setIsMobile(typeof event?.matches === 'boolean' ? event.matches : mediaQuery.matches);
    };

    update();
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', update);
      return () => mediaQuery.removeEventListener('change', update);
    }

    mediaQuery.addListener?.(update);
    return () => mediaQuery.removeListener?.(update);
  }, []);

  return isMobile;
}

export function submenuVisibilityClass(open: boolean): 'nxl-menu-visible' | 'nxl-menu-hidden' {
  return open ? 'nxl-menu-visible' : 'nxl-menu-hidden';
}

export function handleSubmenuKeyDown(
  event: { key: string; preventDefault: () => void; currentTarget?: { focus?: () => void } },
  open: boolean,
  setOpen: (nextOpen: boolean) => void,
): void {
  if (event.key === 'ArrowRight' && !open) {
    event.preventDefault();
    setOpen(true);
    return;
  }

  if ((event.key === 'ArrowLeft' || event.key === 'Escape') && open) {
    event.preventDefault();
    setOpen(false);
    event.currentTarget?.focus?.();
  }
}

export function navigationIconName(icon: string | undefined): string {
  return String(icon || '').replace(/^feather-/, '');
}

/** Legacy Sidebar renders a CSS class; adapters emit bare Icon names. */
export function navigationIconClass(icon: string | undefined): string {
  const value = String(icon || '').trim();
  if (!value) return '';
  if (value.includes(' ')) return value;
  return value.startsWith('feather-') ? value : `feather-${value}`;
}

function pathOnly(value: string | undefined | null): string | null {
  if (!value) return null;
  const path = String(value).split(/[?#]/, 1)[0];
  if (!path.startsWith('/')) return null;
  if (path === '/') return '/';
  return path.replace(/\/+$/, '');
}

/**
 * Returns the matching path length, or -1 when `href` is not the current
 * route. Longer matches win so `/app/users` beats `/app`.
 */
export function navigationPathScore(href: string | undefined, pathname: string | undefined): number {
  const hrefPath = pathOnly(href);
  const currentPath = pathOnly(pathname);
  if (!hrefPath || !currentPath) return -1;

  if (hrefPath === '/') return currentPath === '/' ? 0 : -1;
  if (currentPath === hrefPath || currentPath.startsWith(`${hrefPath}/`)) {
    return hrefPath.length;
  }
  return -1;
}

interface KeyedNavCoreItem extends NavCoreItem {
  key: string;
  children?: KeyedNavCoreItem[];
}

interface ResolvedNavCoreItem extends KeyedNavCoreItem {
  active: boolean;
  current: boolean;
  children?: ResolvedNavCoreItem[];
}

function identityFor(item: NavCoreItem): string {
  const identity = item.key ?? item.href ?? item.label ?? item.type ?? 'item';
  return String(identity).trim() || 'item';
}

/**
 * Keys are based on caller identity plus sibling occurrence, not on render
 * position. That keeps duplicate labels/destinations independent and gives
 * disclosure state a stable identity during normal list updates.
 */
function assignStableKeys(items: NavCoreItem[], parentKey = ''): KeyedNavCoreItem[] {
  const occurrences = new Map<string, number>();

  return items.map((item) => {
    const base = identityFor(item);
    const occurrence = (occurrences.get(base) || 0) + 1;
    occurrences.set(base, occurrence);
    const segment = `${base.length}:${base}~${occurrence}`;
    const key = parentKey ? `${parentKey}/${segment}` : segment;
    const children = item.children?.length
      ? assignStableKeys(item.children, key)
      : undefined;

    return {
      ...item,
      key,
      children,
    };
  });
}

function assignStableSectionKeys(sections: NavCoreSection[]): (NavCoreSection & { key: string })[] {
  const occurrences = new Map<string, number>();
  return sections.map((section) => {
    const base = section.key ?? section.caption ?? 'section';
    const occurrence = (occurrences.get(base) || 0) + 1;
    occurrences.set(base, occurrence);
    return { ...section, key: `section:${String(base)}~${occurrence}` };
  });
}

function visitItems(
  items: KeyedNavCoreItem[],
  callback: (item: KeyedNavCoreItem) => void,
): void {
  items.forEach((item) => {
    callback(item);
    if (item.children?.length) visitItems(item.children, callback);
  });
}

function findBestRouteKey(
  sections: (NavCoreSection & { key: string; items: KeyedNavCoreItem[] })[],
  routeMode: boolean,
): string | null {
  if (!routeMode) return null;
  let bestScore = -1;
  let bestKey: string | null = null;
  sections.forEach(section => visitItems(section.items, item => {
    if (item.children?.length || item.disabled) return;
    const score = typeof item.routeScore === 'number' ? item.routeScore : -1;
    if (score >= 0 && score > bestScore) {
      bestScore = score;
      bestKey = item.key;
    }
  }));
  return bestKey;
}

function findLegacyCurrentKey(
  sections: (NavCoreSection & { key: string; items: KeyedNavCoreItem[] })[],
  routeMode: boolean,
): string | null {
  if (routeMode) return null;
  let currentKey: string | null = null;
  sections.some(section => {
    const found = (() => {
      let result: string | null = null;
      visitItems(section.items, item => {
        if (!result && !item.children?.length && !item.disabled && item.active) result = item.key;
      });
      return result;
    })();
    if (found) {
      currentKey = found;
      return true;
    }
    return false;
  });
  return currentKey;
}

function resolveItems(
  items: KeyedNavCoreItem[],
  routeMode: boolean,
  currentKey: string | null,
): ResolvedNavCoreItem[] {
  return items.map((item) => {
    const children = item.children?.length
      ? resolveItems(item.children, routeMode, currentKey)
      : undefined;
    const { children: _children, ...itemWithoutChildren } = item;
    const hasChildren = Boolean(children?.length);
    const childActive = Boolean(children?.some(child => child.active));
    const ownRouteActive = routeMode
      && !hasChildren
      && !item.disabled
      && typeof item.routeScore === 'number'
      && item.key === currentKey;
    const active = item.disabled
      ? false
      : routeMode
        ? ownRouteActive || childActive
        : Boolean(item.active) || childActive;

    return {
      ...itemWithoutChildren,
      active,
      current: !item.disabled && !hasChildren && item.key === currentKey,
      ...(children ? { children } : {}),
    };
  });
}

function collectActiveGroupKeys(
  sections: (NavCoreSection & { key: string; items: ResolvedNavCoreItem[] })[],
): string[] {
  const keys: string[] = [];
  sections.forEach(section => visitResolvedItems(section.items, item => {
    if (item.children?.length && item.active) keys.push(item.key);
  }));
  return keys;
}

function visitResolvedItems(
  items: ResolvedNavCoreItem[],
  callback: (item: ResolvedNavCoreItem) => void,
): void {
  items.forEach(item => {
    callback(item);
    if (item.children?.length) visitResolvedItems(item.children, callback);
  });
}

function collectGroupKeysByParent(
  sections: (NavCoreSection & { key: string; items: KeyedNavCoreItem[] })[],
): Map<string, string[]> {
  const groups = new Map<string, string[]>();
  const visit = (items: KeyedNavCoreItem[], parentKey: string) => {
    const siblingGroups = groups.get(parentKey) || [];
    items.forEach(item => {
      if (!item.children?.length) return;
      siblingGroups.push(item.key);
    });
    groups.set(parentKey, siblingGroups);
    items.forEach(item => {
      if (item.children?.length) visit(item.children, item.key);
    });
  };
  sections.forEach(section => visit(section.items, ''));
  return groups;
}

function collectAllGroupKeys(
  sections: (NavCoreSection & { key: string; items: KeyedNavCoreItem[] })[],
): Set<string> {
  const keys = new Set<string>();
  sections.forEach(section => visitItems(section.items, item => {
    if (item.children?.length) keys.add(item.key);
  }));
  return keys;
}

function ItemIcon({ icon }: { icon?: string }) {
  if (!icon) return null;
  return (
    <span className="nxl-micon">
      <Icon name={navigationIconName(icon)} />
    </span>
  );
}

function ItemText({ label }: { label: React.ReactNode }) {
  return <span className="nxl-mtext">{label}</span>;
}

function SubmenuArrow() {
  return (
    <span className="nxl-arrow">
      <Icon name="chevron-right" />
    </span>
  );
}

interface NavItemRowProps {
  item: ResolvedNavCoreItem;
  adapter: NavCoreAdapter;
  openKeys: Set<string>;
  onToggleGroup: (item: ResolvedNavCoreItem, parentKey: string) => void;
  parentKey: string;
  hiddenByAncestor: boolean;
  ancestorTriggerRef?: React.RefObject<HTMLButtonElement | null>;
  suppressFocusRestore?: boolean;
}

function NavItemRow({
  item,
  adapter,
  openKeys,
  onToggleGroup,
  parentKey,
  hiddenByAncestor,
  ancestorTriggerRef,
  suppressFocusRestore = false,
}: NavItemRowProps) {
  const submenuId = `nav-submenu-${useId().replace(/:/g, '')}`;
  const submenuRef = useRef<HTMLUListElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const wasSubmenuHidden = useRef(true);
  const hasChildren = Boolean(item.children?.length);
  const open = hasChildren && !item.disabled && openKeys.has(item.key);
  const submenuHidden = hiddenByAncestor || !open || Boolean(item.disabled);
  const tabIndex = hiddenByAncestor ? -1 : undefined;
  const inertProps = submenuHidden ? { inert: '' } : {};

  useEffect(() => {
    const element = submenuRef.current as (HTMLUListElement & { inert?: boolean }) | null;
    if (!element) return;

    const becameHidden = !wasSubmenuHidden.current && submenuHidden;
    if (!suppressFocusRestore && becameHidden && element.contains(document.activeElement)) {
      const restoreTarget = hiddenByAncestor
        ? ancestorTriggerRef?.current
        : triggerRef.current;
      restoreTarget?.focus();
    }
    wasSubmenuHidden.current = submenuHidden;

    // The attribute is the progressive-enhancement path; the property covers
    // browsers that implement inert but do not reflect it from markup.
    element.inert = submenuHidden;
    if (submenuHidden) element.setAttribute('inert', '');
    else element.removeAttribute('inert');
  }, [ancestorTriggerRef, hiddenByAncestor, submenuHidden, suppressFocusRestore]);

  const ariaCurrent = !hasChildren && item.current ? 'page' as const : undefined;
  const handleNavigate = (event: React.MouseEvent, navItem: NavCoreItem = item) => {
    adapter.onNavigate?.(event, navItem);
  };

  if (item.type === 'caption') {
    return (
      <li className="nxl-item nxl-caption">
        <span>{item.label}</span>
      </li>
    );
  }

  if (hasChildren) {
    const groupContent = (
      <>
        <ItemIcon icon={item.icon} />
        <ItemText label={item.label} />
        <SubmenuArrow />
      </>
    );

    return (
      <li className={`nxl-item nxl-hasmenu${item.disabled ? ' disabled' : ''}${item.active ? ' active' : ''}${open ? ' nxl-trigger' : ''}`}>
        {item.disabled ? (
          <span className="nxl-link" aria-disabled="true">
            {groupContent}
          </span>
        ) : (
          <button
            ref={triggerRef}
            type="button"
            className="nxl-link gcu-nav-group"
            aria-label={String(item.label)}
            aria-expanded={open}
            aria-controls={submenuId}
            tabIndex={tabIndex}
            onClick={() => onToggleGroup(item, parentKey)}
            onKeyDown={(event) => handleSubmenuKeyDown(
              event,
              open,
              nextOpen => {
                if (nextOpen !== open) onToggleGroup(item, parentKey);
              },
            )}
          >
            {groupContent}
          </button>
        )}
        <ul
          ref={submenuRef}
          id={submenuId}
          className={`nxl-submenu ${submenuVisibilityClass(open)}`}
          aria-hidden={submenuHidden}
          {...inertProps}
        >
          {item.children?.map(child => (
            <NavItemRow
              key={child.key}
              item={child}
              adapter={adapter}
              openKeys={openKeys}
              onToggleGroup={onToggleGroup}
              parentKey={item.key}
              hiddenByAncestor={submenuHidden}
              ancestorTriggerRef={item.disabled ? ancestorTriggerRef : triggerRef}
              suppressFocusRestore={suppressFocusRestore}
            />
          ))}
        </ul>
      </li>
    );
  }

  if (item.disabled) {
    return (
      <li className="nxl-item disabled">
        <span className="nxl-link" aria-disabled="true">
          <ItemIcon icon={item.icon} />
          <ItemText label={item.label} />
        </span>
      </li>
    );
  }

  if (item.href && item.href !== '#') {
    const link = adapter.renderLink({
      item,
      href: item.href,
      className: `nxl-link${item.active ? ' active' : ''}`,
      ariaLabel: String(item.label),
      ariaCurrent,
      tabIndex,
      onClick: event => handleNavigate(event, item),
      children: (
        <>
          <ItemIcon icon={item.icon} />
          <ItemText label={item.label} />
        </>
      ),
    });

    return <li className={`nxl-item${item.active ? ' active' : ''}`}>{link}</li>;
  }

  if (typeof item.action === 'function') {
    return (
      <li className="nxl-item">
        <button
          type="button"
          className="nxl-link gcu-nav-group"
          tabIndex={tabIndex}
          onClick={(event) => {
            item.action?.(event);
            adapter.onNavigate?.(event, item);
          }}
        >
          <ItemIcon icon={item.icon} />
          <ItemText label={item.label} />
        </button>
      </li>
    );
  }

  return (
    <li className="nxl-item disabled">
      <span className="nxl-link" aria-disabled="true">
        <ItemIcon icon={item.icon} />
        <ItemText label={item.label} />
      </span>
    </li>
  );
}

export function NavCore({
  brand,
  sections,
  adapter,
  mobileOpen = false,
  navigationId = 'navigation',
  promoCard,
}: NavCoreProps) {
  const mobileViewport = useMobileViewport();
  const mobileOffCanvas = mobileViewport === true && !mobileOpen;
  const navigationRef = useRef<HTMLElement>(null);
  const keyedSections = useMemo(
    () => assignStableSectionKeys(sections).map(section => ({
      ...section,
      items: assignStableKeys(section.items),
    })),
    [sections],
  );
  const currentKey = useMemo(
    () => findBestRouteKey(keyedSections, adapter.routeMode)
      ?? findLegacyCurrentKey(keyedSections, adapter.routeMode),
    [adapter.routeMode, keyedSections],
  );
  const resolvedSections = useMemo(
    () => keyedSections.map(section => ({
      ...section,
      items: resolveItems(section.items, adapter.routeMode, currentKey),
    })),
    [adapter.routeMode, currentKey, keyedSections],
  );
  const groupKeysByParent = useMemo(
    () => collectGroupKeysByParent(keyedSections),
    [keyedSections],
  );
  const allGroupKeys = useMemo(
    () => collectAllGroupKeys(keyedSections),
    [keyedSections],
  );
  const activeGroupKeys = useMemo(
    () => collectActiveGroupKeys(resolvedSections),
    [resolvedSections],
  );
  const activeGroupSignature = activeGroupKeys.join('|');
  const allGroupSignature = Array.from(allGroupKeys).join('|');
  const [openKeys, setOpenKeys] = useState<Set<string>>(
    () => new Set(activeGroupKeys),
  );

  useEffect(() => {
    setOpenKeys(previous => {
      const next = new Set<string>();
      previous.forEach(key => {
        if (allGroupKeys.has(key)) next.add(key);
      });
      activeGroupKeys.forEach(key => next.add(key));
      if (next.size === previous.size && Array.from(next).every(key => previous.has(key))) {
        return previous;
      }
      return next;
    });
  }, [activeGroupSignature, activeGroupKeys, allGroupKeys, allGroupSignature]);

  const onToggleGroup = (item: ResolvedNavCoreItem, parentKey: string) => {
    setOpenKeys(previous => {
      const next = new Set(previous);
      const isOpen = next.has(item.key);
      if (isOpen) {
        next.delete(item.key);
        // Descendant state should not become visible unexpectedly on reopen.
        Array.from(next).forEach(key => {
          if (key.startsWith(`${item.key}/`)) next.delete(key);
        });
        return next;
      }

      // Duralux disclosures are sibling-exclusive; nested ancestors stay open.
      (groupKeysByParent.get(parentKey) || []).forEach(key => next.delete(key));
      next.add(item.key);
      return next;
    });
  };

  useEffect(() => {
    const element = navigationRef.current as (HTMLElement & { inert?: boolean }) | null;
    if (!element) return;

    element.inert = mobileOffCanvas;
    if (mobileOffCanvas) element.setAttribute('inert', '');
    else element.removeAttribute('inert');

    if (mobileOffCanvas && element.contains(document.activeElement)) {
      (document.activeElement as HTMLElement).blur?.();
    }
  }, [mobileOffCanvas]);

  const brandItem: NavCoreItem | null = brand
    ? { key: 'brand', label: brand.alt || 'Inicio', href: brand.href, linkKind: adapter.brandLinkKind }
    : null;
  const navigationInertProps = mobileOffCanvas ? { inert: '' } : {};

  return (
    <nav
      ref={navigationRef}
      id={navigationId}
      className={`nxl-navigation${mobileOpen ? ' mob-navigation-active' : ''}`}
      aria-label="Navegación principal"
      aria-hidden={mobileOffCanvas ? true : undefined}
      {...navigationInertProps}
    >
      <div className="navbar-wrapper">
        {brand && brandItem && (
          <div className="m-header">
            {adapter.renderLink({
              item: brandItem,
              href: brand.href,
              className: 'b-brand',
              ariaLabel: brand.alt || 'Inicio',
              tabIndex: mobileOffCanvas ? -1 : undefined,
              onClick: event => adapter.onNavigate?.(event, brandItem),
              children: (
                <>
                  {brand.logoLg && (
                    <img
                      src={brand.logoLg}
                      alt=""
                      className="logo logo-lg"
                      style={{ height: 40, width: 'auto', objectFit: 'contain' }}
                    />
                  )}
                  {brand.logoSm && (
                    <img
                      src={brand.logoSm}
                      alt=""
                      className="logo logo-sm"
                      style={{ height: 36, width: 'auto', objectFit: 'contain' }}
                    />
                  )}
                </>
              ),
            })}
          </div>
        )}
        <div className="navbar-content">
          <ul className="nxl-navbar">
            {resolvedSections.map(section => (
              <React.Fragment key={section.key}>
                {section.caption && (
                  <li className="nxl-item nxl-caption">
                    <span>{section.caption}</span>
                  </li>
                )}
                {section.items.map(item => (
                  <NavItemRow
                    key={item.key}
                    item={item}
                    adapter={adapter}
                    openKeys={openKeys}
                    onToggleGroup={onToggleGroup}
                    parentKey=""
                    hiddenByAncestor={mobileOffCanvas}
                    suppressFocusRestore={mobileOffCanvas}
                  />
                ))}
              </React.Fragment>
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
  );
}
