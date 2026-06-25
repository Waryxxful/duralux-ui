/**
 * Icon — icono feather con tamaños opcionales.
 *
 * Props:
 *   name       — bare feather icon name (e.g. "airplay"); class built as feather-${name}
 *   size       — "xs" | "sm" | "md" | "lg" | "xl" | number (px)
 *   aria-label — si se pasa, se establece role="img"; si no, aria-hidden="true"
 *   className  — clases adicionales
 *   style      — estilos adicionales (se fusionan con font-size del size)
 */

const sizeMap = {
  xs: '0.625rem',
  sm: '0.75rem',
  md: '1rem',
  lg: '1.25rem',
  xl: '1.5rem',
}

export function Icon({ name, size, 'aria-label': label, className = '', style, ...rest }) {
  const resolvedSize = typeof size === 'number' ? size : sizeMap[size]
  const inlineSize = resolvedSize ? { fontSize: resolvedSize, ...style } : style
  const cls = ['feather-' + name, className].filter(Boolean).join(' ')

  if (label) {
    return <i className={cls} role="img" aria-label={label} style={inlineSize} {...rest} />
  }
  return <i className={cls} aria-hidden="true" style={inlineSize} {...rest} />
}
