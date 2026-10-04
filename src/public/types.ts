import type * as React from 'react'
import type { SemanticVariant, StatusVariant } from '../tokens'

export type SemanticTone = Exclude<SemanticVariant, 'link'>
export type KeyLike = string | number
export type Renderable = React.ReactNode

export interface ThemeProviderProps {
  children: React.ReactNode
  enableResponsiveMini?: boolean
}

export interface ApiFetchOptions extends RequestInit {
  json?: unknown
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: SemanticVariant
  outline?: boolean
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: string | null
  /** Nombre Feather (string) o icono Tabler (`<IconX />`). */
  startIcon?: IconSlot
  /** Nombre Feather (string) o icono Tabler (`<IconX />`). */
  endIcon?: IconSlot
  href?: string
  as?: React.ElementType
}

export interface LinkButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string
  variant?: SemanticVariant
  outline?: boolean
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: string | null
  /** Nombre Feather (string) o icono Tabler (`<IconX />`). */
  startIcon?: IconSlot
  /** Nombre Feather (string) o icono Tabler (`<IconX />`). */
  endIcon?: IconSlot
}

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconSlot
  label: string
  variant?: SemanticTone
  size?: 'sm' | 'md' | 'lg'
  outline?: boolean
}

/** Icono de slot: nombre Feather (string) o elemento SVG (p. ej. `<IconRobot />` de @tabler/icons-react). */
export type IconSlot = string | React.ReactElement | null

export interface IconProps extends React.HTMLAttributes<HTMLElement> {
  /** Nombre Feather. Requerido salvo que se pase `icon`. */
  name?: string
  /** Icono Tabler (u otro SVG con props size/stroke). */
  icon?: React.ReactElement
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number
  'aria-label'?: string
}

export interface BadgeProps extends React.HTMLAttributes<HTMLElement> {
  variant?: SemanticTone
  soft?: boolean
  pill?: boolean
  /** Punto de estado decorativo antes del texto. */
  dot?: boolean
  as?: React.ElementType
  /** Tipo nativo cuando `as="button"`. */
  type?: 'button' | 'submit' | 'reset'
}

export interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode
  subtitle?: React.ReactNode
  actions?: React.ReactNode
  headerRight?: React.ReactNode
  footer?: React.ReactNode
  noPadding?: boolean
  noPad?: boolean
  stretch?: boolean
  bodyClassName?: string
  /** @deprecated usa `ref`. */
  elementRef?: React.Ref<HTMLDivElement>
  /** Hover con elevación 2 y cursor de acción. */
  interactive?: boolean
  loading?: boolean
  /** `overlay` (default, CardLoader) o `skeleton` (filas skeleton en el cuerpo). */
  loadingVariant?: 'overlay' | 'skeleton'
  /** Filas del skeleton (1–12, default 3). */
  skeletonRows?: number
  loadingLabel?: React.ReactNode
  onRefresh?: () => void
  onRemove?: () => void
  onExpand?: () => void
  refresh?: React.ReactNode | (() => void)
  remove?: React.ReactNode | (() => void)
  expand?: React.ReactNode | (() => void)
  refreshLabel?: string
  removeLabel?: string
  expandLabel?: string
  children?: React.ReactNode
}

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: SemanticTone
  rounded?: boolean | string
  src?: string | null
  alt?: string
  bg?: string | null
}

export interface AlertProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  variant?: SemanticTone
  soft?: boolean
  /** Clase Feather completa (`"feather-info"`) o icono Tabler (`<IconInfoCircle />`). */
  icon?: string | React.ReactElement
  title?: React.ReactNode
  onDismiss?: () => void
  dismissible?: boolean
  /** Announces dynamic, non-urgent feedback through a polite live region. */
  announce?: boolean
  children?: React.ReactNode
}

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen'

export interface ModalProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title' | 'children'> {
  open?: boolean
  onClose?: () => void
  title?: React.ReactNode
  children?: React.ReactNode
  footer?: React.ReactNode
  size?: ModalSize
  scrollable?: boolean
  closeOnEscape?: boolean
  closeOnBackdrop?: boolean
  showCloseButton?: boolean
}

export interface EmptyStateProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Nombre Feather (`"inbox"`) o icono Tabler (`<IconInbox />`). */
  icon?: IconSlot
  title?: React.ReactNode
  message?: React.ReactNode
  /** Acción siguiente (normalmente un Button). */
  action?: React.ReactNode
  /** Acción alternativa junto a la principal. */
  secondaryAction?: React.ReactNode
  /** Menos aire vertical (dentro de cards o celdas de tabla). */
  compact?: boolean
  className?: string
}

