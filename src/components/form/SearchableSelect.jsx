import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  HiddenValues,
  normalizeOptions,
  optionVisual,
  optionText,
  safeOptionId,
  safeString,
  useListboxCore,
  valueToken,
} from './internal/selectCore.jsx'

const EMPTY_OPTIONS = Object.freeze([])

function hasValue(value) {
  return typeof value === 'string' || (typeof value === 'number' && Number.isFinite(value))
}

function renderSelected(option, renderValue) {
  if (!option) return ''
  if (typeof renderValue === 'function') {
    try {
      const rendered = renderValue(option.raw, option)
      if (typeof rendered === 'string' || typeof rendered === 'number') return safeString(rendered)
    } catch {
      // Fall through to the option label.
    }
  }
  return optionText(option)
}

/**
 * Accessible, dependency-free searchable single select.
 * `value` makes it controlled; otherwise `defaultValue` seeds local state.
 */
export function SearchableSelect({
  options = EMPTY_OPTIONS,
  value,
  defaultValue,
  onChange,
  getOptionValue,
  getOptionLabel,
  renderOption,
  renderValue,
  placeholder = 'Seleccionar…',
  noResultsLabel = 'Sin resultados',
  disabled = false,
  required = false,
  name,
  id,
  className = '',
  clearable = false,
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
  const [internalValue, setInternalValue] = useState(defaultValue)
  const selectedValue = controlled ? value : internalValue
  const selected = hasValue(selectedValue) ? optionByToken.get(valueToken(selectedValue)) : undefined
  const [query, setQuery] = useState('')
  const resetQuery = useCallback(() => setQuery(''), [])

  useEffect(() => {
    if (controlled || !hasValue(internalValue)) return
    if (optionByToken.has(valueToken(internalValue))) return
    setInternalValue(undefined)
  }, [controlled, internalValue, optionByToken])

  const isSelected = candidate => hasValue(selectedValue) && valueToken(candidate) === valueToken(selectedValue)
  const commit = option => {
    if (!controlled) setInternalValue(option.value)
    setQuery('')
    if (typeof onChange === 'function') onChange(option.value, option.raw)
  }
  const core = useListboxCore({
    options: normalized,
    query,
    disabled,
    onQueryChange: setQuery,
    onSelect: commit,
    isSelected,
    closeOnSelect: true,
    onClose: resetQuery,
  })
  const inputId = id || `${core.prefix}-input`
  const listboxId = `${core.prefix}-listbox`
  const displayValue = core.open ? query : renderSelected(selected, renderValue)
  const hasSelection = Boolean(selected)
  const activeId = core.open && core.activeOption
    ? safeOptionId(core.prefix, core.activeOption.token)
    : undefined

  function clear(event) {
    event.preventDefault()
    event.stopPropagation()
    if (disabled || !hasSelection) return
    if (!controlled) setInternalValue(undefined)
    setQuery('')
    if (typeof onChange === 'function') onChange(undefined, undefined)
    core.inputRef.current?.focus()
  }

  return (
    <div
      ref={core.rootRef}
      className={['gcu-select', core.open && 'gcu-select--open', disabled && 'is-disabled', className]
        .filter(Boolean)
        .join(' ')}
    >
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
          required={required && !hasSelection}
          value={displayValue}
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
            if (typeof onFocus === 'function') onFocus(event)
            if (!event.defaultPrevented) core.show()
          }}
          onBlur={onBlur}
          onClick={(event) => {
            if (typeof onClick === 'function') onClick(event)
            if (!event.defaultPrevented) core.show()
          }}
          onChange={(event) => {
            if (!core.open) core.show()
            setQuery(event.currentTarget.value)
          }}
          onKeyDown={(event) => {
            if (typeof onKeyDown === 'function') onKeyDown(event)
            if (!event.defaultPrevented) core.handleKeyDown(event)
          }}
          onCompositionStart={(event) => {
            core.onCompositionStart()
            if (typeof onCompositionStart === 'function') onCompositionStart(event)
          }}
          onCompositionEnd={(event) => {
            core.onCompositionEnd()
            if (typeof onCompositionEnd === 'function') onCompositionEnd(event)
          }}
        />
        {clearable && hasSelection && !disabled ? (
          <button type="button" className="gcu-select__clear" aria-label="Limpiar selección" onMouseDown={event => event.preventDefault()} onClick={clear}>×</button>
        ) : null}
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
      <HiddenValues name={name} values={hasSelection ? [selectedValue] : []} disabled={disabled} />
      {core.open ? (
        <div id={listboxId} className="gcu-select__listbox" role="listbox">
          {core.filtered.map(option => {
            const optionId = safeOptionId(core.prefix, option.token)
            return (
              <div
                key={option.token}
                id={optionId}
                role="option"
                className={[
                  'gcu-select__option',
                  option.token === core.activeToken && 'is-active',
                  isSelected(option.value) && 'is-selected',
                  option.disabled && 'is-disabled',
                ].filter(Boolean).join(' ')}
                aria-selected={isSelected(option.value)}
                aria-disabled={option.disabled || undefined}
                onMouseEnter={() => { if (!option.disabled) core.setActiveToken(option.token) }}
                onMouseDown={event => event.preventDefault()}
                onClick={() => core.choose(option)}
              >
                {optionVisual(option, renderOption)}
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

SearchableSelect.duraluxFormControl = true
