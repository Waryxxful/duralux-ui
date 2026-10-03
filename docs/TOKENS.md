# Tokens

`tokens/tokens.json` (formato W3C DTCG) es la única fuente. Todo lo demás se genera:

```bash
npm run tokens:generate   # escribe los artefactos
npm run tokens:check      # falla si hay deriva o si un par de texto no cumple AA (corre en build)
```

| Artefacto | Para qué |
|---|---|
| Bloque `BEGIN/END GENERATED SEMANTIC TOKENS` en `src/styles/grancrm-ui.css` | Custom properties `--gcu-*` en runtime (light, dark y navy) |
| `src/styles/tokens.css` (`@duralux/ui/tokens.css`) | El mismo bloque, solo, para quien no carga `grancrm-ui.css` |
| `scss/themes/_semantic-tokens.generated.scss` | Valores para Bootstrap y el theme Sass (`$semantic-*`, `$token-*`) |
| `src/generated/semantic-colors.ts`, `src/generated/tokens.ts` | `semanticColors` y `designTokens` en TypeScript |
| `src/generated/antd-theme.ts` | `ThemeConfig` de antd por tema (lo consume el futuro subpath `/antd`) |

## Niveles

1. **Primitivos** (`color.base`, `color.palette`): los 14 colores base de Duralux y escalas 50–950 en OKLCH ancladas en el paso 500. Se usan en ilustraciones y gráficos; los componentes no los usan directamente.
2. **Semánticos** (`theme.light|dark|navy`): roles con significado (`text`, `muted`, `surface`, `border`, `focus-ring-color`…). Por cada tono el generador deriva `--gcu-{tono}-soft`, `--gcu-{tono}-border` y `--gcu-{tono}-text`. **Es lo que usan los componentes.**
3. **De componente:** solo cuando un componente lo necesita de verdad. No se crean por adelantado.

## Escalas

| Grupo | Custom properties |
|---|---|
| Espaciado | `--gcu-space-{0,0-5,1,2,3,4,5,6,8,10,12,16}` (base 4 px) |
| Radios | `--gcu-radius-{xs,sm,md,lg,xl,full}` |
| Alturas de control | `--gcu-control-h-{xs,sm,md,lg}` = 28/32/36/40 (xs: iconos en tablas densas) |
| Tipografía | `--gcu-font-size-*`, `--gcu-line-height-*`, `--gcu-font-weight-*`, `--gcu-tracking-*`, `--gcu-font-sans`, `--gcu-font-mono` |
| Elevación | `--gcu-shadow-{0..4}` (por tema) |
| Movimiento | `--gcu-duration-{instant,fast,base,slow}`, `--gcu-ease-{standard,enter,exit}`, `--gcu-press-scale` |
| Capas | `--gcu-z-{dropdown,sticky,drawer,modal,tooltip,toast}` |
| Foco | `--gcu-focus-ring` (box-shadow completo), `--gcu-focus-ring-color` |

## Temas

- `:root`, `.gcu-theme` y `[data-gcu-theme="light"]` declaran los valores claros y las escalas.
- `[data-gcu-theme="dark"]` y `.app-skin-dark` declaran el oscuro gris-negro.
- `[data-gcu-theme="navy"]` va después y gana al oscuro (en navy `<html>` también lleva `.app-skin-dark`).
- Un `ThemeScope` local (`data-gcu-theme` en un contenedor) redefine los valores para su subárbol.
- `@media (prefers-reduced-motion: reduce)` lleva las duraciones a 0.

## Cómo agregar un token

1. Agrégalo en `tokens/tokens.json` en el nivel correcto. Si es un color de texto, agrégalo a los tres temas.
2. Si es un rol de texto, agrégalo a `THEME_COLOR_KEYS` y a `TEXT_KEYS` en `scripts/generate-tokens.mjs` para que el contraste se verifique.
3. Corre `npm run tokens:generate` y `npm test`.
4. Documenta el uso en la página de Fundamentos de Storybook si es un rol nuevo.

## Excepciones permitidas

- Los artefactos generados contienen hex: es su función y no cuentan en el presupuesto de deuda CSS.
- Las paletas del oscuro Sass (`$gcu-dark-palettes` en `_theme-options-dark-theme.scss`) y de gráficos (`chartPalette.js`) contienen hex porque Sass y ApexCharts necesitan valores literales. Se reducen en el subproyecto 2.
- `!important` solo en utilidades que deben ganar a reglas del tema con mayor especificidad; el presupuesto por archivo (`scripts/audit/css-budget.json`) no puede crecer.