export interface ErrorStateProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title' | 'role'> {
  title?: React.ReactNode
  message?: React.ReactNode
  /** Error recibido (Error u objeto con `message`): reemplaza a `message` y se registra con `log.error`. */
  error?: Error | { message?: React.ReactNode } | React.ReactNode
  onRetry?: () => void
  /** Etiqueta del botón de reintento (por defecto «Reintentar»). */
  retryLabel?: string
  /** El reintento está en curso: el botón muestra spinner y `aria-busy`. */
  retrying?: boolean
  /** Acción alternativa junto al reintento. */
  action?: React.ReactNode
  compact?: boolean
  className?: string
}

export interface LoadingStateProps extends React.HTMLAttributes<HTMLDivElement> {
  message?: React.ReactNode
  /** `spinner` (por defecto) o `skeleton` (líneas con shimmer; recomendado en listas y cards). */
  variant?: 'spinner' | 'skeleton'
  /** Líneas del skeleton (por defecto 3). */
  rows?: number
  compact?: boolean
  className?: string
}

export interface ProgressProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  value: number
  max?: number
  variant?: SemanticTone
  striped?: boolean
  animated?: boolean
  label?: string | number
  showValue?: boolean
  height?: number | string
}

export interface ProgressRingProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
  size?: number
  stroke?: number
  color?: string
  /** Foreground for the central label; intentionally independent of the stroke. */
  labelColor?: string
  label?: React.ReactNode
}

/** Altura del control: 32 / 36 / 40 px (`--gcu-control-h-{sm,md,lg}`). `md` es el tamaño base. */
export type ControlSize = 'sm' | 'md' | 'lg'

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: React.ReactNode
  invalid?: boolean
  error?: boolean | string
  indeterminate?: boolean
}

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: React.ReactNode
  invalid?: boolean
  error?: boolean | string
}

export interface FileInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode
  error?: boolean | string
  helpText?: React.ReactNode
  controlSize?: ControlSize
}

export interface InputGroupControlProps {
  id?: string
  required?: boolean
  disabled?: boolean
  'aria-required'?: React.AriaAttributes['aria-required']
  'aria-invalid'?: React.AriaAttributes['aria-invalid']
  'aria-describedby'?: string
}

export interface InputGroupProps {
  prepend?: React.ReactNode
  append?: React.ReactNode
  /** Altura del grupo completo (`input-group-sm` / `-lg`). */
  controlSize?: ControlSize
  className?: string
  id?: string
  required?: boolean
  disabled?: boolean
  'aria-required'?: React.AriaAttributes['aria-required']
  'aria-invalid'?: React.AriaAttributes['aria-invalid']
  'aria-describedby'?: string
  children?: React.ReactNode | ((controlProps: InputGroupControlProps) => React.ReactNode)
}

export type SelectValue = string | number
export type SelectText = string | number

/** Object option accepted by SearchableSelect and MultiSelect. */
export interface SearchableSelectOption {
  value: SelectValue
  /** Text used for filtering, the combobox input and ARIA labels. */
  label: SelectText
  disabled?: boolean
  color?: string
  icon?: string
  avatar?: string
  [key: string]: string | number | boolean | null | undefined
}

/** The default option domain; consumers may supply a narrower custom model. */
export type SelectOptionInput = SearchableSelectOption | SelectValue

export type SelectOptionValueResolver<TOption> = (option: TOption) => SelectValue
export type SelectOptionLabelResolver<TOption> = (option: TOption) => SelectText
export type SelectOptionRenderer<TOption> = (
  option: TOption,
  normalized: SearchableSelectOption,
) => React.ReactNode
/** A searchable single select renders its selected value in a native input. */
export type SelectOptionTextRenderer<TOption> = (
  option: TOption,
  normalized: SearchableSelectOption,
) => SelectText

export interface SearchableSelectProps<TOption = SelectOptionInput> extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'value' | 'defaultValue' | 'onChange' | 'children' | 'type' | 'size' | 'name' | 'id' | 'placeholder'
> {
  options?: ReadonlyArray<TOption>
  value?: SelectValue
  defaultValue?: SelectValue
  onChange?: (value: SelectValue | undefined, option?: TOption) => void
  getOptionValue?: SelectOptionValueResolver<TOption>
  getOptionLabel?: SelectOptionLabelResolver<TOption>
  renderOption?: SelectOptionRenderer<TOption>
  renderValue?: SelectOptionTextRenderer<TOption>
  /** Native input placeholders accept text only. */
  placeholder?: SelectText
  noResultsLabel?: React.ReactNode
  disabled?: boolean
  required?: boolean
  name?: string
  id?: string
  className?: string
  clearable?: boolean
}

