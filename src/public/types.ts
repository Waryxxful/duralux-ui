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
    /** Columna numérica: encabezado y celdas a la derecha con números tabulares. */
    numeric?: boolean
    /** Ancho del encabezado (número en px o largo CSS). */
    width?: number | string
    /** `false` la deja fuera del menú «Columnas» (siempre visible). */
    hideable?: boolean
  }
}[K]

/** Visibilidad por columna (clave = `String(column.key)`); `false` la oculta. */
export type DataTableColumnVisibility = Readonly<Partial<Record<string, boolean>>>

/** Contexto del slot de acciones masivas. */
export interface DataTableBulkContext {
  /** Cantidad de filas seleccionadas (incluye las ocultas por la búsqueda). */
  count: number
  /** Deselecciona todo. */
  clearSelection: () => void
}

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
  /** Menú «Columnas» listo para ubicar en una barra propia (null si la tabla no lo ofrece). */
  columnMenu?: React.ReactNode
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
  /** Densidad de filas (igual que Table): `compact` 40 px, `comfortable` 56 px; sin valor, 48 px. */
  density?: TableDensity
  /** Encabezado fijo dentro del contenedor, con sombra solo al hacer scroll. */
  stickyHeader?: boolean
  /** Alto máximo del contenedor con `stickyHeader` o `virtualized` (px o largo CSS). */
  maxHeight?: number | string
  /** Reemplaza el estado vacío por defecto (EmptyState con `emptyMessage`). */
  emptyState?: React.ReactNode
  /** Filas de skeleton mientras `loading` (por defecto 5). */
  loadingRows?: number
  /** Error al cargar: se muestra ErrorState en el cuerpo de la tabla. */
  error?: ErrorStateProps['error']
  /** Reintento del ErrorState. */
  onRetry?: () => void
  /** Visibilidad controlada de columnas; activa el menú «Columnas». */
  columnVisibility?: DataTableColumnVisibility
  /** Visibilidad inicial (no controlada); activa el menú «Columnas». */
  defaultColumnVisibility?: DataTableColumnVisibility
  /** Cambio de visibilidad desde el menú «Columnas»; también lo activa. */
  onColumnVisibilityChange?: (visibility: DataTableColumnVisibility) => void
  /** Muestra el menú «Columnas» aunque no se pase visibilidad. */
  columnMenu?: boolean
  /** Acciones masivas sobre la selección: aparecen en una barra cuando hay filas seleccionadas. */
  renderBulkActions?: (selectedRows: T[], context: DataTableBulkContext) => React.ReactNode
  /** Virtualiza las filas (sin paginación) con @tanstack/react-virtual, cargado bajo demanda. Pensado para más de 500 filas. */
  virtualized?: boolean
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
  /** Título de la pantalla de acceso (h1). */
  title?: React.ReactNode
  /** Texto bajo el título. */
  description?: React.ReactNode
  /** Error del formulario: se anuncia con `role="alert"`; el formulario lo referencia con `errorId`. */
  error?: React.ReactNode
  /** id del mensaje de error, para `aria-describedby` del formulario. */
  errorId?: string
  /** Pie bajo la tarjeta (enlaces de ayuda, versión). */
  footer?: React.ReactNode
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
  /** Acciones a la derecha (máximo una primaria). */
  actions?: React.ReactNode
  className?: string
  children?: React.ReactNode
  /** Fija la barra al hacer scroll; la sombra aparece solo cuando queda pegada. Por defecto true. */
  sticky?: boolean
}

// ── 2.5 · Lote N2: datos y composición ─────────────────────────────────────────

/** Severidad: crítico requiere acción ya; advertencia está fuera de lo esperado; normal, sin urgencia. */
export type SeverityLevel = 'critical' | 'warning' | 'normal'

export interface SeverityProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  level: SeverityLevel
  /** Texto visible («SLA vencido»). Por defecto el nombre del nivel; `false` deja solo el marcador con nombre accesible. */
  label?: React.ReactNode | false
  size?: 'sm' | 'md'
}

/** Umbrales de `severityOf`. Por defecto más es mejor: bajo `warning` es advertencia y bajo `critical`, crítico. */
export interface SeverityThresholds {
  warning?: number
  critical?: number
  /** Métricas donde más es peor (abandono, TMO): el umbral se alcanza con `>=`. */
  higherIsWorse?: boolean
}

