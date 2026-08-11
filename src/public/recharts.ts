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

export const AreaChartWidget: React.FC<AreaChartWidgetProps> = AreaChartRuntime as unknown as React.FC<AreaChartWidgetProps>
export const BarChartWidget: React.FC<BarChartWidgetProps> = BarChartRuntime as unknown as React.FC<BarChartWidgetProps>
export const LineChartWidget: React.FC<LineChartWidgetProps> = LineChartRuntime as unknown as React.FC<LineChartWidgetProps>
export const PieChartWidget: React.FC<PieChartWidgetProps> = PieChartRuntime as unknown as React.FC<PieChartWidgetProps>

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
