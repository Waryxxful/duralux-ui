// Componentes en TSX: se exportan tal cual (tipos y ref reales).
export { AreaChartWidget } from '../components/charts/AreaChartWidget'
export { BarChartWidget } from '../components/charts/BarChartWidget'
export { LineChartWidget } from '../components/charts/LineChartWidget'
export { PieChartWidget } from '../components/charts/PieChartWidget'
export { ChartCard } from './chart-card'

export type {
  AreaChartWidgetProps,
  BarChartWidgetProps,
  CartesianChartProps,
  ChartDatum,
  ChartDatumRecord,
  ChartDatumValue,
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
export type { ChartCardAction, ChartCardHeadingLevel, ChartCardProps } from './chart-card'
