# Changelog

Los cambios notables de `@duralux/ui` se registran aquí. Este archivo describe el contenido del commit de preparación; la publicación requiere crear el tag `v2.0.0` después de que CI valide el commit.

## 2.8.0 — Componentes de IA

Lotes IA1 e IA2. API aditiva. Los componentes solo emiten intenciones: ninguno ejecuta acciones ni llama a un modelo; toda acción con efecto pasa por `ApprovalCard`.

### Conversación (IA1)
AiAvatar, AiMessage, MessageActions, AiEmptyState, PromptComposer (con `AI_DISCLAIMER`), ThinkingIndicator, AiLoader, Citation, SourceList, StreamingAnswer (anuncia por bloques completos), AiErrorState, QuotaBanner, ModelSelector, UsageMeter, VoiceInput (se deshabilita con aviso sin Web Speech API), AiHistory, MemoryChips y SuggestionBanner.

### Agente y contenido (IA2)
ReasoningTrace, AgentSteps, ToolChip, ApprovalCard, TaskRows, AgentPlan, StatusTracker, WebResults, InlineEdit, DiffView (`wordDiff`, `lineDiff`), CodeBlock (copiar con alternativa sin Clipboard API) e InsightCard. Tipos `AiToolArgs`/`AiJsonValue` para argumentos de herramientas (JSON).

### Transversal
- Un solo saneador de enlaces (`utils/safeHref`): solo http/https o rutas relativas; el aviso por log no incluye la URL. Lo usan el shell (CommandPalette, AppSwitcher, notificaciones, perfil, navegación) y la IA (Citation, SourceList, WebResults).
- Patrón «Asistente» en Storybook con AiHistory, AiMessage, PromptComposer, pasos del agente y aprobación.
- Foco visible también en modo de alto contraste en los componentes de 2.7–2.8; contraste AA del menú lateral en oscuro y navy y del nombre de la persona en el header de `AppLayout`.
- react-doctor 81/100.

## 2.7.0 — Componentes de dominio

Lote D7 (`src/components/domain`). API aditiva.

- **Calidad:** CriterionRow, Transcript, AudioPlayer (simula el avance sin `src`), CallRow y CallList (listbox con foco itinerante).
- **Operación:** TargetBar, QueueCard, AgentStatusBoard y Heatmap (desplazable con teclado en pantallas angostas).
- **CRM:** ContactCard, PipelineBoard (mover entre etapas con arrastre o teclado) y Funnel.

## 2.6.0 — Shell, layout y patrones de página

Lotes P1, P2 y DOC. Sin cambios de API en lo existente.

