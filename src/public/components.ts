import type * as React from 'react'
export { Avatar } from '../components/ui/Avatar'
export { Badge } from '../components/ui/Badge'
// Componentes ya en TSX: se exportan tal cual (tipos y ref reales).
export { Button, IconButton, LinkButton } from '../components/ui/Button'
export { Icon } from '../components/ui/Icon'
import { Alert as AlertRuntime } from '../components/ui/Alert'
import { Modal as ModalRuntime } from '../components/ui/Modal'
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
import { EmptyState as EmptyStateRuntime } from '../components/feedback/EmptyState'
import { ErrorState as ErrorStateRuntime } from '../components/feedback/ErrorState'
import { LoadingState as LoadingStateRuntime } from '../components/feedback/LoadingState'
import { FormField as FormFieldRuntime } from '../components/form/FormField'
import { Input as InputRuntime } from '../components/form/Input'
import { Select as SelectRuntime } from '../components/form/Select'
import { Textarea as TextareaRuntime } from '../components/form/Textarea'
import { Checkbox as CheckboxRuntime } from '../components/form/Checkbox'
import { Radio as RadioRuntime } from '../components/form/Radio'
import { FileInput as FileInputRuntime } from '../components/form/FileInput'
import { InputGroup as InputGroupRuntime } from '../components/form/InputGroup'
import { SearchableSelect as SearchableSelectRuntime } from '../components/form/SearchableSelect'
import { MultiSelect as MultiSelectRuntime } from '../components/form/MultiSelect'
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
import { CardLoader as CardLoaderRuntime } from '../components/ui/CardLoader'
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
  IconSlot,
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

function asComponent<P>(runtime: React.ComponentType<any>): React.FC<P> {
  // SAFETY: runtime JSX component implements the public React component contract P
  return runtime as React.FC<P>
}

function asGenericComponent<F>(runtime: React.ComponentType<any>): F {
  // SAFETY: runtime JSX component implements the public generic component contract F
  return runtime as F
}

export const Alert = asComponent<AlertProps>(AlertRuntime)
export const Modal = asComponent<ModalProps>(ModalRuntime)
export const EmptyState = asComponent<EmptyStateProps>(EmptyStateRuntime)
export const ErrorState = asComponent<ErrorStateProps>(ErrorStateRuntime)
export const LoadingState = asComponent<LoadingStateProps>(LoadingStateRuntime)
export const Checkbox = asComponent<CheckboxProps>(CheckboxRuntime)
export const Radio = asComponent<RadioProps>(RadioRuntime)
export const FileInput = asComponent<FileInputProps>(FileInputRuntime)
export const InputGroup = asComponent<InputGroupProps>(InputGroupRuntime)
export const SearchableSelect = asGenericComponent<<TOption = import('./types').SelectOptionInput>(props: SearchableSelectProps<TOption>) => React.ReactElement | null>(SearchableSelectRuntime)
export const MultiSelect = asGenericComponent<<TOption = import('./types').SelectOptionInput>(props: MultiSelectProps<TOption>) => React.ReactElement | null>(MultiSelectRuntime)
export const FormField = asComponent<FormFieldProps>(FormFieldRuntime)
export const Input = asComponent<InputProps>(InputRuntime)
export const Select = asComponent<SelectProps>(SelectRuntime)
export const Textarea = asComponent<TextareaProps>(TextareaRuntime)
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
export const CardLoader = asComponent<CardLoaderProps>(CardLoaderRuntime)

export type {
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
