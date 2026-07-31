/**
 * Design tokens — espejo 1:1 de las variables SCSS de la plantilla Duralux v2:
 *   scss/themes/_variables.scss
 *   scss/themes/_bs-custom-variables.scss
 *
 * Fuente de verdad visual = SCSS, que a su vez sigue duralux-v2 (react-vite).
 * Si cambiás un color/escala en SCSS, actualizá acá en el mismo PR.
 */
export const tokens = {
  colors: {
    // Final $theme-colors after SCSS re-assign in _bs-custom-variables.scss
    // (the intermediate $success:#25b865 etc. are overwritten by $green/$red/…).
    // Must match compiled utilities (.bg-success) and --gcu-* in grancrm-ui.css.
    primary: '#3454d1',   // $blue / $primary
    success: '#17c666',   // $green → final $success
    danger: '#ea4d4d',    // $red → final $danger
    warning: '#ffa21d',   // $yellow → final $warning
    info: '#3dc7be',      // $cyan → final $info
    dark: '#283c50',      // $brand-dark
    darken: '#001327',
    secondary: '#727981', // $gray-600
    light: '#eff0f6',     // $gray-100 / $light
    // _variables.scss brand
    brand: '#283c50',
    brandBody: '#6b7885', // $brand-body
    brandMuted: '#7587a7', // $brand-muted (breadcrumbs)
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
  // $radius-* — scss/themes/_variables.scss:158-166
  radius: { none: 0, xs: 3, sm: 5, md: 10, lg: 15, xl: 20, xxl: 25, pill: 30, circle: 50 },
  // $border-radius* (form controls/buttons) — _bs-custom-variables.scss
  controlRadius: { sm: 2, base: 4, lg: 6 },
  // $shadow-* — scss/themes/_variables.scss:132-137 ($dark: #283c50 → rgba(40,60,80,.15))
  shadow: {
    none: 'none',
    sm: '0 1px 5px rgba(40,60,80,.15)',
    md: '0 5px 15px rgba(40,60,80,.15)',
    lg: '0 10px 25px rgba(40,60,80,.15)',
    xl: '0 15px 35px rgba(40,60,80,.15)',
    xxl: '0 20px 45px rgba(40,60,80,.15)',
  },
  // $border-none/soft/normal/medium/hard/contrast — scss/themes/_variables.scss.
  // soft/normal/medium/hard/contrast = darken($gray-100, 1|2|5|8|12) con $gray-100: #eff0f6
  // (valor real calculado con el compilador `sass`, no un placeholder de darken() a ojo).
  border: {
    none: 'transparent',
    soft: '#ecedf4',
    normal: '#e8eaf2',
    medium: '#dfe1ed',
    hard: '#d5d8e7',
    contrast: '#c8cbe0',
  },
  spacing: { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24 },
  // Fixed layout constants (not part of the 4px scale) — $card-spacer-*,
  // main-content padding. _bs-custom-variables.scss, nxl-common.scss.
  layoutGutter: { card: 25, content: 30 },
  /** Motion craft — alineado a scss/themes/components/_motion.scss.
   *  DESIGN.md house signature: `all 0.3s ease` on interactive surfaces
   *  (scoped to paint props here instead of literal `all`). No es parte
   *  de v2 (que no tokeniza motion ni soporta prefers-reduced-motion) —
   *  se mantiene como capa de accesibilidad, no como desviacion a corregir. */
  motion: {
    easeOut: 'ease',
    easeInOut: 'ease',
    durationPress: 300,
    durationFast: 300,
    durationUi: 300,
    durationPanel: 300,
    pressScale: 0.97,
  },
  /** Ruta SCSS de origen para auditoría */
  source: {
    variables: 'scss/themes/_variables.scss',
    bsCustom: 'scss/themes/_bs-custom-variables.scss',
    motion: 'scss/themes/components/_motion.scss',
  },
} as const

export type Tokens = typeof tokens

/** Solid + soft (light-*) button/badge tones that the theme SCSS emits. */
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
  | 'light-primary'
  | 'light-secondary'
  | 'light-success'
  | 'light-danger'
  | 'light-warning'
  | 'light-info'
  | 'light-dark'
  | 'light-light'
  | 'teal'
  | 'indigo'
  | 'light-teal'
  | 'light-indigo'

export type StatusVariant = 'success' | 'danger' | 'warning' | 'info' | 'secondary'
