import { forwardRef } from 'react'
import type * as React from 'react'
import { cx } from '../../utils/cx'
import { log } from '../../utils/log'
import { isFiniteNumber } from '../../utils/typeGuards'
import type { SkeletonProps } from '../../public/types'

const MAX_LINES = 12

function toLength(value: SkeletonProps['width']): string | undefined {
  if (value === undefined || value === null || value === '') return undefined
  return isFiniteNumber(value) ? `${value}px` : String(value)
}

function lineCount(variant: SkeletonProps['variant'], lines: number | undefined): number {
  if (lines === undefined) return 1
  if (variant !== 'text') {
    log.warn('Skeleton: `lines` solo aplica a variant="text"; se dibuja un solo bloque.')
    return 1
  }
  if (!isFiniteNumber(lines) || lines < 1) {
    log.warn(`Skeleton: lines=${String(lines)} no es válido; se dibuja una línea.`)
    return 1
  }
  return Math.min(Math.floor(lines), MAX_LINES)
}

/**
 * Skeleton — forma del contenido mientras carga, sobre `.gcu-skeleton` (shimmer con tokens; con
 * reduced-motion queda estático).
 *
 * - variant: `text` (línea de 12 px), `circle` (avatar; usa `width` como diámetro) o `block`
 *   (imagen, gráfico, card).
 * - lines: varias líneas de texto; la última es más corta, como un párrafo real.
 * - Siempre `aria-hidden`: quien carga marca su contenedor con `aria-busy` y anuncia el resultado.
 */
export const Skeleton = /* @__PURE__ */ forwardRef<HTMLSpanElement, SkeletonProps>(function Skeleton(
  { variant = 'text', width, height, lines, className, style, ...rest },
  ref,
) {
  const count = lineCount(variant, lines)
  const inlineSize = toLength(width)
  const blockSize = variant === 'circle' ? toLength(height) ?? inlineSize : toLength(height)
  const dimensions: React.CSSProperties = {
    ...(inlineSize ? { inlineSize } : null),
    ...(blockSize ? { blockSize } : null),
  }
  // `gcu-skeleton--shape` acota los tamaños por defecto a este componente (las apps ya usan .gcu-skeleton).
  const skeletonClasses = cx('gcu-skeleton', 'gcu-skeleton--shape', `gcu-skeleton--${variant}`)

  if (count === 1) {
    return (
      <span
        {...rest}
        ref={ref}
        className={cx(skeletonClasses, className)}
        style={{ ...dimensions, ...style }}
        aria-hidden="true"
      />
    )
  }

  return (
    <span {...rest} ref={ref} className={cx('gcu-skeleton-lines', className)} style={style} aria-hidden="true">
      {Array.from({ length: count }, (_, line) => (
        <span key={`linea-${line + 1}`} className={skeletonClasses} style={dimensions} />
      ))}
    </span>
  )
})
