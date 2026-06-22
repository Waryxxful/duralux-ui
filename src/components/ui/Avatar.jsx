/**
 * Avatar — imagen o iniciales con tamaños Duralux.
 *
 * Props:
 *   src      — image URL
 *   name     — used to derive initials when no src
 *   size     — "sm" | "md" | "lg" | "xl" (default "md")
 *   rounded  — "circle" | "3" (default "circle")
 *   bg       — background class when showing initials
 */
export function Avatar({ src, name = '', size = 'md', rounded = 'circle', bg = 'bg-primary' }) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  if (src) {
    return (
      <div className={`avatar-image avatar-${size}`}>
        <img src={src} alt={name} className="img-fluid" style={{ borderRadius: rounded === 'circle' ? '50%' : undefined }} />
      </div>
    )
  }

  return (
    <div className={`avatar-text avatar-${size} rounded-${rounded} ${bg} text-white`}>
      {initials || '?'}
    </div>
  )
}
