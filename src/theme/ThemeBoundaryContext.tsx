import React, { createContext, useContext } from 'react'
import { useThemeOptional, type ThemeMode } from './ThemeContext'

const ThemeBoundaryContext = createContext<ThemeMode | undefined>(undefined)

export function ThemeBoundaryProvider({ mode, children }: { mode?: ThemeMode; children: React.ReactNode }) {
  return <ThemeBoundaryContext.Provider value={mode}>{children}</ThemeBoundaryContext.Provider>
}

/** Resolved appearance for descendants and portal-based primitives. */
export function useThemeBoundaryMode(): ThemeMode | undefined {
  const boundaryMode = useContext(ThemeBoundaryContext)
  const providerMode = useThemeOptional()?.mode
  return boundaryMode ?? providerMode
}
