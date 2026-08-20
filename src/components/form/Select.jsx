import { cx } from '../../utils/cx'
import { isSelectValue, valueToken } from './internal/selectCoreModel'
import { isArray, isObject } from '../../utils/typeGuards'

const MAX_OPTION_COUNT = 10000

function readOption(option, key) {
  try {
    return option?.[key]
  } catch {
    return undefined
  }
}

function normalizeNativeOptions(options) {
  if (!isArray(options)) return []

  let length = 0
  try {
    length = Number.isSafeInteger(options.length) ? Math.min(options.length, MAX_OPTION_COUNT) : 0
  } catch {
    return []
  }

  const normalized = []
  for (let index = 0; index < length; index += 1) {
    let raw
    try {
      raw = options[index]
    } catch {
      continue
    }

    if (isSelectValue(raw)) {
      normalized.push({ value: raw, label: raw, disabled: false, index })
      continue
    }
    if (raw === null || !isObject(raw)) continue

    const value = readOption(raw, 'value')
    if (!isSelectValue(value)) continue
    const label = readOption(raw, 'label')
    normalized.push({
      value,
      label: label === undefined ? value : label,
      disabled: Boolean(readOption(raw, 'disabled')),
      index,
    })
  }
  return normalized
}

/**
 * Select — select nativo estilizado con Duralux.
 *
 * Props:
 *   options  — [{ value, label }] o [string | number]
 *   error    — estado de error → is-invalid (alias legacy: invalid)
 *   Todos los props nativos de <select> son válidos.
 */
export function Select({
  options = [],
  invalid,
  error,
  className = '',
  children,
  placeholder,
  'aria-invalid': ariaInvalid,
  ...props
}) {
  const isInvalid = Boolean(invalid || error)
  const normalizedOptions = normalizeNativeOptions(options)
  return (
    <select
      {...props}
      className={cx('form-control', 'form-select', isInvalid && 'is-invalid', className)}
      aria-invalid={ariaInvalid !== undefined ? ariaInvalid : isInvalid ? true : undefined}
    >
      {placeholder != null && <option value="" disabled>{placeholder}</option>}
      {children || normalizedOptions.map(option => (
        <option key={`${valueToken(option.value)}-${option.index}`} value={option.value} disabled={option.disabled}>
          {option.label}
        </option>
      ))}
    </select>
  )
}