/** Rango de un puntaje: ok (≥ 80 % del máximo), medio (≥ 50 %), bajo o anulado por error grave. */
export type ScoreRange = 'ok' | 'medio' | 'bajo' | 'anulado'

export interface ScoreThresholds {
  /** Desde este valor el puntaje está en rango ok. Por defecto 80 % del máximo. */
  ok?: number
  /** Desde este valor el puntaje está en rango medio. Por defecto 50 % del máximo. */
  medio?: number
}

export interface ScoreProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** Puntaje; `null` o `undefined` muestran «—» y «Sin puntaje». */
  value: number | null | undefined
  max?: number
  /** El puntaje fue anulado por un error grave: la cifra se tacha y el rango dice «Anulado». */
  voided?: boolean
  thresholds?: ScoreThresholds
  /** Muestra el rango en texto («Bueno», «Medio», «Bajo», «Anulado»). Por defecto `true`. */
  showRange?: boolean
  size?: 'sm' | 'md'
}

export interface ScoreHeroProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  value: number | null | undefined
  max?: number
  /** Por defecto «Puntaje final». */
  label?: React.ReactNode
  /** Puntaje previo a la anulación: si existe, el puntaje se considera anulado y se muestra al lado. */
  previous?: number
  voided?: boolean
  thresholds?: ScoreThresholds
  /** Variación respecto de la evaluación anterior. */
  delta?: IndicatorDelta
  /** Contexto visible: «Meta 80 · 12 evaluaciones». */
  context?: React.ReactNode
  loading?: boolean
}

export interface PersonProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  name: string
  /** Dato secundario en la misma línea: rol, equipo, correo. */
  meta?: React.ReactNode
  src?: string | null
  size?: 'sm' | 'md' | 'lg'
  /** Tono de las iniciales. */
  variant?: SemanticTone
}

export interface DescriptionListItem {
  /** Clave estable; si falta se usa la etiqueta (texto). */
  id?: string | number
  label: React.ReactNode
  value?: React.ReactNode
  /** Valor en monoespaciada (IDs, URLs, esquemas). */
  mono?: boolean
  /** Columnas que ocupa el par cuando hay espacio. */
  span?: 1 | 2 | 3
}

export interface DescriptionListProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  items: ReadonlyArray<DescriptionListItem>
  /** Columnas cuando el contenedor tiene espacio (2 desde 28rem, 3 desde 42rem). Por defecto 1. */
  columns?: 1 | 2 | 3
  /** Lo que se muestra en valores vacíos. Por defecto «—» (y «Sin dato» para lectores de pantalla). */
  emptyValue?: React.ReactNode
  loading?: boolean
}

export interface KpiCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  label: React.ReactNode
  /** Cifra principal. Un número se formatea en es-CL; `null` muestra el estado vacío. */
  value: React.ReactNode
  /** Sufijo pequeño tras la cifra: «%», «/100», «s». */
  unit?: React.ReactNode
  icon?: IndicatorIcon
  /** Variación con signo, unidad y flecha. */
  delta?: IndicatorDelta
  /** Meta o tendencia en texto: «Meta 80 %». Toda cifra necesita `delta`, `context` o `chart`. */
  context?: React.ReactNode
  /** Tono del ícono; `danger`/`warning` marcan una cifra fuera de meta (con el texto de `status`). */
  tone?: IndicatorTone
  /** Estado en texto cuando la cifra está fuera de meta: «Bajo la meta». */
  status?: React.ReactNode
  /** Sparkline u otro gráfico compacto bajo la cifra (de `@duralux/ui/charts/apex`). */
  chart?: React.ReactNode
  footer?: React.ReactNode
  loading?: boolean
  emptyText?: React.ReactNode
  /** Nivel del encabezado de la etiqueta (h2–h6). Por defecto 3. */
  headingLevel?: 2 | 3 | 4 | 5 | 6
}

export interface StatGroupItem {
  id?: string | number
  label: React.ReactNode
  value: React.ReactNode
  unit?: React.ReactNode
  icon?: IndicatorIcon
  tone?: IndicatorTone
  delta?: IndicatorDelta
  context?: React.ReactNode
}

export interface StatGroupProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  /** De 2 a 4 métricas relacionadas. */
  items: ReadonlyArray<StatGroupItem>
  /** Título de la card; si falta, usa `aria-label`. */
  title?: React.ReactNode
  /** Nivel del título (h2–h6). Por defecto 3. */
  headingLevel?: 2 | 3 | 4 | 5 | 6
  loading?: boolean
}

