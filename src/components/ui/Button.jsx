/**
 * Button — botón con variantes, tamaños y estado de carga.
 *
 * Props:
 *   variant   — "primary" | "secondary" | "success" | "danger" | "warning" | "info" | "light" | "dark" | "light-brand"
 *   outline   — DEPRECADO e ignorado: la plantilla Duralux no usa variantes outline; usá variant="light-brand"
 *   size      — "sm" | "md" | "lg"
 *   loading   — muestra spinner y deshabilita
 *   icon      — feather class string shown before label (legacy; prefer startIcon)
 *   startIcon — bare feather name → leading icon
 *   endIcon   — bare feather name → trailing icon
 *   as        — element type (default "button")
 */
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
  const sizeClass = size ? ` btn-${size}` : ''
  const variantClass = `btn-${variant}` // outline deprecado: la plantilla no usa variantes outline

  return (
    <Tag
      className={`btn ${variantClass}${sizeClass} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
      href={href}
      type={Tag === 'button' ? type : undefined}
      {...props}
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
  return (
    <button
      type="button"
      className={['btn', 'btn-icon', `btn-${variant || 'light-brand'}`, size ? `btn-${size}` : '', className].filter(Boolean).join(' ')}
      aria-label={label}
      title={label}
      {...rest}
    >
      <i className={`feather-${icon}`} aria-hidden />
    </button>
  )
}
