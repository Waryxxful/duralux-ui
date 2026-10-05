import React from 'react';
import { isFiniteNumber, isString } from '../../utils/typeGuards';

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
  /** Fixed mark (never clipped). Pair with `logoWord` for a Terafab-style lockup. */
  logoMark?: string;
  /** Wordmark inside an overflow track that collapses on `html.minimenu`. */
  logoWord?: string;
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

export function pathOnly(value: string | undefined | null): string | null {
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

export interface KeyedNavCoreItem extends NavCoreItem {
  key: string;
  children?: KeyedNavCoreItem[];
}

export interface ResolvedNavCoreItem extends KeyedNavCoreItem {
  active: boolean;
  current: boolean;
  children?: ResolvedNavCoreItem[];
}

export function identityFor(item: NavCoreItem): string {
  const identity = item.key ?? item.href ?? item.label ?? item.type ?? 'item';
  return String(identity).trim() || 'item';
}

/**
 * Keys are based on caller identity plus sibling occurrence, not on render
 * position. That keeps duplicate labels/destinations independent and gives
 * disclosure state a stable identity during normal list updates.
 */
export function assignStableKeys(items: NavCoreItem[], parentKey = ''): KeyedNavCoreItem[] {
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

export function assignStableSectionKeys(sections: NavCoreSection[]): (NavCoreSection & { key: string })[] {
  const occurrences = new Map<string, number>();
  return sections.map((section) => {
    const base = section.key ?? section.caption ?? 'section';
    const occurrence = (occurrences.get(base) || 0) + 1;
    occurrences.set(base, occurrence);
    return { ...section, key: `section:${String(base)}~${occurrence}` };
  });
}

export function visitItems(
  items: KeyedNavCoreItem[],
  callback: (item: KeyedNavCoreItem) => void,
): void {
  items.forEach((item) => {
    callback(item);
    if (item.children?.length) visitItems(item.children, callback);
  });
}

export function findBestRouteKey(
  sections: (NavCoreSection & { key: string; items: KeyedNavCoreItem[] })[],
  routeMode: boolean,
): string | null {
  if (!routeMode) return null;
  let bestScore = -1;
  let bestKey: string | null = null;
  sections.forEach(section => visitItems(section.items, item => {
    if (item.children?.length || item.disabled) return;
    const score = isFiniteNumber(item.routeScore) ? item.routeScore : -1;
    if (score >= 0 && score > bestScore) {
      bestScore = score;
      bestKey = item.key;
    }
  }));
  return bestKey;
}

export function findLegacyCurrentKey(
  sections: (NavCoreSection & { key: string; items: KeyedNavCoreItem[] })[],
  routeMode: boolean,
): string | null {
  if (routeMode) return null;
  let currentKey: string | null = null;
  sections.forEach(section => visitItems(section.items, item => {
    if (!currentKey && item.active && !item.children?.length && !item.disabled) {
      currentKey = item.key;
    }
  }));
  return currentKey;
}

export function resolveItem(item: KeyedNavCoreItem, currentKey: string | null): ResolvedNavCoreItem {
  const { children: itemChildren, ...rest } = item;
  const children = itemChildren?.map(child => resolveItem(child, currentKey));
  const isCurrent = Boolean(currentKey && item.key === currentKey);
  const hasActiveChild = Boolean(children?.some(child => child.active));
  const active = Boolean(isCurrent || hasActiveChild || (!currentKey && item.active));

  const result: ResolvedNavCoreItem = {
    ...rest,
    current: isCurrent,
    active,
  };
  if (children) {
    result.children = children;
  }
  return result;
}

export interface KeyedNavCoreSection extends Omit<NavCoreSection, 'items'> {
  key: string;
  items: KeyedNavCoreItem[];
}

export interface ResolvedNavCoreSection extends Omit<NavCoreSection, 'items'> {
  key: string;
  items: ResolvedNavCoreItem[];
}

export function resolveSections(
  sections: KeyedNavCoreSection[],
  currentKey: string | null,
): ResolvedNavCoreSection[] {
  return sections.map(section => ({
    ...section,
    items: section.items.map(item => resolveItem(item, currentKey)),
  }));
}

export function collectAllGroupKeys(sections: KeyedNavCoreSection[]): Set<string> {
  const keys = new Set<string>();
  sections.forEach(section => visitItems(section.items, item => {
    if (item.children?.length) keys.add(item.key);
  }));
  return keys;
}

export function collectActiveGroupKeys(sections: ResolvedNavCoreSection[]): string[] {
  const keys: string[] = [];
  sections.forEach(section => {
    const walk = (items: ResolvedNavCoreItem[]) => {
      items.forEach(item => {
        if (item.children?.length) {
          if (item.active) keys.push(item.key);
          walk(item.children);
        }
      });
    };
    walk(section.items);
  });
  return keys;
}

export function buildGroupKeysByParent(sections: (NavCoreSection & { key: string; items: KeyedNavCoreItem[] })[]): Map<string, string[]> {
  const map = new Map<string, string[]>();
  sections.forEach(section => {
    const rootGroups = section.items.flatMap(item => (item.children?.length ? [item.key] : []));
    map.set(section.key, rootGroups);

    const walk = (items: KeyedNavCoreItem[]) => {
      items.forEach(item => {
        if (item.children?.length) {
          const childGroups = item.children.flatMap(child => (child.children?.length ? [child.key] : []));
          map.set(item.key, childGroups);
          walk(item.children);
        }
      });
    };
    walk(section.items);
  });
  return map;
}
