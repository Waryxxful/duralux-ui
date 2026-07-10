/**
 * Avatar — imagen o iniciales con tamaños Duralux.
 *
 * Props:
 *   src      — image URL
 *   name     — used to derive initials when no src
 *   size     — "sm" | "md" | "lg" | "xl" (default "md")
 *   rounded  — "circle" | "3" (default "circle") | boolean
 *   variant  — color de fondo semántico para las iniciales (alias legacy: bg="bg-...")
 *   alt      — texto alternativo de la imagen (default: name)
 */
export function Avatar({ src = null, name = '', size = 'md', rounded = 'circle', variant = 'primary', bg = null, alt = '', className = '', style = undefined, ...rest }) {
  const bgClass = bg ?? (variant ? `bg-${variant}` : 'bg-primary')
  const roundedClass = rounded === true ? 'circle' : rounded
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  if (src) {
    return (
      <div className={`avatar-image avatar-${size} ${className}`} style={style} {...rest}>
        <img src={src} alt={alt ?? name} className="img-fluid" style={{ borderRadius: roundedClass === 'circle' ? '50%' : undefined }} />
      </div>
    )
  }

  return (
    <div className={`avatar-text avatar-${size} rounded-${roundedClass} ${bgClass} text-white ${className}`} style={style} {...rest}>
      {initials || '?'}
    </div>
  )
}
