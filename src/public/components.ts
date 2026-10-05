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
export { Table } from '../components/data/Table'
export { ResponsiveTable } from '../components/data/ResponsiveTable'
export { Pagination } from '../components/data/Pagination'
export { DataTableToolbar } from '../components/data/DataTableToolbar'
export { StatsCard } from '../components/ui/StatsCard'
export { MiniStatCard } from '../components/ui/MiniStatCard'
export { ColoredStatCard } from '../components/ui/ColoredStatCard'
export { ChartMetricsFooter } from '../components/ui/ChartMetricsFooter'
export { QuickLinkGrid } from '../components/ui/QuickLinkGrid'
export { ConnectionCard } from '../components/ui/ConnectionCard'
export { Timeline } from '../components/ui/Timeline'
export { ProgressRing } from '../components/ui/ProgressRing'
export { Progress } from '../components/ui/Progress'
export { Tabs } from '../components/ui/Tabs'
export { ChatBubble, ChatTypingIndicator, ChatDaySeparator } from '../components/chat/ChatBubble'
export { ChatInputBar } from '../components/chat/ChatInputBar'
export { ChatSidebar } from '../components/chat/ChatSidebar'
export { ChatWindow } from '../components/chat/ChatWindow'
export { groupChatMessages, formatChatDay } from '../components/chat/chatModel'
export { MessageBubble } from '../components/conversation/MessageBubble'
import { DataTable as DataTableRuntime } from '../components/data/DataTable'
import { AppLayout as AppLayoutRuntime } from '../components/layout/AppLayout'
import { Header as HeaderRuntime } from '../components/layout/Header'
import { Sidebar as SidebarRuntime } from '../components/layout/Sidebar'
import { Footer as FooterRuntime } from '../components/layout/Footer'
export { AvatarGroup } from '../components/ui/AvatarGroup'
// 2.5 · Lote N2: datos y composición (TSX, se exportan tal cual).
export { Severity } from '../components/ui/Severity'
export { severityOf } from '../components/ui/internal/severity'
export { Score, ScoreHero } from '../components/ui/Score'
export { Person } from '../components/ui/Person'
export { DescriptionList } from '../components/data/DescriptionList'
export { KpiCard } from '../components/data/KpiCard'
export { StatGroup } from '../components/data/StatGroup'
export { List } from '../components/data/List'
export { BulkBar } from '../components/data/BulkBar'
export { ActiveFilters } from '../components/data/ActiveFilters'
export { EntityCard } from '../components/composition/EntityCard'
export { RankList } from '../components/composition/RankList'
export { QuickTiles } from '../components/composition/QuickTiles'
export { ProcessSteps } from '../components/composition/ProcessSteps'
export { AppStatusCard } from '../components/composition/AppStatusCard'
export { Spotlight } from '../components/composition/Spotlight'
export { WelcomeBand } from '../components/composition/WelcomeBand'
export { DashGrid } from '../components/composition/DashGrid'
// 2.5 · Lote N1: controles y estructura.
export { Tooltip } from '../components/ui/Tooltip'
export { Segmented } from '../components/ui/Segmented'
export { Accordion } from '../components/ui/Accordion'
export { Drawer } from '../components/ui/Drawer'
export { Divider } from '../components/ui/Divider'
export { Kbd } from '../components/ui/Kbd'
export { Spinner } from '../components/ui/Spinner'
export { Skeleton } from '../components/ui/Skeleton'
export { Tag } from '../components/ui/Tag'
export { Switch } from '../components/form/Switch'
export { Fieldset } from '../components/form/Fieldset'
export { RadioGroup } from '../components/form/RadioGroup'
export { ChoiceCard } from '../components/form/ChoiceCard'
// 2.6 · Lote P1: shell y layout.
export { PageHeader } from '../components/layout/PageHeader'
export { AuthLayout } from '../components/layout/AuthLayout'
export { ThemeToggle } from '../components/shell/ThemeToggle'
export { CommandPalette } from '../components/shell/CommandPalette'
// 2.7 dominios
export { CriterionRow } from '../components/domain/quality/CriterionRow'
export { Transcript } from '../components/domain/quality/Transcript'
export { AudioPlayer } from '../components/domain/quality/AudioPlayer'
export { CallRow } from '../components/domain/quality/CallRow'
export { CallList } from '../components/domain/quality/CallList'
export { TargetBar } from '../components/domain/operations/TargetBar'
export { QueueCard } from '../components/domain/operations/QueueCard'
export { AgentStatusBoard } from '../components/domain/operations/AgentStatusBoard'
export { Heatmap } from '../components/domain/operations/Heatmap'
export { ContactCard } from '../components/domain/crm/ContactCard'
export { PipelineBoard } from '../components/domain/crm/PipelineBoard'
export { Funnel } from '../components/domain/crm/Funnel'
// 2.8 IA conversación
export { AiAvatar } from '../components/ai/AiAvatar'
export { AiMessage } from '../components/ai/AiMessage'
export { MessageActions } from '../components/ai/MessageActions'
export { AiEmptyState } from '../components/ai/AiEmptyState'
export { PromptComposer, AI_DISCLAIMER } from '../components/ai/PromptComposer'
export { ThinkingIndicator } from '../components/ai/ThinkingIndicator'
export { AiLoader } from '../components/ai/AiLoader'
export { Citation } from '../components/ai/Citation'
export { SourceList } from '../components/ai/SourceList'
export { StreamingAnswer } from '../components/ai/StreamingAnswer'
export { AiErrorState } from '../components/ai/AiErrorState'
export { QuotaBanner } from '../components/ai/QuotaBanner'
export { ModelSelector } from '../components/ai/ModelSelector'
export { UsageMeter } from '../components/ai/UsageMeter'
export { VoiceInput } from '../components/ai/VoiceInput'
export { AiHistory } from '../components/ai/AiHistory'
export { MemoryChips } from '../components/ai/MemoryChips'
export { SuggestionBanner } from '../components/ai/SuggestionBanner'
// 2.8 IA agente y contenido
export { ReasoningTrace } from '../components/ai/ReasoningTrace'
export { AgentSteps } from '../components/ai/AgentSteps'
export { ToolChip } from '../components/ai/ToolChip'
export { ApprovalCard } from '../components/ai/ApprovalCard'
export { TaskRows } from '../components/ai/TaskRows'
export { AgentPlan } from '../components/ai/AgentPlan'
export { StatusTracker } from '../components/ai/StatusTracker'
export { WebResults } from '../components/ai/WebResults'
export { InlineEdit } from '../components/ai/InlineEdit'
export { DiffView } from '../components/ai/DiffView'
export { CodeBlock } from '../components/ai/CodeBlock'
export { InsightCard } from '../components/ai/InsightCard'
export { wordDiff, lineDiff } from '../components/ai/diffModel'
import type {
  AlertProps,
  AppLayoutProps,
  AvatarProps,
  BadgeProps,
  Breadcrumb,
  ButtonProps,
  CardProps,
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
  ModalProps,
  ModalSize,
  ProgressProps,
  ProgressRingProps,
  DataTableToolbarContext,
  SidebarProps,
  TableColumn,
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

export const DataTable = asGenericComponent<<T extends object = Record<string, string | number | boolean | null | undefined>>(props: DataTableProps<T>) => React.ReactElement>(DataTableRuntime)
export const AppLayout = asComponent<AppLayoutProps>(AppLayoutRuntime)
export const Header = asComponent<HeaderProps>(HeaderRuntime)
export const Sidebar = asComponent<SidebarProps>(SidebarRuntime)
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
  ChatDaySeparatorProps,
  ChatDeliveryStatus,
  ChatMessage,
  ChatLabels,
  ChatTimelineEntry,
  CheckboxProps,
  ColoredStatCardProps,
  DataTableProps,
  DataTableAction,
  DataTableColumn,
  DataTableIdentityKey,
  DataTableColumnVisibility,
  DataTableBulkContext,
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
  TableDensity,
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
  StatsCardTrend,
  StatsCardProgress,
  IndicatorTone,
  IndicatorDelta,
  IndicatorIcon,
  ChartMetric,
  QuickLinkItem,
  ConnectionCardProps,
  CardHeaderProps,
  CardBodyProps,
  CardFooterProps,
  StatusBadgeProps,
  StatusButtonProps,
  StatCardProps,
  ThemeProviderProps,
  ApiFetchOptions,
  SeverityLevel,
  SeverityProps,
  SeverityThresholds,
  ScoreRange,
  ScoreThresholds,
  ScoreProps,
  ScoreHeroProps,
  PersonProps,
  DescriptionListItem,
  DescriptionListProps,
  KpiCardProps,
  StatGroupItem,
  StatGroupProps,
  ListItem,
  ListProps,
  BulkBarProps,
  ActiveFilter,
  ActiveFiltersProps,
  EntityCardProps,
  EntityCardStat,
  RankListItem,
  RankListProps,
  QuickTile,
  QuickTilesProps,
  ProcessStep,
  ProcessStepStatus,
  ProcessStepsProps,
  AppStatus,
  AppStatusCardProps,
  ColorSurfaceTone,
  SpotlightProps,
  WelcomeBandProps,
  WelcomeBandStat,
  DashGridSpan,
  DashGridProps,
  DashGridRowProps,
  TooltipPlacement,
  TooltipProps,
  SegmentedValue,
  SegmentedOption,
  SegmentedProps,
  SwitchProps,
  FieldsetProps,
  RadioGroupOption,
  RadioGroupProps,
  ChoiceCardProps,
  AccordionItem,
  AccordionProps,
  DrawerSize,
  DrawerProps,
  DividerProps,
  KbdProps,
  SpinnerProps,
  SkeletonProps,
  TagTone,
  TagProps,
  ThemeToggleMode,
  ThemeToggleResolved,
  ThemeToggleProps,
  CommandPaletteItem,
  CommandPaletteProps,
} from './types'

