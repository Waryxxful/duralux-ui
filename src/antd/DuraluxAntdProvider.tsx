import { ConfigProvider } from 'antd'
import esES from 'antd/locale/es_ES.js'
import dayjs from 'dayjs'
import 'dayjs/locale/es.js'
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

const THEMES = ['light', 'dark', 'navy'] as const satisfies ReadonlyArray<ResolvedTheme>

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
  const requested = theme ?? boundary ?? ambient ?? documentTheme ?? 'light'
  const known = THEMES.find((item) => item === requested)
  if (!known) log.warn(`DuraluxAntdProvider: tema desconocido "${String(requested)}"; se usa light.`)
  const resolved = known ?? 'light'
  const config = useMemo(() => antdConfigFor(resolved), [resolved])
  return (
    <ConfigProvider theme={config} locale={esES} componentSize="middle">
      {children}
    </ConfigProvider>
  )
}
