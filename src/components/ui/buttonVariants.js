// Solid tones + theme soft tones emitted by SCSS `@each $color in $theme-colors` → .btn-light-#{$color}
const SOLID_VARIANTS = new Set([
  'primary', 'secondary', 'success', 'danger', 'warning', 'info',
  'light', 'dark', 'light-brand', 'teal', 'indigo', 'link',
])
const SOFT_THEME_COLORS = new Set([
  'primary', 'secondary', 'success', 'danger', 'warning', 'info',
  'light', 'dark', 'teal', 'indigo',
])

/** Map banned outline-* / unknown strings; keep soft light-* that SCSS actually emits. */
export function resolveVariant(variant) {
  const raw = String(variant || 'primary')
  // outline* is banned (fidelity gate); soft light-* is the Duralux equivalent.
  if (raw === 'outline' || raw.startsWith('outline-')) {
    if (typeof console !== 'undefined' && console.warn) {
      console.warn(`[duralux/ui] Button variant "${raw}" is non-canonical; use "light-brand" or a solid semantic variant.`)
    }
    return 'light-brand'
  }
  // .btn-light-brand is a dedicated class (not $theme-colors); keep as-is.
  if (raw === 'light-brand') return raw
  // Soft semantic: light-danger → btn-light-danger (template soft buttons).
  if (raw.startsWith('light-')) {
    const tone = raw.slice('light-'.length)
    if (SOFT_THEME_COLORS.has(tone)) return raw
  }
  if (SOLID_VARIANTS.has(raw)) return raw
  if (typeof console !== 'undefined' && console.warn) {
    console.warn(`[duralux/ui] Button variant "${raw}" is unknown; falling back to "primary".`)
  }
  return 'primary'
}