export interface ListItem {
  id: string | number
  title: React.ReactNode
  meta?: React.ReactNode
  /** Avatar, ícono o marca a la izquierda. */
  leading?: React.ReactNode
  /** Cifra o estado a la derecha. En listas seleccionables no debe ser interactivo. */
  trailing?: React.ReactNode
  /** Lista no seleccionable: la fila es un botón. */
  onClick?: () => void
  /** Lista no seleccionable: la fila es un enlace. */
  href?: string
  disabled?: boolean
  /** Marca «Sin leer» (notificaciones): punto + texto oculto. */
  unread?: boolean
  /** Fila actual (vista de detalle) en listas no seleccionables. */
  active?: boolean
  /** Texto para la búsqueda por tipeo cuando `title` no es texto. */
  textValue?: string
}

export interface ListProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onChange' | 'defaultValue'> {
  items: ReadonlyArray<ListItem>
  /** Nombre accesible de la lista (obligatorio si es seleccionable). */
  label?: string
  /** `single` o `multiple` la vuelven un `listbox` con teclado completo. */
  selectionMode?: 'none' | 'single' | 'multiple'
  selectedIds?: ReadonlyArray<string | number>
  defaultSelectedIds?: ReadonlyArray<string | number>
  onSelectionChange?: (ids: Array<string | number>) => void
  density?: 'compact' | 'default' | 'comfortable'
  loading?: boolean
  /** Estado vacío (por defecto un texto que explica qué pasó). */
  empty?: React.ReactNode
}

export interface ActiveFilter {
  key: string
  /** Nombre del filtro: «Estado». */
  label: React.ReactNode
  /** Valor aplicado: «Vencido». */
  value?: React.ReactNode
  /** Texto para el botón de quitar cuando label/value no son texto. */
  textValue?: string
}

export interface ActiveFiltersProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  filters: ReadonlyArray<ActiveFilter>
  onRemove: (key: string) => void
  onClear?: () => void
  /** Por defecto «Filtros activos». */
  label?: React.ReactNode
  /** Cantidad de resultados con los filtros aplicados: «128 resultados». */
  resultCount?: number
}

export interface BulkBarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Cantidad seleccionada; con 0 la barra no se muestra. */
  count: number
  /** Acciones sobre la selección (botones). */
  actions?: React.ReactNode
  onClear?: () => void
  /** Nombre del botón que quita la selección. Por defecto «Quitar selección». */
  clearLabel?: string
  /** Total de filas, para «3 de 120 seleccionados». */
  total?: number
  /** Texto de la cantidad; por defecto «N seleccionado(s)». */
  formatCount?: (count: number, total?: number) => string
}

export interface EntityCardStat {
  id?: string | number
  label: React.ReactNode
  value: React.ReactNode
}

export interface EntityCardProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title' | 'onClick'> {
  title: React.ReactNode
  subtitle?: React.ReactNode
  /** Nombre para las iniciales del avatar (si no hay `mark`). */
  name?: string
  /** Marca propia (logo, ícono); reemplaza al avatar. */
  mark?: React.ReactNode
  src?: string | null
  stats?: ReadonlyArray<EntityCardStat>
  /** Badges o Severity. */
  chips?: React.ReactNode
  footer?: React.ReactNode
  /** Entidad inactiva: se atenúa y se anuncia «Inactiva». */
  inactive?: boolean
  href?: string
  onClick?: () => void
  /** Nivel del título (h2–h6). Por defecto 3. */
  headingLevel?: 2 | 3 | 4 | 5 | 6
}

export interface RankListItem {
  id?: string | number
  label: React.ReactNode
  meta?: React.ReactNode
  value: number
  /** Texto de la cifra (por defecto el número en es-CL). */
  display?: React.ReactNode
  tone?: IndicatorTone
}

export interface RankListProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** De 3 a 6 filas, ya ordenadas. */
  items: ReadonlyArray<RankListItem>
  /** Unidad de las cifras: «llamadas». */
  unit?: string
  /** Valor que define la barra completa; por defecto el máximo de la lista. */
  max?: number
  /** Nombre accesible del ranking. */
  label?: string
  loading?: boolean
  emptyText?: React.ReactNode
}