export interface MultiSelectProps<TOption = SelectOptionInput> extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'value' | 'defaultValue' | 'onChange' | 'children' | 'type' | 'size' | 'name' | 'id' | 'placeholder'
> {
  options?: ReadonlyArray<TOption>
  value?: ReadonlyArray<SelectValue>
  defaultValue?: ReadonlyArray<SelectValue>
  onChange?: (values: SelectValue[], options: TOption[]) => void
  getOptionValue?: SelectOptionValueResolver<TOption>
  getOptionLabel?: SelectOptionLabelResolver<TOption>
  renderOption?: SelectOptionRenderer<TOption>
  renderValue?: SelectOptionRenderer<TOption>
  /** Native input placeholders accept text only; chips may use renderValue. */
  placeholder?: SelectText
  noResultsLabel?: React.ReactNode
  /** Accessible group label; it is stringified for aria-label. */
  selectedLabel?: SelectText
  disabled?: boolean
  required?: boolean
  max?: number
  name?: string
  id?: string
  className?: string
}

export interface FormFieldProps {
  label: React.ReactNode
  htmlFor?: string
  required?: boolean
  error?: React.ReactNode
  helpText?: React.ReactNode
  hint?: React.ReactNode
  className?: string
  children: React.ReactNode | ((id: string) => React.ReactNode)
}

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  icon?: string
  prefix?: React.ReactNode
  startAddon?: React.ReactNode
  endAddon?: React.ReactNode
  invalid?: boolean
  error?: boolean | string
  /** Altura del control; el atributo nativo `size` (ancho en caracteres) se conserva. */
  controlSize?: ControlSize
}

export interface SelectOption {
  value: string | number
  label: React.ReactNode
  disabled?: boolean
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options?: ReadonlyArray<SelectValue | SelectOption>
  invalid?: boolean
  error?: boolean | string
  placeholder?: React.ReactNode
  /** Altura del control; el atributo nativo `size` (filas visibles) se conserva. */
  controlSize?: ControlSize
}

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  icon?: string
  invalid?: boolean
  error?: boolean | string
  controlSize?: ControlSize
}

export interface TableRowEntry<T> {
  row: T
  index: number
  rawKey: KeyLike | undefined
  identity: KeyLike
  reactKey: string
}

export interface TableSlotContext<T> {
  columns: ReadonlyArray<TableColumn<T>>
  rows: ReadonlyArray<T>
  rowEntries: ReadonlyArray<TableRowEntry<T>>
  loading: boolean
  emptyMessage: React.ReactNode
}

export type TableSlot<T> = React.ReactNode | ((context: TableSlotContext<T>) => React.ReactNode)

export interface TableColumn<T = unknown> {
  key: string | number
  header?: React.ReactNode
  label?: React.ReactNode
  headerClassName?: string
  width?: string | number
  cellClassName?: string
  /** Columna numérica: alinea encabezado y celdas a la derecha con números tabulares. */
  numeric?: boolean
  render?: (row: T, rowIndex: number) => React.ReactNode
}

/** Densidad de filas: `compact` (40 px) para tablas operativas largas, `comfortable` (56 px) para pocas filas. */
export type TableDensity = 'compact' | 'comfortable'

export interface TableProps<T = unknown> extends Omit<React.TableHTMLAttributes<HTMLTableElement>, 'children' | 'className' | 'rows'> {
  columns?: ReadonlyArray<TableColumn<T>>
  rows?: ReadonlyArray<T>
  rowKey?: string | ((row: T, index: number) => KeyLike | undefined)
  emptyMessage?: React.ReactNode
  loading?: boolean
  caption?: React.ReactNode
  ariaLabel?: string
  className?: string
  hover?: boolean
  responsive?: boolean
  wrapperClassName?: string
  head?: TableSlot<T>
  body?: TableSlot<T>
  header?: TableSlot<T>
  renderHeader?: TableSlot<T>
  renderBody?: TableSlot<T>
  children?: TableSlot<T>
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-busy'?: React.AriaAttributes['aria-busy']
  /** Densidad de filas; sin valor, altura estándar de 48 px. */
  density?: TableDensity
  /** Encabezado fijo dentro del contenedor (que pasa a desplazarse en vertical); sombra solo al hacer scroll. */
  stickyHeader?: boolean
  /** Alto máximo del contenedor con `stickyHeader` (número en px o largo CSS). Por defecto `min(32rem, 70vh)`. */
  maxHeight?: number | string
  /** Reemplaza el estado vacío por defecto (EmptyState con `emptyMessage` como título). */
  emptyState?: React.ReactNode
  /** Filas de skeleton mientras `loading` (por defecto 5). */
  loadingRows?: number
}

