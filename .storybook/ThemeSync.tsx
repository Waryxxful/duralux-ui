import { useEffect } from 'react'
import { applyThemeToDocument, type ResolvedTheme } from '../src/theme/ThemeContext'

/** Aplica el tema elegido en la barra de Storybook al documento del iframe. */
export function ThemeSync({ theme }: { theme: ResolvedTheme }) {
  useEffect(() => {
    applyThemeToDocument(theme)
  }, [theme])
  return null
}
