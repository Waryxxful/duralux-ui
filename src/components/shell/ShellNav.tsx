import type { MouseEvent } from 'react';
import { NavCore, navigationPathScore } from './navigationCore';

// ─── ShellNav Props ───────────────────────────────────────────────────────────

export interface ShellNavBrand {
  href: string;
  logoLg: string;
  logoSm: string;
  alt: string;
  logoMark?: string;
  logoWord?: string;
}

// `href`/`active` remain the gateway API. `pathname` on ShellNav is optional:
// when supplied, route matching is the source of truth; without it, the
// legacy `active` flags remain supported for consumers that already resolve
// routes outside this package.
export interface ShellNavItem {
  key?: string;
  id?: string;
  label: string;
  icon: string;
  href?: string;
  active?: boolean;
  disabled?: boolean;
  action?: (event: MouseEvent<HTMLButtonElement>) => void;
  children?: ShellNavItem[];
}

export interface ShellNavSection {
  key?: string;
  caption?: string;
  items: ShellNavItem[];
}

export interface ShellNavProps {
  brand: ShellNavBrand;
  sections: ShellNavSection[];
  onNavigate: (href: string, e: MouseEvent) => void;
  /** Current gateway pathname; ShellNav intentionally does not import Router. */
  pathname?: string;
  /** En móvil desliza el sidebar: clase Duralux .mob-navigation-active sobre el <nav>. */
  mobileOpen?: boolean;
  /** ID shared with ShellHeader's `aria-controls`. */
  navigationId?: string;
}

function gatewayNavItem(item: ShellNavItem, pathname: string | undefined) {
  const href = item.href && item.href !== '#' ? item.href : undefined;
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
 * GatewayAdapter owns only gateway semantics: anchors, pathname prefix
 * matching, and the public `(href, event)` callback. React Router is kept out
 * of this module and therefore out of gateway bundles.
 */
export function GatewayAdapter({ sections, pathname, onNavigate }: {
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
      routeMode: typeof pathname === 'string',
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

export function ShellNav({
  brand,
  sections,
  onNavigate,
  pathname,
  mobileOpen = false,
  navigationId = 'shell-navigation',
}: ShellNavProps) {
  const gateway = GatewayAdapter({ sections, pathname, onNavigate });

  return (
    <NavCore
      brand={brand}
      sections={gateway.sections}
      adapter={gateway.adapter}
      mobileOpen={mobileOpen}
      navigationId={navigationId}
    />
  );
}
