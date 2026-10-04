import { forwardRef, useState } from 'react'
import { cx } from '../../utils/cx'
import { isString } from '../../utils/typeGuards'
import { log } from '../../utils/log'
import type { AvatarProps } from '../../public/types'
import { resolveTone } from './internal/tones'

type Printable = string | number | bigint | boolean | null | undefined

function safeString(value: Printable, fallback = ''): string {
  try {
    return String(value)
  } catch {
    return fallback
  }
}

function getInitials(name: Printable): string {
  const words = safeString(name ?? '').trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return '?'
  if (words.length === 1) return Array.from(words[0]).slice(0, 2).join('').toUpperCase()
  return words.slice(0, 2).map((word) => Array.from(word)[0]).join('').toUpperCase()
}

/**
 * Avatar — imagen o iniciales con tamaños Duralux.
 *
 * - src: imagen; si falla al cargar cae en las iniciales (y lo registra con `log.warn`).
 * - name: de aquí salen las iniciales.
 * - size: "sm" | "md" | "lg" | "xl" (default "md").
 * - rounded: "circle" | "3" | boolean (default "circle").
 * - variant: tono de las iniciales; relleno `--gcu-status-{tono}` con texto inverso (AA en los tres temas).
 * - bg: escape legado (clase del consumidor, p. ej. "bg-soft-primary"); desactiva el relleno semántico.
 * - alt / aria-label: sin ellos el avatar es decorativo (aria-hidden).
 */
export const Avatar = /* @__PURE__ */ forwardRef<HTMLDivElement, AvatarProps>(function Avatar({
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
}, ref) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const { tone } = resolveTone(variant, 'Avatar')
  const semanticBackground = bg === null
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
  const showImage = Boolean(src) && failedSrc !== src

  if (showImage) {
    return (
      <div
        {...rest}
        ref={ref}
        className={cx('avatar-image', `avatar-${size}`, 'gcu-avatar', 'gcu-avatar--image', className)}
        style={style}
      >
        <img
          src={src ?? undefined}
          alt={imageAlt}
          className="img-fluid"
          role={roleProp ?? (informative ? 'img' : undefined)}
          aria-label={meaningfulLabel ? ariaLabel : undefined}
          aria-labelledby={ariaLabelledBy}
          aria-describedby={ariaDescribedBy}
          aria-hidden={ariaHidden !== undefined ? ariaHidden : informative ? undefined : true}
          style={{ borderRadius: roundedClass === 'circle' ? '50%' : undefined }}
          onError={() => {
            log.warn(`Avatar: no se pudo cargar la imagen "${src}"; se muestran las iniciales.`)
            setFailedSrc(src)
          }}
        />
      </div>
    )
  }

  return (
    <div
      {...rest}
      ref={ref}
      className={cx(
        'avatar-text',
        `avatar-${size}`,
        'gcu-avatar',
        roundedClass && `rounded-${roundedClass}`,
        bg,
        semanticBackground && 'gcu-avatar--semantic',
        semanticBackground && `gcu-avatar--${tone}`,
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
})
