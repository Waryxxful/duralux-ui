import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import type {
  ButtonHTMLAttributes,
  ElementType,
  HTMLAttributes,
  MouseEvent as ReactMouseEvent,
  ReactElement,
  ReactNode,
  RefCallback,
} from 'react';
import { registerDismissableLayer } from '../../utils/dismissableLayer';

export type DropdownAlignment = 'start' | 'end';

export type DropdownTriggerProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  ref: RefCallback<HTMLButtonElement>;
  'aria-controls': string;
  'aria-expanded': boolean;
};

export interface DropdownState {
  open: boolean;
}

export interface DropdownProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  children: ReactNode;
  trigger: (props: DropdownTriggerProps, state: DropdownState) => ReactElement;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  align?: DropdownAlignment;
  desktopHover?: boolean;
  menuId?: string;
}

export interface DropdownMenuProps extends Omit<HTMLAttributes<HTMLElement>, 'id'> {
  as?: ElementType;
  closeOnSelect?: boolean;
}

interface DropdownContextValue {
  align: DropdownAlignment;
  close: (restoreFocus?: boolean) => void;
  menuId: string;
  open: boolean;
  triggerId: string;
}

const DropdownContext = createContext<DropdownContextValue | null>(null);

export function Dropdown({
  align = 'start',
  children,
  className = 'dropdown',
  defaultOpen = false,
  desktopHover = false,
  menuId,
  onMouseEnter,
  onMouseLeave,
  onOpenChange,
  open: controlledOpen,
  trigger,
  ...rootProps
}: DropdownProps) {
  const reactId = useId();
  const resolvedMenuId = menuId ?? `dropdown-${reactId.replace(/:/g, '')}`;
  const triggerId = `${resolvedMenuId}-trigger`;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const openedByHoverRef = useRef(false);
  const controlledOpenRef = useRef(controlledOpen);
  const onOpenChangeRef = useRef(onOpenChange);
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open = controlledOpen ?? uncontrolledOpen;

  function setOpen(nextOpen: boolean) {
    if (nextOpen === open) return;
    if (controlledOpen === undefined) setUncontrolledOpen(nextOpen);
    onOpenChange?.(nextOpen);
  }

  useEffect(() => {
    controlledOpenRef.current = controlledOpen;
    onOpenChangeRef.current = onOpenChange;
  }, [controlledOpen, onOpenChange]);

  useEffect(() => {
    if (!open) return undefined;

    const close = () => {
      if (controlledOpen === undefined) setUncontrolledOpen(false);
      onOpenChange?.(false);
    };
    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close();
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [controlledOpen, onOpenChange, open]);

  useEffect(() => {
    if (!open) return undefined;

    return registerDismissableLayer({
      element: rootRef.current,
      onEscape: () => {
        if (controlledOpenRef.current === undefined) setUncontrolledOpen(false);
        onOpenChangeRef.current?.(false);
        triggerRef.current?.focus();
      },
    });
  }, [open]);

  const context: DropdownContextValue = {
    align,
    close: (restoreFocus = false) => {
      setOpen(false);
      if (restoreFocus) triggerRef.current?.focus();
    },
    menuId: resolvedMenuId,
    open,
    triggerId,
  };
  const triggerProps: DropdownTriggerProps = {
    ref: (node) => {
      triggerRef.current = node;
    },
    id: triggerId,
    type: 'button',
    'aria-controls': resolvedMenuId,
    'aria-expanded': open,
    onClick: (event) => {
      if (desktopHover && openedByHoverRef.current && event.detail > 0) {
        openedByHoverRef.current = false;
        return;
      }

      openedByHoverRef.current = false;
      setOpen(!open);
    },
  };

  return (
    <DropdownContext.Provider value={context}>
      <div
        {...rootProps}
        ref={rootRef}
        className={className}
        onMouseEnter={(event) => {
          onMouseEnter?.(event);
          if (desktopHover && !event.defaultPrevented) {
            if (!open) openedByHoverRef.current = true;
            setOpen(true);
          }
        }}
        onMouseLeave={(event) => {
          onMouseLeave?.(event);
          if (desktopHover && !event.defaultPrevented) {
            openedByHoverRef.current = false;
            setOpen(false);
          }
        }}
      >
        {trigger(triggerProps, { open })}
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

export function DropdownMenu({
  as: Component = 'div',
  children,
  className,
  closeOnSelect = true,
  onClick,
  ...menuProps
}: DropdownMenuProps) {
  const context = useContext(DropdownContext);
  if (!context) throw new Error('DropdownMenu must be rendered inside Dropdown');

  const { align, close, menuId, open, triggerId } = context;

  function handleClick(event: ReactMouseEvent<HTMLElement>) {
    onClick?.(event);
    if (!closeOnSelect) return;

    const target = event.target;
    if (!(target instanceof Element) || target.closest('[data-dropdown-keep-open]')) return;
    const item = target.closest(
      'button:not([disabled]), a[href], [role="menuitem"]:not([aria-disabled="true"]), [data-dropdown-item]',
    );
    if (item && event.currentTarget.contains(item)) close(true);
  }

  return (
    <Component
      {...menuProps}
      id={menuId}
      className={[
        'dropdown-menu',
        align === 'end' ? 'dropdown-menu-end' : '',
        className,
        open ? 'show' : '',
      ].filter(Boolean).join(' ')}
      aria-hidden={open ? undefined : true}
      aria-labelledby={triggerId}
      onClick={handleClick}
    >
      {children}
    </Component>
  );
}
