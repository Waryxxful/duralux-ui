import { log } from '../../utils/log'

// Tonos sólidos y suaves que el SCSS emite (`.btn-{tono}` y `.btn-light-{tono}`).
const SOLID_VARIANTS: ReadonlySet<string> = new Set([
  'primary', 'secondary', 'success', 'danger', 'warning', 'info',
  'light', 'dark', 'light-brand', 'teal', 'indigo', 'link',
])
const SOFT_THEME_COLORS: ReadonlySet<string> = new Set([
  'primary', 'secondary', 'success', 'danger', 'warning', 'info',
  'light', 'dark', 'teal', 'indigo',
])

/** Normaliza la variante: outline-* (prohibido por el canon) → light-brand; desconocida → primary. */
export function resolveVariant(variant: string | null | undefined): string {
  const raw = String(variant || 'primary')
  if (raw === 'outline' || raw.startsWith('outline-')) {
    log.warn(`Button: la variante "${raw}" no es canónica; se usa "light-brand".`)
    return 'light-brand'
  }
  if (raw === 'light-brand') return raw
  if (raw.startsWith('light-') && SOFT_THEME_COLORS.has(raw.slice('light-'.length))) return raw
  if (SOLID_VARIANTS.has(raw)) return raw
  log.warn(`Button: la variante "${raw}" no existe; se usa "primary".`)
  return 'primary'
}