export type DataTableKey<T extends object> = Extract<keyof T, string | number>

export type DataTableRowKey<T extends object> = Extract<keyof T, string>

export type DataTableColumn<
  T extends object = Record<string, string | number | boolean | null | undefined>,
  K extends DataTableKey<T> = DataTableKey<T>,
> = {
  [P in K]: {
    key: P
    label?: React.ReactNode
    header?: React.ReactNode
    sortable?: boolean
    render?: (row: T, value: T[P], rowIndex: number) => React.ReactNode
  }
}[K]

export interface DataTableAction<T extends object = Record<string, string | number | boolean | null | undefined>> {
  label?: React.ReactNode
  icon?: string
  onClick: (row: T) => void
  variant?: 'icon' | 'button'
  buttonVariant?: string
}

export type DataTableIdentityKey<T extends object> = {
  [K in DataTableRowKey<T>]-?: [T[K]] extends [React.Key] ? K : never
}[DataTableRowKey<T>]

export interface DataTableToolbarContext {
  searchValue: string
  onSearchChange: (value: string) => void
  pageSize: number
  pageSizeOptions: ReadonlyArray<number>
  onPageSizeChange: (pageSize: number) => void
}

export interface DataTableToolbarProps {
  searchable?: boolean
  searchValue?: string | number
  defaultSearchValue?: string | number
  onSearchChange?: (value: string) => void
  searchLabel?: React.ReactNode
  searchPlaceholder?: React.ReactNode
  searchId?: string
  pageSize?: number
  pageSizeOptions?: ReadonlyArray<number>
  onPageSizeChange?: (pageSize: number) => void
  pageSizeLabel?: React.ReactNode
  pageSizeId?: string
  className?: string
  children?: React.ReactNode
}

export type DataTableProps<T extends object = Record<string, string | number | boolean | null | undefined>> = Omit<
  React.TableHTMLAttributes<HTMLTableElement>,
  'children' | 'className' | 'aria-label' | 'aria-labelledby'
> & {
  columns: ReadonlyArray<DataTableColumn<T>>
  data: ReadonlyArray<T>
  actions?: ReadonlyArray<DataTableAction<T>>
  pageSize?: number
  selectable?: boolean
  onSelectionChange?: (selectedIds: React.Key[]) => void
  rowKey?: DataTableIdentityKey<T> | ((row: T, index: number) => KeyLike | undefined)
  getRowLabel?: (row: T, index: number) => string | number
  autoWidth?: boolean
  loading?: boolean
  emptyMessage?: React.ReactNode
  responsive?: boolean
  wrapperClassName?: string
  caption?: React.ReactNode
  className?: string
  hover?: boolean
  searchable?: boolean
  searchValue?: string | number
  defaultSearchValue?: string | number
  onSearchChange?: (value: string) => void
  searchLabel?: React.ReactNode
  searchPlaceholder?: React.ReactNode
  filterMode?: 'local' | 'manual' | 'remote'
  filterResolver?: (row: T, index: number) => string | number | boolean | null | undefined
  filterPredicate?: (row: T, query: string, index: number) => boolean
  pageSizeOptions?: ReadonlyArray<number>
  onPageSizeChange?: (pageSize: number) => void
  pageSizeLabel?: React.ReactNode
  totalItems?: number
  totalCount?: number
  noResultsMessage?: React.ReactNode
  toolbar?: React.ReactNode | ((context: DataTableToolbarContext) => React.ReactNode)
  renderToolbar?: React.ReactNode | ((context: DataTableToolbarContext) => React.ReactNode)
  search?: string | number
  defaultSearch?: string | number
  onSearch?: (value: string) => void
  searchResolver?: (row: T, index: number) => string | number | boolean | null | undefined
  searchPredicate?: (row: T, query: string, index: number) => boolean
  manualFiltering?: boolean
  'aria-label'?: string
  'aria-labelledby'?: string
} & ('id' extends DataTableIdentityKey<T>
  ? unknown
  : { rowKey: DataTableIdentityKey<T> | ((row: T, index: number) => KeyLike | undefined) })

export interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  sibling?: number
  className?: string
  pageAriaLabel?: (page: number) => string
  'aria-label'?: string
  /** Filas por página; con `totalItems` muestra el rango visible («11–20 de 248»). */
  pageSize?: number
  /** Total de registros; con `pageSize` muestra el rango visible. */
  totalItems?: number
}

