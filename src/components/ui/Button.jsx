/**
 * Button — botón con variantes, tamaños y estado de carga.
 *
 * Props:
 *   variant  — "primary" | "secondary" | "success" | "danger" | "warning" | "info" | "light" | "dark"
 *              Prefix with "outline-" for outlined. "light-brand" for the brand light variant.
 *   size     — "sm" | "md" | "lg"
 *   loading  — muestra spinner y deshabilita
 *   icon     — feather class string shown before label
 *   as       — element type (default "button")
 */
export function Button({
  variant = 'primary',
  size,
  loading,
  icon,
  disabled,
  onClick,
  href,
  as: Tag = href ? 'a' : 'button',
  className = '',
  children,
  type = 'button',
  ...props
}) {
  const sizeClass = size ? ` btn-${size}` : ''
  const variantClass = variant.startsWith('outline-') || variant === 'light-brand'
    ? `btn-${variant}`
    : `btn-${variant}`

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
        : icon && <i className={`${icon} me-2`}></i>
      }
      {children}
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
 *   icon       — feather class string (e.g. "feather-edit")
 *   aria-label — requerido para accesibilidad
 *   variant, size, disabled, loading, className, ...rest
 */
export function IconButton({ icon, 'aria-label': label, className = '', ...props }) {
  return (
    <Button
      icon={icon}
      aria-label={label}
      title={label}
      className={`btn-icon ${className}`}
      {...props}
    />
  )
}
