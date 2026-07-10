// Canonical design tokens for the portable GranCRM / Duralux component layer.
export const tokens = {
  colors: {
    primary: '#3454d1',
    success: '#17c666',
    danger: '#ea4d4d',
    warning: '#ffa21d',
    info: '#3dc7be',
    dark: '#283c50',
    darken: '#001327',
    secondary: '#6c757d',
    light: '#f8f9fa',
    brand: '#283c50',
    brandBody: '#6b7885',
    brandMuted: '#7587a7',
    brandLight: '#eaebef',
    bg: '#f3f4f6',
  },
  font: {
    family: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    size: {
      xs: '0.625rem',   // fs-10
      sm: '0.6875rem',  // fs-11
      base: '0.75rem',  // fs-12 Duralux default
      md: '0.8125rem',  // fs-13
      lg: '0.875rem',   // fs-14
      xl: '1rem',       // fs-16
    },
  },
  nav: { width: 280, collapsedWidth: 100, background: '#0f172a', headerHeight: 80 },
  dark: { background: '#0f172a', border: '#1b2436', hover: '#1c2438' },
  radius: { sm: 5, md: 10, lg: 15, pill: 30 },
  shadow: {
    sm: '0 1px 3px rgba(0,0,0,.08)',
    md: '0 2px 8px rgba(0,0,0,.12)',
    lg: '0 4px 20px rgba(0,0,0,.16)',
  },
  spacing: { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24 },
} as const

export type Tokens = typeof tokens

export type SemanticVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'dark'
  | 'light'
  | 'link'

export type StatusVariant = 'success' | 'danger' | 'warning' | 'info' | 'secondary'
