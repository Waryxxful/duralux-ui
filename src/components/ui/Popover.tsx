import * as RadixPopover from '@radix-ui/react-popover';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

/**
 * Popover posicionado (flip/shift/portal) sobre `@radix-ui/react-popover` —
 * a diferencia de `Dropdown` (posicionamiento vía clases Bootstrap, sin
 * colisión con los bordes del viewport), este primitivo cubre casos donde
 * el contenido debe anclarse a cualquier elemento y evitar recortes
 * (base de Combobox/DatePicker). Reusa `.popover`/`.popover-body` que
 * Bootstrap ya trae en el theme (`scss/bootstrap/_popover.scss`) — el
 * posicionamiento (incluido el arrow) lo resuelve Radix/floating-ui solo,
 * vía `@radix-ui/react-popper`, sin necesidad de las clases `.bs-popover-*`
 * ni `[data-popper-placement]` que usa el JS de Bootstrap. Único CSS nuevo:
 * `themes/components/popover.scss` le da `fill` al arrow (un
 * `<svg><polygon>`, no el triángulo de bordes de Bootstrap — sin `fill`
 * se pinta negro por defecto).
 */
export const Popover = RadixPopover.Root;
export const PopoverTrigger = RadixPopover.Trigger;
export const PopoverAnchor = RadixPopover.Anchor;

export interface PopoverContentProps
  extends Omit<ComponentPropsWithoutRef<typeof RadixPopover.Content>, 'children'> {
  children: ReactNode;
}

export function PopoverContent({
  className,
  sideOffset = 8,
  children,
  ...props
}: PopoverContentProps) {
  return (
    <RadixPopover.Portal>
      <RadixPopover.Content
        sideOffset={sideOffset}
        className={['popover', className].filter(Boolean).join(' ')}
        {...props}
      >
        <div className="popover-body">{children}</div>
        <RadixPopover.Arrow className="popover-arrow" width={11} height={5} />
      </RadixPopover.Content>
    </RadixPopover.Portal>
  );
}
