import type * as React from 'react'
import { AreaChartWidget as AreaChartRuntime } from '../components/charts/AreaChartWidget'
import { BarChartWidget as BarChartRuntime } from '../components/charts/BarChartWidget'
import { LineChartWidget as LineChartRuntime } from '../components/charts/LineChartWidget'
import { PieChartWidget as PieChartRuntime } from '../components/charts/PieChartWidget'
import { ChartCard } from './chart-card'
import type {
  AreaChartWidgetProps,
  BarChartWidgetProps,
  ChartDatum,
  ChartSeries,
  LineChartWidgetProps,
  PieChartDatum,
  PieChartWidgetProps,
} from './chart-types'

export const AreaChartWidget: React.FC<AreaChartWidgetProps> = AreaChartRuntime
export const BarChartWidget: React.FC<BarChartWidgetProps> = BarChartRuntime
export const LineChartWidget: React.FC<LineChartWidgetProps> = LineChartRuntime
export const PieChartWidget: React.FC<PieChartWidgetProps> = PieChartRuntime

export { ChartCard }
export type {
  AreaChartWidgetProps,
  BarChartWidgetProps,
  ChartDatum,
  ChartError,
  ChartErrorObject,
  ChartSeries,
  ChartStateProps,
  ChartTheme,
  ChartThemeMode,
  LineChartWidgetProps,
  PieChartDatum,
  PieChartWidgetProps,
} from './chart-types'
export type { ChartCardAction, ChartCardProps } from './chart-card'
