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
  startIcon?: string | null
  endIcon?: string | null
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
  startIcon?: string | null
  endIcon?: string | null
}

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: string
  label: string
  variant?: SemanticTone
  size?: 'sm' | 'md' | 'lg'
  outline?: boolean
}

export interface IconProps extends React.HTMLAttributes<HTMLElement> {
  name: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number
  'aria-label'?: string
}

export interface BadgeProps extends React.HTMLAttributes<HTMLElement> {
  variant?: SemanticTone
  soft?: boolean
  pill?: boolean
  as?: React.ElementType
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
  elementRef?: React.Ref<HTMLDivElement>
  loading?: boolean
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
  icon?: string
  title?: React.ReactNode
  onDismiss?: () => void
  dismissible?: boolean
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

export interface EmptyStateProps {
  icon?: string
  title?: React.ReactNode
  message?: React.ReactNode
  action?: React.ReactNode
  className?: string
}

export interface ErrorStateProps {
  title?: React.ReactNode
  message?: React.ReactNode
  onRetry?: () => void
  className?: string
}

export interface LoadingStateProps {
  message?: React.ReactNode
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
  label?: React.ReactNode
}

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
  [key: string]: unknown
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
}

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  icon?: string
  invalid?: boolean
  error?: boolean | string
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
  render?: (row: T, rowIndex: number) => React.ReactNode
}

export interface TableProps<T = unknown> extends Omit<React.TableHTMLAttributes<HTMLTableElement>, 'children' | 'className' | 'rows'> {
  columns?: ReadonlyArray<TableColumn<T>>
  rows?: ReadonlyArray<T>
  rowKey?: string | ((row: T, index: number) => KeyLike | undefined)
  emptyMessage?: React.ReactNode
  loading?: boolean
  caption?: React.ReactNode
  ariaLabel?: string
  className?: string
  striped?: boolean
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
}

export type DataTableKey<T extends object> = Extract<keyof T, string | number>

export type DataTableRowKey<T extends object> = Extract<keyof T, string>

export type DataTableColumn<
  T extends object = Record<string, unknown>,
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

export interface DataTableAction<T extends object = Record<string, unknown>> {
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

export type DataTableProps<T extends object = Record<string, unknown>> = Omit<
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
  filterResolver?: (row: T, index: number) => unknown
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
  searchResolver?: (row: T, index: number) => unknown
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

export interface StatsCardProps {
  icon?: string
  iconBg?: string
  value: React.ReactNode
  label: React.ReactNode
  trend?: StatsCardTrend
  progress?: StatsCardProgress
  footer?: React.ReactNode
  onFooter?: () => void
}

export interface MiniStatCardProps {
  icon?: string
  value: React.ReactNode
  label: React.ReactNode
  color?: string
}

export interface ColoredStatCardProps {
  icon?: string
  value: React.ReactNode
  label: React.ReactNode
  trend?: string
  trendUp?: boolean
  bg?: string
  chart?: React.ReactNode
}

export interface ChartMetric {
  id?: React.Key
  label: React.ReactNode
  value: React.ReactNode
  color?: string
}

export interface ChartMetricsFooterProps {
  metrics?: ReadonlyArray<ChartMetric>
}

export interface QuickLinkItem {
  id?: React.Key
  icon: string
  label: React.ReactNode
  href?: string
  onClick?: (event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => void
  color?: string
}

export interface QuickLinkGridProps {
  items?: ReadonlyArray<QuickLinkItem>
  columns?: number
}

export interface TimelineItem {
  id?: string | number
  title: React.ReactNode
  description?: React.ReactNode
  time?: React.ReactNode
  icon?: string
  iconBg?: string
  color?: string
  user?: { name?: React.ReactNode; avatar?: string }
}

export interface TimelineProps {
  items?: ReadonlyArray<TimelineItem>
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
}

export interface ChatMessage {
  id?: string | number
  text?: string | number
  time?: string | number
  sender?: { name?: string | number; avatar?: string }
  mine?: boolean
}

export interface ChatBubbleProps {
  message: ChatMessage
}

export interface ChatTypingIndicatorProps {
  name?: string | number
}

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
  labels?: Pick<ChatLabels, 'window' | 'empty' | 'phone' | 'video' | 'menu' | 'messages' | 'online' | 'offline'>
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
