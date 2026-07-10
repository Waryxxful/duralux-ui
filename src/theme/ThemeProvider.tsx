import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'grancrm-theme';
const MINI_KEY = 'grancrm-menu-mini';

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

function readStoredMini(): boolean {
  try {
    // Plantilla: nexel-classic-dashboard-menu-mini-theme; GranCRM: grancrm-menu-mini
    const v = localStorage.getItem(MINI_KEY) ?? localStorage.getItem('nexel-classic-dashboard-menu-mini-theme');
    return v === '1' || v === 'menu-mini-theme' || v === 'true';
  } catch {
    return false;
  }
}

/** Snippet anti-FOUC para <head> — exportado como string para apps. */
export const THEME_HEAD_SNIPPET = `try{var t=localStorage.getItem('${STORAGE_KEY}');if(t==='dark')document.documentElement.classList.add('app-skin-dark');var m=localStorage.getItem('${MINI_KEY}');if(m==='1'||m==='true')document.documentElement.classList.add('minimenu')}catch(e){}`;

/**
 * Un solo mecanismo de theming (plan D4):
 * - dark: clase `app-skin-dark` en <html> + localStorage grancrm-theme
 * - mini sidebar: clase `minimenu` en <html> + localStorage grancrm-menu-mini
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
  const [mini, setMiniState] = useState<boolean>(() =>
    typeof document !== 'undefined' && document.documentElement.classList.contains('minimenu')
      ? true
      : readStoredMini(),
  );
  const [userPinnedMini, setUserPinnedMini] = useState(false);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
  }, []);

  const toggleDark = useCallback(() => {
    setModeState(m => (m === 'dark' ? 'light' : 'dark'));
  }, []);

  const setMini = useCallback((next: boolean) => {
    setUserPinnedMini(true);
    setMiniState(next);
  }, []);

  const toggleMini = useCallback(() => {
    setUserPinnedMini(true);
    setMiniState(v => !v);
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
    try {
      localStorage.setItem(MINI_KEY, mini ? '1' : '0');
      localStorage.setItem(
        'nexel-classic-dashboard-menu-mini-theme',
        mini ? 'menu-mini-theme' : 'menu-expend-theme',
      );
    } catch { /* ignore */ }
  }, [mini]);

  // Mirror plantilla common-init resize: auto mini between 1024 and 1600
  useEffect(() => {
    if (!enableResponsiveMini || userPinnedMini) return;
    const apply = () => {
      const w = window.innerWidth;
      if (w >= 1024 && w <= 1600) setMiniState(true);
      else if (w > 1600) setMiniState(false);
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