export interface ResponsiveTableProps<T = unknown> extends TableProps<T> {}

export type TabKey = string | number

export interface TabItem<K extends TabKey = TabKey> {
  key: K
  label: React.ReactNode
  content?: React.ReactNode
  icon?: string
  disabled?: boolean
}

export interface TabsProps<K extends TabKey = TabKey> {
  tabs?: ReadonlyArray<TabItem<K>>
  className?: string
  tabClassName?: string
  activeKey?: K
  defaultActiveKey?: K
  onChange?: (key: K) => void
  /** Accessible tablist name when no visible heading is referenced. */
  ariaLabel?: string
  'aria-label'?: string
  'aria-labelledby'?: string
}

export type BubbleVariant = 'incoming' | 'outgoing' | 'system'

export interface MessageBubbleProps {
  variant: BubbleVariant
  children: React.ReactNode
  header?: React.ReactNode
  meta?: React.ReactNode
  highlighted?: boolean
  'data-raw'?: string
  bubbleRef?: React.Ref<HTMLDivElement>
  className?: string
  /** Hora visible en la meta (cifras tabulares). */
  time?: React.ReactNode
  /** Estado de entrega: ícono + texto (nunca solo color). */
  status?: ChatDeliveryStatus
  /** Continuación de un mensaje del mismo autor: menos aire y sin cola. */
  grouped?: boolean
}

export interface CardLoaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'aria-label'> {
  loading?: boolean
  visible?: boolean
  label?: string | number
  loadingLabel?: string | number
  className?: string
  'aria-label'?: string
}

export interface AvatarGroupItem {
  id?: React.Key
  name?: string | number
  src?: string | null
  href?: string
  onClick?: React.MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>
  renderItem?: (item: AvatarGroupItem, index: number) => React.ReactNode
}

export interface AvatarGroupProps {
  items?: ReadonlyArray<AvatarGroupItem>
  max?: number
  size?: AvatarProps['size']
  className?: string
  renderItem?: (item: AvatarGroupItem, index: number) => React.ReactNode
  onOverflowClick?: React.MouseEventHandler<HTMLButtonElement>
  overflowLabel?: string
  overflowClassName?: string
}

export interface FooterLink {
  id?: React.Key
  key?: React.Key
  label?: React.ReactNode
  children?: React.ReactNode
  href?: string
  onClick?: React.MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>
}

export interface FooterProps {
  copyright?: React.ReactNode
  content?: React.ReactNode
  links?: ReadonlyArray<FooterLink>
  actions?: React.ReactNode
  className?: string
}

// ── Indicadores (lote L4) ──────────────────────────────────────────────────────

/** Tono de un indicador: define el ícono suave o el relleno de la tarjeta de color. */
export type IndicatorTone =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'teal'
  | 'indigo'
  | 'dark'
  | 'neutral'

/**
 * Variación de una cifra respecto de un periodo o una meta. Se muestra con signo, unidad y
 * forma (flecha + texto), nunca solo con color: «+4 pts vs. semana pasada».
 */
export interface IndicatorDelta {
  /** Variación numérica; el signo define la flecha. Se formatea en es-CL (coma decimal). */
  value: number
  /** Unidad que sigue a la cifra: `%` (con espacio), `pts`, `s`, `llamadas`… */
  unit?: string
  /** Contexto de la comparación: «vs. semana pasada», «vs. meta». */
  label?: React.ReactNode
  /** Qué sentido es bueno (define el color de apoyo). Por defecto `up`; TMO o abandono usan `down`. */
  goodWhen?: 'up' | 'down'
  /** Decimales visibles (por defecto los necesarios, hasta 1). */
  fractionDigits?: number
}

/** Ícono de un indicador: clase completa (`feather-users`), nombre Feather (`users`) o un SVG Tabler. */
export type IndicatorIcon = string | React.ReactElement

/** @deprecated Usa `IndicatorDelta` con la prop `delta`. */
export interface StatsCardTrend {
  value: string
  up?: boolean
}

export interface StatsCardProgress {
  value: number
  max?: number
  label?: React.ReactNode
  color?: string
}

