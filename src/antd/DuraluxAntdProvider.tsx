import { ConfigProvider } from 'antd'
import esES from 'antd/locale/es_ES'
import dayjs from 'dayjs'
import 'dayjs/locale/es'
import type * as React from 'react'
import { useMemo } from 'react'
import { useThemeOptional, type ResolvedTheme } from '../theme/ThemeContext'
import { log } from '../utils/log'
import { antdConfigFor } from './config'

dayjs.locale('es')

const THEMES: ReadonlySet<string> = new Set<ResolvedTheme>(['light', 'dark', 'navy'])

export interface DuraluxAntdProviderProps {
  children: React.ReactNode
  /** Fuerza un tema. Por defecto sigue al `ThemeProvider` de @duralux/ui (tema resuelto). */
  theme?: ResolvedTheme
}

/**
 * Envuelve componentes antd con el tema Duralux (tokens, alturas 32/36/40, Inter, radios),
 * locale español y popups por encima de los modales del sistema.
 */
export function DuraluxAntdProvider({ children, theme }: DuraluxAntdProviderProps) {
  const ambient = useThemeOptional()?.resolved
  let resolved: ResolvedTheme = theme ?? ambient ?? 'light'
  if (!THEMES.has(resolved)) {
    log.warn(`DuraluxAntdProvider: tema desconocido "${String(resolved)}"; se usa light.`)
    resolved = 'light'
  }
  const config = useMemo(() => antdConfigFor(resolved), [resolved])
  return (
    <ConfigProvider theme={config} locale={esES} componentSize="middle">
      {children}
    </ConfigProvider>
  )
}
