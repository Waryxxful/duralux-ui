import { forwardRef, useMemo, useState } from 'react'
import type * as React from 'react'
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
import { log } from '../../utils/log'
import type { MultiSelectProps, SelectOptionInput, SelectValue } from '../../public/types'
import { mergeRefs } from './internal/fieldState'

const EMPTY_VALUES = Object.freeze([])
const MAX_VALUE_COUNT = 10000

function normalizeValues<T>(values: T): SelectValue[] {
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
  const normalized: SelectValue[] = []
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

function normalizeMax(max: number | string | null | undefined): number {
  if (max === undefined || max === null || max === '') return Infinity
  let numeric
  try {
    numeric = Number(max)
  } catch {
    return Infinity
  }
  return isFiniteNumber(numeric) ? Math.max(0, Math.floor(numeric)) : Infinity
}

/**
 * MultiSelect — combobox APG multiselección con chips removibles.
 *
 * - La lista queda abierta al elegir; Retroceso con la búsqueda vacía quita el último chip.
 * - max: tope de selección; muestra el contador «n de max» con cifras tabulares.
 * - Valores que ya no están en `options` o exceden `max` se descartan en render (DX-017), sin callback.
 * - El ref apunta al `<input role="combobox">`.
 */
const MultiSelectBase = forwardRef<HTMLInputElement, MultiSelectProps>(function MultiSelect({
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
}, ref) {
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
  const selectionLimit = normalizeMax(max)
  const selectedValues = useMemo(
    () => {
      const known = normalizeValues(controlled ? value : internalValues)
        .filter(valueItem => optionByToken.has(valueToken(valueItem)))
      // El valor controlado es del consumidor: solo se recorta el estado interno.
      return controlled ? known : known.slice(0, selectionLimit)
    },
    [controlled, internalValues, optionByToken, selectionLimit, value],
  )
  const selectedTokens = useMemo(
    () => new Set(selectedValues.map(valueItem => valueToken(valueItem))),
    [selectedValues],
  )
  const [query, setQuery] = useState('')

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
  const setInputRef = useMemo(() => mergeRefs<HTMLInputElement>(core.inputRef, ref), [core.inputRef, ref])
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
      } catch (error) {
        log.warn('renderValue de MultiSelect lanzó un error; el chip muestra el label.', error)
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
          ref={setInputRef}
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
      {Number.isFinite(selectionLimit) ? (
        <div className="gcu-multiselect__meta">
          <span className="gcu-multiselect__count">{selectedValues.length} de {selectionLimit}</span>
        </div>
      ) : null}
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
})

type MultiSelectComponent = (<TOption = SelectOptionInput>(
  props: MultiSelectProps<TOption> & React.RefAttributes<HTMLInputElement>,
) => React.ReactElement | null) & { duraluxFormControl?: boolean; displayName?: string }

export const MultiSelect =
  // SAFETY: forwardRef borra el genérico TOption; la implementación solo lee `options` como datos opacos.
  MultiSelectBase as MultiSelectComponent
MultiSelect.duraluxFormControl = true
