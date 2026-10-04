import { forwardRef } from 'react'
import type * as React from 'react'
import { cx } from '../../utils/cx'
import { isArray, isFiniteNumber, isObject, isString } from '../../utils/typeGuards'
import type { SelectOption, SelectProps, SelectValue } from '../../public/types'
import { valueToken } from './internal/selectCoreModel'
import { ariaInvalidFor, resolveInvalid, sizeClass, warnOnce } from './internal/fieldState'

const MAX_OPTION_COUNT = 10000

interface NativeOption {
  value: SelectValue
  label: React.ReactNode
  disabled: boolean
  index: number
}

type RawOption = SelectValue | SelectOption | null | undefined

function readOption<K extends keyof SelectOption>(option: SelectOption, key: K): SelectOption[K] | undefined {
  try {
    return option[key]
  } catch {
    return undefined
  }
}

function isValue<T>(value: T): value is T & SelectValue {
  return isString(value) || isFiniteNumber(value)
}

function normalizeNativeOptions(options: SelectProps['options']): NativeOption[] {
  if (!isArray<SelectProps['options'], RawOption>(options)) return []

  let length = 0
  try {
    length = Number.isSafeInteger(options.length) ? Math.min(options.length, MAX_OPTION_COUNT) : 0
  } catch {
    return []
  }

  const normalized: NativeOption[] = []
  let skipped = 0
  for (let index = 0; index < length; index += 1) {
    let raw: RawOption
    try {
      raw = options[index]
    } catch {
      skipped += 1
      continue
    }

    if (isValue(raw)) {
      normalized.push({ value: raw, label: raw, disabled: false, index })
      continue
    }
    if (raw === null || raw === undefined || !isObject(raw)) {
      skipped += 1
      continue
    }

    const value = readOption(raw, 'value')
    if (!isValue(value)) {
      skipped += 1
      continue
    }
    const label = readOption(raw, 'label')
    normalized.push({
      value,
      label: label === undefined ? value : label,
      disabled: Boolean(readOption(raw, 'disabled')),
      index,
    })
  }
  if (skipped > 0) {
    warnOnce('select-options-skipped', `Select descartó ${skipped} opción(es) sin \`value\` string o number.`)
  }
  return normalized
}

/**
 * Select — `<select class="form-select">` nativo con tokens del tema.
 *
 * - options: `[{ value, label, disabled }]` o `[string | number]`; las inválidas se descartan con aviso.
 * - placeholder: primera opción vacía y deshabilitada.
 * - error: borde y `aria-invalid`. `invalid` está deprecado.
 * - controlSize: alturas 32 / 36 / 40 px. El atributo nativo `size` (filas visibles) se conserva.
 */
export const Select = /* @__PURE__ */ forwardRef<HTMLSelectElement, SelectProps>(function Select({
  options = [],
  invalid,
  error,
  controlSize,
  className = '',
  children,
  placeholder,
  'aria-invalid': ariaInvalid,
  ...props
}, ref) {
  const isInvalid = resolveInvalid('Select', invalid, error)
  const normalizedOptions = normalizeNativeOptions(options)
  return (
    <select
      {...props}
      ref={ref}
      className={cx('form-control', 'form-select', sizeClass('form-select', controlSize), isInvalid && 'is-invalid', className)}
      aria-invalid={ariaInvalidFor(ariaInvalid, isInvalid)}
    >
      {placeholder != null && <option value="" disabled>{placeholder}</option>}
      {children || normalizedOptions.map(option => (
        <option key={`${valueToken(option.value)}-${option.index}`} value={option.value} disabled={option.disabled}>
          {option.label}
        </option>
      ))}
    </select>
  )
})
