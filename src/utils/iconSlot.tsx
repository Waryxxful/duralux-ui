import { cloneElement, isValidElement } from 'react'
import type * as React from 'react'
import { cx } from './cx'
import { isFiniteNumber, isNonEmptyString, isString } from './typeGuards'

/** Tamaños de icono SVG (Tabler) alineados ópticamente con Feather y el texto adyacente. */
export const ICON_PX = { xs: 12, sm: 14, md: 16, lg: 20, xl: 24 } as const
export type IconSize = keyof typeof ICON_PX

export interface IconSlotOptions {
  className?: string
  size?: IconSize | number
  label?: string
  /** Estilos del consumidor; se fusionan con los del elemento (los del consumidor ganan). */
  style?: React.CSSProperties
  /** Ref hacia el nodo renderizado (glifo `<i>` o SVG clonado). */
  ref?: React.Ref<HTMLElement>
  /** Atributos extra (data-*, eventos, id…) que se reenvían al nodo. */
  rest?: React.HTMLAttributes<HTMLElement>
}

interface IconA11yProps {
  role?: string
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-hidden'?: boolean | 'true' | 'false'
  focusable?: 'false'
}

interface SvgIconProps extends IconA11yProps {
  ref?: React.Ref<HTMLElement>
  size?: number
  stroke?: number
  className?: string
  style?: React.CSSProperties
}

/** El elemento ya trae su propio nombre accesible: no se debe ocultar (DX-035). */
function hasOwnAccessibleName(props: SvgIconProps): boolean {
  return isNonEmptyString(props['aria-label']) || isNonEmptyString(props['aria-labelledby'])
}

function svgA11y(own: SvgIconProps, label: string | undefined): IconA11yProps {
  if (label) return { role: 'img', 'aria-label': label, 'aria-hidden': undefined }
  if (hasOwnAccessibleName(own)) return { role: own.role ?? 'img' }
  return { 'aria-hidden': own['aria-hidden'] ?? true, focusable: 'false' }
}

/**
 * Normaliza un icono de slot:
 * - string → glifo Feather (`feather-${name}`), comportamiento histórico.
 * - elemento React (p. ej. `<IconRobot />` de @tabler/icons-react) → SVG con tamaño,
 *   trazo 2 y aria-hidden, salvo que el consumidor ya los haya fijado. Si el elemento trae
 *   su propio `aria-label`/`aria-labelledby`, se anuncia como imagen y no se oculta.
 */
export function renderIconSlot(
  value: React.ReactNode,
  { className, size = 'md', label, style, ref, rest }: IconSlotOptions = {},
): React.ReactElement | null {
  if (value === null || value === undefined || value === false || value === '') return null
  if (isString(value)) {
    const glyphProps = { ...rest, ref, style, className: cx(`feather-${value}`, className) }
    return label
      ? <i {...glyphProps} role="img" aria-label={label} />
      : <i {...glyphProps} aria-hidden="true" />
  }
  if (!isValidElement<SvgIconProps>(value)) return null
  const own = value.props
  const px = isFiniteNumber(size) ? size : ICON_PX[size] ?? ICON_PX.md
  const mergedStyle = own.style || style ? { ...own.style, ...style } : undefined
  // `ref` indefinido no reemplaza el ref propio del elemento en cloneElement.
  return cloneElement(value, {
    ...rest,
    ref,
    size: own.size ?? px,
    stroke: own.stroke ?? 2,
    className: cx('gcu-icon-svg', own.className, className),
    style: mergedStyle,
    ...svgA11y(own, label),
  })
}
