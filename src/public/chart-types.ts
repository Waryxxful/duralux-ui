import type * as React from 'react'

export type ChartDatum = {
  name?: string | number
  [key: string]: string | number | boolean | null | undefined | object
}

export interface ChartSeries {
  key: string
  color?: string
  label?: string
  dashed?: boolean
}

export type PieChartDatum = ChartDatum & {
  value?: number | string
  x?: string | number
  y?: number | string
  color?: string
}

export interface ChartErrorObject {
  title?: React.ReactNode
  message?: React.ReactNode
  onRetry?: () => void
}

export type ChartError = Error | string | ChartErrorObject | React.ReactNode

export type ChartThemeMode = 'light' | 'dark'

export interface ApexThemeOptions {
  // ApexCharts accepts arbitrary named modes; retain the common light/dark
  // literals while keeping the wrapper an escape hatch for its native API.
  mode?: ChartThemeMode | string
  palette?: string
  [key: string]: unknown
}

export type ChartTheme = ChartThemeMode | ApexThemeOptions

export interface ApexChartSeriesItem {
  name?: string
  // Null is a native ApexCharts gap value for time-series data.
  data?: Array<number | null>
  type?: string
  color?: string
  [key: string]: unknown
}

export type ApexChartSeries = ReadonlyArray<ApexChartSeriesItem | number>

export interface ApexChartOptions {
  chart?: {
    type?: string
    height?: number | string
    width?: number | string
    background?: string
    foreColor?: string
    animations?: {
      enabled?: boolean
      [key: string]: unknown
    }
    [key: string]: unknown
  }
  colors?: string[]
  theme?: ApexThemeOptions
  grid?: {
    borderColor?: string
    [key: string]: unknown
  }
  xaxis?: {
    categories?: string[]
    labels?: {
      style?: {
        colors?: string | string[]
        [key: string]: unknown
      }
      [key: string]: unknown
    }
    axisBorder?: {
      color?: string
      [key: string]: unknown
    }
    axisTicks?: {
      color?: string
      [key: string]: unknown
    }
    [key: string]: unknown
  }
  yaxis?: {
    labels?: {
      style?: {
        colors?: string | string[]
        [key: string]: unknown
      }
      [key: string]: unknown
    }
    [key: string]: unknown
  }
  tooltip?: {
    theme?: string
    style?: {
      fontSize?: string
      fontFamily?: string
      [key: string]: unknown
    }
    [key: string]: unknown
  }
  legend?: {
    labels?: {
      colors?: string
      [key: string]: unknown
    }
    [key: string]: unknown
  }
  // Preserve ApexCharts' intentionally broad configuration escape hatch.
  [key: string]: unknown
}

export interface ChartStateProps {
  theme?: ChartTheme
  ariaLabel?: string
  title?: React.ReactNode
  description?: React.ReactNode
  accessibleTable?: React.ReactNode | boolean
  fallback?: React.ReactNode
  loading?: boolean
  empty?: boolean
  error?: ChartError
  onRetry?: () => void
  loadingMessage?: React.ReactNode
  emptyTitle?: React.ReactNode
  emptyMessage?: React.ReactNode
  errorTitle?: React.ReactNode
  errorMessage?: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

export interface ApexChartProps extends ChartStateProps {
  type?: string
  options?: ApexChartOptions
  series?: ApexChartSeries
  height?: number | string
  width?: number | string
  theme?: ChartTheme
}

export interface ChartCardAction {
  id?: string | number
  label: React.ReactNode
  onClick: React.MouseEventHandler<HTMLButtonElement>
}

export interface ChartCardProps extends Omit<ChartStateProps, 'theme' | 'ariaLabel' | 'description' | 'accessibleTable' | 'className' | 'style'> {
  subtitle?: React.ReactNode
  actions?: ReadonlyArray<ChartCardAction>
  noPad?: boolean
  children?: React.ReactNode
}

export interface CartesianChartProps extends ChartStateProps {
  data?: ReadonlyArray<ChartDatum>
  series?: ReadonlyArray<ChartSeries>
  height?: number
}

export interface AreaChartWidgetProps extends CartesianChartProps {
  grid?: boolean
}

export interface BarChartWidgetProps extends CartesianChartProps {
  stacked?: boolean
  rounded?: number
  barSize?: number
}

export interface LineChartWidgetProps extends CartesianChartProps {}

export interface PieChartWidgetProps extends ChartStateProps {
  data?: ReadonlyArray<PieChartDatum>
  donut?: boolean
  height?: number
  legend?: boolean
}
