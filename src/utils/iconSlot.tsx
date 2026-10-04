import { cloneElement, isValidElement } from 'react'
import type * as React from 'react'
import { cx } from './cx'
import { isFiniteNumber, isString } from './typeGuards'

/** Tamaños de icono SVG (Tabler) alineados ópticamente con Feather y el texto adyacente. */
export const ICON_PX = { xs: 12, sm: 14, md: 16, lg: 20, xl: 24 } as const
export type IconSize = keyof typeof ICON_PX

export interface IconSlotOptions {
  className?: string
  size?: IconSize | number
  label?: string
}

interface SvgIconProps {
  size?: number
  stroke?: number
  className?: string
}

/**
 * Normaliza un icono de slot:
 * - string → glifo Feather (`feather-${name}`), comportamiento histórico.
 * - elemento React (p. ej. `<IconRobot />` de @tabler/icons-react) → SVG con tamaño,
 *   trazo 2 y aria-hidden, salvo que el consumidor ya los haya fijado.
 */
export function renderIconSlot(value: React.ReactNode, { className, size = 'md', label }: IconSlotOptions = {}): React.ReactElement | null {
  if (value === null || value === undefined || value === false || value === '') return null
  if (isString(value)) {
    return label
      ? <i className={cx(`feather-${value}`, className)} role="img" aria-label={label} />
      : <i className={cx(`feather-${value}`, className)} aria-hidden="true" />
  }
  if (!isValidElement<SvgIconProps>(value)) return null
  const px = isFiniteNumber(size) ? size : ICON_PX[size] ?? ICON_PX.md
  const a11y = label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true, focusable: 'false' }
  return cloneElement(value, {
    size: value.props.size ?? px,
    stroke: value.props.stroke ?? 2,
    className: cx('gcu-icon-svg', value.props.className, className),
    ...a11y,
  })
}
