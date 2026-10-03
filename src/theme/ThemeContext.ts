import { createContext, useContext } from 'react';
import { log } from '../utils/log';

/** Preferencia del usuario. `system` sigue `prefers-color-scheme`. */
export type ThemeMode = 'light' | 'dark' | 'navy' | 'system';
/** Tema efectivamente aplicado (`data-gcu-theme` en <html>). */
export type ResolvedTheme = 'light' | 'dark' | 'navy';

export const THEME_STORAGE_KEY = 'grancrm-theme';
export const MINI_KEY = 'grancrm-menu-mini';
export const LEGACY_MINI_KEY = 'nexel-classic-dashboard-menu-mini-theme';
export const MINI_PIN_KEY = 'grancrm-menu-mini-pinned';
export const MINI_PIN_VERSION = '1';
export const DARK_MEDIA_QUERY = '(prefers-color-scheme: dark)';

const THEME_MODES: ReadonlySet<string> = new Set<ThemeMode>(['light', 'dark', 'navy', 'system']);

export interface ThemeContextValue {
  mode: ThemeMode;
  resolved: ResolvedTheme;
  /** true en dark y navy (ambos llevan `.app-skin-dark`). */
  dark: boolean;
  setMode: (mode: ThemeMode) => void;
  toggleDark: () => void;
  mini: boolean;
  setMini: (mini: boolean) => void;
  toggleMini: () => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function isThemeMode(value: string): value is ThemeMode {
  return THEME_MODES.has(value);
}

/** Preferencia guardada, o null si no hay ninguna válida. */
export function readStoredPreference(): ThemeMode | null {
  let value: string | null = null;
  try {
    value = localStorage.getItem(THEME_STORAGE_KEY);
  } catch {
    return null;
  }
  if (value === null) return null;
  if (isThemeMode(value)) return value;
  log.warn(`Tema guardado desconocido "${value}" en ${THEME_STORAGE_KEY}; se usa light.`);
  return null;
}

export function readStoredMode(): ThemeMode {
  return readStoredPreference() ?? 'light';
}

export function systemPrefersDark(): boolean {
  try {
    return Boolean(globalThis.window?.matchMedia?.(DARK_MEDIA_QUERY).matches);
  } catch {
    return false;
  }
}

export function resolveTheme(mode: ThemeMode, prefersDark: boolean): ResolvedTheme {
  if (mode === 'system') return prefersDark ? 'dark' : 'light';
  return mode;
}

/** Aplica el tema resuelto al documento: atributo + clase legacy `.app-skin-dark`. */
export function applyThemeToDocument(resolved: ResolvedTheme, root: HTMLElement = document.documentElement): void {
  root.setAttribute('data-gcu-theme', resolved);
  root.classList.toggle('app-skin-dark', resolved !== 'light');
}

export function parseStoredMini(value: string | null): boolean | null {
  if (value === '1' || value === 'true' || value === 'menu-mini-theme') return true;
  if (value === '0' || value === 'false' || value === 'menu-expend-theme') return false;
  return null;
}

export function readStoredMiniPreference(): boolean | null {
  try {
    if (localStorage.getItem(MINI_PIN_KEY) !== MINI_PIN_VERSION) return null;
    return parseStoredMini(localStorage.getItem(MINI_KEY))
      ?? parseStoredMini(localStorage.getItem(LEGACY_MINI_KEY));
  } catch {
    return null;
  }
}

/** Responsive menu contract: only the narrow desktop band is mini. */
export function isResponsiveMiniWidth(width: number): boolean {
  return Number.isFinite(width) && width > 1024 && width <= 1400;
}

/**
 * Snippet anti-FOUC para <head>: fija `data-gcu-theme` y `.app-skin-dark` antes del
 * primer pintado. Exportado como string para que las apps lo incrusten inline.
 */
export const THEME_HEAD_SNIPPET = `try{var h=document.documentElement,t=localStorage.getItem('${THEME_STORAGE_KEY}');if(t==='system')t=window.matchMedia&&window.matchMedia('${DARK_MEDIA_QUERY}').matches?'dark':'light';if(t!=='dark'&&t!=='navy')t='light';h.setAttribute('data-gcu-theme',t);if(t!=='light')h.classList.add('app-skin-dark');var p=localStorage.getItem('${MINI_PIN_KEY}'),m=localStorage.getItem('${MINI_KEY}')||localStorage.getItem('${LEGACY_MINI_KEY}');if(p==='${MINI_PIN_VERSION}'&&(m==='1'||m==='true'||m==='menu-mini-theme'))h.classList.add('minimenu')}catch(e){}`;

export interface MiniState {
  mini: boolean;
  userPinnedMini: boolean;
}

export function readInitialMiniState(enableResponsiveMini = true): MiniState {
  const preference = readStoredMiniPreference();
  if (preference !== null) return { mini: preference, userPinnedMini: true };

  if (enableResponsiveMini && globalThis.window) {
    return { mini: isResponsiveMiniWidth(window.innerWidth), userPinnedMini: false };
  }

  return {
    mini: Boolean(globalThis.document?.documentElement.classList.contains('minimenu')),
    userPinnedMini: false,
  };
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme() debe usarse dentro de <ThemeProvider>');
  }
  return ctx;
}

/** Variante safe para componentes que pueden vivir fuera del provider. */
export function useThemeOptional(): ThemeContextValue | null {
  return useContext(ThemeContext);
}
