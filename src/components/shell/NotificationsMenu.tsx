import { forwardRef } from 'react';
import type * as React from 'react';
import type { AppManifestEntry, Notificacion } from '../../contract';
import { Icon } from '../ui/Icon';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Dropdown, DropdownMenu } from '../ui/Dropdown';
import { resolveNotificationsHref, tiempoRelativo } from './shellHeaderModel';
import { safeHref } from '../../utils/safeHref';
import { useControllableOpen, useDesktopHover } from './internal/useDesktopHover';

const NO_NOTIFICATIONS: Notificacion[] = [];
const NO_APPS: AppManifestEntry[] = [];

export interface NotificationsMenuProps {
  notifications?: Notificacion[];
  /** Sin callback no se muestra «Marcar como leído». */
  onMarkAllRead?: () => void;
  /** Navegación SPA: solo se usa si la notificación pertenece a una app SPA del manifest. */
  onNotificationClick?: (e: React.MouseEvent, n: Notificacion) => void;
  /** Manifest: resuelve el destino de «Ver todas» y qué notificaciones abren en SPA. */
  apps?: AppManifestEntry[];
  appHref?: (app: AppManifestEntry) => string;
  /** Destino de «Ver todas las notificaciones»; por defecto la app de notificaciones o `/notificaciones`. */
  notificationsHref?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  desktopHover?: boolean;
  className?: string;
}

/**
 * NotificationsMenu — campana del header con el conteo sin leer y la lista de avisos.
 *
 * - El nombre accesible incluye el conteo («Notificaciones, 3 sin leer»); el badge muestra 99+.
 * - Clic normal en un aviso de una app SPA llama a `onNotificationClick`; con modificadores
 *   (Ctrl, Cmd, Shift, Alt) o botón medio se respeta el enlace nativo.
 * - Cerrado, el menú queda `inert`: sus enlaces no entran en el orden de Tab.
 * - El ref apunta al contenedor del dropdown.
 */
export const NotificationsMenu = /* @__PURE__ */ forwardRef<HTMLDivElement, NotificationsMenuProps>(function NotificationsMenu({
  notifications = NO_NOTIFICATIONS,
  onMarkAllRead,
  onNotificationClick,
  apps = NO_APPS,
  appHref,
  notificationsHref: notificationsHrefProp,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  desktopHover: desktopHoverProp,
  className = 'dropdown nxl-h-item',
}, ref) {
  const [open, setOpen] = useControllableOpen(openProp, defaultOpen, onOpenChange);
  const desktopHover = useDesktopHover(desktopHoverProp);
  const noLeidas = notifications.filter(n => !n.leida).length;
  const notificationsHref = safeHref(notificationsHrefProp ?? resolveNotificationsHref(apps, appHref), '/notificaciones')
    ?? '/notificaciones';
  const inertProps = open ? {} : { inert: '' };

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
          className={`nxl-head-link me-0 gcu-header-icon-button${state.open ? ' show is-active' : ''}`}
          aria-label={`Notificaciones${noLeidas > 0 ? `, ${noLeidas} sin leer` : ''}`}
        >
          <Icon name="bell" />
          {noLeidas > 0 && (
            <Badge variant="danger" className="nxl-h-badge">{noLeidas > 99 ? '99+' : noLeidas}</Badge>
          )}
        </button>
      )}
    >
      <DropdownMenu className="nxl-h-dropdown nxl-notifications-menu" closeOnSelect={false} {...inertProps}>
        <div className="d-flex justify-content-between align-items-center notifications-head">
          <h6 className="fw-bold text-dark mb-0">Notificaciones</h6>
          {noLeidas > 0 && onMarkAllRead && (
            <button
              type="button"
              tabIndex={open ? undefined : -1}
              onClick={onMarkAllRead}
              className="fs-11 text-success text-end ms-auto gcu-link-button"
            >
              <Icon name="check" />
              <span> Marcar como leído</span>
            </button>
          )}
        </div>
        <div className="gcu-notifications-list">
          {notifications.length === 0 ? (
            <div className="notifications-item">
              <Avatar name="I" variant="primary" size="md" className="me-3" style={{ borderRadius: '50%' }} />
              <div className="notifications-desc">
                <p className="font-body text-body text-truncate-2-line mb-0">
                  Sin notificaciones nuevas.
                </p>
              </div>
            </div>
          ) : (
            notifications.map((n) => {
              const hasMatchingSpaApp = apps.some(
                app => app.modo !== 'external_link' && app.nombre === n.aplicacion_nombre,
              );
              const notificationHref = n.url && n.url !== '#'
                ? safeHref(n.url, notificationsHref) ?? notificationsHref
                : notificationsHref;

              return (
                <div key={n.id} className={`notifications-item ${n.leida ? '' : 'fw-semibold'}`}>
                  <Avatar
                    name={(n.aplicacion_nombre ?? 'N').charAt(0)}
                    variant={n.leida ? 'secondary' : 'primary'}
                    size="md"
                    className="me-3"
                    style={{ borderRadius: '50%' }}
                  />
                  <div className="notifications-desc">
                    <a
                      href={notificationHref}
                      tabIndex={open ? undefined : -1}
                      onClick={onNotificationClick && hasMatchingSpaApp ? (e) => {
                        if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
                        e.preventDefault();
                        onNotificationClick(e, n);
                      } : undefined}
                      className="font-body text-body text-truncate-2-line"
                    >
                      {n.mensaje}
                    </a>
                    <div className="fs-11 text-muted">{tiempoRelativo(n.creada_en)}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        <div className="notifications-footer text-center">
          <a href={notificationsHref} className="fs-12 fw-semibold" tabIndex={open ? undefined : -1}>
            Ver todas las notificaciones
          </a>
        </div>
      </DropdownMenu>
    </Dropdown>
  );
});
