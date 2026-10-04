import { forwardRef, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import type * as React from 'react'
import { cx } from '../../utils/cx'
import { log } from '../../utils/log'
import { assignRef } from '../../utils/assignRef'
import { isObject } from '../../utils/typeGuards'
import { renderIconSlot } from '../../utils/iconSlot'
import type { SegmentedOption, SegmentedProps, SegmentedValue } from '../../public/types'
import { useIsomorphicLayoutEffect } from './internal/layoutEffect'

function normalizeOptions<V extends SegmentedValue>(
  options: ReadonlyArray<V | SegmentedOption<V>>,
): SegmentedOption<V>[] {
  return options.map((option) => (
    isObject(option) ? option : { value: option, label: String(option) }
  ))
}

/** Mueve el indicador bajo la opción marcada escribiendo variables CSS en el raíz (sin re-render). */
function placeIndicator(root: HTMLDivElement | null) {
  if (!root) return
  const checked = root.querySelector<HTMLElement>('.gcu-segmented__option.is-checked')
  if (!checked) {
    root.removeAttribute('data-indicator')
    return
  }
  root.style.setProperty('--gcu-segmented-x', `${checked.offsetLeft}px`)
  root.style.setProperty('--gcu-segmented-w', `${checked.offsetWidth}px`)
  root.setAttribute('data-indicator', 'true')
}

function SegmentedInner<V extends SegmentedValue = string>({
  options,
  value,
  defaultValue,
  onChange,
  name,
  size = 'md',
  fullWidth = false,
  disabled = false,
  className,
  ...rest
}: SegmentedProps<V>, forwardedRef: React.ForwardedRef<HTMLDivElement>) {
  const normalized = useMemo(() => normalizeOptions(options), [options])
  const baseId = useId()
  const groupName = name ?? `gcu-segmented-${baseId.replace(/:/g, '')}`
  const [uncontrolledValue, setUncontrolledValue] = useState<V | undefined>(defaultValue)
  const current = value !== undefined ? value : uncontrolledValue
  const rootRef = useRef<HTMLDivElement | null>(null)
  const setRootRef = useCallback((node: HTMLDivElement | null) => {
    rootRef.current = node
    assignRef(forwardedRef, node)
  }, [forwardedRef])
  const hasCurrent = normalized.some((option) => option.value === current)
  const missingValue = current !== undefined && !hasCurrent ? current : undefined
  const hasName = Boolean(rest['aria-label'] || rest['aria-labelledby'])

  useEffect(() => {
    if (missingValue !== undefined) log.warn(`Segmented: el valor "${String(missingValue)}" no está entre las opciones.`)
    if (!hasName) log.warn('Segmented: pasa `aria-label` o `aria-labelledby` para nombrar el grupo («Rango», «Vista»).')
    if (normalized.length > 5) log.warn(`Segmented: ${normalized.length} opciones son muchas; con más de 5 usa Select o RadioGroup.`)
  }, [hasName, missingValue, normalized.length])

  // Posición del indicador: se mide antes de pintar y se vuelve a medir si cambia el ancho.
  useIsomorphicLayoutEffect(() => {
    placeIndicator(rootRef.current)
  }, [current, normalized])

  useEffect(() => {
    const root = rootRef.current
    if (!root || typeof ResizeObserver === 'undefined') return undefined
    const observer = new ResizeObserver(() => placeIndicator(root))
    observer.observe(root)
    // El deslizamiento se habilita después de la primera posición: la carga no anima.
    const frame = requestAnimationFrame(() => root.setAttribute('data-animate', 'true'))
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [])

  const select = (option: SegmentedOption<V>) => {
    if (option.value === current) return
    if (value === undefined) setUncontrolledValue(option.value)
    onChange?.(option.value)
  }

  return (
    <div
      {...rest}
      ref={setRootRef}
      role="radiogroup"
      aria-disabled={disabled || undefined}
      className={cx(
        'gcu-segmented',
        size === 'sm' && 'gcu-segmented--sm',
        fullWidth && 'gcu-segmented--full',
        className,
      )}
    >
      <span className="gcu-segmented__indicator" aria-hidden="true" />
      {normalized.map((option) => {
        const checked = option.value === current
        const optionDisabled = disabled || Boolean(option.disabled)
        return (
          <label
            key={String(option.value)}
            className={cx('gcu-segmented__option', checked && 'is-checked', optionDisabled && 'is-disabled')}
          >
            <input
              type="radio"
              className="gcu-segmented__input"
              name={groupName}
              value={String(option.value)}
              checked={checked}
              disabled={optionDisabled}
              onChange={() => select(option)}
            />
            <span className="gcu-segmented__label">
              {renderIconSlot(option.icon, { size: 'sm', className: 'gcu-segmented__icon' })}
              {option.label}
            </span>
          </label>
        )
      })}
    </div>
  )
}

/**
 * Segmented — 2 a 5 opciones cortas y excluyentes que cambian una vista (rango, modo, canal).
 *
 * - Radios nativos dentro de `role="radiogroup"`: una sola parada de Tab y flechas para elegir
 *   (comportamiento del navegador); participa en formularios con `name`.
 * - Controlado (`value` + `onChange`) o no controlado (`defaultValue`).
 * - Indicador que se desliza hasta la opción marcada (movimiento espacial; con reduced-motion los
 *   tokens lo dejan instantáneo). Radio interior = radio exterior − separación.
 * - Nombre del grupo obligatorio: `aria-label` o `aria-labelledby` (avisa por log si falta).
 */
export const Segmented =
  // SAFETY: forwardRef pierde el genérico V; se restituye con la misma firma de props + ref.
  /* @__PURE__ */ forwardRef(SegmentedInner) as <V extends SegmentedValue = string>(
  props: SegmentedProps<V> & { ref?: React.Ref<HTMLDivElement> },
) => React.ReactElement