// 2.7 dominios
export type {
  CriterionResult,
  QualityCriterion,
  CriterionRowProps,
  TranscriptSpeaker,
  TranscriptTurn,
  TranscriptProps,
  AudioMark,
  AudioPlayerProps,
  CallId,
  CallSummary,
  CallRowProps,
  CallListProps,
  TargetBarProps,
  QueueCardProps,
  AgentPresence,
  AgentPresenceState,
  AgentStatusBoardProps,
  HeatmapProps,
  ContactFact,
  ContactCardProps,
  PipelineDeal,
  PipelineStage,
  PipelineBoardProps,
  FunnelStep,
  FunnelProps,
  // 2.8 IA conversación
  AiAvatarSize,
  AiAvatarProps,
  AiMessageSender,
  AiMessageProps,
  AiFeedbackValue,
  MessageActionsProps,
  AiEmptyStateProps,
  PromptComposerProps,
  ThinkingIndicatorProps,
  AiLoaderProps,
  AiSource,
  CitationProps,
  SourceListProps,
  StreamingAnswerProps,
  AiErrorStateProps,
  QuotaBannerProps,
  AiModelOption,
  ModelSelectorProps,
  UsageMeterProps,
  VoiceInputProps,
  AiThread,
  AiHistoryProps,
  AiMemoryItem,
  MemoryChipsProps,
  SuggestionBannerProps,
  // 2.8 IA agente y contenido
  AgentStepStatus,
  ReasoningStep,
  ReasoningStepInput,
  ReasoningTraceProps,
  AgentStep,
  AgentStepsProps,
  ToolChipProps,
  ApprovalIntent,
  ApprovalStatus,
  ApprovalCardProps,
  AgentTask,
  TaskRowsProps,
  AgentPlanStep,
  AgentPlanProps,
  StatusTrackerStage,
  StatusTrackerProps,
  WebResult,
  WebResultsProps,
  InlineEditProps,
  DiffPartKind,
  DiffPart,
  DiffFile,
  DiffViewProps,
  CodeBlockProps,
  InsightDelta,
  InsightCardProps,
} from './types'