export interface StatsCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title' | 'color'> {
  icon?: IndicatorIcon
  /** @deprecated Usa `tone`. Clases del ícono (`bg-soft-info text-info`); se siguen aplicando. */
  iconBg?: string
  /** Tono del ícono con los roles `--gcu-{tono}-soft` / `--gcu-{tono}-text`. */
  tone?: IndicatorTone
  /** Cifra principal. Un número se formatea en es-CL (2.840 · 4,3). `null` muestra el estado vacío. */
  value: React.ReactNode
  label: React.ReactNode
  /** Variación con signo, unidad y flecha. */
  delta?: IndicatorDelta
  /** Contexto visible de la cifra: «meta 80 %», «de 120 agentes». */
  context?: React.ReactNode
  /** @deprecated Usa `delta`. */
  trend?: StatsCardTrend
  progress?: StatsCardProgress
  footer?: React.ReactNode
  onFooter?: () => void
  /** Muestra skeleton en lugar de la cifra y marca `aria-busy`. */
  loading?: boolean
  /** Texto del estado vacío (cuando `value` es `null`, `undefined` o ''). */
  emptyText?: React.ReactNode
}

export interface MiniStatCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title' | 'color'> {
  icon?: IndicatorIcon
  value: React.ReactNode
  label: React.ReactNode
  /** Tono del ícono (`primary`, `success`…). Equivale a `tone`. */
  color?: string
  tone?: IndicatorTone
  delta?: IndicatorDelta
  context?: React.ReactNode
  loading?: boolean
  emptyText?: React.ReactNode
}

export interface ColoredStatCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title' | 'color'> {
  icon?: IndicatorIcon
  value: React.ReactNode
  label: React.ReactNode
  /** Relleno de la tarjeta (AA con texto blanco en claro, oscuro y navy). */
  tone?: Exclude<IndicatorTone, 'neutral'>
  delta?: IndicatorDelta
  context?: React.ReactNode
  /** @deprecated Usa `delta`. */
  trend?: string
  /** @deprecated Usa `delta` (el signo de `value` define la flecha). */
  trendUp?: boolean
  /** @deprecated Usa `tone`. Clase `bg-{tono}`: se traduce al tono equivalente. */
  bg?: string
  chart?: React.ReactNode
  loading?: boolean
  emptyText?: React.ReactNode
}

export interface ChartMetric {
  id?: React.Key
  label: React.ReactNode
  value: React.ReactNode
  /** Clase de color del valor (`text-primary`). */
  color?: string
  delta?: IndicatorDelta
}

export interface ChartMetricsFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  metrics?: ReadonlyArray<ChartMetric>
  loading?: boolean
}

export interface QuickLinkItem {
  id?: React.Key
  icon: IndicatorIcon
  label: React.ReactNode
  /** Cifra opcional del acceso: «12 pendientes». */
  description?: React.ReactNode
  href?: string
  onClick?: (event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => void
  color?: string
}

export interface QuickLinkGridProps extends React.HTMLAttributes<HTMLDivElement> {
  items?: ReadonlyArray<QuickLinkItem>
  /** Columnas cuando el contenedor tiene espacio (≥ 36rem). En contenedores angostos bajan a 2. */
  columns?: number
}

export interface ConnectionCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title' | 'onChange'> {
  /** Logo o ícono de la integración (p. ej. `<Icon />` o una imagen de marca). */
  icon: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  /** Explica por qué el switch está deshabilitado (se asocia con `aria-describedby`). */
  disabledReason?: React.ReactNode
  className?: string
}

// ── Extras GranCRM (CardHeader, CardBody, CardFooter, StatusBadge, StatusButton, StatCard) ─────

export interface CardHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode
  actions?: React.ReactNode
}

export type CardBodyProps = React.HTMLAttributes<HTMLDivElement>

export type CardFooterProps = React.HTMLAttributes<HTMLDivElement>

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: StatusVariant
  label?: string
  soft?: boolean
}

export interface StatusButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  status: StatusVariant
  label?: string
  soft?: boolean
}

export interface StatCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title: string
  value: React.ReactNode
  icon?: string
  variant?: Exclude<SemanticVariant, 'link'>
  /** Variación en porcentaje: se muestra con signo, `%` y flecha. */
  change?: { value: number; label?: string }
  footer?: React.ReactNode
}

/** Fecha de un evento: Date, ISO o epoch (ms). */
export type EventDate = Date | string | number

export interface TimelineItem {
  id?: string | number
  title: React.ReactNode
  description?: React.ReactNode
  /** Fecha del evento: tiempo relativo visible y fecha completa (dd-mm-aaaa HH:mm) en `title`. */
  date?: EventDate
  /** Texto libre legado (se muestra tal cual si no hay `date`). */
  time?: React.ReactNode
  /** `dateTime` del `<time>` cuando se usa `time`. */
  dateTime?: string
  icon?: string
  /** Tono del marcador. */
  variant?: SemanticTone
  /** @deprecated usa `variant`. */
  iconBg?: string
  /** Alias legado de `variant`. */
  color?: string
  user?: { name?: React.ReactNode; avatar?: string }
}
export interface TimelineProps {
  items?: ReadonlyArray<TimelineItem>
  className?: string
  'aria-label'?: string
  /** Instante de referencia del tiempo relativo (por defecto, ahora). */
  now?: Date
}

