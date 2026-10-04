import type * as React from 'react'

// Tipos públicos de los gráficos (`@duralux/ui/charts`, `/charts/apex`, `/charts/recharts`).
// DX-023: ningún diccionario abierto usa `unknown`/`object` como valor. Las claves
// libres (datos de una fila, el escape hatch de ApexCharts) aceptan un valor con
// nombre y recursivo; todo lo que antes compilaba con literales sigue compilando.

/** Valor de una celda de datos: primitivo, fecha, lista o registro anidado. */
export type ChartDatumValue =
  | string
  | number
  | boolean
  | Date
  | null
  | undefined
  | ReadonlyArray<ChartDatumValue>
  | ChartDatumRecord

/** Registro anidado dentro de una fila (metadatos, desgloses). */
export interface ChartDatumRecord {
  readonly [key: string]: ChartDatumValue
}

/** Fila de un gráfico cartesiano: `name` (o `x`) es la categoría; el resto, las series. */
export type ChartDatum = {
  name?: string | number
  [key: string]: ChartDatumValue
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

/** Tema del gráfico. `navy` usa la serie oscura sobre superficies navy. */
export type ChartThemeMode = 'light' | 'dark' | 'navy'

/** Función que ApexCharts invoca (formatters y eventos). */
export type ApexOptionFunction = (...args: never[]) => ApexOptionValue | void

/** Valor de una opción de ApexCharts que la librería no tipa por nombre. */
export type ApexOptionValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | ApexOptionFunction
  | ReadonlyArray<ApexOptionValue>
  | ApexOptionRecord

/** Objeto de opciones de ApexCharts sin forma fija (anotaciones, `plotOptions.pie`, etc.). */
export interface ApexOptionRecord {
  [key: string]: ApexOptionValue
}

export interface ApexThemeOptions {
  // ApexCharts acepta modos con nombre libre; se conservan los literales comunes.
  mode?: ChartThemeMode | string
  palette?: string
  monochrome?: ApexOptionRecord
  [key: string]: ApexOptionValue
}

export type ChartTheme = ChartThemeMode | ApexThemeOptions

/** Punto de una serie de Apex: número, hueco (`null`), `{ x, y }` o par `[x, y]`. */
export type ApexSeriesDatum =
  | number
  | null
  | string
  | ReadonlyArray<number | string | null>
  | ApexSeriesPoint

export interface ApexSeriesPoint {
  x?: string | number | ReadonlyArray<string>
  y?: number | null | ReadonlyArray<number>
  fillColor?: string
  strokeColor?: string
  meta?: ApexOptionValue
  goals?: ReadonlyArray<ApexOptionRecord>
  [key: string]: ApexOptionValue
}

export interface ApexChartSeriesItem {
  name?: string
  // `null` es el hueco nativo de ApexCharts en series de tiempo.
  data?: ReadonlyArray<ApexSeriesDatum>
  type?: string
  color?: string
  group?: string
  zIndex?: number
  [key: string]: ApexOptionValue
}

export type ApexChartSeries = ReadonlyArray<ApexChartSeriesItem | number>

export interface ApexTextStyle {
  colors?: string | ReadonlyArray<string>
  color?: string
  fontSize?: string
  fontFamily?: string
  fontWeight?: string | number
  cssClass?: string
  [key: string]: ApexOptionValue
}

export interface ApexAxisLabels {
  show?: boolean
  style?: ApexTextStyle
  rotate?: number
  trim?: boolean
  maxHeight?: number
  hideOverlappingLabels?: boolean
  // Apex llama al formatter con la categoría (eje X) o el valor (eje Y).
  formatter?: ApexOptionFunction
  [key: string]: ApexOptionValue
}

export interface ApexAxisLine {
  show?: boolean
  color?: string
  [key: string]: ApexOptionValue
}

export interface ApexAxisTitle {
  text?: string
  style?: ApexTextStyle
  offsetX?: number
  offsetY?: number
  [key: string]: ApexOptionValue
}

export interface ApexChartAnimations {
  enabled?: boolean
  speed?: number
  [key: string]: ApexOptionValue
}

export interface ApexChartBlock {
  type?: string
  height?: number | string
  width?: number | string
  background?: string
  foreColor?: string
  fontFamily?: string
  stacked?: boolean
  stackType?: string
  sparkline?: { enabled?: boolean }
  toolbar?: { show?: boolean; [key: string]: ApexOptionValue }
  zoom?: { enabled?: boolean; [key: string]: ApexOptionValue }
  animations?: ApexChartAnimations
  events?: { [key: string]: ApexOptionFunction | undefined }
  [key: string]: ApexOptionValue
}

export interface ApexGridOptions {
  show?: boolean
  borderColor?: string
  strokeDashArray?: number
  padding?: { top?: number; right?: number; bottom?: number; left?: number }
  xaxis?: { lines?: { show?: boolean } }
  yaxis?: { lines?: { show?: boolean } }
  [key: string]: ApexOptionValue
}

export interface ApexXAxisOptions {
  type?: string
  categories?: ReadonlyArray<string | number | ReadonlyArray<string>>
  labels?: ApexAxisLabels
  axisBorder?: ApexAxisLine
  axisTicks?: ApexAxisLine
  title?: ApexAxisTitle
  tickPlacement?: string
  tickAmount?: number
  [key: string]: ApexOptionValue
}

export interface ApexYAxisOptions {
  min?: number
  max?: number
  tickAmount?: number
  forceNiceScale?: boolean
  opposite?: boolean
  labels?: ApexAxisLabels
  title?: ApexAxisTitle
  [key: string]: ApexOptionValue
}

export interface ApexTooltipOptions {
  enabled?: boolean
  theme?: string
  shared?: boolean
  intersect?: boolean
  style?: { fontSize?: string; fontFamily?: string; [key: string]: ApexOptionValue }
  x?: { show?: boolean; format?: string; formatter?: ApexOptionFunction; [key: string]: ApexOptionValue }
  y?: { formatter?: ApexOptionFunction; [key: string]: ApexOptionValue }
  [key: string]: ApexOptionValue
}

export interface ApexLegendOptions {
  show?: boolean
  position?: string
  horizontalAlign?: string
  fontSize?: string
  labels?: { colors?: string | ReadonlyArray<string>; [key: string]: ApexOptionValue }
  markers?: ApexOptionRecord
  itemMargin?: { horizontal?: number; vertical?: number }
  [key: string]: ApexOptionValue
}

export interface ApexStrokeOptions {
  show?: boolean
  curve?: string | ReadonlyArray<string>
  lineCap?: string
  width?: number | ReadonlyArray<number>
  colors?: ReadonlyArray<string>
  dashArray?: number | ReadonlyArray<number>
  [key: string]: ApexOptionValue
}

export interface ApexChartOptions {
  chart?: ApexChartBlock
  colors?: ReadonlyArray<string | ApexOptionFunction>
  theme?: ApexThemeOptions
  grid?: ApexGridOptions
  xaxis?: ApexXAxisOptions
  // Apex admite un eje Y o varios (series con ejes propios).
  yaxis?: ApexYAxisOptions | ReadonlyArray<ApexYAxisOptions>
  tooltip?: ApexTooltipOptions
  legend?: ApexLegendOptions
  stroke?: ApexStrokeOptions
  dataLabels?: ApexOptionRecord
  plotOptions?: ApexOptionRecord
  fill?: ApexOptionRecord
  markers?: ApexOptionRecord
  states?: ApexOptionRecord
  annotations?: ApexOptionRecord
  responsive?: ReadonlyArray<ApexOptionRecord>
  labels?: ReadonlyArray<string | number>
  noData?: ApexOptionRecord
  // Se conserva el escape hatch amplio de ApexCharts, con un valor con nombre.
  [key: string]: ApexOptionValue
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
  /** Contenido para el render del servidor (Apex solo pinta en el navegador). */
  ssrFallback?: React.ReactNode
}

export interface ChartCardAction {
  id?: string | number
  label: React.ReactNode
  onClick: React.MouseEventHandler<HTMLButtonElement>
}

/** Nivel del título de ChartCard dentro del documento. */
export type ChartCardHeadingLevel = 2 | 3 | 4 | 5 | 6

export interface ChartCardProps extends Omit<ChartStateProps, 'theme' | 'ariaLabel' | 'description' | 'accessibleTable'> {
  subtitle?: React.ReactNode
  actions?: ReadonlyArray<ChartCardAction>
  /** Cuerpo a ras (sin padding). */
  noPadding?: boolean
  /** @deprecated Usa `noPadding`. */
  noPad?: boolean
  /** Nivel del título (h2–h6) para respetar el orden de encabezados del contenedor. Por defecto 3. */
  headingLevel?: ChartCardHeadingLevel
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

// ── 2.5 · Lote N2: gráficos compactos (`@duralux/ui/charts/apex`) ─────────────────

/** Tono de la serie principal de un gráfico compacto (roles `status-*`, ≥ 3:1 como marca gráfica). */
export type CompactChartTone = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'indigo' | 'teal' | 'secondary'

interface CompactChartBaseProps extends Omit<ChartStateProps, 'ariaLabel'> {
  /** Nombre accesible de la figura (obligatorio: un gráfico compacto no tiene título visible). */
  ariaLabel: string
  /** Formato de las cifras (por defecto es-CL: 2.840 · 4,3). */
  formatValue?: (value: number) => string
}

export interface SparklineProps extends CompactChartBaseProps {
  data: ReadonlyArray<number>
  /** Etiquetas de cada punto (para la tabla de datos y el tooltip). */
  categories?: ReadonlyArray<string>
  /** Nombre de la serie; por defecto `ariaLabel`. */
  name?: string
  tone?: CompactChartTone
  /** Sobre una superficie de color (Spotlight, ColoredStatCard): línea clara y fondo transparente. */
  onColor?: boolean
  variant?: 'area' | 'line'
  /** Alto en px. Por defecto 48. */
  height?: number
}

export interface TrendLineSeries {
  name: string
  data: ReadonlyArray<number | null>
}

export interface TrendLineProps extends CompactChartBaseProps {
  /** Serie principal y, opcionalmente, una de comparación (se dibuja punteada). */
  series: ReadonlyArray<TrendLineSeries>
  categories: ReadonlyArray<string>
  /** Línea de meta horizontal, punteada y con su etiqueta. */
  target?: { value: number; label: string }
  tone?: CompactChartTone
  /** Alto en px. Por defecto 240. */
  height?: number
}

export interface GaugeProps extends CompactChartBaseProps {
  value: number
  max?: number
  /** Unidad de la cifra central. Por defecto «%». */
  unit?: string
  tone?: CompactChartTone
  /** Alto en px. Por defecto 180. */
  height?: number
}

export interface DonutProps extends CompactChartBaseProps {
  labels: ReadonlyArray<string>
  values: ReadonlyArray<number>
  /** Texto central; por defecto la suma en es-CL. */
  total?: string
  /** Etiqueta del centro. Por defecto «Total». */
  totalLabel?: string
  /** Alto en px. Por defecto 240. */
  height?: number
}
