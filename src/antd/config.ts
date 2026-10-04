import { theme as antdTheme, type ThemeConfig } from 'antd'
import { antdThemes } from '../generated/antd-theme'
import type { ResolvedTheme } from '../theme/ThemeContext'

/** ThemeConfig de antd derivado de los tokens Duralux (algoritmo oscuro en dark y navy). */
export function antdConfigFor(theme: ResolvedTheme) {
  const preset = antdThemes[theme]
  return {
    algorithm: preset.dark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    token: { ...preset.token },
    cssVar: { key: `duralux-${theme}` },
  } satisfies ThemeConfig
}
