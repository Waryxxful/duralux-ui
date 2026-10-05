import type { MouseEvent } from 'react';
import { NavCore } from './navigationCore';
import { createGatewayNav } from './gatewayNavAdapter';

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


export function ShellNav({
  brand,
  sections,
  onNavigate,
  pathname,
  mobileOpen = false,
  navigationId = 'shell-navigation',
}: ShellNavProps) {
  const gateway = createGatewayNav({ sections, pathname, onNavigate });

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