export interface QuickTile {
  id?: string | number
  label: React.ReactNode
  icon?: IndicatorIcon
  description?: React.ReactNode
  tone?: IndicatorTone
  href?: string
  onClick?: () => void
  disabled?: boolean
  /** Por qué está deshabilitado (texto visible). */
  disabledReason?: React.ReactNode
}

export interface QuickTilesProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  items: ReadonlyArray<QuickTile>
  title?: React.ReactNode
  /** Nivel del título (h2–h6). Por defecto 3. */
  headingLevel?: 2 | 3 | 4 | 5 | 6
}

export type ProcessStepStatus = 'done' | 'current' | 'failed' | 'todo'

export interface ProcessStep {
  key: string
  label: React.ReactNode
  description?: React.ReactNode
  /** Estado explícito; si falta se deduce de `current`. */
  status?: ProcessStepStatus
}

export interface ProcessStepsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  steps: ReadonlyArray<ProcessStep>
  /** Índice del paso en curso. */
  current?: number
  /** El paso en curso falló. */
  failed?: boolean
  /** Nombre accesible del proceso: «Procesamiento de la llamada». */
  label: string
  /** Horizontal pasa a vertical en contenedores angostos. Por defecto `horizontal`. */
  orientation?: 'horizontal' | 'vertical'
}

/** Estado de una app conectada (contrato `AppManifestEntry.estado`). */
export type AppStatus = 'activo' | 'montaje' | 'caido'

export interface AppStatusCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  name: React.ReactNode
  description?: React.ReactNode
  icon?: IndicatorIcon
  status: AppStatus
  /** Detalle del estado: «Desde 16:42», «Responde en 320 ms». */
  detail?: React.ReactNode
  action?: React.ReactNode
}

/** Relleno de las superficies de color (Spotlight, WelcomeBand): profundo, con texto blanco AA. */
export type ColorSurfaceTone = 'primary' | 'indigo' | 'dark' | 'danger' | 'success' | 'info' | 'teal'

export interface WelcomeBandStat {
  id?: string | number
  label: React.ReactNode
  value: React.ReactNode
}

export interface WelcomeBandProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  /** Por defecto «Qué atender primero». */
  eyebrow?: React.ReactNode
  /** Nombra la tarea con su cifra: «Cobranza tiene 18 llamadas en espera». No saluda. */
  title: React.ReactNode
  lede?: React.ReactNode
  /** Una acción primaria y, si hace falta, una secundaria. */
  actions?: React.ReactNode
  stats?: ReadonlyArray<WelcomeBandStat>
  tone?: ColorSurfaceTone
  /** Nivel del título (h1–h3). Por defecto 2. */
  headingLevel?: 1 | 2 | 3
}

export interface SpotlightProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  label: React.ReactNode
  value: React.ReactNode
  /** Sufijo pequeño: «%», «/100». */
  unit?: React.ReactNode
  delta?: IndicatorDelta
  /** Contexto de la cifra: «Meta 80 %». */
  context?: React.ReactNode
  /** Sparkline u otro gráfico compacto (usa `onColor` en el gráfico). */
  children?: React.ReactNode
  tone?: ColorSurfaceTone
  loading?: boolean
  emptyText?: React.ReactNode
}

/** Columnas de una celda de DashGrid. Filas permitidas: 12 · 8+4 · 7+5 · 6+6 · 4+4+4 · 3+3+3+3. */
export type DashGridSpan = 3 | 4 | 5 | 6 | 7 | 8 | 12

export interface DashGridProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

export interface DashGridRowProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Columnas de cada celda, en orden. Debe ser una fila permitida (si no, se avisa por consola). */
  layout: ReadonlyArray<DashGridSpan>
  children?: React.ReactNode
}

export type { SemanticVariant, StatusVariant }

// ── 2.5 · Lote N1: controles y estructura ─────────────────────────────────────

export type TooltipPlacement = 'top' | 'bottom' | 'start' | 'end'

export interface TooltipProps {
  /** Texto breve que complementa al disparador. Nunca es la única fuente de la información. */
  content: React.ReactNode
  /** Un único elemento enfocable (botón, enlace, input). Recibe `aria-describedby` mientras el tooltip está visible. */
  children: React.ReactElement
  placement?: TooltipPlacement
  /** Espera del primer tooltip en ms (se acota a 400–700). Los vecinos aparecen al instante. */
  delay?: number
  /** Controlado: visible o no. */
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  disabled?: boolean
  className?: string
  id?: string
}

