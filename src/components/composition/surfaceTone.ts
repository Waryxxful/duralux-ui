/** Tonos de las superficies de color (Spotlight, WelcomeBand): rellenos profundos con texto blanco AA. */
import type { ColorSurfaceTone } from '../../public/types'
import { log } from '../../utils/log'

const SURFACE_TONES = ['primary', 'indigo', 'dark', 'danger', 'success', 'info', 'teal'] as const satisfies ReadonlyArray<ColorSurfaceTone>

export function resolveSurfaceTone(component: string, tone: string | undefined): ColorSurfaceTone {
  if (tone === undefined) return 'primary'
  const known = SURFACE_TONES.find((item) => item === tone)
  if (known) return known
  log.warn(`${component}: tono de superficie desconocido "${String(tone)}"; se usa "primary".`)
  return 'primary'
}
