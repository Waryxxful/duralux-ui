import type { ShellNavItem, ShellNavProps, ShellNavSection } from './ShellNav';
import { navigationPathScore } from './navigationModel';
import { isString } from '../../utils/typeGuards';
import { safeHref } from '../../utils/safeHref';

// Adaptador del gateway para NavCore. Vive fuera de ShellNav.tsx para que ese archivo exporte
// solo componentes (fast refresh, DX-021).

function gatewayNavItem(item: ShellNavItem, pathname: string | undefined) {
  const href = item.href && item.href !== '#' ? safeHref(item.href) : undefined;
  return {
    key: item.key ?? item.id ?? item.href ?? item.label ?? 'item',
    label: item.label,
    icon: item.icon,
    href,
    linkKind: 'anchor' as const,
    routeScore: href ? navigationPathScore(href, pathname) : -1,
    active: item.active,
    disabled: item.disabled,
    action: item.action,
    children: item.children?.length
      ? item.children.map(child => gatewayNavItem(child, pathname))
      : item.children,
  };
}

/**
 * createGatewayNav owns only gateway semantics: anchors, pathname prefix
 * matching, and the public `(href, event)` callback. React Router is kept out
 * of this module and therefore out of gateway bundles.
 */
export function createGatewayNav({ sections, pathname, onNavigate }: {
  sections: ShellNavSection[];
  pathname?: string;
  onNavigate: ShellNavProps['onNavigate'];
}) {
  return {
    sections: sections.map(section => ({
      key: section.key,
      caption: section.caption,
      items: section.items.map(item => gatewayNavItem(item, pathname)),
    })),
    adapter: {
      routeMode: isString(pathname),
      brandLinkKind: 'anchor' as const,
      renderLink: ({ item, href, className, ariaLabel, ariaCurrent, tabIndex, onClick, children }) => (
        <a
          href={href}
          className={className}
          aria-label={ariaLabel}
          aria-current={ariaCurrent}
          tabIndex={tabIndex}
          onClick={onClick}
        >
          {children}
        </a>
      ),
      onNavigate: (event, item) => {
        if (item.href) onNavigate(item.href, event);
      },
    },
  };
}
