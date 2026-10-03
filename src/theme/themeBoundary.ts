import { createContext, useContext } from 'react'
import { useThemeOptional, type ResolvedTheme } from './ThemeContext'

export const ThemeBoundaryContext = createContext<ResolvedTheme | undefined>(undefined)

/** Tema resuelto para descendientes y primitivas en portal (Modal, Toast). */
export function useThemeBoundaryMode(): ResolvedTheme | undefined {
  const boundaryMode = useContext(ThemeBoundaryContext)
  const providerMode = useThemeOptional()?.resolved
  return boundaryMode ?? providerMode
}
