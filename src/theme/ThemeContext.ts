import { createContext, useContext } from 'react';

export type ThemeMode = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'grancrm-theme';
export const MINI_KEY = 'grancrm-menu-mini';
export const LEGACY_MINI_KEY = 'nexel-classic-dashboard-menu-mini-theme';
export const MINI_PIN_KEY = 'grancrm-menu-mini-pinned';
export const MINI_PIN_VERSION = '1';

export interface ThemeContextValue {
  mode: ThemeMode;
  dark: boolean;
  setMode: (mode: ThemeMode) => void;
  toggleDark: () => void;
  mini: boolean;
  setMini: (mini: boolean) => void;
  toggleMini: () => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function readStoredMode(): ThemeMode {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
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

/** Snippet anti-FOUC para <head> — exportado como string para apps. */
export const THEME_HEAD_SNIPPET = `try{var t=localStorage.getItem('${THEME_STORAGE_KEY}');if(t==='dark')document.documentElement.classList.add('app-skin-dark');var p=localStorage.getItem('${MINI_PIN_KEY}'),m=localStorage.getItem('${MINI_KEY}')||localStorage.getItem('${LEGACY_MINI_KEY}');if(p==='${MINI_PIN_VERSION}'&&(m==='1'||m==='true'||m==='menu-mini-theme'))document.documentElement.classList.add('minimenu')}catch(e){}`;

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
