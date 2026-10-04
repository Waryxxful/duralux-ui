import { AutoComplete as AntdAutoComplete, ColorPicker as AntdColorPicker, InputNumber, Mentions as AntdMentions, Slider } from 'antd'
import type { AutoCompleteProps, ColorPickerProps, InputNumberProps, MentionsProps, SliderRangeProps } from 'antd'
import { duraluxColorPresets, formatNumberEsCL, parseNumberEsCL } from './defaults'
import { log } from '../utils/log'
import { isFiniteNumber, isString } from '../utils/typeGuards'

export type { AutoCompleteProps, ColorPickerProps, MentionsProps }

// ── RangeSlider ─────────────────────────────────────────────────────────────

export interface RangeSliderProps extends Omit<SliderRangeProps, 'range' | 'ariaLabelForHandle'> {
  /** Nombre accesible de cada manija, p. ej. `['Puntaje mínimo', 'Puntaje máximo']`. Obligatorio. */
  handleLabels: [string, string]
}

const DEFAULT_HANDLE_LABELS: [string, string] = ['Mínimo', 'Máximo']

function isValidPair(value: readonly number[], min: number, max: number): boolean {
  return value.length === 2 && value.every(item => isFiniteNumber(item) && item >= min && item <= max)
}

/** Slider de rango (mín./máx.) con escala 0–100 por defecto, valor en el tooltip y nombre accesible por manija. */
export function RangeSlider({ handleLabels, min = 0, max = 100, value, defaultValue, ...props }: RangeSliderProps) {
  let labels = handleLabels
  if (!Array.isArray(labels) || labels.length !== 2) {
    log.warn('RangeSlider: falta `handleLabels` ([mínimo, máximo]); se usan «Mínimo» / «Máximo».')
    labels = DEFAULT_HANDLE_LABELS
  }
  const initial = value ?? defaultValue
  if (Array.isArray(initial) && !isValidPair(initial, min, max)) {
    log.warn(`RangeSlider: valor fuera de rango o inválido (${JSON.stringify(initial)}); se espera [desde, hasta] entre ${min} y ${max}.`)
  }
  return <Slider range min={min} max={max} value={value} defaultValue={defaultValue ?? (value === undefined ? [min, max] : undefined)} ariaLabelForHandle={labels} {...props} />
}

// ── NumberInput (formato es-CL) ─────────────────────────────────────────────

export type NumberInputProps = InputNumberProps<number>

/**
 * InputNumber con formato es-CL (miles con `.`, decimales con `,`). Mientras se escribe respeta
 * lo tecleado; al salir del campo se normaliza. `suffix` (p. ej. «%» o «CLP») viene de antd.
 */
export function NumberInput({ formatter, parser, ...props }: NumberInputProps) {
  return (
    <InputNumber<number>
      formatter={formatter ?? ((value, info) => (info.userTyping ? info.input : formatNumberEsCL(value)))}
      parser={parser ?? (text => {
        // Vacío → undefined: antd lo entrega como `null` en onChange (campo limpio, no `0`).
        const parsed = parseNumberEsCL(text)
        return parsed === '' ? undefined : Number(parsed)
      })}
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

/** ColorPicker con la paleta Duralux como presets. */
export function ColorPicker({ presets = duraluxColorPresets, ...props }: ColorPickerProps) {
  return <AntdColorPicker presets={presets} {...props} />
}
