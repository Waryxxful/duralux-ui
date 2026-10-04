import { DatePicker as AntdDatePicker } from 'antd'
import type { DatePickerProps, GetProps } from 'antd'
import { dateRangePresets } from './defaults'

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

/** Filtro de período para barras de filtros: RangePicker con presets en español. */
export function DateRangeFilter({ presets, ...props }: RangePickerProps) {
  return <RangePicker presets={presets ?? dateRangePresets()} allowClear {...props} />
}
