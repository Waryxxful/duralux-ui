import { forwardRef } from 'react'
import { cx } from '../../utils/cx'
import { isString } from '../../utils/typeGuards'
import type { PersonProps } from '../../public/types'
import { Avatar } from './Avatar'

/**
 * Person — avatar + nombre + dato secundario (rol, equipo) en una sola línea.
 *
 * - El avatar es decorativo: el nombre ya está en texto.
 * - Nombre y dato se truncan con «…» y el valor completo queda en `title`.
 * - src: foto (con contorno interior, Craft); si falla, iniciales.
 * Estilos: src/styles/components/person.css.
 */
export const Person = /* @__PURE__ */ forwardRef<HTMLSpanElement, PersonProps>(function Person({
  name,
  meta,
  src = null,
  size = 'sm',
  variant = 'primary',
  className,
  ...rest
}, ref) {
  return (
    <span {...rest} ref={ref} className={cx('gcu-person', `gcu-person--${size}`, className)}>
      <Avatar name={name} src={src} size={size} variant={variant} />
      <span className="gcu-person__text">
        <span className="gcu-person__name" title={name}>{name}</span>
        {meta !== undefined && meta !== null && meta !== '' && (
          <span className="gcu-person__meta" title={isString(meta) ? meta : undefined}>{meta}</span>
        )}
      </span>
    </span>
  )
})
