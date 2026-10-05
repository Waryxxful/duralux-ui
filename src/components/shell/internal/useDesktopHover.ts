import { useEffect, useState } from 'react';

const DESKTOP_MEDIA_QUERY = '(hover: hover) and (min-width: 1024.01px)';

/**
 * true en escritorio con puntero fino: los menús del header se abren al pasar el puntero.
 * El primer render es igual en servidor y cliente; la media query es una mejora progresiva.
 * `override` fija el valor (sin suscribirse).
 */
export function useDesktopHover(override?: boolean): boolean {
  const [enabled, setEnabled] = useState(false);
  const overridden = override !== undefined;

  useEffect(() => {
    // Con valor explícito (lo pasa ShellHeader) no hace falta escuchar la media query.
    if (overridden || !globalThis.window?.matchMedia) return undefined;
    const mediaQuery = window.matchMedia(DESKTOP_MEDIA_QUERY);
    const onChange = () => setEnabled(mediaQuery.matches);
    onChange();
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', onChange);
      return () => mediaQuery.removeEventListener('change', onChange);
    }
    mediaQuery.addListener?.(onChange);
    return () => mediaQuery.removeListener?.(onChange);
  }, [overridden]);

  return override ?? enabled;
}

/** Estado abierto controlado o no controlado (patrón de los menús del header). */
export function useControllableOpen(
  controlled: boolean | undefined,
  defaultOpen: boolean,
  onOpenChange: ((open: boolean) => void) | undefined,
): [boolean, (next: boolean) => void] {
  const [uncontrolled, setUncontrolled] = useState(defaultOpen);
  const open = controlled ?? uncontrolled;
  const setOpen = (next: boolean) => {
    if (controlled === undefined) setUncontrolled(next);
    onOpenChange?.(next);
  };
  return [open, setOpen];
}
