import { forwardRef, useCallback, useMemo, useState } from 'react'
import type * as React from 'react'
import { HiddenValues } from './internal/selectCore'
import {
  EMPTY_OPTIONS,
  normalizeOptions,
  optionText,
  optionVisual,
  safeOptionId,
  safeString,
  useListboxCore,
  valueToken,
} from './internal/selectCoreModel'
import { isFiniteNumber, isFunction, isString } from '../../utils/typeGuards'
import { log } from '../../utils/log'
import type { SearchableSelectProps, SelectOptionInput } from '../../public/types'
import { mergeRefs } from './internal/fieldState'

function hasValue<T>(value: T): boolean {
  return isString(value) || isFiniteNumber(value)
}

function renderSelected(option, renderValue): string {
  if (!option) return ''
  if (isFunction(renderValue)) {
    try {
      const rendered = renderValue(option.raw, option)
      if (isString(rendered) || isFiniteNumber(rendered)) return safeString(rendered)
    } catch (error) {
      log.warn('renderValue de SearchableSelect lanzó un error; se muestra el label.', error)
    }
  }
  return optionText(option)
}

/**
 * SearchableSelect — combobox APG con filtro, sin dependencias.
 *
 * - `value` lo vuelve controlado; si no, `defaultValue` siembra el estado local.
 * - Teclado: flechas, Inicio/Fin, Enter elige, Escape cierra y devuelve el foco.
 * - Si la opción elegida desaparece de `options`, deja de mostrarse y de enviarse (derivado en render, DX-017).
 * - El ref apunta al `<input role="combobox">`.
 */
const SearchableSelectBase = forwardRef<HTMLInputElement, SearchableSelectProps>(function SearchableSelect({
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
  const [internalValue, setInternalValue] = useState<SearchableSelectProps['value']>(defaultValue)
  const selectedValue = controlled ? value : internalValue
  const selected = hasValue(selectedValue) ? optionByToken.get(valueToken(selectedValue)) : undefined
  const [query, setQuery] = useState('')
  const resetQuery = useCallback(() => setQuery(''), [])

  const isSelected = useCallback(
    candidate => hasValue(selectedValue) && valueToken(candidate) === valueToken(selectedValue),
    [selectedValue],
  )
  const commit = useCallback((option) => {
    if (!controlled) setInternalValue(option.value)
    setQuery('')
    if (isFunction(onChange)) onChange(option.value, option.raw)
  }, [controlled, onChange])
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
  const setInputRef = useMemo(() => mergeRefs<HTMLInputElement>(core.inputRef, ref), [core.inputRef, ref])
  const inputId = id || `${core.prefix}-input`
  const listboxId = `${core.prefix}-listbox`
  const displayValue = core.open ? query : renderSelected(selected, renderValue)
  const hasSelection = Boolean(selected)
  const activeId = core.open && core.activeOption
    ? safeOptionId(core.prefix, core.activeOption.token)
    : undefined

  function clear(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    event.stopPropagation()
    if (disabled || !hasSelection) return
    if (!controlled) setInternalValue(undefined)
    setQuery('')
    if (isFunction(onChange)) onChange(undefined, undefined)
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
          ref={setInputRef}
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
            if (!event.defaultPrevented) core.handleKeyDown(event)
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
})

type SearchableSelectComponent = (<TOption = SelectOptionInput>(
  props: SearchableSelectProps<TOption> & React.RefAttributes<HTMLInputElement>,
) => React.ReactElement | null) & { duraluxFormControl?: boolean; displayName?: string }

export const SearchableSelect =
  // SAFETY: forwardRef borra el genérico TOption; la implementación solo lee `options` como datos opacos.
  SearchableSelectBase as SearchableSelectComponent
SearchableSelect.duraluxFormControl = true
