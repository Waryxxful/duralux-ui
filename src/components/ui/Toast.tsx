import React, { useCallback, useEffect, useRef, useState } from 'react';
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
  /** ms antes del auto-dismiss. Omitido usa 3000; 0 o un valor no positivo lo desactiva. */
  autoHideMs?: number;
  className?: string;
}

const VARIANT_ICON: Record<ToastVariant, string> = {
  success: 'check-circle',
  danger: 'alert-octagon',
  warning: 'alert-triangle',
  info: 'info',
};
const VARIANTS = new Set<ToastVariant>(['success', 'danger', 'warning', 'info']);

const VIEWPORT_ID = 'gcu-toast-viewport';
type ViewportState = { element: HTMLElement; consumers: number; owned: boolean };
const VIEWPORT_REGISTRY_KEY = Symbol.for('@duralux/ui/toast-viewport-registry');

function getViewportRegistry(): WeakMap<Document, ViewportState> {
  const host = globalThis as unknown as Record<PropertyKey, unknown>;
  const existing = host[VIEWPORT_REGISTRY_KEY];
  if (existing instanceof WeakMap) return existing as WeakMap<Document, ViewportState>;

  const registry = new WeakMap<Document, ViewportState>();
  try {
    Object.defineProperty(host, VIEWPORT_REGISTRY_KEY, {
      value: registry,
      configurable: false,
      enumerable: false,
      writable: false,
    });
  } catch {
    // A separate registry is still safe if another bundle owns the symbol.
  }
  return registry;
}

const viewportStates = getViewportRegistry();

function normalizeVariant(variant: ToastVariant): ToastVariant {
  return VARIANTS.has(variant) ? variant : 'info';
}

function acquireViewport(): HTMLElement | null {
  if (typeof document === 'undefined' || !document.body) return null;

  let element = document.getElementById(VIEWPORT_ID) as HTMLElement | null;
  let state = viewportStates.get(document);
  let createdByThisRegistry = false;
  if (!element) {
    element = document.createElement('div');
    element.id = VIEWPORT_ID;
    element.className = 'gcu-toast-viewport';
    element.setAttribute('data-gcu-toast-owned', 'true');
    document.body.appendChild(element);
    state = undefined;
    createdByThisRegistry = true;
  }

  if (!state || state.element !== element) {
    state = {
      element,
      consumers: 0,
      owned: createdByThisRegistry,
    };
    viewportStates.set(document, state);
  }

  state.consumers += 1;
  return element;
}

function releaseViewport(element: HTMLElement) {
  const ownerDocument = element.ownerDocument;
  const state = viewportStates.get(ownerDocument);
  if (!state || state.element !== element) return;

  state.consumers = Math.max(0, state.consumers - 1);
  if (state.consumers > 0) return;

  if (
    state.owned
    && element.isConnected
    && document.getElementById(VIEWPORT_ID) === element
    && element.getAttribute('data-gcu-toast-owned') === 'true'
  ) {
    element.remove();
  }
  viewportStates.delete(ownerDocument);
}

export function Toast({ variant, title, show, onClose, autoHideMs = 3000, className }: ToastProps) {
  const resolvedVariant = normalizeVariant(variant);
  const [closing, setClosing] = useState(false);
  const [viewport, setViewport] = useState<HTMLElement | null>(null);
  const viewportRef = useRef<HTMLElement | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const closeRequested = useRef(false);
  const onCloseRef = useRef(onClose);
  const componentMountedRef = useRef(false);

  useEffect(() => {
    componentMountedRef.current = true;
    return () => {
      componentMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!show || typeof document === 'undefined' || !document.body) return undefined;

    let alive = true;
    const ensureViewport = () => {
      if (!alive || !componentMountedRef.current || !document.body) return;
      const current = viewportRef.current;
      const currentIsCurrent = current
        && current.isConnected
        && document.getElementById(VIEWPORT_ID) === current;
      if (currentIsCurrent) return;

      if (current) releaseViewport(current);
      const next = acquireViewport();
      viewportRef.current = next;
      if (alive && componentMountedRef.current) setViewport(next);
    };

    ensureViewport();
    const observer = typeof MutationObserver === 'function'
      ? new MutationObserver(ensureViewport)
      : null;
    observer?.observe(document.body, { childList: true });

    return () => {
      alive = false;
      observer?.disconnect();
      const current = viewportRef.current;
      viewportRef.current = null;
      if (current) releaseViewport(current);
    };
  }, [show]);

  const requestClose = useCallback(() => {
    if (!componentMountedRef.current || closeRequested.current) return;
    closeRequested.current = true;
    clearTimeout(hideTimer.current);
    hideTimer.current = undefined;
    clearTimeout(closeTimer.current);
    closeTimer.current = undefined;
    setClosing(true);
    closeTimer.current = setTimeout(() => {
      closeTimer.current = undefined;
      if (componentMountedRef.current && typeof onCloseRef.current === 'function') {
        onCloseRef.current();
      }
    }, 300);
  }, []);

  useEffect(() => {
    closeRequested.current = false;
    setClosing(false);
    if (show && Number.isFinite(autoHideMs) && autoHideMs > 0) {
      hideTimer.current = setTimeout(requestClose, autoHideMs);
    }
    return () => {
      clearTimeout(hideTimer.current);
      clearTimeout(closeTimer.current);
      hideTimer.current = undefined;
      closeTimer.current = undefined;
    };
  }, [show, autoHideMs, requestClose]);

  if (!show || !viewport || !viewport.isConnected) return null;
  const assertive = resolvedVariant === 'danger' || resolvedVariant === 'warning';

  return createPortal(
    <div
      className={['gcu-toast', `gcu-toast--${resolvedVariant}`, closing ? 'gcu-toast--closing' : '', className]
        .filter(Boolean)
        .join(' ')}
      role={assertive ? 'alert' : 'status'}
      aria-live={assertive ? 'assertive' : 'polite'}
      aria-atomic="true"
    >
      <i className={`gcu-icon gcu-toast__icon feather-${VARIANT_ICON[resolvedVariant]}`} aria-hidden="true" />
      <div className="gcu-toast__title">{title}</div>
      <button type="button" className="gcu-toast__close" aria-label="Cerrar notificación" onClick={requestClose}>
        <i className="gcu-icon feather-x" aria-hidden="true" />
      </button>
    </div>,
    viewport,
  );
}
