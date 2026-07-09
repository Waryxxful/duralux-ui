/**
 * Badge — badge de estado con variantes de color.
 *
 * Props:
 *   variant — "success" | "warning" | "danger" | "primary" | "info" | "secondary" | "light" | "dark"
 *   soft    — variante suave (bg-*-100 text-*)
 *   pill    — rounded-pill
 *   className / rest — passthrough HTML
 *
 * "light" is a high-contrast chip (slate bg + dark text + border), not washed-out
 * Bootstrap bg-light which disappears on white cards.
 */
export function Badge({
  variant = 'primary',
  soft = false,
  pill = false,
  children,
  className = '',
  ...rest
}) {
  let tone
  if (variant === 'light') {
    tone = 'gcu-badge gcu-badge--light'
  } else if (soft) {
    tone = `bg-${variant}-100 text-${variant}`
  } else {
    tone = `bg-${variant}`
  }

  const classes = [
    'badge',
    tone,
    pill ? 'rounded-pill' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <span className={classes} {...rest}>
      {children}
    </span>
  )
}
