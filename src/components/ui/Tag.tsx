import { forwardRef } from 'react'
import type * as React from 'react'
import { cx } from '../../utils/cx'
import { log } from '../../utils/log'
import { isFiniteNumber, isFunction, isString } from '../../utils/typeGuards'
import { renderIconSlot } from '../../utils/iconSlot'
import type { TagProps, TagTone } from '../../public/types'

const TONES: ReadonlyArray<TagTone> = ['neutral', 'primary', 'success', 'warning', 'danger', 'info']
const warnedTones = new Set<string>()

function resolveTagTone(tone: string | undefined): TagTone {
  const found = TONES.find((candidate) => candidate === tone)
  if (found) return found
  if (tone !== undefined && !warnedTones.has(tone)) {
    warnedTones.add(tone)
    log.warn(`Tag: tono "${tone}" desconocido; se usa "neutral".`)
  }
  return 'neutral'
}

function defaultRemoveLabel(children: React.ReactNode): string {
  if (isString(children) || isFiniteNumber(children)) return `Quitar ${children}`
  log.warn('Tag: con contenido que no es texto, pasa `removeLabel` para nombrar el botón de quitar.')
  return 'Quitar'
}

/**
 * Tag — valor elegido o filtro aplicado, removible.
 *
 * - tone: `neutral` (por defecto) o un tono semántico suave (`-soft` / `-text`, AA por tokens).
 * - onRemove: agrega un botón real «Quitar {texto}» (o `removeLabel`); el tag en sí no es interactivo.
 * - disabled: atenúa y deshabilita el botón de quitar.
 * - Para estados (activo, vencido) usa Badge; Tag es un valor que la persona puede quitar.
 */
export const Tag = /* @__PURE__ */ forwardRef<HTMLSpanElement, TagProps>(function Tag(
  { tone, icon, size = 'md', onRemove, removeLabel, disabled = false, className, children, ...rest },
  ref,
) {
  const resolvedTone = resolveTagTone(tone)
  const removable = isFunction(onRemove)
  return (
    <span
      {...rest}
      ref={ref}
      className={cx(
        'gcu-tag',
        `gcu-tag--${resolvedTone}`,
        size === 'sm' && 'gcu-tag--sm',
        removable && 'gcu-tag--removable',
        disabled && 'gcu-tag--disabled',
        className,
      )}
      aria-disabled={disabled || undefined}
    >
      {renderIconSlot(icon, { className: 'gcu-tag__icon' })}
      <span className="gcu-tag__text">{children}</span>
      {removable && (
        <button
          type="button"
          className="gcu-tag__remove"
          aria-label={removeLabel ?? defaultRemoveLabel(children)}
          disabled={disabled}
          onClick={onRemove}
        >
          <i className="feather-x" aria-hidden="true" />
        </button>
      )}
    </span>
  )
})
