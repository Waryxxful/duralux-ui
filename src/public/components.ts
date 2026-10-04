import type * as React from 'react'
export { Avatar } from '../components/ui/Avatar'
export { Badge } from '../components/ui/Badge'
// Componentes ya en TSX: se exportan tal cual (tipos y ref reales).
export { Button, IconButton, LinkButton } from '../components/ui/Button'
export { Checkbox } from '../components/form/Checkbox'
export { FileInput } from '../components/form/FileInput'
export { FormField } from '../components/form/FormField'
export { InputGroup } from '../components/form/InputGroup'
export { MultiSelect } from '../components/form/MultiSelect'
export { Radio } from '../components/form/Radio'
export { SearchableSelect } from '../components/form/SearchableSelect'
export { Input } from '../components/form/Input'
export { Select } from '../components/form/Select'
export { Textarea } from '../components/form/Textarea'
export { Alert } from '../components/ui/Alert'
export { Modal } from '../components/ui/Modal'
export { CardLoader } from '../components/ui/CardLoader'
export { LoadingState } from '../components/feedback/LoadingState'
export { ErrorState } from '../components/feedback/ErrorState'
export { EmptyState } from '../components/feedback/EmptyState'
export { Icon } from '../components/ui/Icon'
export { Card } from '../components/ui/Card'
import { StatsCard as StatsCardRuntime } from '../components/ui/StatsCard'
import { MiniStatCard as MiniStatCardRuntime } from '../components/ui/MiniStatCard'
import { ColoredStatCard as ColoredStatCardRuntime } from '../components/ui/ColoredStatCard'
import { ChartMetricsFooter as ChartMetricsFooterRuntime } from '../components/ui/ChartMetricsFooter'
import { QuickLinkGrid as QuickLinkGridRuntime } from '../components/ui/QuickLinkGrid'
export { Timeline } from '../components/ui/Timeline'
export { ProgressRing } from '../components/ui/ProgressRing'
export { Progress } from '../components/ui/Progress'
export { Tabs } from '../components/ui/Tabs'
import { DataTable as DataTableRuntime } from '../components/data/DataTable'
import { Table as TableRuntime } from '../components/data/Table'
import { Pagination as PaginationRuntime } from '../components/data/Pagination'
import { ResponsiveTable as ResponsiveTableRuntime } from '../components/data/ResponsiveTable'
import { DataTableToolbar as DataTableToolbarRuntime } from '../components/data/DataTableToolbar'
import { ChatSidebar as ChatSidebarRuntime } from '../components/chat/ChatSidebar'
import { ChatBubble as ChatBubbleRuntime, ChatTypingIndicator as ChatTypingIndicatorRuntime } from '../components/chat/ChatBubble'
import { ChatInputBar as ChatInputBarRuntime } from '../components/chat/ChatInputBar'
import { ChatWindow as ChatWindowRuntime } from '../components/chat/ChatWindow'
import { MessageBubble as MessageBubbleRuntime } from '../components/conversation/MessageBubble'
import { AppLayout as AppLayoutRuntime } from '../components/layout/AppLayout'
import { AuthLayout as AuthLayoutRuntime } from '../components/layout/AuthLayout'
import { Header as HeaderRuntime } from '../components/layout/Header'
import { Sidebar as SidebarRuntime } from '../components/layout/Sidebar'
import { PageHeader as PageHeaderRuntime } from '../components/layout/PageHeader'
import { Footer as FooterRuntime } from '../components/layout/Footer'
export { AvatarGroup } from '../components/ui/AvatarGroup'
import type {
  AlertProps,
  AppLayoutProps,
  AuthLayoutProps,
  AvatarProps,
  BadgeProps,
  Breadcrumb,
  ButtonProps,
  CardProps,
  ChatBubbleProps,
  ChatContact,
  ChatInputBarProps,
  ChatSidebarProps,
  ChatTypingIndicatorProps,
  ChatWindowContact,
  ChatWindowProps,
  ColoredStatCardProps,
  DataTableProps,
  DataTableAction,
  DataTableColumn,
  DataTableIdentityKey,
  DataTableKey,
  DataTableRowKey,
  EmptyStateProps,
  ErrorStateProps,
  HeaderProps,
  IconButtonProps,
  IconProps,
  IconSlot,
  LinkButtonProps,
  LoadingStateProps,
  MessageBubbleProps,
  MiniStatCardProps,
  ModalProps,
  ModalSize,
  PageHeaderBreadcrumb,
  PageHeaderProps,
  PaginationProps,
  ProgressProps,
  ProgressRingProps,
  ResponsiveTableProps,
  DataTableToolbarProps,
  DataTableToolbarContext,
  SidebarProps,
  TableColumn,
  TableProps,
  TableRowEntry,
  TableSlot,
  TableSlotContext,
  TabItem,
  TabKey,
  TabsProps,
  TimelineProps,
  CardLoaderProps,
  AvatarGroupProps,
  AvatarGroupItem,
  FooterProps,
  FooterLink,
  ChartMetricsFooterProps,
  QuickLinkGridProps,
  StatsCardProps,
  ThemeProviderProps,
  ApiFetchOptions,
} from './types'

