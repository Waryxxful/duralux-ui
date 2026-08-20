import { useEffect, useMemo, useState } from 'react'
import { HiddenValues } from './internal/selectCore'
import {
  EMPTY_OPTIONS,
  isSelectValue,
  normalizeOptions,
  optionText,
  optionVisual,
  safeOptionId,
  safeRenderable,
  safeString,
  useListboxCore,
  valueToken,
} from './internal/selectCoreModel'
import { isArray, isFiniteNumber, isFunction } from '../../utils/typeGuards'

const EMPTY_VALUES = Object.freeze([])
const MAX_VALUE_COUNT = 10000

function normalizeValues(values) {
  try {
    if (!isArray(values)) return []
  } catch {
    return []
  }

  let length = 0
  try {
    const sourceLength = values.length
    length = Number.isSafeInteger(sourceLength) ? Math.min(sourceLength, MAX_VALUE_COUNT) : 0
  } catch {
    return []
  }

  const seen = new Set()
  const normalized = []
  for (let index = 0; index < length; index += 1) {
    let value
    try {
      value = values[index]
    } catch {
      continue
    }
    if (!isSelectValue(value)) continue
    const token = valueToken(value)
    if (seen.has(token)) continue
    seen.add(token)
    normalized.push(value)
  }
  return normalized
}

function normalizeMax(max) {
  if (max === undefined || max === null || max === '') return Infinity
  let numeric
  try {
    numeric = Number(max)
  } catch {
    return Infinity
  }
  return isFiniteNumber(numeric) ? Math.max(0, Math.floor(numeric)) : Infinity
}

