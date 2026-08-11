import type * as React from 'react'
import { Avatar as AvatarRuntime } from '../components/ui/Avatar'
import { Badge as BadgeRuntime } from '../components/ui/Badge'
import {
  Button as ButtonRuntime,
  IconButton as IconButtonRuntime,
  LinkButton as LinkButtonRuntime,
} from '../components/ui/Button'
import { Icon as IconRuntime } from '../components/ui/Icon'
import { Alert as AlertRuntime } from '../components/ui/Alert'
import { Modal as ModalRuntime } from '../components/ui/Modal'
import { Card as CardRuntime } from '../components/ui/Card'
import { StatsCard as StatsCardRuntime } from '../components/ui/StatsCard'
import { MiniStatCard as MiniStatCardRuntime } from '../components/ui/MiniStatCard'
import { ColoredStatCard as ColoredStatCardRuntime } from '../components/ui/ColoredStatCard'
import { ChartMetricsFooter as ChartMetricsFooterRuntime } from '../components/ui/ChartMetricsFooter'
import { QuickLinkGrid as QuickLinkGridRuntime } from '../components/ui/QuickLinkGrid'
import { Timeline as TimelineRuntime } from '../components/ui/Timeline'
import { ProgressRing as ProgressRingRuntime } from '../components/ui/ProgressRing'
import { Progress as ProgressRuntime } from '../components/ui/Progress'
import { Tabs as TabsRuntime } from '../components/ui/Tabs'
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
import { AvatarGroup as AvatarGroupRuntime } from '../components/ui/AvatarGroup'
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

