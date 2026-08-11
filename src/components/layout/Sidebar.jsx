import { Link, matchPath, useLocation } from 'react-router-dom'
import { NavCore } from '../shell/navigationCore'

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
      ? item.href
      : undefined

  return {
    key: item.key ?? item.id ?? item.to ?? item.href ?? item.label ?? item.type ?? 'item',
    label: item.label,
    icon: item.icon,
    href: destination,
    linkKind: hasRouterDestination ? 'router' : 'anchor',
    routeScore: routerRouteScore(item, pathname),
    action: typeof item.onClick === 'function' ? item.onClick : undefined,
    disabled: item.disabled,
    type: item.type === 'caption' ? 'caption' : 'item',
    children: item.children?.length
      ? item.children.map(child => routerNavItem(child, pathname))
      : item.children,
  }
}

/**
 * RouterAdapter is the only place where Sidebar knows react-router. It turns
 * the legacy item shape into NavCore's small navigation seam; it does not
 * render rows or own disclosure state.
 */
export function RouterAdapter({ navItems, pathname, onNavigate }) {
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

export function Sidebar({
  navItems = [],
  logo,
  logoAbbr,
  promoCard,
  mobileOpen = false,
  onNavigate,
  navigationId = 'duralux-sidebar',
}) {
  const { pathname } = useLocation()
  const router = RouterAdapter({ navItems, pathname, onNavigate })

  return (
    <NavCore
      brand={{
        href: '/',
        logoLg: logo,
        logoSm: logoAbbr,
        alt: 'Logo',
      }}
      sections={router.sections}
      adapter={router.adapter}
      mobileOpen={mobileOpen}
      navigationId={navigationId}
      promoCard={promoCard}
    />
  )
}