/** Accessible searchable multi-select with removable value chips. */
export function MultiSelect({
  options = EMPTY_OPTIONS,
  value,
  defaultValue = EMPTY_VALUES,
  onChange,
  getOptionValue,
  getOptionLabel,
  renderOption,
  renderValue,
  placeholder = 'Buscar…',
  noResultsLabel = 'Sin resultados',
  selectedLabel = 'Seleccionados',
  disabled = false,
  required = false,
  max,
  name,
  id,
  className = '',
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  onBlur,
  onFocus,
  onClick,
  onKeyDown,
  onCompositionStart,
  onCompositionEnd,
  ...inputProps
}) {
  const normalized = useMemo(
    () => normalizeOptions(options, { getOptionValue, getOptionLabel }),
    [getOptionLabel, getOptionValue, options],
  )
  const optionByToken = useMemo(
    () => new Map(normalized.map(option => [option.token, option])),
    [normalized],
  )
  const controlled = value !== undefined
  const [internalValues, setInternalValues] = useState(() => normalizeValues(defaultValue))
  const selectedValues = useMemo(
    () => normalizeValues(controlled ? value : internalValues)
      .filter(valueItem => optionByToken.has(valueToken(valueItem))),
    [controlled, internalValues, optionByToken, value],
  )
  const selectedTokens = useMemo(
    () => new Set(selectedValues.map(valueItem => valueToken(valueItem))),
    [selectedValues],
  )
  const [query, setQuery] = useState('')
  const selectionLimit = normalizeMax(max)

  useEffect(() => {
    if (controlled) return
    const next = internalValues
      .filter(valueItem => optionByToken.has(valueToken(valueItem)))
      .slice(0, selectionLimit)
    if (next.length === internalValues.length && next.every((item, index) => Object.is(item, internalValues[index]))) return
    setInternalValues(next)
  }, [controlled, internalValues, optionByToken, selectionLimit])

  function emit(nextValues) {
    const normalizedNext = normalizeValues(nextValues).slice(0, selectionLimit)
    if (!controlled) setInternalValues(normalizedNext)
    if (isFunction(onChange)) {
      onChange(
        normalizedNext,
        normalizedNext.map(valueItem => optionByToken.get(valueToken(valueItem))?.raw).filter(item => item !== undefined),
      )
    }
  }

  const isSelected = candidate => selectedTokens.has(valueToken(candidate))
  const toggle = option => {
    if (selectedTokens.has(option.token)) {
      emit(selectedValues.filter(valueItem => valueToken(valueItem) !== option.token))
      return
    }
    if (selectedValues.length >= selectionLimit) return
    emit([...selectedValues, option.value])
    setQuery('')
  }
  const interactiveOptions = useMemo(() => normalized.map(option => ({
    ...option,
    disabled: option.disabled || (!selectedTokens.has(option.token) && selectedValues.length >= selectionLimit),
  })), [normalized, selectedTokens, selectedValues.length, selectionLimit])
  const core = useListboxCore({
    options: interactiveOptions,
    query,
    disabled,
    onQueryChange: setQuery,
    onSelect: toggle,
    isSelected,
    closeOnSelect: false,
  })
  const inputId = id || `${core.prefix}-input`
  const listboxId = `${core.prefix}-listbox`
  const activeId = core.open && core.activeOption
    ? safeOptionId(core.prefix, core.activeOption.token)
    : undefined

  function remove(valueItem) {
    if (disabled) return
    emit(selectedValues.filter(candidate => valueToken(candidate) !== valueToken(valueItem)))
    core.inputRef.current?.focus()
  }

  function renderChip(valueItem) {
    const option = optionByToken.get(valueToken(valueItem))
    const fallback = optionText(option, safeString(valueItem))
    if (isFunction(renderValue)) {
      try {
        return safeRenderable(
          renderValue(option?.raw, option ?? { value: valueItem, label: safeString(valueItem) }),
          fallback,
        )
      } catch {
        // Fall back to a stable text value.
      }
    }
    return fallback
  }

  return (
    <div
      ref={core.rootRef}
      className={['gcu-select', 'gcu-multiselect', core.open && 'gcu-select--open', disabled && 'is-disabled', className]
        .filter(Boolean)
        .join(' ')}
    >
      {selectedValues.length > 0 ? (
        <div className="gcu-multiselect__values" role="group" aria-label={safeString(selectedLabel)}>
          {selectedValues.map(valueItem => (
            <span className="gcu-multiselect__chip" key={valueToken(valueItem)}>
              <span>{renderChip(valueItem)}</span>
              {!disabled ? (
                <button
                  type="button"
                  aria-label={`Quitar ${optionText(optionByToken.get(valueToken(valueItem)), safeString(valueItem))}`}
                  onClick={() => remove(valueItem)}
                >
                  ×
                </button>
              ) : null}
            </span>
          ))}
        </div>
      ) : null}
      <div className="gcu-select__control">
        <input
          {...inputProps}
          ref={core.inputRef}
          id={inputId}
          type="text"
          role="combobox"
          className="form-control gcu-select__input"
          autoComplete="off"
          disabled={disabled}
          required={required && selectedValues.length === 0}
          value={query}
          placeholder={safeString(placeholder)}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          aria-describedby={ariaDescribedBy}
          aria-invalid={ariaInvalid}
          aria-required={required || undefined}
          aria-autocomplete="list"
          aria-expanded={core.open}
          aria-controls={listboxId}
          aria-activedescendant={activeId}
          onFocus={(event) => {
            if (isFunction(onFocus)) onFocus(event)
            if (!event.defaultPrevented) core.show()
          }}
          onBlur={onBlur}
          onClick={(event) => {
            if (isFunction(onClick)) onClick(event)
            if (!event.defaultPrevented) core.show()
          }}
          onChange={(event) => {
            if (!core.open) core.show()
            setQuery(event.currentTarget.value)
          }}
          onKeyDown={(event) => {
            if (isFunction(onKeyDown)) onKeyDown(event)
            if (event.defaultPrevented) return
            if (event.key === 'Backspace' && !query && selectedValues.length) {
              event.preventDefault()
              remove(selectedValues[selectedValues.length - 1])
              return
            }
            core.handleKeyDown(event)
          }}
          onCompositionStart={(event) => {
            core.onCompositionStart()
            if (isFunction(onCompositionStart)) onCompositionStart(event)
          }}
          onCompositionEnd={(event) => {
            core.onCompositionEnd()
            if (isFunction(onCompositionEnd)) onCompositionEnd(event)
          }}
        />
        <button
          type="button"
          className="gcu-select__toggle"
          aria-label={core.open ? 'Cerrar opciones' : 'Abrir opciones'}
          aria-expanded={core.open}
          aria-controls={listboxId}
          disabled={disabled}
          onMouseDown={event => event.preventDefault()}
          onClick={() => (core.open ? core.close(true) : core.show())}
        >
          <i className="feather-chevron-down" aria-hidden="true" />
        </button>
      </div>
      <HiddenValues name={name} values={selectedValues} disabled={disabled} />
      {core.open ? (
        <div id={listboxId} className="gcu-select__listbox" role="listbox" aria-multiselectable="true">
          {core.filtered.map(option => {
            const optionId = safeOptionId(core.prefix, option.token)
            const atLimit = !isSelected(option.value) && selectedValues.length >= selectionLimit
            const optionDisabled = option.disabled || atLimit
            return (
              <div
                key={option.token}
                id={optionId}
                role="option"
                className={[
                  'gcu-select__option',
                  option.token === core.activeToken && 'is-active',
                  isSelected(option.value) && 'is-selected',
                  optionDisabled && 'is-disabled',
                ].filter(Boolean).join(' ')}
                aria-selected={isSelected(option.value)}
                aria-disabled={optionDisabled || undefined}
                onMouseEnter={() => { if (!optionDisabled) core.setActiveToken(option.token) }}
                onMouseDown={event => event.preventDefault()}
                onClick={() => { if (!optionDisabled) core.choose(option) }}
              >
                {optionVisual(option, renderOption)}
                {isSelected(option.value) ? <i className="feather-check ms-auto" aria-hidden="true" /> : null}
              </div>
            )
          })}
          {core.filtered.length === 0 ? (
            <div className="gcu-select__empty" role="status">{noResultsLabel}</div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

MultiSelect.duraluxFormControl = true