### Cambios visibles
- **`PageHeader` es sticky por defecto** y muestra sombra solo cuando queda pegado al hacer scroll (`sticky={false}` lo desactiva). Ya no hace falta `className="sticky-top"`.
- **`ShellHeader` dividido en piezas** exportadas por separado (`AppSwitcher`, `TenantSwitcher`, `NotificationsMenu`, `ProfileMenu`, `ThemeToggle`); mismas props que 2.5. `themeMenu` (opcional) cambia el botón sol / luna por el menú de cuatro modos.
- **Demo Vite retirada** (`demo/`, `dev:demo`, `preview:demo`): Storybook cubre sus páginas. `scripts/audit/capture.mjs` ahora trabaja solo con Storybook (`--storybook`, por defecto http://localhost:6006).

### Nuevo
- `CommandPalette` (Ctrl/Cmd + K, búsqueda sin tildes, «Recientes»), `ThemeToggle`, `PageHeader` y `AuthLayout` en TSX; los adaptadores de navegación salen de `Sidebar` y `ShellNav` a módulos propios.
- Ocho patrones de página en Storybook (Cola primero, Reporte, Directorio, Tabla operativa, Bandeja, Espacio de trabajo, Ajustes, Acceso) y `docs/PATRONES.md`.
- Documentación: `AGENTS.md`, `docs/manifest.json` / `docs/MANIFEST.md` y guías de migración por app en `docs/migracion/`.

## 2.5.0 — Componentes nuevos, DataTable sobre TanStack y antd ampliado

Lotes N1, N2, N3 y 2.5.1 (sub-specs `2026-10-04-2-5-componentes-nuevos-design.md` y `2026-10-04-2-5-1-antd-ampliado-design.md`). API aditiva: nada se rompe.

### Controles y estructura (N1)
Tooltip, Segmented, Switch, Fieldset, RadioGroup, ChoiceCard, Accordion, Drawer, Divider, Kbd, Spinner, Skeleton y Tag. La pila de capas modales se comparte entre Modal y Drawer (`ui/internal/modalStack`).

### Datos y composición (N2)
Severity, Score/ScoreHero, Person, DescriptionList, KpiCard, StatGroup, List, BulkBar, ActiveFilters, EntityCard, RankList, QuickTiles, ProcessSteps, AppStatusCard, Spotlight, WelcomeBand y DashGrid; Sparkline, TrendLine, Gauge y Donut en `charts/apex`.

### DataTable sobre TanStack Table (N3)
Misma API (los 30 tests previos pasan sin cambios) más orden múltiple, menú de columnas, `density`, `stickyHeader`, `virtualized`, `error` + `onRetry`, `renderBulkActions` con BulkBar y anuncios accesibles. Dependencias nuevas: `@tanstack/react-table` y `@tanstack/react-virtual`. Sin `import()` dinámicos (rompían los remotos de Module Federation): nuevo gate en `check-bundle`.

### `@duralux/ui/antd` ampliado (2.5.1)
RangeSlider, Transfer, CheckTree, Splitter, TimePicker/TimeRangePicker, Calendar, Tour, AutoComplete, Mentions, NumberInput (es-CL), ColorPicker e ImagePreview. `DuraluxAntdProvider` sigue a ThemeScope y a `data-gcu-theme` de `<html>` sin ThemeProvider (satélites en el shell).

### Correcciones
Skeleton visible sobre superficies sutiles; Switch en oscuro y navy.

## 2.4.0 — Indicadores, tablas, gráficos y chat refinados

Cierra el refinamiento del núcleo (lotes L4–L7). Mismas reglas que 2.3: TSX con `forwardRef`, CSS propio con tokens, stories en tres temas, API sin rupturas (props nuevas; lo reemplazado con `deprecate()`).

### Indicadores
StatsCard, MiniStatCard, ColoredStatCard, QuickLinkGrid, ChartMetricsFooter, ConnectionCard y GranCrmExtras (CardHeader, CardBody, CardFooter, StatusBadge, StatusButton, StatCard).
- Props nuevas `delta` (variación con signo, unidad, flecha y texto; `goodWhen: 'down'` para TMO o abandono) y `context` (toda cifra con referencia). Estados de carga y vacío.
- **Cambios visibles:** ColoredStatCard con rellenos más profundos (AA ~7:1) y grano; QuickLinkGrid en grilla CSS; números es-CL (2840 → 2.840). Deprecados `iconBg`/`trend` (StatsCard) y `bg`/`trend`/`trendUp` (ColoredStatCard).
- DX-020 y DX-021 cerrados.

### Tablas
Table, ResponsiveTable (alias deprecado), Pagination y DataTableToolbar.
- Props nuevas en Table: `columns[].numeric`, `density`, `stickyHeader` + `maxHeight`, `emptyState`, `loadingRows`. Pagination con `pageSize`/`totalItems` («11–20 de 248»).
- **Cambios visibles en toda `.table` y `.pagination`:** celdas centradas verticalmente (DX-039), filas parejas en oscuro (DX-040), encabezado 11 px semibold con tracking, paginación con botones de 32 px separados.

### Gráficos
ApexChart, ChartCard y los widgets de Recharts.
- Figura accesible con `<figure>`/`figcaption` y tabla de datos (DX-004); `ChartCard` con `headingLevel` (DX-006, por defecto h3); tipos públicos con nombre (DX-023); paleta, tooltip, ejes y leyenda (forma + texto) desde tokens; skeleton, vacío y error con reintento.
- `ChartThemeMode` incluye `navy`. Deprecado `noPad` de ChartCard.

### Chat
MessageBubble, ChatBubble, ChatInputBar, ChatSidebar y ChatWindow.
- `ChatDaySeparator`, `groupChatMessages`, `formatChatDay`; estado de entrega con ícono y texto; compositor `multiline` (Enter envía, Shift+Enter salta línea) con contador; lista seleccionable (`listbox`) con no leídos; `.gcu-chat` opcional que pasa a una columna en contenedores angostos.
- DX-017 cerrado en ChatSidebar.

### Sistema
- react-doctor 77 (el gate ahora exige 75). Deuda CSS desde 2.1: `!important` 680 → 478, overrides de oscuro 181 → 14, hex 367 → 194.

## 2.3.1 — Chevron del select por tema

- La flecha de `Select` vuelve a ser un chevron (2.3.0 la había cambiado por un triángulo relleno). Ahora se genera por tema desde los tokens (`--gcu-chevron`, `--gcu-chevron-danger`), así se ve en claro, oscuro y navy y en estado de error.

## 2.3.0 — Formularios, feedback y presentación refinados

Primeras tres tandas del refinamiento del núcleo (`docs/superpowers/specs/2026-10-04-2-3-refinamiento-nucleo-design.md`). Todos los componentes de estos lotes pasan a TSX con `forwardRef` (ref tipado), CSS propio con tokens en `styles/components/`, stories en tres temas y detalles de oficio Craft. La API no rompe: lo nuevo son props; lo reemplazado avisa con `deprecate()`.

### Formularios
Input, Textarea, Select, Checkbox, Radio, FileInput, InputGroup, FormField, SearchableSelect y MultiSelect.
- Prop nueva `controlSize` (sm/md/lg). Deprecados: `invalid` (usa `aria-invalid`/error del campo), `icon`/`prefix` de Input y `hint` de FormField.
- **Cambio visible:** FormField deja las columnas de Bootstrap y usa una grilla que se adapta a su contenedor (apila en angosto, fila desde 36rem).
- Formularios en oscuro y navy desde tokens (vuelve el anillo de foco). FileInput legible en oscuro (DX-010). Selects sin estado ajustado en efectos (DX-017 parcial).

### Feedback y capas
Alert, Modal, Toast, Dropdown, ConfirmDialog, EmptyState, ErrorState, LoadingState y CardLoader.
- Toast con `description`, duración según largo del texto y región «Notificaciones». EmptyState/ErrorState con acción secundaria, `compact` y reintento. LoadingState `variant="skeleton"`.
- Dropdown abre en 100 ms sin transición en ítems; Modal anima la entrada. DX-019 (`<dialog>`): no aplica, documentado.

### Presentación
Badge, Avatar, AvatarGroup, Card, Progress, ProgressRing, Timeline, ActivityFeed, Tabs e Icon.
- Badge con `dot`; Card con `interactive`, `loadingVariant="skeleton"` y etiquetas en español (DX-029); Tabs con patrón APG completo y sin `onChange` desde efectos (DX-016); Timeline/ActivityFeed con tiempo relativo («hace 5 minutos») y fecha completa en `title`.
- Deprecados: `elementRef`, `headerRight`, `noPad` de Card; `iconBg` de Timeline.

### Sistema
- Detalles de oficio Craft y container queries (`docs/REGLAS-DE-DISENO.md` §11–§13).
- Tree-shaking garantizado: componentes anotados como puros (Button solo pesa 3,7 KB gzip).
- Deuda CSS en baja (presupuesto por archivo). react-doctor 71.

## 2.2.0 — antd tematizado y Button ejemplar

### Agregado

- **`@duralux/ui/antd`**: `DuraluxAntdProvider`, `DatePicker`, `RangePicker`, `DateRangeFilter` (presets en español), `TreeSelect`, `Cascader` y `FileDrop`. antd y dayjs son dependencias opcionales y nunca entran al bundle raíz. Ver `docs/ANTD.md`.
- Token `--gcu-z-popover` (1070) y `--gcu-control-h-xs` (28 px).
- `docs/RECETA-COMPONENTE.md`: la receta que siguen todos los componentes refinados.

### Cambiado

- `Button`, `LinkButton` e `IconButton` en TSX con `forwardRef` (el `ref` llega al elemento nativo y está tipado). Las variantes no canónicas avisan con `log` (`[duralux]`) y `outline` con `deprecate`.
- El CSS de botón vive en `styles/components/button.css` (importado por `grancrm-ui.css`; no cambia cómo se importan los estilos).

### Corregido

- `.btn-link` en línea conserva su padding (DX-036).
- Números tabulares solo en celdas numéricas; IconButton `sm` a 32 px y 28 px en tablas (regresiones vistas en DEV con 2.1).

## 2.1.0 — Fundaciones del design system

Primera entrega de la serie 2.x (spec `docs/superpowers/specs/2026-10-03-duralux-design-system-design.md`). El contrato shell ↔ satélite (`src/contract.ts`) no cambia y no se elimina ninguna API. Sí hay **cambios visuales globales** y una **ampliación de tipos** que puede requerir ajustes:

### Posibles rupturas

- **TypeScript:** `ThemeMode` pasa de `'light' | 'dark'` a `'light' | 'dark' | 'navy' | 'system'`. Un `switch` exhaustivo o un `Record<ThemeMode, …>` deja de compilar hasta cubrir los modos nuevos.
- **Lógica de tema:** `mode === 'dark'` ya no basta para saber si la interfaz está oscura (navy y `system` también pueden serlo). Usa `dark` (booleano) o `resolved`.
- **Bootstrap recalculado:** los overrides de Duralux se importan antes de las variables de Bootstrap, así que los derivados por fin salen de ellos. Cambian, entre otros: `--bs-blue/red/green/gray-*` a los colores de marca, `--bs-link-color`, `--bs-font-sans-serif` (Inter), el padding de inputs y botones (0,375 → 0,5 rem, luego normalizado a 36 px por la capa de refinamiento), radios de botón/input/card y variantes de tabla. El fondo de inputs, selects y checks se mantiene blanco como en la plantilla.
- **Estilos obligatorios:** `grancrm-ui.css` declara los tokens y la fuente Inter; `bootstrap.css` y `theme.css` traen valores de respaldo, pero la apariencia completa requiere los tres archivos (como ya indicaba la guía de consumo).

### Agregado

- **Tokens DTCG** (`tokens/tokens.json`): paletas OKLCH 50–950, roles semánticos por tema, escalas de espaciado, radios, alturas de control, tipografía, elevación, movimiento y capas. Se exportan como `@duralux/ui/tokens.json`, `@duralux/ui/tokens.css` y `designTokens` (TS). `tokens:check` exige contraste AA en los tres temas.
- **Temas en runtime:** `ThemeMode` = `light | dark | navy | system`. `ThemeProvider` fija `data-gcu-theme` en `<html>` (y `.app-skin-dark` en dark y navy); `system` sigue al sistema operativo en caliente. `ThemeScope` acepta `navy`. Los gráficos (Apex y Recharts) tienen paleta navy.
- **Iconos Tabler:** `Icon`, `Button` (`startIcon`/`endIcon`) e `IconButton` aceptan un elemento como `<IconRobot />` además del nombre Feather. Tipo público `IconSlot`.
- `log` y `deprecate` exportados desde la raíz (prefijo `[duralux]`).
- **Storybook** con Fundamentos (color, tipografía, espaciado, radios y elevación, motion, iconografía) y selector de tema. Docker publica Storybook.
- Documentación: `docs/PRINCIPIOS.md`, `docs/REGLAS-DE-DISENO.md`, `docs/TOKENS.md`, `docs/ICONOGRAFIA.md`, `AGENTS.md` y `docs/auditoria/DEFECTOS.md`.
- Gates: presupuesto de deuda CSS por archivo, hex inline prohibido en componentes y react-doctor ≥ 60.

### Cambiado (visible)

- Refinamiento visual global desde tokens: botones e inputs de 36 px alineados (32/40 en sm/lg), radios 6 (controles) y 12 (modales), cards con borde fino y elevación suave, anillo de foco único solo con teclado, presión con escala, entrada animada de dropdowns y modales, `::selection`, números tabulares y títulos balanceados.
- Inter Variable autoalojada; ya no se carga Google Fonts.
- Los overrides de Bootstrap se importan antes de sus variables: radios, `form-select` (mismo tamaño que `form-control`) y estados de validación salen de los tokens.

### Corregido

- Contraste AA de `code`, texto de ayuda, `.text-muted` y feedback inválido en claro y oscuro (DX-001, DX-002, DX-003).
- `Select` con tamaño de fuente distinto al de `Input` (DX-009).
- Un tema guardado desconocido ya no se pierde en silencio: cae en `light` con aviso (DX-012).

### Migración

- Actualiza el SHA de `@duralux/ui` y revisa visualmente tus pantallas en claro y oscuro.
- Si tu app incrusta `THEME_HEAD_SNIPPET`, vuelve a copiarlo: ahora fija `data-gcu-theme`.
- Si usas `useTheme().mode` para decidir colores, usa `resolved` (`mode` puede ser `system`).

## 2.0.0 — preparación de release

### Cambios incompatibles

- Los componentes y motores de charts ya no se exportan desde `@duralux/ui`. Actualiza los imports a `@duralux/ui/charts/apex` o `@duralux/ui/charts/recharts`.
- `apexcharts`, `react-apexcharts` y `recharts` son peer dependencies opcionales. Instala solo los peers del subpath que uses.
- El paquete declara ESM (`"type": "module"`) y mantiene entradas CJS mediante `exports`; los consumidores deben importar subpaths públicos, no archivos internos de `dist/`.
- Las declaraciones públicas ahora reflejan los contratos reales. En particular, labels y placeholders de selects avanzados son texto (`string | number`), y `renderValue` de `SearchableSelect` debe devolver texto porque se muestra en un input nativo.
- `FormField` ya no infiere que cualquier wrapper React es un control. Los wrappers propios que reenvían props deben declarar `duraluxFormControl = true`; los wrappers visuales dejan de recibir atributos de input por accidente.

### Agregado

- `SearchableSelect`: selección única buscable, combobox accesible, teclado/IME, valores controlados o no controlados, limpieza opcional y submit nativo mediante `name`.
- `MultiSelect`: búsqueda, chips eliminables, `max`, teclado y un input oculto por valor seleccionado.
- `InputGroup` con reenvío conservador de semántica de campo al único control hijo.
- `DataTableToolbar`, `CardLoader`, `AvatarGroup`, `Footer` y mejoras de catálogo.
- Tokens semánticos generados y verificables para TypeScript, SCSS y CSS runtime.
- Entrypoints `@duralux/ui/charts`, `@duralux/ui/charts/apex` y `@duralux/ui/charts/recharts`.

### Mejorado

- Contraste, dark mode, foco, reduced motion, SSR, estados de carga/error/vacío y tablas alternativas accesibles de charts.
- Modal, toast, formularios, tablas, paginación, shell, chat, dropdown, botones y API `apiFetch`.
- `apiFetch` conserva `Response`, `credentials: 'same-origin'`, todas las formas de `HeadersInit` y sólo serializa JSON cuando corresponde; también reexporta `SESSION_EXPIRED_EVENT` como alias de compatibilidad para el evento 401.
- Empaquetado, declaraciones TypeScript, tree-shaking y gates de contrato/tamaño.
- El lifecycle `prepare` evita la recursión de empaquetado de npm 10 en Node 20/22; `deploy.sh` detecta Docker Compose v2 y el binario legacy.
- El peer opcional `apexcharts` acepta las ramas 5 y 6, compatibles con `react-apexcharts` 2.1.1.
- Se restauran los tipos públicos `Breadcrumb`/`PageHeaderBreadcrumb` y `ModalSize` para que los builds desde dependencias Git conserven el contrato de `PageHeader` y `Modal`.

### Migración rápida

```diff
- import { ApexChart, ChartCard } from '@duralux/ui'
+ import { ApexChart, ChartCard } from '@duralux/ui/charts/apex'
```

```bash
# Sólo si se usa Apex
npm install apexcharts react-apexcharts

# Sólo si se usan widgets Recharts
npm install recharts
```

Consultá los ejemplos de `SearchableSelect`, `MultiSelect`, `InputGroup` y charts en el [README](./README.md), y las validaciones/advertencias aceptadas en [docs/RELEASE_V2.md](./docs/RELEASE_V2.md).
