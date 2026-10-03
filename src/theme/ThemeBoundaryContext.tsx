import React from 'react'
import type { ResolvedTheme } from './ThemeContext'
import { ThemeBoundaryContext } from './themeBoundary'

export function ThemeBoundaryProvider({ mode, children }: { mode?: ResolvedTheme; children: React.ReactNode }) {
  return <ThemeBoundaryContext.Provider value={mode}>{children}</ThemeBoundaryContext.Provider>
}
