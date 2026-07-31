import { cx } from '../../utils/cx'

/**
 * Button — botón con variantes, tamaños y estado de carga.
 *
 * Props:
 *   variant   — solid semantic | "light-brand" | soft "light-{semantic}" (SCSS .btn-light-*)
 *   outline   — DEPRECADO e ignorado: la plantilla Duralux no usa variantes outline; usá variant="light-brand"
 *   size      — "sm" | "md" | "lg"
 *   loading   — muestra spinner y deshabilita
 *   icon      — feather class string shown before label (legacy; prefer startIcon)
 *   startIcon — bare feather name → leading icon
 *   endIcon   — bare feather name → trailing icon
 *   as        — element type (default "button")
 */
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

export function Button({
  variant = 'primary',
  outline = false,
  size = undefined,
  loading = false,
  icon = null,
  startIcon = null,
  endIcon = null,
  disabled = false,
  onClick = undefined,
  href = undefined,
  as: Tag = href ? 'a' : 'button',
  className = '',
  children,
  type = 'button',
  ...props
}) {
  // outline deprecado: la plantilla no usa variantes outline
  void outline
  const tone = resolveVariant(variant)
  const isDisabled = disabled || loading
  const isAnchor = Tag === 'a'
  const isDisabledAnchor = isAnchor && isDisabled
  const handleClick = isDisabledAnchor
    ? (event) => {
        event.preventDefault()
        event.stopPropagation()
      }
    : onClick

  return (
    <Tag
      {...props}
      className={cx('btn', `btn-${tone}`, size && `btn-${size}`, className)}
      onClick={handleClick}
      disabled={isAnchor ? undefined : isDisabled}
      href={isDisabledAnchor ? undefined : href}
      type={Tag === 'button' ? type : undefined}
      aria-disabled={isDisabledAnchor ? true : props['aria-disabled']}
      tabIndex={isDisabledAnchor ? -1 : props.tabIndex}
    >
      {loading
        ? <span className="spinner-border spinner-border-sm me-2" role="status"></span>
        : (startIcon
            ? <i className={`feather-${startIcon} me-2`} aria-hidden />
            : icon && <i className={`${icon} me-2`}></i>
          )
      }
      {children}
      {!loading && endIcon && <i className={`feather-${endIcon} ms-2`} aria-hidden />}
    </Tag>
  )
}

/**
 * LinkButton — Button renderizado como ancla (<a>).
 *
 * Props: mismas que Button + href requerido.
 */
export function LinkButton({ href, ...props }) {
  return <Button as="a" href={href} {...props} />
}

/**
 * IconButton — Button solo con icono, sin texto.
 *
 * Props:
 *   icon    — bare feather name (e.g. "edit")
 *   label   — REQUIRED; used as aria-label and title
 *   variant (default "light-brand", canónico del template), size, ...rest (outline deprecado e ignorado)
 */
export function IconButton({ icon, label, variant, size, outline, className = '', ...rest }) {
  void outline
  const tone = resolveVariant(variant || 'light-brand')
  return (
    <button
      type="button"
      className={cx('btn', 'btn-icon', `btn-${tone}`, size && `btn-${size}`, className)}
      aria-label={label}
      title={label}
      {...rest}
    >
      <i className={`feather-${icon}`} aria-hidden />
    </button>
  )
}
