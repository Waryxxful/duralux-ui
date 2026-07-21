import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'grancrm-theme';
const MINI_KEY = 'grancrm-menu-mini';
const LEGACY_MINI_KEY = 'nexel-classic-dashboard-menu-mini-theme';
// MINI_KEY remains compatible; this marker identifies an explicit user choice rather than responsive state.
const MINI_PIN_KEY = 'grancrm-menu-mini-pinned';
const MINI_PIN_VERSION = '1';

export interface ThemeContextValue {
  mode: ThemeMode;
  dark: boolean;
  setMode: (mode: ThemeMode) => void;
  toggleDark: () => void;
  mini: boolean;
  setMini: (mini: boolean) => void;
  toggleMini: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readStoredMode(): ThemeMode {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

function parseStoredMini(value: string | null): boolean | null {
  if (value === '1' || value === 'true' || value === 'menu-mini-theme') return true;
  if (value === '0' || value === 'false' || value === 'menu-expend-theme') return false;
  return null;
}

function readStoredMiniPreference(): boolean | null {
  try {
    if (localStorage.getItem(MINI_PIN_KEY) !== MINI_PIN_VERSION) return null;
    return parseStoredMini(localStorage.getItem(MINI_KEY))
      ?? parseStoredMini(localStorage.getItem(LEGACY_MINI_KEY));
  } catch {
    return null;
  }
}

/** Snippet anti-FOUC para <head> — exportado como string para apps. */
export const THEME_HEAD_SNIPPET = `try{var t=localStorage.getItem('${STORAGE_KEY}');if(t==='dark')document.documentElement.classList.add('app-skin-dark');var p=localStorage.getItem('${MINI_PIN_KEY}'),m=localStorage.getItem('${MINI_KEY}')||localStorage.getItem('${LEGACY_MINI_KEY}');if(p==='${MINI_PIN_VERSION}'&&(m==='1'||m==='true'||m==='menu-mini-theme'))document.documentElement.classList.add('minimenu')}catch(e){}`;

interface MiniState {
  mini: boolean;
  userPinnedMini: boolean;
}

function readInitialMiniState(): MiniState {
  const preference = readStoredMiniPreference();
  if (preference !== null) return { mini: preference, userPinnedMini: true };

  return {
    mini: typeof document !== 'undefined' && document.documentElement.classList.contains('minimenu'),
    userPinnedMini: false,
  };
}

/**
 * Un solo mecanismo de theming (plan D4):
 * - dark: clase `app-skin-dark` en <html> + localStorage grancrm-theme
 * - mini sidebar: clase `minimenu` en <html>; solo elecciones explícitas se persisten
 * Comportamiento de resize alineado al common-init de la plantilla Duralux:
 *   width ∈ [1024, 1600] → mini; width > 1600 → expandido (salvo preferencia usuario).
 */
export function ThemeProvider({
  children,
  enableResponsiveMini = true,
}: {
  children: React.ReactNode;
  enableResponsiveMini?: boolean;
}) {
  const [mode, setModeState] = useState<ThemeMode>(() =>
    typeof document !== 'undefined' && document.documentElement.classList.contains('app-skin-dark')
      ? 'dark'
      : readStoredMode(),
  );
  const [miniState, setMiniState] = useState<MiniState>(readInitialMiniState);
  const { mini, userPinnedMini } = miniState;

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
  }, []);

  const toggleDark = useCallback(() => {
    setModeState(m => (m === 'dark' ? 'light' : 'dark'));
  }, []);

  const setMini = useCallback((next: boolean) => {
    setMiniState({ mini: next, userPinnedMini: true });
  }, []);

  const toggleMini = useCallback(() => {
    setMiniState(current => ({ mini: !current.mini, userPinnedMini: true }));
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    html.classList.toggle('app-skin-dark', mode === 'dark');
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch { /* ignore */ }
  }, [mode]);

  useEffect(() => {
    const html = document.documentElement;
    html.classList.toggle('minimenu', mini);
    if (!userPinnedMini) return;
    try {
      localStorage.setItem(MINI_KEY, mini ? '1' : '0');
      localStorage.setItem(MINI_PIN_KEY, MINI_PIN_VERSION);
      localStorage.setItem(
        LEGACY_MINI_KEY,
        mini ? 'menu-mini-theme' : 'menu-expend-theme',
      );
    } catch { /* ignore */ }
  }, [mini, userPinnedMini]);

  // Mirror plantilla common-init resize: auto mini between 1024 and 1600
  useEffect(() => {
    if (!enableResponsiveMini || userPinnedMini) return;
    const apply = () => {
      const w = window.innerWidth;
      let next: boolean;
      if (w >= 1024 && w <= 1600) next = true;
      else if (w > 1600) next = false;
      else return;

      setMiniState(current => {
        if (current.userPinnedMini || current.mini === next) return current;
        return { ...current, mini: next };
      });
    };
    apply();
    window.addEventListener('resize', apply);
    return () => window.removeEventListener('resize', apply);
  }, [enableResponsiveMini, userPinnedMini]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      dark: mode === 'dark',
      setMode,
      toggleDark,
      mini,
      setMini,
      toggleMini,
    }),
    [mode, mini, setMode, toggleDark, setMini, toggleMini],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
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
