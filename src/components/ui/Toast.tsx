import React, { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useThemeBoundaryMode } from '../../theme/themeBoundary';
import { log } from '../../utils/log';
import { isNumber, isString } from '../../utils/typeGuards';

/**
 * Toast — feedback de acción canónico de la plantilla (SweetAlert2 toast:
 * top-end, auto-dismiss ~3s) implementado en React puro, sin dependencia
 * nueva. Controlado: un solo item por instancia, sin provider/context.
 *
 * Estilo: src/styles/components/toast.css, solo tokens `--gcu-*` (los temas se
 * resuelven solos). Entra con `gcu-enter` y sale más rápido con `--gcu-ease-exit`;
 * con reduced-motion no anima. El auto-cierre se pausa con puntero o foco.
 *
 * Apilado: cada Toast montado hace portal a un viewport compartido
 * (#gcu-toast-viewport, creado on-demand) fijo debajo del header de 80px;
 * el propio contenedor flex apila las instancias — no hace falta un
 * provider para "stackear" varios toasts a la vez.
 */
export type ToastVariant = 'success' | 'danger' | 'warning' | 'info';

const DEFAULT_AUTO_HIDE_MS = {
  success: 3000,
  info: 3000,
  warning: 0,
  danger: 0,
} as const satisfies Record<ToastVariant, number>;

export interface ToastProps {
  variant: ToastVariant;
  title: React.ReactNode;
  /** Línea secundaria opcional (qué pasó o qué hacer). */
  description?: React.ReactNode;
  show: boolean;
  onClose: () => void;
  /** ms antes del auto-dismiss. Omitido usa 3000 en success/info (más si el texto es largo: nunca se acorta el tiempo de lectura) y permanece hasta el cierre en danger/warning. 0 o un valor no positivo lo desactiva. */
  autoHideMs?: number;
  className?: string;
}

/** Espera antes de avisar onClose: cubre la salida CSS (150 ms, --gcu-duration-fast) con margen. */
const CLOSE_UNMOUNT_MS = 300;

const VARIANT_ICON = {
  success: 'check-circle',
  danger: 'alert-octagon',
  warning: 'alert-triangle',
  info: 'info',
} as const satisfies Record<ToastVariant, string>;
const VARIANTS = new Set<ToastVariant>(['success', 'danger', 'warning', 'info']);

const VIEWPORT_ID = 'gcu-toast-viewport';
type ViewportState = { element: HTMLElement; consumers: number; owned: boolean };
const VIEWPORT_REGISTRY_KEY = Symbol.for('@duralux/ui/toast-viewport-registry');

function getViewportRegistry(): WeakMap<Document, ViewportState> {
  // SAFETY: Symbol-keyed singleton registry on globalThis across module boundaries
  const host = globalThis as { [VIEWPORT_REGISTRY_KEY]?: WeakMap<Document, ViewportState> };
  const existing = host[VIEWPORT_REGISTRY_KEY];
  if (existing instanceof WeakMap) return existing;

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
  if (VARIANTS.has(variant)) return variant;
  log.warn(`Toast: la variante "${String(variant)}" no existe; se usa "info".`);
  return 'info';
}

/** Tiempo de lectura: 2 s + 50 ms por carácter, tope 10 s. Solo alarga el valor por defecto. */
const READING_BASE_MS = 2000;
const READING_MS_PER_CHAR = 50;
const READING_MAX_MS = 10_000;

function textLength(node: React.ReactNode): number {
  if (isString(node) || isNumber(node)) return String(node).length;
  if (Array.isArray(node)) return node.reduce<number>((total, child) => total + textLength(child), 0);
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) return textLength(node.props.children);
  return 0;
}

function defaultAutoHideMs(variant: ToastVariant, title: React.ReactNode, description: React.ReactNode): number {
  const base = DEFAULT_AUTO_HIDE_MS[variant];
  if (base <= 0) return base;
  const reading = READING_BASE_MS + (textLength(title) + textLength(description)) * READING_MS_PER_CHAR;
  return Math.max(base, Math.min(READING_MAX_MS, reading));
}

