import { AutoComplete as AntdAutoComplete, ColorPicker as AntdColorPicker, InputNumber, Mentions as AntdMentions, Slider } from 'antd'
import type { AutoCompleteProps, ColorPickerProps, InputNumberProps, MentionsProps, SliderRangeProps } from 'antd'
import { designTokens } from '../generated/tokens'
import { log } from '../utils/log'
import { isFiniteNumber, isString } from '../utils/typeGuards'

export type { AutoCompleteProps, ColorPickerProps, MentionsProps }

// ── RangeSlider ─────────────────────────────────────────────────────────────

export interface RangeSliderProps extends Omit<SliderRangeProps, 'range' | 'ariaLabelForHandle'> {
  /** Nombre accesible de cada manija, p. ej. `['Puntaje mínimo', 'Puntaje máximo']`. Obligatorio. */
  handleLabels: [string, string]
}

const DEFAULT_HANDLE_LABELS: [string, string] = ['Mínimo', 'Máximo']

function isValidPair(value: unknown, min: number, max: number): boolean {
  return Array.isArray(value) && value.length === 2 && value.every(item => isFiniteNumber(item) && item >= min && item <= max)
}

/** Slider de rango (mín./máx.) con escala 0–100 por defecto, valor en el tooltip y nombre accesible por manija. */
export function RangeSlider({ handleLabels, min = 0, max = 100, value, defaultValue, ...props }: RangeSliderProps) {
  let labels = handleLabels
  if (!Array.isArray(labels) || labels.length !== 2) {
    log.warn('RangeSlider: falta `handleLabels` ([mínimo, máximo]); se usan «Mínimo» / «Máximo».')
    labels = DEFAULT_HANDLE_LABELS
  }
  const initial = value ?? defaultValue
  if (initial !== undefined && !isValidPair(initial, min, max)) {
    log.warn(`RangeSlider: valor fuera de rango o inválido (${JSON.stringify(initial)}); se espera [desde, hasta] entre ${min} y ${max}.`)
  }
  return <Slider range min={min} max={max} value={value} defaultValue={defaultValue ?? (value === undefined ? [min, max] : undefined)} ariaLabelForHandle={labels} {...props} />
}

// ── NumberInput (formato es-CL) ─────────────────────────────────────────────

const THOUSANDS = /\B(?=(\d{3})+(?!\d))/g

/** Formatea un número con separador de miles `.` y decimal `,` (es-CL). `1234567.5` → `1.234.567,5`. */
export function formatNumberEsCL(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') return ''
  const raw = String(value)
  if (raw === '-') return raw
  if (!/^-?\d*(\.\d*)?$/.test(raw)) {
    log.warn(`NumberInput: valor no numérico "${raw}"; se muestra vacío.`)
    return ''
  }
  const [integer, decimals] = raw.split('.')
  const grouped = integer.replace(THOUSANDS, '.')
  return decimals === undefined ? grouped : `${grouped},${decimals}`
}

/** Inverso de `formatNumberEsCL`: `1.234.567,5` → `1234567.5`. Ignora sufijos y espacios. */
export function parseNumberEsCL(text: string | undefined): string {
  if (!text) return ''
  const normalized = text.replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, '')
  if (normalized !== '' && normalized !== '-' && Number.isNaN(Number(normalized))) {
    log.warn(`NumberInput: no se pudo interpretar "${text}" como número.`)
    return ''
  }
  return normalized
}

export type NumberInputProps = InputNumberProps<number>

/**
 * InputNumber con formato es-CL (miles con `.`, decimales con `,`). Mientras se escribe respeta
 * lo tecleado; al salir del campo se normaliza. `suffix` (p. ej. «%» o «CLP») viene de antd.
 */
export function NumberInput({ formatter, parser, ...props }: NumberInputProps) {
  return (
    <InputNumber<number>
      formatter={formatter ?? ((value, info) => (info.userTyping ? info.input : formatNumberEsCL(value)))}
      parser={parser ?? (text => Number(parseNumberEsCL(text)))}
      {...props}
    />
  )
}

// ── AutoComplete y Mentions ─────────────────────────────────────────────────

/** AutoComplete con placeholder en español y nombre accesible desde el placeholder. */
export function AutoComplete({ placeholder = 'Escribe para buscar…', ...props }: AutoCompleteProps) {
  const label = props['aria-label'] ?? (isString(placeholder) ? placeholder : undefined)
  return <AntdAutoComplete placeholder={placeholder} aria-label={label} {...props} />
}

/** Mentions con prefijo `@` y aviso «Sin coincidencias». */
export function Mentions({ prefix = '@', notFoundContent = 'Sin coincidencias', ...props }: MentionsProps) {
  const label = props['aria-label'] ?? (isString(props.placeholder) ? props.placeholder : undefined)
  return <AntdMentions prefix={prefix} notFoundContent={notFoundContent} aria-label={label} {...props} />
}

// ── ColorPicker ─────────────────────────────────────────────────────────────

const PALETTE_ORDER = ['primary', 'success', 'danger', 'warning', 'info', 'teal', 'indigo', 'slate'] as const

/** Presets del ColorPicker: tono 500 de cada familia de la paleta de tokens. */
export const duraluxColorPresets: NonNullable<ColorPickerProps['presets']> = [
  { label: 'Paleta Duralux', colors: PALETTE_ORDER.map(name => designTokens.palette[name]['500']), defaultOpen: true },
]

/** ColorPicker con la paleta Duralux como presets. */
export function ColorPicker({ presets = duraluxColorPresets, ...props }: ColorPickerProps) {
  return <AntdColorPicker presets={presets} {...props} />
}
