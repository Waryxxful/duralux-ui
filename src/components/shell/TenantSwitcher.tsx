import { forwardRef } from 'react';
import { Icon } from '../ui/Icon';
import { Dropdown, DropdownMenu } from '../ui/Dropdown';
import { useControllableOpen, useDesktopHover } from './internal/useDesktopHover';

export interface TenantSwitcherProps {
  /** true cuando un admin SA está viendo la cuenta de un cliente. */
  viewAsSa: boolean;
  cuentaNombre: string | null;
  cuentas: { slug: string; nombre: string }[];
  onSelectCuenta: (slug: string) => void;
  onVolverSa: () => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  desktopHover?: boolean;
  className?: string;
}

/**
 * TenantSwitcher — selector de cliente (cuenta) para administradores SA.
 *
 * - Disclosure con `Dropdown`: Esc y clic fuera cierran; el foco vuelve al disparador.
 * - Viendo como cliente, el disparador se tiñe de advertencia y nombra la cuenta actual;
 *   la cuenta actual se marca con un check y «Volver al Panel SA» sale del modo.
 * - El ref apunta al contenedor del dropdown.
 */
export const TenantSwitcher = /* @__PURE__ */ forwardRef<HTMLDivElement, TenantSwitcherProps>(function TenantSwitcher({
  viewAsSa,
  cuentaNombre,
  cuentas,
  onSelectCuenta,
  onVolverSa,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  desktopHover: desktopHoverProp,
  className = 'dropdown nxl-h-item',
}, ref) {
  const [open, setOpen] = useControllableOpen(openProp, defaultOpen, onOpenChange);
  const desktopHover = useDesktopHover(desktopHoverProp);
  const inertProps = open ? {} : { inert: '' };

  return (
    <Dropdown
      ref={ref}
      className={className}
      desktopHover={desktopHover}
      open={open}
      onOpenChange={setOpen}
      trigger={(triggerProps, state) => (
        <button
          {...triggerProps}
          className={`btn border px-3 py-2 fw-semibold fs-12 d-flex align-items-center gap-2 ${
            viewAsSa ? 'text-warning border-warning bg-warning-subtle' : 'text-dark bg-white'
          }${state.open ? ' show' : ''}`}
          aria-label={viewAsSa ? `Cliente actual: ${cuentaNombre}` : 'Elegir cliente'}
        >
          <Icon name="eye" />
          <span className="gcu-client-selector-label">{viewAsSa ? cuentaNombre : 'Elegir cliente'}</span>
          <Icon name="chevron-down" />
        </button>
      )}
    >
      <DropdownMenu className="nxl-h-dropdown" style={{ minWidth: 220 }} {...inertProps}>
        {viewAsSa && (
          <div className="px-3 py-2 border-bottom">
            <p className="fs-11 text-muted mb-0">Viendo como admin de</p>
            <p className="fs-13 fw-bold mb-0 text-dark">{cuentaNombre}</p>
          </div>
        )}
        <div className="px-3 pt-2 pb-1">
          <p className="fs-11 text-muted mb-0 text-uppercase fw-semibold">Cambiar a cliente</p>
        </div>
        {cuentas.length === 0 && (
          <p className="fs-12 text-muted px-3 py-2 mb-0">Sin clientes activos</p>
        )}
        {cuentas.map(c => (
          <button
            key={c.slug}
            type="button"
            tabIndex={open ? undefined : -1}
            onClick={() => onSelectCuenta(c.slug)}
            className={`dropdown-item d-flex align-items-center gap-2 py-2 ${
              cuentaNombre === c.nombre ? 'fw-bold text-warning' : ''
            }`}
          >
            <Icon name="database" size="sm" className="text-muted" />
            <span className="fs-13">{c.nombre}</span>
            {cuentaNombre === c.nombre && (
              <Icon name="check" size="sm" className="ms-auto text-warning" />
            )}
          </button>
        ))}
        {viewAsSa && (
          <>
            <div className="dropdown-divider my-1"></div>
            <button
              type="button"
              tabIndex={open ? undefined : -1}
              onClick={onVolverSa}
              className="dropdown-item d-flex align-items-center gap-2 py-2 text-secondary"
            >
              <Icon name="shield" size={14} />
              <span className="fs-13">Volver al Panel SA</span>
            </button>
          </>
        )}
      </DropdownMenu>
    </Dropdown>
  );
});