export type ActivityFeedVariant = 'primary' | 'success' | 'danger' | 'warning' | 'info'

export interface ActivityFeedItem {
  key: string | number
  variant: ActivityFeedVariant
  title: React.ReactNode
  description?: React.ReactNode
  /** Fecha del evento: tiempo relativo visible y fecha completa en `title`. */
  date?: EventDate
  /** Texto libre legado (se muestra tal cual si no hay `date`). */
  time?: React.ReactNode
  /** Slot final (badges, acciones, avatares agrupados, etc.) */
  extra?: React.ReactNode
}

export interface ActivityFeedProps {
  items: ActivityFeedItem[]
  className?: string
  /** Instante de referencia del tiempo relativo (por defecto, ahora). */
  now?: Date
}

export interface ChatContact {
  id?: string | number
  name?: string | number
  avatar?: string
  preview?: string | number
  time?: string | number
  online?: boolean
  unread?: number | string
}

export interface ChatLabels {
  sidebar?: string | number
  search?: string | number
  searchPlaceholder?: string | number
  edit?: string | number
  list?: string | number
  online?: string | number
  unread?: string | number
  selected?: string | number
  window?: string | number
  empty?: string | number
  phone?: string | number
  video?: string | number
  menu?: string | number
  messages?: string | number
  offline?: string | number
  noResults?: string | number
  results?: string | number
  input?: string | number
  attach?: string | number
  emoji?: string | number
  send?: string | number
  /** Título del estado vacío cuando la lista no tiene conversaciones (sin búsqueda). */
  emptyList?: string | number
  /** Botón para volver a la lista en contenedores angostos. */
  back?: string | number
  /** Anuncio y texto del estado de carga. */
  loading?: string | number
}

export interface ChatSidebarProps<TContact extends ChatContact = ChatContact> {
  contacts?: ReadonlyArray<TContact>
  selectedId?: string | number
  onSelect?: (contact: TContact) => void
  onSearch?: (query: string) => void
  onEdit?: () => void
  sidebarLabel?: string | number
  searchLabel?: string | number
  searchPlaceholder?: string | number
  editLabel?: string | number
  listLabel?: string | number
  onlineLabel?: string | number
  unreadLabel?: string | number
  selectedLabel?: string | number
  labels?: ChatLabels
  /** Muestra filas skeleton y marca la lista con `aria-busy`. */
  loading?: boolean
  className?: string
}

/** Estado de entrega de un mensaje propio. */
export type ChatDeliveryStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed'

export interface ChatMessage {
  id?: string | number
  text?: string | number
  time?: string | number
  sender?: { id?: string | number; name?: string | number; avatar?: string }
  mine?: boolean
  /** Fecha del mensaje: separadores de día («Hoy», «Ayer», dd-mm-aaaa) y agrupación. */
  date?: EventDate
  /** Estado de entrega (solo mensajes propios). */
  status?: ChatDeliveryStatus
  /** Mensaje del sistema: discreto y centrado («Ana se unió a la conversación»). */
  system?: boolean
}

export interface ChatBubbleProps {
  message: ChatMessage
  /** Continuación del mismo autor: oculta avatar y nombre, y junta la burbuja con la anterior. */
  grouped?: boolean
  /** Reintento de un mensaje con `status: 'failed'`; sin él solo se informa el error. */
  onRetry?: (message: ChatMessage) => void
  retryLabel?: string
  className?: string
}

export interface ChatTypingIndicatorProps {
  name?: string | number
  className?: string
}

export interface ChatDaySeparatorProps {
  /** Día del separador: «Hoy», «Ayer» o dd-mm-aaaa. */
  date: EventDate
  /** Instante de referencia (tests y capturas); por defecto, ahora. */
  now?: Date
  className?: string
}

/** Entrada de `groupChatMessages`: separador de día o mensaje con su agrupación. */
export type ChatTimelineEntry =
  | { type: 'day'; key: string; date: Date; label: string }
  | { type: 'message'; key: string; message: ChatMessage; grouped: boolean }

