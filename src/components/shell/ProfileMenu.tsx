import { forwardRef } from 'react';
import { Icon } from '../ui/Icon';
import { Avatar } from '../ui/Avatar';
import { Dropdown, DropdownMenu } from '../ui/Dropdown';
import { useControllableOpen, useDesktopHover } from './internal/useDesktopHover';
import { safeHref } from '../../utils/safeHref';

export interface ProfileMenuProps {
  nombre: string;
  email: string;
  avatarUrl?: string | null;
  /** Enlace «Mi Perfil y Configuración»; sin él no se muestra. */
  profileHref?: string;
  /** Navegación SPA al perfil: si existe, se usa en vez del enlace nativo. */
  onNavigateProfile?: () => void;
  /** Token CSRF del formulario de cierre de sesión (POST). */
  csrfToken: string;
  /** Acción del formulario de cierre de sesión. */
  logoutAction?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  desktopHover?: boolean;
  className?: string;
}

/**
 * ProfileMenu — avatar del usuario con su nombre, correo, perfil y cierre de sesión.
 *
 * - Cerrar sesión es un POST con CSRF (`<form method="post">`), nunca un enlace GET.
 * - Cerrado, el menú queda `inert`. El ref apunta al contenedor del dropdown.
 */
export const ProfileMenu = /* @__PURE__ */ forwardRef<HTMLDivElement, ProfileMenuProps>(function ProfileMenu({
  nombre,
  email,
  avatarUrl,
  profileHref,
  onNavigateProfile,
  csrfToken,
  logoutAction = '/logout/',
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  desktopHover: desktopHoverProp,
  className = 'dropdown nxl-h-item ms-2',
}, ref) {
  const [open, setOpen] = useControllableOpen(openProp, defaultOpen, onOpenChange);
  const desktopHover = useDesktopHover(desktopHoverProp);
  const inertProps = open ? {} : { inert: '' };
  const safeProfileHref = safeHref(profileHref);

  return (
    <Dropdown
      ref={ref}
      align="end"
      className={className}
      desktopHover={desktopHover}
      open={open}
      onOpenChange={setOpen}
      trigger={(triggerProps, state) => (
        <button
          {...triggerProps}
          className={`d-flex align-items-center gap-2 nxl-head-link me-0 gcu-header-icon-button gcu-avatar-trigger${state.open ? ' show is-active' : ''}`}
          aria-label="Menú de usuario"
        >
          <Avatar src={avatarUrl} name={nombre} size="md" variant="primary" className="gcu-header-avatar" />
        </button>
      )}
    >
      <DropdownMenu className="nxl-h-dropdown nxl-user-dropdown" closeOnSelect={false} {...inertProps}>
        <div className="dropdown-header border-bottom pb-3 mb-1">
          <div className="d-flex align-items-center gap-3">
            <Avatar src={avatarUrl} name={nombre} size="lg" variant="primary" />
            <div style={{ minWidth: 0 }}>
              <h6 className="text-dark mb-0 fs-13 fw-bold text-truncate">{nombre}</h6>
              <span className="fs-11 text-muted text-truncate d-block">{email}</span>
            </div>
          </div>
        </div>
        {safeProfileHref && (
          <a
            href={safeProfileHref}
            tabIndex={open ? undefined : -1}
            onClick={(e) => {
              if (onNavigateProfile) {
                e.preventDefault();
                setOpen(false);
                onNavigateProfile();
              } else {
                setOpen(false);
              }
            }}
            className="dropdown-item d-flex align-items-center gap-2 py-2"
          >
            <Icon name="user" size={14} />
            <span className="fs-13">Mi Perfil y Configuración</span>
          </a>
        )}
        <div className="dropdown-divider my-1"></div>
        <form method="post" action={logoutAction}>
          <input type="hidden" name="csrfmiddlewaretoken" value={csrfToken} />
          <button type="submit" tabIndex={open ? undefined : -1} className="dropdown-item d-flex align-items-center gap-2 py-2 text-danger">
            <Icon name="log-out" size={14} />
            <span className="fs-13">Cerrar sesión</span>
          </button>
        </form>
      </DropdownMenu>
    </Dropdown>
  );
});
