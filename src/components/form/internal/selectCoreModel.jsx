import React, { isValidElement, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { registerDismissableLayer } from '../../../utils/dismissableLayer'
import { isArray, isBoolean, isFiniteNumber, isFunction, isNonEmptyString, isObject, isString } from '../../../utils/typeGuards'
import { warnOnce } from './fieldState'

export const EMPTY_OPTIONS = Object.freeze([])
export const MAX_OPTION_COUNT = 10000

export function safeString(value, fallback = '') {
  try {
    return String(value)
  } catch {
    return fallback
  }
}

export function valueToken(value) {
  const tag = isString(value) ? 'string' : isFiniteNumber(value) ? 'number' : 'unknown'
  return `${tag}:${safeString(value)}`
}

export function isSelectValue(value) {
  return isString(value) || isFiniteNumber(value)
}

export function safeRead(value, key) {
  try {
    return value == null ? undefined : value[key]
  } catch {
    return undefined
  }
}

export function callResolver(resolver, option, fallback) {
  if (!isFunction(resolver)) return fallback
  try {
    return resolver(option)
  } catch {
    return fallback
  }
}

export function searchText(value) {
  const text = isString(value) || isFiniteNumber(value) ? safeString(value) : ''
  try {
    return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase()
  } catch {
    return text.toLowerCase()
  }
}

const MAX_RENDER_DEPTH = 32

export function renderSafely(value, fallback, seen, depth, state) {
  try {
    if (isValidElement(value)) return value
  } catch {
    // Revoked proxies and malformed renderer output are treated as text.
  }
  if (isString(value) || isFiniteNumber(value)) return value
  if (value === undefined || value === null || isBoolean(value)) return fallback

  let arrayValue = false
  try {
    arrayValue = isArray(value)
  } catch {
    arrayValue = false
  }
  if (arrayValue) {
    if (depth >= MAX_RENDER_DEPTH || seen.has(value)) {
      state.invalid = true
      return fallback
    }
    seen.add(value)
    const rendered = []
    let length = 0
    try {
      length = Number.isSafeInteger(value.length) ? Math.min(value.length, MAX_OPTION_COUNT) : 0
    } catch {
      state.invalid = true
    }
    for (let index = 0; index < length; index += 1) {
      const item = safeRead(value, index)
      const safeItem = renderSafely(item, '', seen, depth + 1, state)
      if (safeItem !== '') rendered.push(safeItem)
    }
    seen.delete(value)
    return state.invalid ? fallback : rendered
  }

  return safeString(value, fallback)
}

/**
 * Renderer output is untrusted at this boundary. Arrays are accepted because
 * React accepts arrays, but cycle/depth protection ensures a hostile renderer
 * cannot make a select recursively walk forever.
 */
export function safeRenderable(value, fallback) {
  return renderSafely(value, fallback, new WeakSet(), 0, { invalid: false })
}

/** Returns text suitable for native input values and ARIA labels. */
export function optionText(option, fallback = '') {
  const label = safeRead(option, 'label')
  if (isString(label) || isFiniteNumber(label)) return safeString(label, fallback)
  return safeString(safeRead(option, 'value'), fallback)
}

export function normalizeOptions(options, {
  getOptionValue,
  getOptionLabel,
} = {}) {
  let source = EMPTY_OPTIONS
  try {
    if (isArray(options)) source = options
  } catch {
    source = EMPTY_OPTIONS
  }
  const seen = new Set()
  const normalized = []

  let length = 0
  try {
    length = Number.isSafeInteger(source.length)
      ? Math.min(source.length, MAX_OPTION_COUNT)
      : 0
  } catch {
    return normalized
  }

  for (let index = 0; index < length; index += 1) {
    const raw = safeRead(source, index)
    const objectOption = raw !== null && isObject(raw)
    const fallbackValue = objectOption ? safeRead(raw, 'value') : raw
    const value = callResolver(getOptionValue, raw, fallbackValue)
    if (!isSelectValue(value)) continue

    const token = valueToken(value)
    if (seen.has(token)) continue
    seen.add(token)

    const fallbackLabel = objectOption ? safeRead(raw, 'label') : safeString(raw)
    const resolvedLabel = callResolver(getOptionLabel, raw, fallbackLabel)
    const label = safeRenderable(resolvedLabel, safeString(value))

    normalized.push({
      raw,
      value,
      token,
      label,
      search: searchText(isString(label) || isFiniteNumber(label) ? label : value),
      disabled: Boolean(objectOption && safeRead(raw, 'disabled')),
      color: objectOption ? safeRead(raw, 'color') : undefined,
      icon: objectOption ? safeRead(raw, 'icon') : undefined,
      avatar: objectOption ? safeRead(raw, 'avatar') : undefined,
      index,
    })
  }

  return normalized
}

export function optionVisual(option, renderOption) {
  if (isFunction(renderOption)) {
    try {
      // Consumer renderers are an escape hatch, but React cannot render an
      // arbitrary object. Keep the listbox usable when an option is hostile.
      return safeRenderable(renderOption(option.raw, option), option.label)
    } catch (error) {
      // A consumer renderer is an escape hatch; fall back to the safe label.
      warnOnce('select-render-option', `renderOption lanzó un error; se muestra el label de la opción. ${safeString(error)}`)
    }
  }

  return (
    <>
      {isNonEmptyString(option.color) ? (
        <span
          className="gcu-select__color"
          style={{ backgroundColor: option.color }}
          aria-hidden="true"
        />
      ) : null}
      {isNonEmptyString(option.avatar) ? (
        <img className="gcu-select__avatar" src={option.avatar} alt="" />
      ) : null}
      {isNonEmptyString(option.icon) ? (
        <i className={option.icon} aria-hidden="true" />
      ) : null}
      <span className="gcu-select__label">{option.label}</span>
    </>
  )
}

export function safeIdPart(value) {
  return safeString(value, 'select').replace(/[^A-Za-z0-9_-]+/g, '-') || 'select'
}

export function safeOptionId(prefix, token) {
  const encoded = Array.from(safeString(token)).map(character => character.codePointAt(0).toString(16)).join('-')
  return `${prefix}-option-${encoded || 'empty'}`
}

export function firstEnabled(options) {
  return options.find(option => !option.disabled)?.token ?? null
}

export function useListboxCore({
  options,
  query,
  disabled,
  onQueryChange,
  onSelect,
  isSelected,
  closeOnSelect,
  onClose = undefined,
}) {
  const generatedId = useId()
  const prefix = `gcu-select-${safeIdPart(generatedId)}`
  const rootRef = useRef(null)
  const inputRef = useRef(null)
  const [openState, setOpen] = useState(false)
  // DX-017: deshabilitado se deriva en render; no se ajusta estado en un efecto.
  const open = openState && !disabled
  const [activeToken, setActiveToken] = useState(null)
  const composingRef = useRef(false)

  const filtered = useMemo(() => {
    const normalizedQuery = searchText(query).trim()
    return normalizedQuery
      ? options.filter(option => option.search.includes(normalizedQuery))
      : options
  }, [options, query])

  const enabled = useMemo(() => filtered.filter(option => !option.disabled), [filtered])
  // DX-017: si la opción activa sale del filtro, la activa es la primera habilitada (derivado en render).
  const storedIndex = enabled.findIndex(option => option.token === activeToken)
  const activeIndex = storedIndex >= 0 ? storedIndex : (open && enabled.length ? 0 : -1)
  const activeOption = activeIndex >= 0 ? enabled[activeIndex] : null

  const close = useCallback((restoreFocus = false) => {
    setOpen(false)
    setActiveToken(null)
    onClose?.()
    if (restoreFocus) inputRef.current?.focus()
  }, [onClose])

  const show = useCallback(() => {
    if (disabled) return
    setOpen(true)
    setActiveToken(current => (
      enabled.some(option => option.token === current)
        ? current
        : enabled.find(option => isSelected(option.value))?.token ?? firstEnabled(enabled)
    ))
  }, [disabled, enabled, isSelected])

  useEffect(() => {
    if (!open) return undefined
    return registerDismissableLayer({
      element: rootRef.current,
      onEscape: () => close(true),
      onPointerDownOutside: () => close(false),
    })
  }, [close, open])

  function move(delta) {
    if (!enabled.length) return
    const current = activeIndex >= 0 ? activeIndex : (delta > 0 ? -1 : 0)
    const next = (current + delta + enabled.length) % enabled.length
    setActiveToken(enabled[next].token)
  }

  function choose(option) {
    if (disabled || !option || option.disabled) return
    onSelect(option)
    if (closeOnSelect) close(true)
  }

  function handleKeyDown(event) {
    if (disabled) return
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      if (!open) show()
      else move(1)
      return
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      if (!open) show()
      else move(-1)
      return
    }
    if (event.key === 'Home' && open) {
      event.preventDefault()
      setActiveToken(enabled[0]?.token ?? null)
      return
    }
    if (event.key === 'End' && open) {
      event.preventDefault()
      setActiveToken(enabled[enabled.length - 1]?.token ?? null)
      return
    }
    if (event.key === 'Enter' && open && !composingRef.current && !event.nativeEvent?.isComposing) {
      event.preventDefault()
      choose(activeOption)
      return
    }
    if (event.key === 'Escape' && open) {
      event.preventDefault()
      event.stopPropagation()
      close(true)
      return
    }
    if (event.key === 'Tab') close(false)
  }

  return {
    prefix,
    rootRef,
    inputRef,
    open,
    filtered,
    activeToken: activeOption?.token ?? null,
    activeOption,
    setActiveToken,
    show,
    close,
    choose,
    handleKeyDown,
    onCompositionStart: () => { composingRef.current = true },
    onCompositionEnd: () => { composingRef.current = false },
    setQuery: onQueryChange,
  }
}
