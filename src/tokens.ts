/**
 * Design tokens — alineados a la plantilla Duralux SCSS:
 *   scss/themes/_variables.scss
 *   scss/themes/_bs-custom-variables.scss ($blue/$primary = #3454d1, etc.)
 *
 * Fuente de verdad visual = SCSS. Este archivo expone los mismos valores
 * para uso en TS (charts, inline styles). Si cambiás un color en SCSS,
 * actualizá acá en el mismo PR.
 */
export const tokens = {
  colors: {
    // _bs-custom-variables.scss — WCAG AA (text on white / white on solid)
    primary: '#3454d1',   // $blue / $primary
    success: '#15803d',   // $green / $success
    danger: '#b91c1c',    // $red / $danger
    warning: '#a16207',   // $yellow / $warning
    info: '#0e7490',      // $cyan
    dark: '#283c50',      // $brand-dark
    darken: '#001327',
    secondary: '#4b5563', // $gray-600
    light: '#f8f9fa',
    // _variables.scss brand
    brand: '#283c50',
    brandBody: '#4b5563', // $brand-body
    brandMuted: '#4a5d7a', // $brand-muted (breadcrumbs)
    brandLight: '#eaebef', // $brand-light
    bg: '#f0f2f8',        // $body-bg
    border: '#dcdee4',    // $border-color-2
  },
  font: {
    family: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", // $font-inter
    size: {
      xs: '0.625rem',   // 10px
      sm: '0.6875rem',  // 11px
      base: '0.84rem',  // $font-body
      md: '0.8125rem',  // 13px
      lg: '0.875rem',   // 14px
      xl: '1rem',       // 16px
    },
  },
  nav: {
    width: 280,
    collapsedWidth: 100,
    background: '#0f172a',
    headerHeight: 80,
  },
  dark: {
    background: '#0f172a',
    border: '#1b2436',
    hover: '#1c2438',
  },
  radius: { sm: 5, md: 10, lg: 15, pill: 30 },
  shadow: {
    sm: '0 1px 3px rgba(0,0,0,.08)',
    md: '0 2px 8px rgba(0,0,0,.12)',
    lg: '0 4px 20px rgba(0,0,0,.16)',
  },
  spacing: { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24 },
  /** Ruta SCSS de origen para auditoría */
  source: {
    variables: 'scss/themes/_variables.scss',
    bsCustom: 'scss/themes/_bs-custom-variables.scss',
  },
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
  | 'light-brand'

export type StatusVariant = 'success' | 'danger' | 'warning' | 'info' | 'secondary'
