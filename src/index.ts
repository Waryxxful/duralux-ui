export * from './public/components'

export { ActivityFeed } from './components/ui/ActivityFeed'
export type { ActivityFeedItem, ActivityFeedProps, ActivityFeedVariant } from './components/ui/ActivityFeed'
export { ConnectionCard } from './components/ui/ConnectionCard'
export type { ConnectionCardProps } from './components/ui/ConnectionCard'
export { Toast } from './components/ui/Toast'
export type { ToastProps, ToastVariant } from './components/ui/Toast'
export { Dropdown, DropdownMenu } from './components/ui/Dropdown'
export type {
  DropdownAlignment,
  DropdownMenuProps,
  DropdownProps,
  DropdownState,
  DropdownTriggerProps,
} from './components/ui/Dropdown'

export { ShellHeader } from './components/shell/ShellHeader'
export type { ShellHeaderProps } from './components/shell/ShellHeader'
export { ShellNav } from './components/shell/ShellNav'
export type {
  ShellNavBrand,
  ShellNavItem,
  ShellNavProps,
  ShellNavSection,
} from './components/shell/ShellNav'
export { ThemeScope } from './components/shell/ThemeScope'
export type { GranCrmTheme, ThemeScopeProps } from './components/shell/ThemeScope'
export { ConfirmDialog } from './components/shell/ConfirmDialog'
export type { ConfirmDialogProps } from './components/shell/ConfirmDialog'
export {
  CardHeader,
  CardBody,
  CardFooter,
  StatusBadge,
  StatusButton,
  StatCard,
} from './components/shell/GranCrmExtras'
export type {
  CardHeaderProps,
  CardBodyProps,
  CardFooterProps,
  StatusBadgeProps,
  StatusButtonProps,
  StatCardProps,
} from './components/shell/GranCrmExtras'

export * from './contract'
export * from './tokens'
export {
  ThemeProvider,
  useTheme,
  useThemeOptional,
  THEME_HEAD_SNIPPET,
} from './theme/ThemeProvider'
export type { ThemeContextValue, ThemeMode } from './theme/ThemeProvider'
export { apiFetch, SESSION_EXPIRED_EVENT } from './api/client'
