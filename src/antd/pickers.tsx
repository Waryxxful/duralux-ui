import { DatePicker as AntdDatePicker } from 'antd'
import type { DatePickerProps, GetProps } from 'antd'
import dayjs, { type Dayjs } from 'dayjs'

export const DATE_FORMAT = 'DD-MM-YYYY'

type AntdRangePickerProps = GetProps<typeof AntdDatePicker.RangePicker>
export type RangePickerProps = AntdRangePickerProps
export type { DatePickerProps }

/** DatePicker con formato dd-mm-aaaa y placeholder en español. */
export function DatePicker({ format = DATE_FORMAT, placeholder = 'Selecciona una fecha', ...props }: DatePickerProps) {
  return <AntdDatePicker format={format} placeholder={placeholder} {...props} />
}

/** RangePicker con formato dd-mm-aaaa y placeholders Desde / Hasta. */
export function RangePicker({ format = DATE_FORMAT, placeholder = ['Desde', 'Hasta'], ...props }: RangePickerProps) {
  return <AntdDatePicker.RangePicker format={format} placeholder={placeholder} {...props} />
}

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

/** Filtro de período para barras de filtros: RangePicker con presets en español. */
export function DateRangeFilter({ presets, ...props }: RangePickerProps) {
  return <RangePicker presets={presets ?? dateRangePresets()} allowClear {...props} />
}
