import { cx } from '../../utils/cx'
import { isString } from '../../utils/typeGuards'

const SEMANTIC_VARIANTS = new Set([
  'primary', 'secondary', 'success', 'danger', 'warning', 'info',
  'teal', 'indigo', 'dark', 'darken', 'light',
])

/**
 * Avatar — imagen o iniciales con tamaños Duralux.
 *
 * Props:
 *   src      — image URL
 *   name     — used to derive initials when no src
 *   size     — "sm" | "md" | "lg" | "xl" (default "md")
 *   rounded  — "circle" | "3" (default "circle") | boolean
 *   variant  — color de fondo semántico para las iniciales (alias legacy: bg="bg-...")
 *   alt      — texto alternativo explícito (default: "", avatar decorativo)
 */
function safeString(value, fallback = '') {
  try {
    return String(value)
  } catch {
    return fallback
  }
}

function getInitials(name) {
  const words = safeString(name ?? '').trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return '?'
  if (words.length === 1) return Array.from(words[0]).slice(0, 2).join('').toUpperCase()
  return words.slice(0, 2).map((word) => Array.from(word)[0]).join('').toUpperCase()
}

export function Avatar({
  src = null,
  name = '',
  size = 'md',
  rounded = 'circle',
  variant = 'primary',
  bg = null,
  alt = '',
  className = '',
  style = undefined,
  role: roleProp = undefined,
  'aria-label': ariaLabel = undefined,
  'aria-labelledby': ariaLabelledBy = undefined,
  'aria-describedby': ariaDescribedBy = undefined,
  'aria-hidden': ariaHidden = undefined,
  ...rest
}) {
  const normalizedVariant = isString(variant) && SEMANTIC_VARIANTS.has(variant) ? variant : 'primary'
  const semanticBackground = bg === null
  const bgClass = bg ?? `bg-${normalizedVariant}`
  const roundedClass = rounded === true ? 'circle' : rounded === false ? null : rounded
  const imageAlt = alt == null ? '' : safeString(alt)
  const initials = getInitials(name)
  const meaningfulAlt = imageAlt.trim() !== ''
  const meaningfulLabel = isString(ariaLabel)
    ? ariaLabel.trim() !== ''
    : ariaLabel !== undefined && ariaLabel !== null
  const hasLabelReference = ariaLabelledBy !== undefined && ariaLabelledBy !== null && ariaLabelledBy !== ''
  const explicitHidden = ariaHidden === true || ariaHidden === 'true'
  const explicitVisible = ariaHidden === false || ariaHidden === 'false'
  const informative = !explicitHidden && (meaningfulAlt || meaningfulLabel || hasLabelReference || explicitVisible)

  if (src) {
    return (
      <div
        {...rest}
        className={cx('avatar-image', `avatar-${size}`, className)}
        style={style}
      >
        <img
          src={src}
          alt={imageAlt}
          className="img-fluid"
          role={roleProp ?? (informative ? 'img' : undefined)}
          aria-label={meaningfulLabel ? ariaLabel : undefined}
          aria-labelledby={ariaLabelledBy}
          aria-describedby={ariaDescribedBy}
          aria-hidden={ariaHidden !== undefined ? ariaHidden : informative ? undefined : true}
          style={{ borderRadius: roundedClass === 'circle' ? '50%' : undefined }}
        />
      </div>
    )
  }

  return (
    <div
      {...rest}
      className={cx(
        'avatar-text',
        `avatar-${size}`,
        roundedClass && `rounded-${roundedClass}`,
        bgClass,
        semanticBackground && 'gcu-avatar--semantic',
        semanticBackground && `gcu-avatar--${normalizedVariant}`,
        className,
      )}
      style={style}
      role={roleProp ?? (informative ? 'img' : undefined)}
      aria-label={meaningfulLabel ? ariaLabel : meaningfulAlt ? imageAlt : undefined}
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaDescribedBy}
      aria-hidden={ariaHidden !== undefined ? ariaHidden : informative ? undefined : true}
    >
      {initials}
    </div>
  )
}
