import React, { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import {
  applyThemeToDocument,
  DARK_MEDIA_QUERY,
  isResponsiveMiniWidth,
  LEGACY_MINI_KEY,
  MINI_KEY,
  MINI_PIN_KEY,
  MINI_PIN_VERSION,
  readInitialMiniState,
  readStoredPreference,
  resolveTheme,
  systemPrefersDark,
  ThemeContext,
  THEME_STORAGE_KEY,
  type ThemeContextValue,
  type ThemeMode,
} from './ThemeContext';

export interface ThemeProviderProps {
  children: React.ReactNode;
  enableResponsiveMini?: boolean;
}

function subscribeToSystemTheme(onChange: () => void): () => void {
  const media = globalThis.window?.matchMedia?.(DARK_MEDIA_QUERY);
  if (!media) return () => {};
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
}

function initialMode(): ThemeMode {
  const stored = readStoredPreference();
  if (stored) return stored;
  // Otra pieza (snippet antiguo, AppLayout sin provider) pudo marcar el documento.
  const root = globalThis.document?.documentElement;
  if (root?.getAttribute('data-gcu-theme') === 'navy') return 'navy';
  return root?.classList.contains('app-skin-dark') ? 'dark' : 'light';
}

/**
 * Un solo mecanismo de theming:
 * - tema: `data-gcu-theme` (light | dark | navy) + clase `app-skin-dark` en dark y navy
 *   sobre <html>; la preferencia (incluido `system`) se guarda en localStorage grancrm-theme.
 * - mini sidebar: clase `minimenu` en <html>; solo elecciones explícitas se persisten.
 * Responsive v2: width <= 1024 → expandido; 1024.01..1400 → mini;
 * width > 1400 → expandido (salvo preferencia explícitamente fijada).
 */
export function ThemeProvider({
  children,
  enableResponsiveMini = true,
}: ThemeProviderProps) {
  const [mode, setMode] = useState<ThemeMode>(initialMode);
  const prefersDark = useSyncExternalStore(subscribeToSystemTheme, systemPrefersDark, () => false);
  const resolved = resolveTheme(mode, prefersDark);
  const [miniState, setMiniState] = useState(() => readInitialMiniState(enableResponsiveMini));
  const { mini, userPinnedMini } = miniState;

  const toggleDark = useCallback(() => {
    setMode(() => (resolved === 'light' ? 'dark' : 'light'));
  }, [resolved]);

  const setMini = useCallback((next: boolean) => {
    setMiniState({ mini: next, userPinnedMini: true });
  }, []);

  const toggleMini = useCallback(() => {
    setMiniState(current => ({ mini: !current.mini, userPinnedMini: true }));
  }, []);

  useEffect(() => {
    applyThemeToDocument(resolved);
  }, [resolved]);

  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch { /* almacenamiento bloqueado: el tema sigue aplicado en memoria */ }
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
      const next = isResponsiveMiniWidth(window.innerWidth);
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
      resolved,
      dark: resolved !== 'light',
      setMode,
      toggleDark,
      mini,
      setMini,
      toggleMini,
    }),
    [mode, resolved, mini, toggleDark, setMini, toggleMini],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
