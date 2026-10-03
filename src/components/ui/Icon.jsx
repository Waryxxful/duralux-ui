/**
 * Icon — icono feather con tamaños opcionales.
 *
 * Props:
 *   name       — bare feather icon name (e.g. "airplay"); class built as feather-${name}
 *   icon       — alternativa a name: icono Tabler (`<IconRobot />`), normalizado a tamaño y trazo 2
 *   size       — "xs" | "sm" | "md" | "lg" | "xl" | number (px)
 *   aria-label — si se pasa, se establece role="img"; si no, aria-hidden="true"
 *   className  — clases adicionales
 *   style      — estilos adicionales (se fusionan con font-size del size)
 */
import { cx } from '../../utils/cx'
import { isFiniteNumber } from '../../utils/typeGuards'
import { renderIconSlot } from '../../utils/iconSlot'

const sizeMap = {
  xs: '0.625rem',
  sm: '0.75rem',
  md: '1rem',
  lg: '1.25rem',
  xl: '1.5rem',
}

export function Icon({ name, icon = undefined, size = undefined, 'aria-label': label = undefined, className = '', style = undefined, ...rest }) {
  if (icon) return renderIconSlot(icon, { size: size ?? 'md', label, className })
  const resolvedSize = isFiniteNumber(size) ? size : sizeMap[size]
  const inlineSize = resolvedSize ? { fontSize: resolvedSize, ...style } : style
  const cls = cx('gcu-icon', 'feather-' + name, className)

  if (label) {
    return <i className={cls} role="img" aria-label={label} style={inlineSize} {...rest} />
  }
  return <i className={cls} aria-hidden="true" style={inlineSize} {...rest} />
}
