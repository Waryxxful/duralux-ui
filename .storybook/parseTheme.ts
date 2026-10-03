import type { ResolvedTheme } from '../src/theme/ThemeContext'

export function parseTheme(value: string): ResolvedTheme {
  return value === 'dark' || value === 'navy' ? value : 'light'
}
