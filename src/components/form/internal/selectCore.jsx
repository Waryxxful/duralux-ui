import { isValidElement, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { registerDismissableLayer } from '../../../utils/dismissableLayer'

const EMPTY_OPTIONS = Object.freeze([])
const MAX_OPTION_COUNT = 10000

export function safeString(value, fallback = '') {
  try {
    return String(value)
  } catch {
    return fallback
  }
}

export function valueToken(value) {
  return `${typeof value}:${safeString(value)}`
}

export function isSelectValue(value) {
  return (typeof value === 'string') || (typeof value === 'number' && Number.isFinite(value))
}

function safeRead(value, key) {
  try {
    return value == null ? undefined : value[key]
  } catch {
    return undefined
  }
}

function callResolver(resolver, option, fallback) {
  if (typeof resolver !== 'function') return fallback
  try {
    return resolver(option)
  } catch {
    return fallback
  }
}

function searchText(value) {
  const text = typeof value === 'string' || typeof value === 'number' ? safeString(value) : ''
  try {
    return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase()
  } catch {
    return text.toLowerCase()
  }
}

const MAX_RENDER_DEPTH = 32

function renderSafely(value, fallback, seen, depth, state) {
  try {
    if (isValidElement(value)) return value
  } catch {
    // Revoked proxies and malformed renderer output are treated as text.
  }
  if (typeof value === 'string' || typeof value === 'number') return value
  if (value === undefined || value === null || typeof value === 'boolean') return fallback

  let arrayValue = false
  try {
    arrayValue = Array.isArray(value)
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
  if (typeof label === 'string' || typeof label === 'number') return safeString(label, fallback)
  return safeString(safeRead(option, 'value'), fallback)
}

export function normalizeOptions(options, {
  getOptionValue,
  getOptionLabel,
} = {}) {
  let source = EMPTY_OPTIONS
  try {
    if (Array.isArray(options)) source = options
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
    const objectOption = raw !== null && typeof raw === 'object'
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
      search: searchText(typeof label === 'string' || typeof label === 'number' ? label : value),
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
  if (typeof renderOption === 'function') {
    try {
      // Consumer renderers are an escape hatch, but React cannot render an
      // arbitrary object. Keep the listbox usable when an option is hostile.
      return safeRenderable(renderOption(option.raw, option), option.label)
    } catch {
      // A consumer renderer is an escape hatch; fall back to the safe label.
    }
  }

  return (
    <>
      {typeof option.color === 'string' && option.color.trim() ? (
        <span
          className="gcu-select__color"
          style={{ backgroundColor: option.color }}
          aria-hidden="true"
        />
      ) : null}
      {typeof option.avatar === 'string' && option.avatar.trim() ? (
        <img className="gcu-select__avatar" src={option.avatar} alt="" />
      ) : null}
      {typeof option.icon === 'string' && option.icon.trim() ? (
        <i className={option.icon} aria-hidden="true" />
      ) : null}
      <span className="gcu-select__label">{option.label}</span>
    </>
  )
}

function safeIdPart(value) {
  return safeString(value, 'select').replace(/[^A-Za-z0-9_-]+/g, '-') || 'select'
}

export function safeOptionId(prefix, token) {
  const encoded = Array.from(safeString(token)).map(character => character.codePointAt(0).toString(16)).join('-')
  return `${prefix}-option-${encoded || 'empty'}`
}

function firstEnabled(options) {
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
  onClose,
}) {
  const generatedId = useId()
  const prefix = `gcu-select-${safeIdPart(generatedId)}`
  const rootRef = useRef(null)
  const inputRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [activeToken, setActiveToken] = useState(null)
  const composingRef = useRef(false)

  const filtered = useMemo(() => {
    const normalizedQuery = searchText(query).trim()
    return normalizedQuery
      ? options.filter(option => option.search.includes(normalizedQuery))
      : options
  }, [options, query])

  const enabled = useMemo(() => filtered.filter(option => !option.disabled), [filtered])
  const activeIndex = enabled.findIndex(option => option.token === activeToken)
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

  useEffect(() => {
    if (!disabled || !open) return
    close(false)
  }, [close, disabled, open])

  useEffect(() => {
    if (!open) return
    if (activeOption) return
    setActiveToken(firstEnabled(enabled))
  }, [activeOption, enabled, open])

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
    activeToken,
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

export function HiddenValues({ name, values, disabled = false }) {
  if (typeof name !== 'string' || !name) return null
  const safeValues = Array.isArray(values) ? values : EMPTY_OPTIONS
  return safeValues.reduce((inputs, value) => {
    if (isSelectValue(value)) {
      inputs.push(<input key={valueToken(value)} type="hidden" name={name} value={safeString(value)} disabled={disabled} />)
    }
    return inputs
  }, [])
}
