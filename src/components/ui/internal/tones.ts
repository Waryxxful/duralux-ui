import { isString } from '../../../utils/typeGuards'
import { log } from '../../../utils/log'

/** Tonos con relleno propio en los componentes de presentación (Badge, Avatar, Progress, Timeline). */
export const PRESENTATION_TONES = [
  'primary', 'secondary', 'success', 'danger', 'warning', 'info', 'teal', 'indigo', 'dark', 'light',
] as const
export type PresentationTone = (typeof PRESENTATION_TONES)[number]

/** Alias públicos que no son un tono directo. */
const ALIASES = new Map<string, PresentationTone>([
  ['darken', 'dark'],
  ['light-brand', 'primary'],
  ['light-light', 'light'],
])
const warned = new Set<string>()

function findTone(value: string): PresentationTone | undefined {
  return PRESENTATION_TONES.find((tone) => tone === value)
}

export interface ResolvedTone {
  tone: PresentationTone
  /** La variante pedida era `light-{tono}`: se pinta suave. */
  softAlias: boolean
}

/**
 * Normaliza la variante pública a un tono con tokens. `light-{tono}` se pinta suave;
 * un valor desconocido avisa una vez por componente y valor, y cae en `fallback`.
 */
export function resolveTone(
  variant: string | null | undefined,
  component: string,
  fallback: PresentationTone = 'primary',
): ResolvedTone {
  if (!isString(variant)) return { tone: fallback, softAlias: false }
  const direct = findTone(variant)
  if (direct) return { tone: direct, softAlias: false }
  const alias = ALIASES.get(variant)
  if (alias) return { tone: alias, softAlias: variant !== 'light-light' }
  const lightTone = variant.startsWith('light-') ? findTone(variant.slice(6)) : undefined
  if (lightTone) return { tone: lightTone, softAlias: true }
  const key = `${component}:${variant}`
  if (!warned.has(key)) {
    warned.add(key)
    log.warn(`${component}: variante "${variant}" desconocida; se usa "${fallback}".`)
  }
  return { tone: fallback, softAlias: false }
}
