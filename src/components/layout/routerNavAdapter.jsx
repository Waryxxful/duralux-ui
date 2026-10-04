import { Link, matchPath } from 'react-router-dom'
import { safeHref } from '../../utils/safeHref'

// Adaptador de react-router para NavCore. Vive fuera de Sidebar.jsx para que ese archivo exporte
// solo componentes (fast refresh, DX-021).

import { isFunction } from '../../utils/typeGuards'

function routerRouteScore(item, pathname) {
  if (!item.to || item.to === '#') return -1

  try {
    const end = item.end ?? (item.to === '/')
    return matchPath({ path: item.to, end }, pathname) ? item.to.length : -1
  } catch {
    return -1
  }
}

function routerNavItem(item, pathname) {
  const hasRouterDestination = Boolean(item.to && item.to !== '#')
  const hasAnchorDestination = Boolean(!hasRouterDestination && item.href && item.href !== '#')
  const destination = hasRouterDestination
    ? item.to
    : hasAnchorDestination
      ? safeHref(item.href)
      : undefined

  return {
    key: item.key ?? item.id ?? item.to ?? item.href ?? item.label ?? item.type ?? 'item',
    label: item.label,
    icon: item.icon,
    href: destination,
    linkKind: hasRouterDestination ? 'router' : 'anchor',
    routeScore: routerRouteScore(item, pathname),
    action: isFunction(item.onClick) ? item.onClick : undefined,
    disabled: item.disabled,
    type: item.type === 'caption' ? 'caption' : 'item',
    children: item.children?.length
      ? item.children.map(child => routerNavItem(child, pathname))
      : item.children,
  }
}

/**
 * createRouterNav is the only place where Sidebar knows react-router. It turns
 * the legacy item shape into NavCore's small navigation seam; it does not
 * render rows or own disclosure state.
 */
export function createRouterNav({ navItems, pathname, onNavigate }) {
  return {
    sections: [{ items: navItems.map(item => routerNavItem(item, pathname)) }],
    adapter: {
      routeMode: true,
      brandLinkKind: 'router',
      renderLink: ({ item, href, className, ariaLabel, ariaCurrent, tabIndex, onClick, children }) => {
        const props = {
          className,
          'aria-label': ariaLabel,
          'aria-current': ariaCurrent,
          tabIndex,
          onClick,
        }

        return item.linkKind === 'router'
          ? <Link to={href} {...props}>{children}</Link>
          : <a href={href} {...props}>{children}</a>
      },
      onNavigate: (event) => onNavigate?.(event),
    },
  }
}
