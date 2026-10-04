import { isString } from '../../../utils/typeGuards'
import { log } from '../../../utils/log'

/** Tonos con relleno propio en los componentes de presentación (Badge, Avatar, Progress, Timeline). */
export const PRESENTATION_TONES = [
  'primary', 'secondary', 'success', 'danger', 'warning', 'info', 'teal', 'indigo', 'dark', 'light',
] as const
export type PresentationTone = (typeof PRESENTATION_TONES)[number]

const TONES = new Set<string>(PRESENTATION_TONES)
const ALIASES: Record<string, PresentationTone> = { darken: 'dark', 'light-brand': 'primary', 'light-light': 'light' }
const warned = new Set<string>()

export interface ResolvedTone {
  tone: PresentationTone
  /** La variante pedida era `light-{tono}`: se pinta suave. */
  softAlias: boolean
}

/**
 * Normaliza la variante pública a un tono con tokens. `light-{tono}` se pinta suave;
 * un valor desconocido avisa una vez por componente y valor, y cae en `fallback`.
 */
export function resolveTone(variant: unknown, component: string, fallback: PresentationTone = 'primary'): ResolvedTone {
  if (!isString(variant)) return { tone: fallback, softAlias: false }
  if (TONES.has(variant)) return { tone: variant as PresentationTone, softAlias: false }
  if (ALIASES[variant]) return { tone: ALIASES[variant], softAlias: variant !== 'light-light' }
  if (variant.startsWith('light-') && TONES.has(variant.slice(6))) {
    return { tone: variant.slice(6) as PresentationTone, softAlias: true }
  }
  const key = `${component}:${variant}`
  if (!warned.has(key)) {
    warned.add(key)
    log.warn(`${component}: variante "${variant}" desconocida; se usa "${fallback}".`)
  }
  return { tone: fallback, softAlias: false }
}
