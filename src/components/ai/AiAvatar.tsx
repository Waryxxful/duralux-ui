import { forwardRef } from 'react'
import { cx } from '../../utils/cx'
import type { AiAvatarProps } from '../../public/types'

/**
 * AiAvatar — identidad visual del asistente: gradiente de tokens con grano (`.gcu-grain`).
 *
 * - CSS puro, sin WebGL (spec 2.8: una variante WebGL futura cumple REGLAS §13 con fallback).
 * - Decorativo por defecto (`aria-hidden`); con `label` se anuncia como `role="img"`.
 * - busy: el gradiente gira lento mientras el asistente trabaja; con reduced-motion queda fijo.
 * Estilos: src/styles/components/ai-avatar.css.
 */
export const AiAvatar = /* @__PURE__ */ forwardRef<HTMLSpanElement, AiAvatarProps>(function AiAvatar(
  { size = 'md', label, busy = false, className, ...rest },
  ref,
) {
  const a11y = label
    ? { role: 'img' as const, 'aria-label': label }
    : { 'aria-hidden': true as const }
  return (
    <span
      {...rest}
      {...a11y}
      ref={ref}
      className={cx('gcu-ai-avatar', 'gcu-grain', `gcu-ai-avatar--${size}`, busy && 'gcu-ai-avatar--busy', className)}
    >
      <span className="gcu-ai-avatar__core" />
    </span>
  )
})