export type SegmentedValue = string | number

export interface SegmentedOption<V extends SegmentedValue = string> {
  value: V
  label: React.ReactNode
  icon?: IconSlot
  disabled?: boolean
}

export interface SegmentedProps<V extends SegmentedValue = string>
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  /** 2 a 5 opciones cortas y excluyentes. Con más, usa Select o RadioGroup. */
  options: ReadonlyArray<V | SegmentedOption<V>>
  value?: V
  defaultValue?: V
  onChange?: (value: V) => void
  /** `name` de los radios nativos (participa en formularios). Por defecto se genera uno. */
  name?: string
  size?: 'sm' | 'md'
  /** Ocupa todo el ancho del contenedor con opciones de igual ancho. */
  fullWidth?: boolean
  disabled?: boolean
}

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label: React.ReactNode
  /** Consecuencia del cambio, bajo la etiqueta («Se notifica al supervisor»). */
  description?: React.ReactNode
  size?: 'sm' | 'md'
}

export interface FieldsetProps extends React.FieldsetHTMLAttributes<HTMLFieldSetElement> {
  legend: React.ReactNode
  /** Ayuda bajo la leyenda; se asocia con `aria-describedby`. */
  description?: React.ReactNode
  /** Error del grupo: texto que se anuncia y se asocia con `aria-describedby`. */
  error?: React.ReactNode
  /** Campos en 1 columna, o 2 desde 32rem de ancho del contenedor. */
  columns?: 1 | 2
  /** Oculta la leyenda a la vista (sigue siendo el nombre del grupo). */
  hideLegend?: boolean
}

export interface RadioGroupOption {
  value: string
  label: React.ReactNode
  description?: React.ReactNode
  disabled?: boolean
}

export interface RadioGroupProps
  extends Omit<React.FieldsetHTMLAttributes<HTMLFieldSetElement>, 'onChange' | 'defaultValue'> {
  legend: React.ReactNode
  options: ReadonlyArray<RadioGroupOption>
  name?: string
  value?: string
  defaultValue?: string
  onChange?: (value: string, event: React.ChangeEvent<HTMLInputElement>) => void
  /** `horizontal` vuelve a vertical cuando el contenedor mide menos de 28rem. */
  orientation?: 'vertical' | 'horizontal'
  helpText?: React.ReactNode
  error?: React.ReactNode
  required?: boolean
}

export interface ChoiceCardProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'title'> {
  title: React.ReactNode
  description?: React.ReactNode
  icon?: IconSlot
  /** `radio` para elegir una opción del grupo (mismo `name`); `checkbox` para varias. */
  type?: 'radio' | 'checkbox'
  error?: boolean
}

export interface AccordionItem {
  value: string
  title: React.ReactNode
  content: React.ReactNode
  disabled?: boolean
}

export interface AccordionProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  items: ReadonlyArray<AccordionItem>
  /** Permite varias secciones abiertas a la vez. */
  multiple?: boolean
  value?: ReadonlyArray<string>
  defaultValue?: ReadonlyArray<string>
  onChange?: (value: string[]) => void
  /** Nivel del encabezado que envuelve cada botón (patrón APG). */
  headingLevel?: 2 | 3 | 4 | 5 | 6
  /** Sin borde exterior ni radio: para usar dentro de una card. */
  flush?: boolean
}

export type DrawerSize = 'sm' | 'md' | 'lg'

export interface DrawerProps extends Omit<React.HTMLAttributes<HTMLDialogElement>, 'title' | 'children'> {
  open?: boolean
  onClose?: () => void
  title: React.ReactNode
  description?: React.ReactNode
  children?: React.ReactNode
  /** Acciones fijas al pie (la primaria a la derecha). */
  footer?: React.ReactNode
  size?: DrawerSize
  side?: 'end' | 'start'
  closeOnEscape?: boolean
  closeOnBackdrop?: boolean
}

export interface DividerProps extends React.HTMLAttributes<HTMLElement> {
  /** Texto en medio de la línea («o continúa con»). Solo horizontal. */
  label?: React.ReactNode
  orientation?: 'horizontal' | 'vertical'
  align?: 'start' | 'center'
}

export interface KbdProps extends React.HTMLAttributes<HTMLElement> {
  /** Combinación de teclas: `['Ctrl', 'K']` se lee «Ctrl + K». */
  keys?: ReadonlyArray<string>
}