export const Button: React.FC<ButtonProps> = ButtonRuntime as unknown as React.FC<ButtonProps>
export const LinkButton: React.FC<LinkButtonProps> = LinkButtonRuntime as unknown as React.FC<LinkButtonProps>
export const IconButton: React.FC<IconButtonProps> = IconButtonRuntime as unknown as React.FC<IconButtonProps>
export const Icon: React.FC<IconProps> = IconRuntime as unknown as React.FC<IconProps>
export const Badge: React.FC<BadgeProps> = BadgeRuntime as unknown as React.FC<BadgeProps>
export const Card: React.FC<CardProps> = CardRuntime as unknown as React.FC<CardProps>
export const Avatar: React.FC<AvatarProps> = AvatarRuntime as unknown as React.FC<AvatarProps>
export const Alert: React.FC<AlertProps> = AlertRuntime as unknown as React.FC<AlertProps>
export const Modal: React.FC<ModalProps> = ModalRuntime as unknown as React.FC<ModalProps>
export const EmptyState: React.FC<EmptyStateProps> = EmptyStateRuntime as unknown as React.FC<EmptyStateProps>
export const ErrorState: React.FC<ErrorStateProps> = ErrorStateRuntime as unknown as React.FC<ErrorStateProps>
export const LoadingState: React.FC<LoadingStateProps> = LoadingStateRuntime as unknown as React.FC<LoadingStateProps>
export const Progress: React.FC<ProgressProps> = ProgressRuntime as unknown as React.FC<ProgressProps>
export const ProgressRing: React.FC<ProgressRingProps> = ProgressRingRuntime as unknown as React.FC<ProgressRingProps>
export const Checkbox: React.FC<CheckboxProps> = CheckboxRuntime as unknown as React.FC<CheckboxProps>
export const Radio: React.FC<RadioProps> = RadioRuntime as unknown as React.FC<RadioProps>
export const FileInput: React.FC<FileInputProps> = FileInputRuntime as unknown as React.FC<FileInputProps>
export const InputGroup: React.FC<InputGroupProps> = InputGroupRuntime as unknown as React.FC<InputGroupProps>
export const SearchableSelect = SearchableSelectRuntime as unknown as <TOption = import('./types').SelectOptionInput>(props: SearchableSelectProps<TOption>) => React.ReactElement | null
export const MultiSelect = MultiSelectRuntime as unknown as <TOption = import('./types').SelectOptionInput>(props: MultiSelectProps<TOption>) => React.ReactElement | null
export const FormField: React.FC<FormFieldProps> = FormFieldRuntime as unknown as React.FC<FormFieldProps>
export const Input: React.FC<InputProps> = InputRuntime as unknown as React.FC<InputProps>
export const Select: React.FC<SelectProps> = SelectRuntime as unknown as React.FC<SelectProps>
export const Textarea: React.FC<TextareaProps> = TextareaRuntime as unknown as React.FC<TextareaProps>
export const Pagination: React.FC<PaginationProps> = PaginationRuntime as unknown as React.FC<PaginationProps>
export const MessageBubble: React.FC<MessageBubbleProps> = MessageBubbleRuntime as unknown as React.FC<MessageBubbleProps>
export const ChatSidebar = ChatSidebarRuntime as unknown as <TContact extends import('./types').ChatContact = import('./types').ChatContact>(props: ChatSidebarProps<TContact>) => React.ReactElement
export const ChatBubble: React.FC<ChatBubbleProps> = ChatBubbleRuntime as unknown as React.FC<ChatBubbleProps>
export const ChatTypingIndicator: React.FC<ChatTypingIndicatorProps> = ChatTypingIndicatorRuntime as unknown as React.FC<ChatTypingIndicatorProps>
export const ChatInputBar: React.FC<ChatInputBarProps> = ChatInputBarRuntime as unknown as React.FC<ChatInputBarProps>
export const ChatWindow = ChatWindowRuntime as unknown as <TContact extends import('./types').ChatWindowContact = import('./types').ChatWindowContact>(props: ChatWindowProps<TContact>) => React.ReactElement
export const StatsCard: React.FC<StatsCardProps> = StatsCardRuntime as unknown as React.FC<StatsCardProps>
export const MiniStatCard: React.FC<MiniStatCardProps> = MiniStatCardRuntime as unknown as React.FC<MiniStatCardProps>
export const ColoredStatCard: React.FC<ColoredStatCardProps> = ColoredStatCardRuntime as unknown as React.FC<ColoredStatCardProps>
export const ChartMetricsFooter: React.FC<ChartMetricsFooterProps> = ChartMetricsFooterRuntime as unknown as React.FC<ChartMetricsFooterProps>
export const QuickLinkGrid: React.FC<QuickLinkGridProps> = QuickLinkGridRuntime as unknown as React.FC<QuickLinkGridProps>
export const Timeline: React.FC<TimelineProps> = TimelineRuntime as unknown as React.FC<TimelineProps>
export const Tabs = TabsRuntime as unknown as <K extends string | number = string | number>(props: TabsProps<K>) => React.ReactElement
export const DataTable = DataTableRuntime as unknown as <T extends object = Record<string, unknown>>(props: DataTableProps<T>) => React.ReactElement
export const Table = TableRuntime as unknown as <T = unknown>(props: TableProps<T>) => React.ReactElement
export const ResponsiveTable = ResponsiveTableRuntime as unknown as <T = unknown>(props: ResponsiveTableProps<T>) => React.ReactElement
export const DataTableToolbar: React.FC<DataTableToolbarProps> = DataTableToolbarRuntime as unknown as React.FC<DataTableToolbarProps>
export const AppLayout: React.FC<AppLayoutProps> = AppLayoutRuntime as unknown as React.FC<AppLayoutProps>
export const AuthLayout: React.FC<AuthLayoutProps> = AuthLayoutRuntime as unknown as React.FC<AuthLayoutProps>
export const Header: React.FC<HeaderProps> = HeaderRuntime as unknown as React.FC<HeaderProps>
export const Sidebar: React.FC<SidebarProps> = SidebarRuntime as unknown as React.FC<SidebarProps>
export const PageHeader: React.FC<PageHeaderProps> = PageHeaderRuntime as unknown as React.FC<PageHeaderProps>
export const Footer: React.FC<FooterProps> = FooterRuntime as unknown as React.FC<FooterProps>
export const AvatarGroup: React.FC<AvatarGroupProps> = AvatarGroupRuntime as unknown as React.FC<AvatarGroupProps>
export const CardLoader: React.FC<CardLoaderProps> = CardLoaderRuntime as unknown as React.FC<CardLoaderProps>

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
