import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  isResponsiveMiniWidth,
  LEGACY_MINI_KEY,
  MINI_KEY,
  MINI_PIN_KEY,
  MINI_PIN_VERSION,
  readInitialMiniState,
  readStoredMode,
  ThemeContext,
  THEME_STORAGE_KEY,
  type ThemeContextValue,
  type ThemeMode,
} from './ThemeContext';

export interface ThemeProviderProps {
  children: React.ReactNode;
  enableResponsiveMini?: boolean;
}

/**
 * Un solo mecanismo de theming (plan D4):
 * - dark: clase `app-skin-dark` en <html> + localStorage grancrm-theme
 * - mini sidebar: clase `minimenu` en <html>; solo elecciones explícitas se persisten
 * Responsive v2: width <= 1024 → expandido; 1024.01..1400 → mini;
 * width > 1400 → expandido (salvo preferencia explícitamente fijada).
 */
export function ThemeProvider({
  children,
  enableResponsiveMini = true,
}: ThemeProviderProps) {
  const [mode, setModeState] = useState<ThemeMode>(() =>
    globalThis.document?.documentElement.classList.contains('app-skin-dark')
      ? 'dark'
      : readStoredMode(),
  );
  const [miniState, setMiniState] = useState(() => readInitialMiniState(enableResponsiveMini));
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
      localStorage.setItem(THEME_STORAGE_KEY, mode);
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

  useEffect(() => {
    if (!enableResponsiveMini || userPinnedMini) return;
    const apply = () => {
      const w = window.innerWidth;
      const next = isResponsiveMiniWidth(w);

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

export {
  useTheme,
  useThemeOptional,
  THEME_HEAD_SNIPPET,
  THEME_STORAGE_KEY,
  MINI_KEY,
  MINI_PIN_KEY,
  type ThemeContextValue,
  type ThemeMode,
} from './ThemeContext';
