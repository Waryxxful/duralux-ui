import { forwardRef, useEffect, useId, useRef, useState } from 'react'
import { cx } from '../../utils/cx'
import { isArray, isFiniteNumber, isFunction, isNonEmptyString, isNumber, isString } from '../../utils/typeGuards'
import type { FilterChipOption, FilterChipProps } from '../../public/types'
import { Dropdown, DropdownMenu } from '../ui/Dropdown'
import { Checkbox } from '../form/Checkbox'
import { formatIndicatorNumber } from '../ui/internal/indicator'

const SEARCH_THRESHOLD = 8

function optionText(option: FilterChipOption): string {
  if (isString(option.textValue)) return option.textValue
  if (isString(option.label) || isNumber(option.label)) return String(option.label)
  return option.value
}

/** Minúsculas y sin tildes: «Retención» coincide con «retencion». */
function normalize(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

/** «Ventas, Retención» (hasta 2) o «Ventas y 3 más». */
function summarize(texts: string[]): string {
  if (texts.length <= 2) return texts.join(', ')
  return `${texts[0]} y ${texts.length - 1} más`
}

/**
 * FilterChip — ficha de filtro de una barra sobre un listado («+ Equipo», «Estado: Vencidas»).
 *
 * - Inactiva: borde punteado, «+» y el nombre. Activa (hay valores o `valueText`): fondo suave del
 *   primario y «Nombre: valor» (hasta dos valores; desde tres, «Ventas y 3 más»).
 * - Abre un panel (Dropdown, patrón disclosure) con casillas, búsqueda opcional (por defecto con más
 *   de 8 opciones) y «Quitar el filtro». Con `children` el panel es propio (una fecha, un rango…).
 * - Esc o clic fuera cierra; Esc y «Quitar el filtro» devuelven el foco a la ficha.
 * - El ref apunta al `div` raíz. Estilos: src/styles/components/filter-chip.css.
 */
export const FilterChip = /* @__PURE__ */ forwardRef<HTMLDivElement, FilterChipProps>(function FilterChip({
  label,
  options,
  value,
  onChange,
  children,
  valueText,
  onClear,
  clearLabel = 'Quitar el filtro',
  emptyText = 'No hay opciones.',
  searchable,
  searchPlaceholder = 'Buscar…',
  align = 'start',
  disabled = false,
  className,
  ...rest
}, ref) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const panelRef = useRef<HTMLElement | null>(null)
  const searchId = `gcu-filter-chip-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}-search`

  const custom = children !== undefined && children !== null && children !== false
  const list = isArray(options) ? options : []
  const selected = isArray(value) ? value : []
  const showSearch = !custom && (searchable ?? list.length > SEARCH_THRESHOLD)

  // Resumen en el orden de las opciones; valores sin opción al final, tal cual.
  const appliedText = custom
    ? (isNonEmptyString(valueText) ? valueText : '')
    : summarize([
        ...list.filter((option) => selected.includes(option.value)).map(optionText),
        ...selected.filter((v) => !list.some((option) => option.value === v)),
      ])
  const active = appliedText !== ''

  const needle = normalize(query.trim())
  const visible = showSearch && needle
    ? list.filter((option) => normalize(optionText(option)).includes(needle))
    : list

  const clear = isFunction(onClear)
    ? onClear
    : !custom && isFunction(onChange) ? () => onChange([]) : undefined

  function changeOpen(next: boolean) {
    setOpen(next)
    if (!next) setQuery('')
  }

  // Al abrir, el foco entra al panel (búsqueda o primera casilla).
  useEffect(() => {
    if (!open) return
    const target = panelRef.current?.querySelector<HTMLElement>('input:not([disabled]), button:not([disabled])')
    target?.focus()
  }, [open])

  function toggle(optionValue: string, checked: boolean) {
    const chosen = new Set(selected)
    if (checked) chosen.add(optionValue)
    else chosen.delete(optionValue)
    // Orden de las opciones; los valores que no están entre ellas se conservan al final.
    const ordered = list.map((option) => option.value).filter((v) => chosen.has(v))
    const extras = selected.filter((v) => chosen.has(v) && !ordered.includes(v))
    onChange?.([...ordered, ...extras])
  }

  return (
    <Dropdown
      {...rest}
      ref={ref}
      className={cx('dropdown', 'gcu-filter-chip', active && 'gcu-filter-chip--active', className)}
      align={align}
      open={open && !disabled}
      onOpenChange={changeOpen}
      trigger={({ ref: triggerCallbackRef, ...triggerProps }) => (
        <button
          {...triggerProps}
          ref={(node) => {
            triggerRef.current = node
            triggerCallbackRef(node)
          }}
          className="gcu-filter-chip__trigger"
          disabled={disabled}
        >
          {!active && <i className="feather-plus gcu-filter-chip__plus" aria-hidden="true" />}
          <span className="gcu-filter-chip__text">
            {active ? (
              <>
                {label}: <span className="gcu-filter-chip__value">{appliedText}</span>
              </>
            ) : label}
          </span>
          <i className="feather-chevron-down gcu-filter-chip__chevron" aria-hidden="true" />
        </button>
      )}
    >
      <DropdownMenu
        ref={panelRef}
        className="gcu-filter-chip__panel"
        closeOnSelect={false}
        role="group"
      >
        {custom ? (
          <div className="gcu-filter-chip__custom">{children}</div>
        ) : (
          <>
            {showSearch && (
              <div className="gcu-filter-chip__search">
                <label htmlFor={searchId} className="visually-hidden">{`Buscar en ${label}`}</label>
                <input
                  id={searchId}
                  type="search"
                  className="form-control form-control-sm"
                  placeholder={searchPlaceholder}
                  autoComplete="off"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </div>
            )}
            {visible.length === 0 ? (
              <p className="gcu-filter-chip__empty">{emptyText}</p>
            ) : (
              <ul className="gcu-filter-chip__options">
                {visible.map((option) => (
                  <li key={option.value} className="gcu-filter-chip__option">
                    <Checkbox
                      checked={selected.includes(option.value)}
                      disabled={option.disabled}
                      onChange={(event) => toggle(option.value, event.target.checked)}
                      label={(
                        <>
                          <span className="gcu-filter-chip__option-label">{option.label}</span>
                          {isFiniteNumber(option.count) && (
                            <span className="gcu-filter-chip__count gcu-tabular">{formatIndicatorNumber(option.count)}</span>
                          )}
                        </>
                      )}
                    />
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
        {active && clear && (
          <div className="gcu-filter-chip__footer">
            <button
              type="button"
              className="gcu-filter-chip__clear"
              onClick={() => {
                clear()
                changeOpen(false)
                triggerRef.current?.focus()
              }}
            >
              {clearLabel}
            </button>
          </div>
        )}
      </DropdownMenu>
    </Dropdown>
  )
})