function asComponent<P>(runtime: React.ComponentType<any>): React.FC<P> {
  // SAFETY: runtime JSX component implements the public React component contract P
  return runtime as React.FC<P>
}

function asGenericComponent<F>(runtime: React.ComponentType<any>): F {
  // SAFETY: runtime JSX component implements the public generic component contract F
  return runtime as F
}

export const Pagination = asComponent<PaginationProps>(PaginationRuntime)
export const MessageBubble = asComponent<MessageBubbleProps>(MessageBubbleRuntime)
export const ChatSidebar = asGenericComponent<<TContact extends import('./types').ChatContact = import('./types').ChatContact>(props: ChatSidebarProps<TContact>) => React.ReactElement>(ChatSidebarRuntime)
export const ChatBubble = asComponent<ChatBubbleProps>(ChatBubbleRuntime)
export const ChatTypingIndicator = asComponent<ChatTypingIndicatorProps>(ChatTypingIndicatorRuntime)
export const ChatInputBar = asComponent<ChatInputBarProps>(ChatInputBarRuntime)
export const ChatWindow = asGenericComponent<<TContact extends import('./types').ChatWindowContact = import('./types').ChatWindowContact>(props: ChatWindowProps<TContact>) => React.ReactElement>(ChatWindowRuntime)
export const StatsCard = asComponent<StatsCardProps>(StatsCardRuntime)
export const MiniStatCard = asComponent<MiniStatCardProps>(MiniStatCardRuntime)
export const ColoredStatCard = asComponent<ColoredStatCardProps>(ColoredStatCardRuntime)
export const ChartMetricsFooter = asComponent<ChartMetricsFooterProps>(ChartMetricsFooterRuntime)
export const QuickLinkGrid = asComponent<QuickLinkGridProps>(QuickLinkGridRuntime)
export const DataTable = asGenericComponent<<T extends object = Record<string, string | number | boolean | null | undefined>>(props: DataTableProps<T>) => React.ReactElement>(DataTableRuntime)
export const Table = asGenericComponent<<T = unknown>(props: TableProps<T>) => React.ReactElement>(TableRuntime)
export const ResponsiveTable = asGenericComponent<<T = unknown>(props: ResponsiveTableProps<T>) => React.ReactElement>(ResponsiveTableRuntime)
export const DataTableToolbar = asComponent<DataTableToolbarProps>(DataTableToolbarRuntime)
export const AppLayout = asComponent<AppLayoutProps>(AppLayoutRuntime)
export const AuthLayout = asComponent<AuthLayoutProps>(AuthLayoutRuntime)
export const Header = asComponent<HeaderProps>(HeaderRuntime)
export const Sidebar = asComponent<SidebarProps>(SidebarRuntime)
export const PageHeader = asComponent<PageHeaderProps>(PageHeaderRuntime)
export const Footer = asComponent<FooterProps>(FooterRuntime)

export type {
  ControlSize,
  AlertProps,
  AppLayoutProps,
  AuthLayoutProps,
  AvatarProps,
  BadgeProps,
  Breadcrumb,
  ButtonProps,
  CardProps,
  ChatBubbleProps,
  ChatContact,
  ChatInputBarProps,
  ChatSidebarProps,
  ChatTypingIndicatorProps,
  ChatWindowContact,
  ChatWindowProps,
  CheckboxProps,
  ColoredStatCardProps,
  DataTableProps,
  DataTableAction,
  DataTableColumn,
  DataTableIdentityKey,
  DataTableKey,
  DataTableRowKey,
  EmptyStateProps,
  ErrorStateProps,
  FileInputProps,
  FormFieldProps,
  HeaderProps,
  IconButtonProps,
  IconProps,
  InputGroupControlProps,
  InputGroupProps,
  InputProps,
  MultiSelectProps,
  SearchableSelectProps,
  SearchableSelectOption,
  SelectOption,
  SelectOptionInput,
  SelectOptionLabelResolver,
  SelectOptionRenderer,
  SelectOptionTextRenderer,
  SelectOptionValueResolver,
  SelectText,
  SelectValue,
  LinkButtonProps,
  LoadingStateProps,
  MessageBubbleProps,
  MiniStatCardProps,
  ModalProps,
  ModalSize,
  PageHeaderBreadcrumb,
  PageHeaderProps,
  PaginationProps,
  ProgressProps,
  ProgressRingProps,
  RadioProps,
  ResponsiveTableProps,
  DataTableToolbarProps,
  DataTableToolbarContext,
  SelectProps,
  SidebarProps,
  TableColumn,
  TableProps,
  TableRowEntry,
  TableSlot,
  TableSlotContext,
  TabItem,
  TabKey,
  TabsProps,
  TextareaProps,
  TimelineProps,
  CardLoaderProps,
  AvatarGroupProps,
  AvatarGroupItem,
  FooterProps,
  FooterLink,
  ChartMetricsFooterProps,
  QuickLinkGridProps,
  StatsCardProps,
  ThemeProviderProps,
  ApiFetchOptions,
} from './types'
