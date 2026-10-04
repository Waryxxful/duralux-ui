import { forwardRef } from 'react'
import { cx } from '../../utils/cx'
import type { BadgeProps } from '../../public/types'
import { resolveTone } from './internal/tones'

/**
 * Badge — etiqueta de estado con tokens por tono.
 *
 * - variant: tono semántico; `light-{tono}` se pinta suave; "light" es el chip neutro de alto contraste.
 * - soft: fondo suave `--gcu-{tono}-soft` con texto `--gcu-{tono}-text` (AA garantizado por tokens).
 * - dot: punto de estado decorativo antes del texto (el estado nunca va solo en color).
 * - pill: bordes redondeados completos.
 * - as: elemento renderizado; fuera de <span> se marca interactivo.
 */
export const Badge = forwardRef<HTMLElement, BadgeProps>(function Badge({
  variant = 'primary',
  soft = false,
  pill = false,
  dot = false,
  as: Tag = 'span',
  children,
  className = '',
  ...rest
}, ref) {
  const { tone, softAlias } = resolveTone(variant, 'Badge')
  const appearance = tone === 'light' ? null : soft || softAlias ? 'soft' : 'solid'

  return (
    <Tag
      {...rest}
      ref={ref}
      className={cx(
        'badge',
        'gcu-badge',
        appearance && `gcu-badge--${appearance}`,
        `gcu-badge--${tone}`,
        pill && 'rounded-pill',
        dot && 'gcu-badge--dot',
        Tag !== 'span' && 'gcu-badge--interactive',
        className,
      )}
    >
      {dot && <span className="gcu-badge__dot" aria-hidden="true" />}
      {children}
    </Tag>
  )
})
