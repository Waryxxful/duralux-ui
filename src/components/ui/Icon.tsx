import { forwardRef } from 'react'
import { cx } from '../../utils/cx'
import { isFiniteNumber } from '../../utils/typeGuards'
import { renderIconSlot } from '../../utils/iconSlot'
import { log } from '../../utils/log'
import type { IconProps } from '../../public/types'

const sizeMap = {
  xs: '0.625rem',
  sm: '0.75rem',
  md: '1rem',
  lg: '1.25rem',
  xl: '1.5rem',
} as const

/**
 * Icon — glifo Feather (`name`) o icono Tabler (`icon`) con tamaño opcional.
 *
 * - name: nombre Feather sin prefijo (p. ej. "airplay"); clase `feather-${name}`.
 * - icon: alternativa a name; SVG normalizado a tamaño y trazo 2. Conserva style, className y atributos extra.
 * - size: "xs" | "sm" | "md" | "lg" | "xl" | número (px).
 * - aria-label: con nombre se anuncia como imagen (role="img"); sin nombre es decorativo (aria-hidden).
 */
export const Icon = forwardRef<HTMLElement, IconProps>(function Icon(
  { name, icon = undefined, size = undefined, 'aria-label': label = undefined, className = '', style = undefined, ...rest },
  ref,
) {
  if (icon) {
    return renderIconSlot(icon, { size: size ?? 'md', label, className, style, ref, rest })
  }
  if (!name) log.warn('Icon sin `name` ni `icon`: no se renderiza ningún glifo.')
  const resolvedSize = isFiniteNumber(size) ? size : size ? sizeMap[size] : undefined
  const inlineStyle = resolvedSize ? { fontSize: resolvedSize, ...style } : style
  const cls = cx('gcu-icon', name && `feather-${name}`, className)

  if (label) {
    return <i {...rest} ref={ref} className={cls} role="img" aria-label={label} style={inlineStyle} />
  }
  return <i {...rest} ref={ref} className={cls} aria-hidden="true" style={inlineStyle} />
})
