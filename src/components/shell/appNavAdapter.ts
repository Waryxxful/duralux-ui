import type { AppNavItem } from '../../contract';
import { navigationIconName } from './navigationCore';

export interface AdaptedAppNavItem {
  label: string;
  /** Icon names are normalized for the package's `<Icon name="…" />` API. */
  icon: string;
  /** Gateway href; also usable as a normal anchor href. */
  href?: string;
  /** React Router alias for the standalone Sidebar adapter. */
  to?: string;
  children?: AdaptedAppNavItem[];
}

export interface AppNavAdapterOptions {
  /** Prefix owned by the active app in the gateway, e.g. `/callreviews`. */
  routePrefix?: string;
  /** Current GranCRM role. Filtering is presentational, never authorization. */
  role?: string | null;
}

function normalizePrefix(routePrefix: string | undefined): string {
  const value = String(routePrefix || '').trim();
  if (!value || value === '/') return '/';
  const candidate = `/${value.replace(/^\/+|\/+$/g, '')}`;
  const canonical = canonicalPath(candidate);
  return canonical && canonical !== '/' ? canonical : '/';
}

function splitInner(inner: string): { path: string; suffix: string } {
  const marker = inner.search(/[?#]/);
  if (marker < 0) return { path: inner, suffix: '' };
  return { path: inner.slice(0, marker), suffix: inner.slice(marker) };
}

const NAVIGATION_ORIGIN = 'https://duralux-navigation.invalid';

function hasTraversalSegment(path: string): boolean {
  return path.split('/').some(segment => segment === '..' || segment === '.');
}

/**
 * Validate the path before URL() gets a chance to normalize it. URL() quite
 * correctly resolves dot segments, but doing that first would let an encoded
 * `..` escape the app prefix. Repeated decoding catches double-encoded input
 * as well; encoded slash/backslash is rejected because it changes path
 * segmentation in downstream servers.
 */
function isSafeInnerPath(path: string): boolean {
  if (!path.startsWith('/') || path.startsWith('//') || path.includes('\\')) return false;
  if (hasTraversalSegment(path) || /%(?![0-9a-f]{2})/i.test(path)) return false;

  let decoded = path;
  for (let pass = 0; pass < 5; pass += 1) {
    if (/%(?:2f|5c)/i.test(decoded)) return false;

    let next: string;
    try {
      next = decodeURIComponent(decoded);
    } catch {
      return false;
    }

    if (hasTraversalSegment(next) || next.includes('\\')) return false;
    if (next === decoded || !/%[0-9a-f]{2}/i.test(next)) break;
    decoded = next;
  }

  return true;
}

function canonicalPath(path: string): string | null {
  if (!isSafeInnerPath(path)) return null;

  try {
    const url = new URL(path, NAVIGATION_ORIGIN);
    if (url.origin !== NAVIGATION_ORIGIN || !url.pathname.startsWith('/')) return null;
    return url.pathname;
  } catch {
    return null;
  }
}

function isValidSuffix(suffix: string): boolean {
  if (!suffix) return true;
  try {
    // Query/hash are opaque to the shell, but malformed percent escapes are
    // still rejected instead of being handed to browser URL normalization.
    decodeURIComponent(suffix);
    return true;
  } catch {
    return false;
  }
}

/**
 * Translate an app-declared `inner` path to a same-origin gateway path.
 *
 * A manifest item is untrusted presentation data. This function only creates
 * a navigation target under `routePrefix`; it does not grant or enforce
 * authorization. Backend routes remain responsible for access control.
 */
export function appNavHref(inner: string | undefined, routePrefix = ''): string {
  const prefix = normalizePrefix(routePrefix);
  const value = String(inner || '').trim();
  if (!value) return prefix;

  const { path, suffix } = splitInner(value);
  if (!isValidSuffix(suffix)) return prefix;

  const safePath = canonicalPath(path);
  if (!safePath) return prefix;

  const candidatePath = safePath === '/'
    ? prefix
    : prefix === '/' || safePath === prefix || safePath.startsWith(`${prefix}/`)
      ? safePath
      : `${prefix}/${safePath.replace(/^\/+/, '')}`;

  try {
    const url = new URL(`${candidatePath}${suffix}`, NAVIGATION_ORIGIN);
    if (url.origin !== NAVIGATION_ORIGIN) return prefix;

    // This final check protects the same-origin canonicalization seam if URL
    // behaviour ever changes around dot segments or escaped separators.
    const pathWithinPrefix = prefix === '/'
      || url.pathname === prefix
      || url.pathname.startsWith(`${prefix}/`);
    return pathWithinPrefix ? `${url.pathname}${url.search}${url.hash}` : prefix;
  } catch {
    return prefix;
  }
}

function canDisplay(item: AppNavItem, role: string | null | undefined): boolean {
  // Role filtering hides presentation only. It is intentionally not an
  // authorization check; the server must still protect every destination.
  return !item.roles || role == null || item.roles.includes(role);
}

function adaptItem(item: AppNavItem, options: Required<Pick<AppNavAdapterOptions, 'routePrefix'>> & AppNavAdapterOptions): AdaptedAppNavItem | null {
  if (!canDisplay(item, options.role)) return null;

  const children = item.children
    ?.map(child => adaptItem(child, options))
    .filter((child): child is AdaptedAppNavItem => child !== null);
  const hasChildren = Boolean(children?.length);
  const href = hasChildren && !item.inner
    ? undefined
    : appNavHref(item.inner, options.routePrefix);

  // A group whose children were all filtered is not useful as an empty
  // disclosure. Leaf items without `inner` intentionally fall back to the app
  // root, preserving the shell's legacy behavior.
  if (item.children?.length && !hasChildren && !item.inner) return null;

  return {
    label: item.label,
    icon: navigationIconName(item.icon),
    ...(href ? { href, to: href } : {}),
    ...(hasChildren ? { children } : {}),
  };
}

/**
 * Official AppNavItem adapter for both shell anchors and standalone Router
 * links. The returned tree deliberately carries `href` and `to` aliases so
 * each renderer can keep its public navigation API without a passthrough
 * wrapper or a Router dependency in `ShellNav`.
 */
export function adaptAppNavItems(
  items: AppNavItem[] = [],
  options: AppNavAdapterOptions = {},
): AdaptedAppNavItem[] {
  const resolvedOptions = {
    routePrefix: options.routePrefix || '/',
    role: options.role,
  };

  return items
    .map(item => adaptItem(item, resolvedOptions))
    .filter((item): item is AdaptedAppNavItem => item !== null);
}