export interface SpinnerProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: 'sm' | 'md' | 'lg'
  /** Texto para lectores de pantalla. `null` lo vuelve decorativo (cuando otro elemento anuncia la carga). */
  label?: string | null
  tone?: 'primary' | 'muted' | 'current'
}

export interface SkeletonProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'text' | 'circle' | 'block'
  width?: number | string
  height?: number | string
  /** Líneas de texto (solo `text`); la última queda más corta. */
  lines?: number
}

export type TagTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info'

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: TagTone
  icon?: IconSlot
  size?: 'sm' | 'md'
  /** Muestra el botón para quitar el tag. */
  onRemove?: (event: React.MouseEvent<HTMLButtonElement>) => void
  /** Nombre accesible del botón de quitar. Por defecto «Quitar {texto}». */
  removeLabel?: string
  disabled?: boolean
}

// ── 2.6 · Lote P1: shell y layout ──────────────────────────────────────────────

export type ThemeToggleMode = 'light' | 'dark' | 'navy' | 'system'
export type ThemeToggleResolved = 'light' | 'dark' | 'navy'

export interface ThemeToggleProps {
  /** Modo elegido; por defecto el del `ThemeProvider`. */
  mode?: ThemeToggleMode
  /** Tema aplicado (en `system`, el que decidió el sistema); por defecto el del `ThemeProvider`. */
  resolved?: ThemeToggleResolved
  /** Cambio de modo; por defecto `setMode` del `ThemeProvider`. */
  onModeChange?: (mode: ThemeToggleMode) => void
  /**
   * Botón de dos estados (sol / luna) que usa `ShellHeader`: con `dark` y `onToggleDark` no se
   * muestra el menú de cuatro modos.
   */
  dark?: boolean
  onToggleDark?: () => void
  align?: 'start' | 'end'
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Abre el menú al pasar el puntero (por defecto: escritorio con puntero fino). */
  desktopHover?: boolean
  className?: string
}

export interface CommandPaletteItem {
  /** Identidad estable: se guarda en «Recientes». */
  id: string
  label: string
  /** Grupo visible («Navegación», «Acciones»…). */
  group?: string
  /** Texto secundario bajo el nombre. */
  description?: string
  /** Sinónimos que también encuentran el comando. */
  keywords?: ReadonlyArray<string>
  /** Ícono Feather. */
  icon?: string
  /** Atajo propio del comando (se muestra con `Kbd`). */
  shortcut?: ReadonlyArray<string>
  /** Destino (http/https o ruta relativa): si no hay `onSelect`, se navega con `location.assign`. */
  href?: string
  disabled?: boolean
  onSelect?: () => void
}

export interface CommandPaletteProps {
  items: ReadonlyArray<CommandPaletteItem>
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Se llama con el comando elegido (además de su `onSelect`). */
  onSelect?: (item: CommandPaletteItem) => void
  /** Ctrl/Cmd + K abre y cierra la paleta. Por defecto true. */
  hotkey?: boolean
  /** Nombre accesible del diálogo. */
  label?: string
  placeholder?: string
  /** Mensaje cuando no hay resultados; recibe la búsqueda. */
  emptyMessage?: (query: string) => React.ReactNode
  /** Clave de localStorage para «Recientes»; `null` los desactiva. */
  recentsKey?: string | null
  /** Máximo de recientes guardados. Por defecto 5. */
  maxRecents?: number
  /** Máximo de resultados mostrados al buscar. Por defecto 50. */
  maxResults?: number
  className?: string
}

// ── 2.7 dominios: calidad, operación y CRM ─────────────────────────────────────

/** Resultado de un criterio de la pauta de calidad. */
export type CriterionResult = 'cumple' | 'no_cumple' | 'no_aplica'

export interface QualityCriterion {
  id: string
  name: React.ReactNode
  result: CriterionResult
  /** Por qué la evaluación concluyó eso (persona evaluadora o IA). */
  justification?: React.ReactNode
  /** Cita literal de la conversación que respalda el resultado. */
  quote?: string
  /** Índice del turno de la transcripción que contiene la cita. */
  turn?: number
  /** Puntos obtenidos (no aplica a errores graves). */
  points?: number
  /** Puntos posibles del criterio. */
  maxPoints?: number
  /** Confianza de la evidencia 0–100; bajo 40 se marca como débil. */
  evidence?: number
  /** Criterio de error grave: «No cumple» se lee «Error grave». */
  grave?: boolean
}

