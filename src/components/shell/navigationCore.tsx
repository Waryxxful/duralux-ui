import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Icon } from '../ui/Icon';
import {
  assignStableKeys,
  assignStableSectionKeys,
  collectActiveGroupKeys,
  collectAllGroupKeys,
  findBestRouteKey,
  findLegacyCurrentKey,
  handleSubmenuKeyDown,
  KeyedNavCoreItem,
  NavCoreAdapter,
  NavCoreBrand,
  NavCoreItem,
  NavCoreProps,
  NavCoreSection,
  navigationIconClass,
  navigationIconName,
  ResolvedNavCoreItem,
  submenuVisibilityClass,
} from './navigationModel';
import { isBoolean, isFiniteNumber } from '../../utils/typeGuards';

const MOBILE_NAV_MEDIA_QUERY = '(max-width: 1024px)';

function useMobileViewport(): boolean | null {
  // Keep the first client render identical to SSR; the viewport is a
  // progressive enhancement once effects are allowed to run.
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    if (!globalThis.window?.matchMedia) return undefined;

    const mediaQuery = window.matchMedia(MOBILE_NAV_MEDIA_QUERY);
    const update = (event?: MediaQueryListEvent) => {
      setIsMobile(isBoolean(event?.matches) ? event.matches : mediaQuery.matches);
    };

    update();
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', update);
      return () => mediaQuery.removeEventListener('change', update);
    }

    mediaQuery.addListener?.(update);
    return () => mediaQuery.removeListener?.(update);
  }, []);

  return isMobile;
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
      && isFiniteNumber(item.routeScore)
      && item.key === currentKey;
    const active = item.disabled
      ? false
      : routeMode
        ? ownRouteActive || childActive
        : Boolean(item.active) || childActive;

    const result: ResolvedNavCoreItem = {
      ...itemWithoutChildren,
      active,
      current: !item.disabled && !hasChildren && item.key === currentKey,
    };
    if (children) {
      result.children = children;
    }
    return result;
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

  useEffect(() => {
    const element = submenuRef.current;
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
    // SAFETY: element is an HTMLUListElement which supports the DOM inert property.
    (element as HTMLElement & { inert?: boolean }).inert = submenuHidden;
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
            onKeyDown={event => handleSubmenuKeyDown(event, open, nextOpen => {
              if (nextOpen !== open) onToggleGroup(item, parentKey);
            })}
          >
            {groupContent}
          </button>
        )}

        <ul
          ref={submenuRef}
          id={submenuId}
          className={`nxl-submenu ${submenuVisibilityClass(open)}`}
          aria-hidden={submenuHidden ? 'true' : 'false'}
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
              ancestorTriggerRef={triggerRef}
              suppressFocusRestore={suppressFocusRestore}
            />
          ))}
        </ul>
      </li>
    );
  }

  const linkContent = (
    <>
      <ItemIcon icon={item.icon} />
      <ItemText label={item.label} />
    </>
  );

  if (item.disabled) {
    return (
      <li className="nxl-item disabled">
        <span className="nxl-link" aria-disabled="true">
          {linkContent}
        </span>
      </li>
    );
  }

  if (item.action) {
    return (
      <li className={`nxl-item${item.active ? ' active' : ''}`}>
        <button
          type="button"
          className="nxl-link gcu-nav-action"
          tabIndex={tabIndex}
          aria-current={ariaCurrent}
          onClick={(event) => {
            item.action?.(event);
            handleNavigate(event);
          }}
        >
          {linkContent}
        </button>
      </li>
    );
  }

  if (!item.href) {
    return (
      <li className={`nxl-item${item.active ? ' active' : ''}`}>
        <span className="nxl-link" tabIndex={tabIndex} aria-current={ariaCurrent}>
          {linkContent}
        </span>
      </li>
    );
  }

  const renderedLink = adapter.renderLink({
    item,
    href: item.href,
    className: `nxl-link${item.active ? ' active' : ''}`,
    ariaLabel: String(item.label),
    ariaCurrent,
    tabIndex,
    onClick: handleNavigate,
    children: linkContent,
  });

  return <li className={`nxl-item${item.active ? ' active' : ''}`}>{renderedLink}</li>;
}

function NavBrand({
  brand,
  adapter,
  mobileOffCanvas,
}: {
  brand: NavCoreBrand;
  adapter: NavCoreAdapter;
  mobileOffCanvas: boolean;
}) {
  const brandItem: NavCoreItem = {
    key: 'brand',
    label: brand.alt || 'Inicio',
    href: brand.href,
    linkKind: adapter.brandLinkKind,
  };

  return (
    <div className="m-header">
      {adapter.renderLink({
        item: brandItem,
        href: brand.href,
        className: 'b-brand',
        ariaLabel: brand.alt || 'Inicio',
        tabIndex: mobileOffCanvas ? -1 : undefined,
        onClick: (event) => adapter.onNavigate?.(event, brandItem),
        children: brand.logoMark && brand.logoWord ? (
          <>
            <img src={brand.logoMark} alt="" className="logo logo-mark" />
            <span className="b-brand-rest-track">
              <img src={brand.logoWord} alt="" className="logo logo-word" />
            </span>
          </>
        ) : (
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
  );
}

/**
 * Common sidebar/navigation shell used by Duralux.
 *
 * Responsibilities:
 * - Deterministic, collision-free key generation for disclosure state.
 * - Single-path route matching so only the deepest leaf gets active status.
 * - Sibling-exclusive submenu disclosures.
 * - Keyboard navigation (ArrowRight / ArrowLeft / Escape).
 * - Full inert/aria-hidden trapping when collapsed or hidden off-canvas.
 */
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
    const element = navigationRef.current;
    if (!element) return;

    // SAFETY: element is an HTMLElement which supports the DOM inert property.
    (element as HTMLElement & { inert?: boolean }).inert = mobileOffCanvas;
    if (mobileOffCanvas) element.setAttribute('inert', '');
    else element.removeAttribute('inert');

    if (mobileOffCanvas && element.contains(document.activeElement)) {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    }
  }, [mobileOffCanvas]);

  return (
    <nav
      ref={navigationRef}
      id={navigationId}
      className={`nxl-navigation${mobileOpen ? ' mob-navigation-active' : ''}`}
      aria-label="Navegación principal"
      aria-hidden={mobileOffCanvas ? 'true' : undefined}
      {...(mobileOffCanvas ? { inert: '' } : {})}
    >
      <div className="navbar-wrapper">
        {brand ? (
          <NavBrand
            brand={brand}
            adapter={adapter}
            mobileOffCanvas={mobileOffCanvas}
          />
        ) : null}

        <div className="navbar-content">
          <ul className="nxl-navbar">
            {resolvedSections.map(section => (
              <React.Fragment key={section.key}>
                {section.caption ? (
                  <li className="nxl-item nxl-caption">
                    <span>{section.caption}</span>
                  </li>
                ) : null}
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
          {promoCard ? (
            <div className="card text-center">
              <div className="card-body">{promoCard}</div>
            </div>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
