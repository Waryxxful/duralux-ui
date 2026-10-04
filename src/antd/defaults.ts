import type { ColorPickerProps } from 'antd'
import dayjs, { type Dayjs } from 'dayjs'
import { designTokens } from '../generated/tokens'
import { log } from '../utils/log'

// Valores y helpers sin JSX de @duralux/ui/antd (separados para no mezclar con componentes).

/** Ancho/alto mínimo por panel de `Splitter` cuando no se indica `min`: evita paneles colapsados por arrastre. */
export const SPLITTER_PANEL_MIN = 160

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

const PALETTE_ORDER = ['primary', 'success', 'danger', 'warning', 'info', 'teal', 'indigo', 'slate'] as const

/** Presets del ColorPicker: tono 500 de cada familia de la paleta de tokens. */
export const duraluxColorPresets: NonNullable<ColorPickerProps['presets']> = [
  { label: 'Paleta Duralux', colors: PALETTE_ORDER.map(name => designTokens.palette[name]['500']), defaultOpen: true },
]


export interface DateRangePreset {
  label: string
  value: [Dayjs, Dayjs]
}

/** Rangos frecuentes en reportes operativos, calculados al momento de abrir. */
export function dateRangePresets(today: Dayjs = dayjs()): DateRangePreset[] {
  const start = today.startOf('day')
  const end = today.endOf('day')
  const lastMonth = today.subtract(1, 'month')
  return [
    { label: 'Hoy', value: [start, end] },
    { label: 'Últimos 7 días', value: [start.subtract(6, 'day'), end] },
    { label: 'Últimos 30 días', value: [start.subtract(29, 'day'), end] },
    { label: 'Este mes', value: [today.startOf('month'), end] },
    { label: 'Mes anterior', value: [lastMonth.startOf('month'), lastMonth.endOf('month')] },
  ]
}