export interface CriterionRowProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  criterion: QualityCriterion
  /** Muestra «Ver en la transcripción» junto a la cita y avisa el turno citado. */
  onShowTurn?: (turn: number) => void
}

export type TranscriptSpeaker = 'agent' | 'client'

export interface TranscriptTurn {
  speaker: TranscriptSpeaker
  text: string
  /** Segundo de la grabación en que empieza el turno (se muestra m:ss). */
  at?: number
}

export interface TranscriptProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  turns: ReadonlyArray<TranscriptTurn>
  /** Turno resaltado (citado por un criterio): se marca y se desplaza a la vista dentro del recuadro. */
  flagged?: number | null
  /** Términos a resaltar con `<mark>` (sin distinguir mayúsculas). */
  highlight?: ReadonlyArray<string>
  /** Nombres visibles de cada lado. Por defecto «Agente» y «Cliente». */
  agentLabel?: string
  clientLabel?: string
  /** Al elegir la marca de tiempo de un turno (p. ej. para saltar el audio). */
  onSeek?: (seconds: number) => void
  /** Alto máximo antes de desplazarse (valor CSS). Por defecto 35rem. */
  maxHeight?: string
  /** Nombre accesible. Por defecto «Transcripción». */
  label?: string
  loading?: boolean
}

export interface AudioMark {
  /** Segundo de la grabación. */
  at: number
  label: string
}

export interface AudioPlayerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** URL del audio. Sin `src` el reproductor simula el avance (demos y vistas previas). */
  src?: string
  /** Duración conocida en segundos (se reemplaza por la del audio al cargar). */
  duration: number
  /** Momentos marcados (errores): botones para saltar a cada uno. */
  marks?: ReadonlyArray<AudioMark>
  onMarkClick?: (mark: AudioMark) => void
  /** Avisa la posición actual (segundos) para sincronizar la transcripción. */
  onTimeChange?: (seconds: number) => void
  /** Forma de onda decorativa sobre la barra. `false` deja la barra sola (alternativa sin onda). */
  waveform?: boolean
  /** Segundos que saltan los botones de retroceder y adelantar. Por defecto 10. */
  skipSeconds?: number
  /** Velocidades disponibles. Por defecto 1×, 1,25×, 1,5× y 2×. */
  rates?: ReadonlyArray<number>
  /** Nombre accesible del reproductor. Por defecto «Grabación de la llamada». */
  label?: string
}

export type CallId = string | number

export interface CallSummary {
  id: CallId
  agent: string
  /** Campaña, cola o canal. */
  source?: string
  /** Foco de la evaluación: «Venta», «Retención». */
  focus?: string
  /** Fecha ya formateada (dd-mm-aaaa HH:mm). */
  date?: string
  score: number | null
  /** Tiene un error grave: el puntaje se anula. */
  critical?: boolean
  /** Días esperando revisión. */
  waitDays?: number
  summary?: React.ReactNode
}

export interface CallRowProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect' | 'children'> {
  call: CallSummary
  active?: boolean
  onSelect?: (id: CallId) => void
  /** Puntaje bajo el cual la llamada se marca como advertencia. Por defecto 50. */
  threshold?: number
}

export interface CallListProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect' | 'children'> {
  calls: ReadonlyArray<CallSummary>
  activeId?: CallId | null
  onSelect?: (id: CallId) => void
  /** Nombre accesible del listbox. Por defecto «Llamadas». */
  label?: string
  threshold?: number
  loading?: boolean
  /** Contenido cuando no hay llamadas (qué pasó y qué probar). */
  empty?: React.ReactNode
}

export interface TargetBarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  label: React.ReactNode
  /** Valor actual (mismas unidades que `target`). */
  value: number
  target: number
  /** Máximo de la escala. Por defecto 100. */
  max?: number
  /** Más es peor (abandono, TMO, tiempo en cola). */
  higherIsWorse?: boolean
  /** Margen de advertencia como fracción de la meta. Por defecto 0,1 (10 %). */
  warningMargin?: number
  /** Formato del valor y la meta. Por defecto «82 %». */
  format?: (value: number) => string
  /** Dato adicional al pie: «80/20», «+3 pts vs. ayer». */
  hint?: React.ReactNode
}

