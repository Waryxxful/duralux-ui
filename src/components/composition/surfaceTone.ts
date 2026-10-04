/** Tonos de las superficies de color (Spotlight, WelcomeBand): rellenos profundos con texto blanco AA. */
import type { ColorSurfaceTone } from '../../public/types'
import { log } from '../../utils/log'

const SURFACE_TONES = /* @__PURE__ */ new Set<string>(['primary', 'indigo', 'dark', 'danger', 'success', 'info', 'teal'] satisfies ColorSurfaceTone[])

export function resolveSurfaceTone(component: string, tone: string | undefined): ColorSurfaceTone {
  if (tone === undefined) return 'primary'
  if (SURFACE_TONES.has(tone)) return tone as ColorSurfaceTone
  log.warn(`${component}: tono de superficie desconocido "${String(tone)}"; se usa "primary".`)
  return 'primary'
}