function acquireViewport(): HTMLElement | null {
  if (!globalThis.document?.body) return null;

  let element = document.getElementById(VIEWPORT_ID);
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

export const Toast = forwardRef<HTMLDivElement, ToastProps>(function Toast(
  { variant, title, description, show, onClose, autoHideMs, className },
  ref,
) {
  const themeMode = useThemeBoundaryMode();
  const resolvedVariant = normalizeVariant(variant);
  const resolvedAutoHideMs = autoHideMs ?? defaultAutoHideMs(resolvedVariant, title, description);
  const [closing, setClosing] = useState(false);
  const [paused, setPaused] = useState(false);
  const [viewport, setViewport] = useState<HTMLElement | null>(null);
  const viewportRef = useRef<HTMLElement | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const remainingMs = useRef(resolvedAutoHideMs);
  const startedAt = useRef<number | null>(null);
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
    if (!show || !globalThis.document?.body) return undefined;

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
    const observer = globalThis.MutationObserver
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
      if (componentMountedRef.current && onCloseRef.current) {
        onCloseRef.current();
      }
    }, CLOSE_UNMOUNT_MS);
  }, []);

  useEffect(() => {
    closeRequested.current = false;
    setClosing(false);
    setPaused(false);
    remainingMs.current = resolvedAutoHideMs;
    startedAt.current = null;
    return () => {
      clearTimeout(hideTimer.current);
      clearTimeout(closeTimer.current);
      hideTimer.current = undefined;
      closeTimer.current = undefined;
    };
  }, [show, resolvedAutoHideMs]);

  useEffect(() => {
    clearTimeout(hideTimer.current);
    hideTimer.current = undefined;
    if (!show || paused || closeRequested.current) return undefined;
    if (!Number.isFinite(resolvedAutoHideMs) || resolvedAutoHideMs <= 0) return undefined;
    startedAt.current = Date.now();
    hideTimer.current = setTimeout(requestClose, remainingMs.current);
    return () => {
      clearTimeout(hideTimer.current);
      hideTimer.current = undefined;
    };
  }, [paused, requestClose, resolvedAutoHideMs, show]);

  const pauseTimer = () => {
    if (!show || closeRequested.current || remainingMs.current <= 0) return;
    if (startedAt.current !== null) {
      remainingMs.current = Math.max(0, remainingMs.current - (Date.now() - startedAt.current));
      startedAt.current = null;
    }
    setPaused(true);
  };

  const resumeTimer = (event: React.MouseEvent<HTMLDivElement> | React.FocusEvent<HTMLDivElement>) => {
    if (!show || closeRequested.current) return;
    const next = event.relatedTarget;
    if (next instanceof Node && event.currentTarget.contains(next)) return;
    setPaused(false);
  };

  if (!show || !viewport || !viewport.isConnected) return null;
  const assertive = resolvedVariant === 'danger' || resolvedVariant === 'warning';

  return createPortal(
    <div
      ref={ref}
      className={['gcu-toast', themeMode && 'gcu-theme', `gcu-toast--${resolvedVariant}`, closing ? 'gcu-toast--closing' : '', className]
        .filter(Boolean)
        .join(' ')}
      data-gcu-theme={themeMode}
      role={assertive ? 'alert' : 'status'}
      aria-live={assertive ? 'assertive' : 'polite'}
      aria-atomic="true"
      onMouseEnter={pauseTimer}
      onMouseLeave={resumeTimer}
      onFocus={pauseTimer}
      onBlur={resumeTimer}
    >
      <i className={`gcu-icon gcu-toast__icon feather-${VARIANT_ICON[resolvedVariant]}`} aria-hidden="true" />
      <div className="gcu-toast__content">
        <div className="gcu-toast__title">{title}</div>
        {description !== undefined && description !== null && description !== false && (
          <div className="gcu-toast__description">{description}</div>
        )}
      </div>
      <button type="button" className="gcu-toast__close" aria-label="Cerrar notificación" onClick={requestClose}>
        <i className="gcu-icon feather-x" aria-hidden="true" />
      </button>
    </div>,
    viewport,
  );
});
