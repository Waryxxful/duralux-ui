import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * Toast — feedback de acción canónico de la plantilla (SweetAlert2 toast:
 * top-end, auto-dismiss ~3s) implementado en React puro, sin dependencia
 * nueva. Controlado: un solo item por instancia, sin provider/context.
 *
 * Estilo: usa el sistema de tokens `--gcu-*` (src/styles/grancrm-ui.css),
 * igual que ShellHeader/ConfirmDialog — así el dark theme (`app-skin-dark` /
 * `[data-gcu-theme="dark"]`) se resuelve solo, sin overrides propios.
 *
 * Apilado: cada Toast montado hace portal a un viewport compartido
 * (#gcu-toast-viewport, creado on-demand) fijo debajo del header de 80px;
 * el propio contenedor flex apila las instancias — no hace falta un
 * provider para "stackear" varios toasts a la vez.
 */
export type ToastVariant = 'success' | 'danger' | 'warning' | 'info';

export interface ToastProps {
  variant: ToastVariant;
  title: React.ReactNode;
  show: boolean;
  onClose: () => void;
  /** ms antes del auto-dismiss. 0/undefined con show=true → sin auto-dismiss. Default 3000. */
  autoHideMs?: number;
  className?: string;
}

const VARIANT_ICON: Record<ToastVariant, string> = {
  success: 'check-circle',
  danger: 'alert-octagon',
  warning: 'alert-triangle',
  info: 'info',
};

function getViewport(): HTMLElement {
  const id = 'gcu-toast-viewport';
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement('div');
    el.id = id;
    el.className = 'gcu-toast-viewport';
    document.body.appendChild(el);
  }
  return el;
}

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function Toast({ variant, title, show, onClose, autoHideMs = 3000, className }: ToastProps) {
  const [closing, setClosing] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>();
  const closeTimer = useRef<ReturnType<typeof setTimeout>>();

  function requestClose() {
    clearTimeout(hideTimer.current);
    if (prefersReducedMotion()) {
      onClose();
      return;
    }
    setClosing(true);
    closeTimer.current = setTimeout(onClose, 300);
  }

  useEffect(() => {
    clearTimeout(hideTimer.current);
    clearTimeout(closeTimer.current);
    setClosing(false);
    if (!show || !autoHideMs) return undefined;
    hideTimer.current = setTimeout(requestClose, autoHideMs);
    return () => clearTimeout(hideTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, autoHideMs]);

  useEffect(() => () => {
    clearTimeout(hideTimer.current);
    clearTimeout(closeTimer.current);
  }, []);

  if (!show) return null;

  return createPortal(
    <div
      className={['gcu-toast', `gcu-toast--${variant}`, closing ? 'gcu-toast--closing' : '', className]
        .filter(Boolean)
        .join(' ')}
      role="status"
      aria-live="polite"
    >
      <i className={`gcu-icon gcu-toast__icon feather-${VARIANT_ICON[variant]}`} aria-hidden="true" />
      <div className="gcu-toast__title">{title}</div>
      <button type="button" className="gcu-toast__close" aria-label="Cerrar notificación" onClick={requestClose}>
        <i className="gcu-icon feather-x" aria-hidden="true" />
      </button>
    </div>,
    getViewport(),
  );
}
