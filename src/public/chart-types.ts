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
  mode?: ChartThemeMode
  palette?: string
}

export type ChartTheme = ChartThemeMode | ApexThemeOptions

export interface ApexChartSeriesItem {
  name?: string
  data?: number[]
  type?: string
  color?: string
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
    }
  }
  colors?: string[]
  theme?: ApexThemeOptions
  grid?: {
    borderColor?: string
  }
  xaxis?: {
    categories?: string[]
    labels?: {
      style?: {
        colors?: string | string[]
      }
    }
    axisBorder?: {
      color?: string
    }
    axisTicks?: {
      color?: string
    }
  }
  yaxis?: {
    labels?: {
      style?: {
        colors?: string | string[]
      }
    }
  }
  tooltip?: {
    theme?: string
    style?: {
      fontSize?: string
      fontFamily?: string
    }
  }
  legend?: {
    labels?: {
      colors?: string
    }
  }
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
