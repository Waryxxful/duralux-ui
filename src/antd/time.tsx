import { Calendar as AntdCalendar, TimePicker as AntdTimePicker } from 'antd'
import type { CalendarProps as AntdCalendarProps, TimePickerProps, TimeRangePickerProps } from 'antd'
import esES from 'antd/locale/es_ES'
import type { Dayjs } from 'dayjs'

export const TIME_FORMAT = 'HH:mm'

export type { TimePickerProps, TimeRangePickerProps }
export type CalendarProps = AntdCalendarProps<Dayjs>

/** TimePicker de 24 h (`HH:mm`) con placeholder en español. */
export function TimePicker({ format = TIME_FORMAT, placeholder = 'Selecciona una hora', ...props }: TimePickerProps) {
  return <AntdTimePicker format={format} placeholder={placeholder} {...props} />
}

/** Rango horario (`HH:mm`) con placeholders Desde / Hasta, p. ej. ventanas de atención. */
export function TimeRangePicker({ format = TIME_FORMAT, placeholder = ['Desde', 'Hasta'], ...props }: TimeRangePickerProps) {
  return <AntdTimePicker.RangePicker format={format} placeholder={placeholder} {...props} />
}

/**
 * Calendar con locale español aunque falte `DuraluxAntdProvider`; la semana parte el lunes
 * (dayjs `es`, que el provider carga).
 */
export function Calendar({ locale = esES.Calendar, ...props }: CalendarProps) {
  return <AntdCalendar locale={locale} {...props} />
}