export interface QueueCardProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  name: string
  /** Contactos en espera. */
  waiting: number
  /** Espera más larga, en segundos. */
  longestWait: number
  agentsAvailable: number
  /** Nivel de servicio del día (%). */
  serviceLevel: number
  /** Meta de nivel de servicio (%). Por defecto 80. */
  target?: number
  /** Umbral de respuesta en segundos (el «20» de 80/20). Por defecto 20. */
  thresholdSeconds?: number
  /** Veces el umbral desde la que la espera máxima es crítica. Por defecto 6. */
  criticalWaitFactor?: number
  /** Canal o etiqueta junto al nombre. */
  channel?: React.ReactNode
  headingLevel?: 2 | 3 | 4 | 5 | 6
}

export type AgentPresence = 'disponible' | 'en_llamada' | 'post_llamada' | 'en_pausa' | 'desconectado'

export interface AgentPresenceState {
  id: string
  name: string
  presence: AgentPresence
  /** Segundos en el estado actual. */
  since: number
  /** Detalle del estado: «Pausa: capacitación». Si falta se usa `queue`. */
  detail?: React.ReactNode
  queue?: string
  src?: string | null
}

export interface AgentStatusBoardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect' | 'children'> {
  agents: ReadonlyArray<AgentPresenceState>
  onSelect?: (agent: AgentPresenceState) => void
  /** Segundos desde los que una pausa se marca larga. Por defecto 900. */
  longPauseAfter?: number
  /** Segundos desde los que una llamada se marca larga. Por defecto 600. */
  longCallAfter?: number
  /** Nombre accesible. Por defecto «Agentes por estado». */
  label?: string
  loading?: boolean
  empty?: React.ReactNode
}

export interface HeatmapProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Encabezados de fila (p. ej. días) y de columna (p. ej. horas). */
  rows: ReadonlyArray<string>
  cols: ReadonlyArray<string>
  /** `values[fila][columna]`; un valor ausente se muestra «—». */
  values: ReadonlyArray<ReadonlyArray<number | null | undefined>>
  /** Título de la tabla (caption). */
  label: string
  /** Formato de cada valor. Por defecto número es-CL. */
  format?: (value: number) => string
  /** Muestra la leyenda de la escala. Por defecto `true`. */
  legend?: boolean
  /** Oculta el caption visualmente (sigue para lectores de pantalla). */
  hideLabel?: boolean
}

export interface ContactFact {
  label: string
  value: React.ReactNode
}

export interface ContactCardProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title' | 'children' | 'role'> {
  name: string
  company?: string
  /** Cargo del contacto («Jefa de compras»); no es el rol ARIA (la ficha es una `section`). */
  role?: string
  email?: string
  phone?: string
  src?: string | null
  tags?: ReadonlyArray<string>
  /** Estado del lead o cliente (Badge, Severity…). */
  status?: React.ReactNode
  /** Cifras del cliente: valor, casos abiertos, última compra. */
  facts?: ReadonlyArray<ContactFact>
  /** Acciones (una primaria como máximo). */
  actions?: React.ReactNode
  headingLevel?: 2 | 3 | 4 | 5 | 6
  loading?: boolean
}

export interface PipelineDeal {
  id: string
  title: string
  account: string
  /** Monto (CLP por defecto; ver `currency`). */
  value: number
  owner: string
  stage: string
  /** Días sin actividad. */
  idleDays?: number
}

export interface PipelineStage {
  key: string
  label: string
}

export interface PipelineBoardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  stages: ReadonlyArray<PipelineStage>
  deals: ReadonlyArray<PipelineDeal>
  /** Al soltar o mover con teclado una oportunidad a otra etapa. Sin él, el tablero es de solo lectura. */
  onMove?: (dealId: string, toStage: string) => void
  onOpen?: (deal: PipelineDeal) => void
  /** Formato de montos. Por defecto CLP sin decimales. */
  currency?: (value: number) => string
  /** Nombre accesible. Por defecto «Pipeline de oportunidades». */
  label?: string
  /** Días sin actividad desde los que se marca una oportunidad. Por defecto 7. */
  idleAfterDays?: number
}

export interface FunnelStep {
  label: string
  value: number
}

export interface FunnelProps extends Omit<React.HTMLAttributes<HTMLOListElement>, 'children'> {
  steps: ReadonlyArray<FunnelStep>
  format?: (value: number) => string
  /** Nombre accesible. Por defecto «Embudo de conversión». */
  label?: string
}
