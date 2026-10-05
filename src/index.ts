export * from './public/components'

export { ActivityFeed } from './components/ui/ActivityFeed'
export type { ActivityFeedItem, ActivityFeedProps, ActivityFeedVariant } from './components/ui/ActivityFeed'
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
export { AppSwitcher } from './components/shell/AppSwitcher'
export type { AppSwitcherProps } from './components/shell/AppSwitcher'
export { TenantSwitcher } from './components/shell/TenantSwitcher'
export type { TenantSwitcherProps } from './components/shell/TenantSwitcher'
export { NotificationsMenu } from './components/shell/NotificationsMenu'
export type { NotificationsMenuProps } from './components/shell/NotificationsMenu'
export { ProfileMenu } from './components/shell/ProfileMenu'
export type { ProfileMenuProps } from './components/shell/ProfileMenu'
export { safeHref } from './utils/safeHref'
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

export * from './contract'
export * from './tokens'
export { ThemeProvider, type ThemeProviderProps } from './theme/ThemeProvider'
export {
  useTheme,
  useThemeOptional,
  THEME_HEAD_SNIPPET,
  THEME_STORAGE_KEY,
  type ThemeContextValue,
  type ThemeMode,
  type ResolvedTheme,
} from './theme/ThemeContext'
export { log, deprecate } from './utils/log'
export { apiFetch, SESSION_EXPIRED_EVENT } from './api/client'