export interface ChatInputBarProps {
  onSend?: (text: string) => void
  onAttach?: () => void
  onEmoji?: () => void
  placeholder?: string | number
  disabled?: boolean
  inputLabel?: string | number
  attachLabel?: string | number
  emojiLabel?: string | number
  sendLabel?: string | number
  labels?: Pick<ChatLabels, 'input' | 'attach' | 'emoji' | 'send'>
  /** Textarea que crece con el texto: Enter envía y Shift+Enter salta de línea. */
  multiline?: boolean
  /** Filas máximas antes de desplazar (multiline). Por defecto 6. */
  maxRows?: number
  /** Límite de caracteres; el contador aparece al llegar al 80 %. */
  maxLength?: number
  /** Borrador controlado. */
  value?: string
  /** Cambio del borrador (controlado o no): sirve para avisar «escribiendo…». */
  onChange?: (text: string) => void
  /** Por qué el compositor está deshabilitado («Sin conexión»). */
  disabledReason?: React.ReactNode
  className?: string
}

export interface ChatWindowContact {
  name?: string | number
  avatar?: string
  online?: boolean
  role?: string | number
}

export interface ChatWindowProps<TContact extends ChatWindowContact = ChatWindowContact> {
  contact?: TContact | null
  children?: React.ReactNode
  messages?: React.ReactNode
  composer?: React.ReactNode
  legacyChildren?: boolean
  onPhone?: (contact: TContact) => void
  onVideo?: (contact: TContact) => void
  onMenu?: (contact: TContact) => void
  windowLabel?: string | number
  emptyLabel?: string | number
  phoneLabel?: string | number
  videoLabel?: string | number
  menuLabel?: string | number
  messagesLabel?: string | number
  onlineLabel?: string | number
  offlineLabel?: string | number
  labels?: Pick<ChatLabels, 'window' | 'empty' | 'phone' | 'video' | 'menu' | 'messages' | 'online' | 'offline' | 'back' | 'loading'>
  /** Volver a la lista: el botón aparece cuando `.gcu-chat` es angosto (una columna). */
  onBack?: () => void
  /** Historial cargando: skeleton y `aria-busy` en el log. */
  loading?: boolean
  className?: string
}

export interface SidebarNavItem {
  key?: string | number
  id?: string | number
  label: string
  icon?: string
  to?: string
  href?: string
  end?: boolean
  type?: 'caption' | 'item'
  disabled?: boolean
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
  children?: ReadonlyArray<SidebarNavItem>
}

export interface HeaderUserMenuItem {
  key?: string | number
  label?: React.ReactNode
  icon?: string
  href?: string
  divider?: boolean
  onClick?: (event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => void
}

export interface HeaderUser {
  avatar?: string
  name?: string
  email?: string
  menuItems?: ReadonlyArray<HeaderUserMenuItem>
}

export interface HeaderNotification {
  id?: string | number
  href?: string
  icon?: string
  color?: string
  title: React.ReactNode
  time?: React.ReactNode
  onClick?: (
    event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>,
    notification: HeaderNotification,
  ) => void
}

export type MobileCloseReason = 'dismiss' | 'escape' | 'overlay' | 'toggle' | 'navigation' | 'programmatic' | 'open'

export interface HeaderProps {
  user?: HeaderUser
  notifications?: ReadonlyArray<HeaderNotification>
  onToggleMini?: () => void
  mini?: boolean
  onToggleMobile?: () => void
  mobileOpen?: boolean
  mobileNavId?: string
  mobileCloseReason?: MobileCloseReason
  onMarkAllRead?: () => void
  onNotificationClick?: (
    event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>,
    notification: HeaderNotification,
  ) => void
}

export interface SidebarProps {
  navItems?: ReadonlyArray<SidebarNavItem>
  logo?: string
  logoAbbr?: string
  promoCard?: React.ReactNode
  mobileOpen?: boolean
  onNavigate?: (event: React.MouseEvent) => void
  navigationId?: string
}

export interface AppLayoutProps {
  children?: React.ReactNode
  navItems?: ReadonlyArray<SidebarNavItem>
  logo?: string
  logoAbbr?: string
  user?: HeaderUser
  notifications?: ReadonlyArray<HeaderNotification>
  theme?: 'light' | 'dark'
  promoCard?: React.ReactNode
}

export interface AuthLayoutProps {
  children?: React.ReactNode
  image?: string
  imageAlt?: string
}

/** A page-header navigation item. `Breadcrumb` is retained as the concise public alias. */
export interface Breadcrumb {
  label: React.ReactNode
  href?: string
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void
}

export type PageHeaderBreadcrumb = Breadcrumb

export interface PageHeaderProps {
  title: React.ReactNode
  subtitle?: React.ReactNode
  breadcrumbs?: ReadonlyArray<PageHeaderBreadcrumb>
  actions?: React.ReactNode
  className?: string
  children?: React.ReactNode
}

export type { SemanticVariant, StatusVariant }
