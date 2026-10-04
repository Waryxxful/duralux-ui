import { ConfigProvider } from 'antd'
import esES from 'antd/locale/es_ES'
import dayjs from 'dayjs'
import 'dayjs/locale/es'
import type * as React from 'react'
import { useMemo, useSyncExternalStore } from 'react'
import { useThemeOptional, type ResolvedTheme } from '../theme/ThemeContext'
import { useThemeBoundaryMode } from '../theme/themeBoundary'
import { log } from '../utils/log'
import { antdConfigFor } from './config'

dayjs.locale('es')

// Sin ThemeProvider (satélite montada en el shell) el tema vive en <html data-gcu-theme>.
function subscribeDocumentTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-gcu-theme'] })
  return () => observer.disconnect()
}
const readDocumentTheme = () => document.documentElement.getAttribute('data-gcu-theme') ?? undefined

const THEMES: ReadonlySet<string> = new Set<ResolvedTheme>(['light', 'dark', 'navy'])

export interface DuraluxAntdProviderProps {
  children: React.ReactNode
  /** Fuerza un tema. Por defecto: ThemeScope, luego `ThemeProvider` y, sin ellos, `data-gcu-theme` de <html>. */
  theme?: ResolvedTheme
}

/**
 * Envuelve componentes antd con el tema Duralux (tokens, alturas 32/36/40, Inter, radios),
 * locale español y popups por encima de los modales del sistema.
 */
export function DuraluxAntdProvider({ children, theme }: DuraluxAntdProviderProps) {
  const ambient = useThemeOptional()?.resolved
  const boundary = useThemeBoundaryMode()
  const documentTheme = useSyncExternalStore(subscribeDocumentTheme, readDocumentTheme, () => undefined)
  let resolved = (theme ?? boundary ?? ambient ?? documentTheme ?? 'light') as ResolvedTheme
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
