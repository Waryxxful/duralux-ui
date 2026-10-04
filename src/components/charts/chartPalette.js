import { designTokens, tokens } from '../../tokens'

// Colores por tema desde tokens/tokens.json (DTCG). ApexCharts necesita valores literales;
// la serie de cada tema son los roles `status-*` (contraste de marca gráfica ≥ 3:1).
const LIGHT = designTokens.themes.light.colors
const DARK = designTokens.themes.dark.colors
const NAVY = designTokens.themes.navy.colors
const SERIES_ROLES = ['primary', 'success', 'warning', 'danger', 'info', 'indigo', 'secondary']
const seriesFrom = (colors) => Object.freeze(SERIES_ROLES.map((role) => colors[`status-${role}`]))

// Keep the fallback values in one place. The CSS variable is resolved by the
// host theme, while the token value keeps charts usable before the stylesheet
// is loaded (for example in a screenshot or a test renderer).
function chartColor(name, fallback = tokens.colors[name]) {
  return `var(--gcu-${name}, ${fallback})`
}

// Literal token colors are required by ApexCharts' color parser. Recharts can
// resolve the CSS-aware variant at paint time, which also follows dark scopes.
// Graphic marks need 3:1 contrast against the light canvas. These are
// same-hue accessible fills, not the raw semantic colors used for decoration.
export const CHART_PALETTE = seriesFrom(LIGHT)

export const CHART_DARK_PALETTE = seriesFrom(DARK)

// Recharts resolves CSS variables at paint time. The wrapper maps the raw
// semantic names to foreground-safe chart roles without changing this public
// fallback interface for unstyled hosts.
export const CHART_CSS_PALETTE = Object.freeze([
  chartColor('primary'),
  chartColor('success'),
  chartColor('warning'),
  chartColor('danger'),
  chartColor('info'),
  chartColor('indigo'),
  chartColor('secondary'),
])

const LIGHT_CHART_THEME = Object.freeze({
  mode: 'light',
  background: chartColor('canvas', tokens.colors.canvas),
  surface: chartColor('surface', LIGHT.surface),
  surfaceSubtle: chartColor('surface-subtle', LIGHT['surface-subtle']),
  text: chartColor('text', tokens.colors.dark),
  muted: chartColor('muted', LIGHT.muted),
  border: chartColor('border', tokens.colors.border),
  primary: chartColor('primary'),
  series: CHART_CSS_PALETTE,
  shadow: 'var(--gcu-shadow, 0 4px 20px rgb(0 0 0 / 0.1))',
})

// Paleta negro/gris (intouch-logo-demo.html) — background/surface siguen la
// misma jerarquía que tokens.dark/tokens.nav (page vs card).
// Texto, apagado y borde conservan la paleta oscura histórica de los gráficos (las apps la
// usan y los tests de contraste la fijan); las superficies salen de tokens.
const DARK_CHART_THEME = Object.freeze({
  mode: 'dark',
  background: DARK['surface-subtle'],
  surface: DARK.surface,
  surfaceSubtle: DARK['surface-subtle'],
  text: '#f5f7ff',
  muted: '#8b8d98',
  border: '#3a3b42',
  primary: CHART_DARK_PALETTE[0],
  series: CHART_DARK_PALETTE,
  shadow: '0 4px 20px rgb(0 0 0 / 0.35)',
})

// Navy: misma serie que el oscuro; superficies y bordes del tema navy.
const NAVY_SURFACES = Object.freeze({
  background: NAVY['surface-subtle'],
  // Superficie de card navy de la plantilla (un paso sobre el lienzo).
  surface: '#1d2a45',
  surfaceSubtle: NAVY['surface-subtle'],
  muted: '#b8c4dc',
  border: '#68799c',
})

const NAVY_CHART_THEME = Object.freeze({ ...DARK_CHART_THEME, mode: 'navy', ...NAVY_SURFACES })

export const CHART_THEME = LIGHT_CHART_THEME

const CHART_THEMES = Object.freeze({ light: LIGHT_CHART_THEME, dark: DARK_CHART_THEME, navy: NAVY_CHART_THEME })

export function getChartTheme(mode = 'light') {
  return CHART_THEMES[mode] ?? LIGHT_CHART_THEME
}

// ApexCharts parses colors itself, so it receives literal token values rather
// than CSS variables. These values mirror the light/dark semantic CSS scope.
export const APEX_CHART_THEME = Object.freeze({
  light: Object.freeze({
    background: LIGHT.surface,
    surface: LIGHT.surface,
    surfaceSubtle: tokens.colors.canvas,
    text: tokens.colors.dark,
    muted: tokens.colors.secondary,
    border: tokens.colors.border,
    series: CHART_PALETTE,
    shadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  }),
  dark: Object.freeze({
    background: DARK['surface-subtle'],
    surface: DARK.surface,
    surfaceSubtle: DARK['surface-subtle'],
    text: '#f5f7ff',
    muted: '#8b8d98',
    border: '#3a3b42',
    series: CHART_DARK_PALETTE,
    shadow: '0 0 20px rgba(0, 0, 0, 0.5)',
  }),
  navy: Object.freeze({
    ...NAVY_SURFACES,
    text: '#f5f7ff',
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

export function getChartColor(color, index = 0, theme = CHART_THEME) {
  if (color !== undefined && color !== null) return color
  const palette = Array.isArray(theme?.series) && theme.series.length
    ? theme.series
    : CHART_CSS_PALETTE
  return palette[index % palette.length]
}
