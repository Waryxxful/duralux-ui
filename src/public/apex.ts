import type * as React from 'react'
import { ApexChart as ApexChartRuntime } from '../components/charts/ApexChart'
import { ChartCard } from './chart-card'
import type { ApexChartProps } from './chart-types'

export const ApexChart: React.FC<ApexChartProps> = ApexChartRuntime

export { ChartCard }
export type {
  ApexChartOptions,
  ApexChartProps,
  ApexChartSeries,
  ApexThemeOptions,
  ChartError,
  ChartErrorObject,
  ChartStateProps,
  ChartTheme,
  ChartThemeMode,
} from './chart-types'
export type { ChartCardAction, ChartCardProps } from './chart-card'
