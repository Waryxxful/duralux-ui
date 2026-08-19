import { tokens } from '../../tokens'

// Keep the fallback values in one place. The CSS variable is resolved by the
// host theme, while the token value keeps charts usable before the stylesheet
// is loaded (for example in a screenshot or a test renderer).
function chartColor(name, fallback = tokens.colors[name]) {
  return `var(--gcu-${name}, ${fallback})`
}

// Literal token colors are required by ApexCharts' color parser. Recharts can
// resolve the CSS-aware variant at paint time, which also follows dark scopes.
export const CHART_PALETTE = Object.freeze([
  tokens.colors.primary,
  tokens.colors.success,
  tokens.colors.warning,
  tokens.colors.danger,
  tokens.colors.info,
  tokens.colors.indigo,
  tokens.colors.secondary,
])

export const CHART_DARK_PALETTE = Object.freeze([
  '#8ea7ff',
  '#55e899',
  '#ffd166',
  '#ff7a8a',
  '#5fd7ff',
  '#b39aff',
  '#c4cedd',
])

export const CHART_CSS_PALETTE = Object.freeze([
  chartColor('primary'),
  chartColor('success'),
  chartColor('warning'),
  chartColor('danger'),
  chartColor('info'),
  chartColor('indigo'),
  chartColor('secondary'),
])

// Alias kept deliberately close to the Apex/Recharts vocabulary.
export const CHART_COLORS = CHART_PALETTE

const LIGHT_CHART_THEME = Object.freeze({
  mode: 'light',
  background: chartColor('canvas', tokens.colors.canvas),
  surface: chartColor('surface', '#fff'),
  surfaceSubtle: chartColor('surface-subtle', '#f3f4f6'),
  text: chartColor('text', tokens.colors.dark),
  muted: chartColor('muted', '#4b5563'),
  border: chartColor('border', tokens.colors.border),
  primary: chartColor('primary'),
  series: CHART_CSS_PALETTE,
  shadow: 'var(--gcu-shadow, 0 4px 20px rgb(0 0 0 / 0.1))',
})

// Paleta negro/gris (intouch-logo-demo.html) — background/surface siguen la
// misma jerarquía que tokens.dark/tokens.nav (page vs card).
const DARK_CHART_THEME = Object.freeze({
  mode: 'dark',
  background: '#0e0f12',
  surface: '#17181d',
  surfaceSubtle: '#0e0f12',
  text: '#f5f7ff',
  muted: '#8b8d98',
  border: '#3a3b42',
  primary: CHART_DARK_PALETTE[0],
  series: CHART_DARK_PALETTE,
  shadow: '0 4px 20px rgb(0 0 0 / 0.35)',
})

export const CHART_THEME = LIGHT_CHART_THEME

export function getChartTheme(mode = 'light') {
  return mode === 'dark' ? DARK_CHART_THEME : LIGHT_CHART_THEME
}

// ApexCharts parses colors itself, so it receives literal token values rather
// than CSS variables. These values mirror the light/dark semantic CSS scope.
export const APEX_CHART_THEME = Object.freeze({
  light: Object.freeze({
    background: '#fff',
    surface: '#fff',
    surfaceSubtle: tokens.colors.canvas,
    text: tokens.colors.dark,
    muted: tokens.colors.secondary,
    border: tokens.colors.border,
    series: CHART_PALETTE,
    shadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  }),
  dark: Object.freeze({
    background: '#0e0f12',
    surface: '#17181d',
    surfaceSubtle: '#0e0f12',
    text: '#f5f7ff',
    muted: '#8b8d98',
    border: '#3a3b42',
    series: CHART_DARK_PALETTE,
    shadow: '0 0 20px rgba(0, 0, 0, 0.5)',
  }),
})

export function getChartTooltipStyle(theme = CHART_THEME) {
  return {
    background: theme.surface,
    color: theme.text,
    border: `1px solid ${theme.border}`,
    borderRadius: 8,
    boxShadow: theme.shadow,
    fontSize: 12,
  }
}

export const CHART_TOOLTIP_STYLE = Object.freeze(getChartTooltipStyle(CHART_THEME))

export function getChartColor(color, index = 0, theme = CHART_THEME) {
  if (color !== undefined && color !== null) return color
  const palette = Array.isArray(theme?.series) && theme.series.length
    ? theme.series
    : CHART_CSS_PALETTE
  return palette[index % palette.length]
}
