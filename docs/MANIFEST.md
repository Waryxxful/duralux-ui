# Manifiesto de componentes

La fuente es [`manifest.json`](manifest.json): una entrada por componente exportado con `name`, `import` (entrypoint), `category`, `use` (cuándo usarlo), `avoid` (cuándo no), `alternative` y, si aplica, `status: "deprecated"`. Lo leen agentes de IA y herramientas; esta página explica cómo usarlo.

## Categorías

| Categoría | Ejemplos |
|---|---|
| `accion` | Button, IconButton, LinkButton, Dropdown |
| `formulario` | FormField, Input, Select, SearchableSelect, RadioGroup, Switch; de `/antd`: DatePicker, DateRangeFilter, NumberInput |
| `dato` | DataTable, Table, KpiCard, StatGroup, DescriptionList, List, Severity, Score |
| `grafico` | ChartCard, ApexChart, TrendLine, Sparkline, Donut, Gauge, widgets Recharts |
| `feedback` | Alert, Toast, Modal, Drawer, ConfirmDialog, EmptyState, ErrorState, Skeleton |
| `presentacion` | Card, Badge, Tag, Avatar, Tooltip, Progress |
| `composicion` | EntityCard, QuickTiles, Spotlight, WelcomeBand, DashGrid, ProcessSteps |
| `navegacion` | Tabs, Accordion |
| `layout` / `shell` / `tema` | PageHeader, AppLayout, ShellHeader, ShellNav, ThemeProvider, ThemeScope, DuraluxAntdProvider |
| `chat` | ChatWindow, ChatSidebar, ChatInputBar, MessageBubble |
| `utilidad` | log, deprecate, apiFetch |

## Próximos (pendientes de integración)

La clave `upcoming` lista lo especificado pero aún no exportado. **No se usa hasta que aparezca en `src/public/components.ts` o `src/index.ts`.**

- **2.6** (`specs/2026-10-04-2-6-patrones-shell-design.md`): AppSwitcher, TenantSwitcher, NotificationsMenu, ProfileMenu, ThemeToggle, CommandPalette; PageHeader sticky por defecto; patrones de página.
- **2.7** (`specs/2026-10-04-2-7-dominios-ia-design.md`): dominios de calidad, operación y CRM (Transcript, AudioPlayer, TargetBar, Heatmap, PipelineBoard…).
- **2.8** (mismo spec): 29 bloques de IA (AiMessage, PromptComposer, StreamingAnswer, ApprovalCard, SourceList…) y AiAvatar.

## Mantenimiento

Quien agrega, depreca o integra un componente actualiza `manifest.json` en el mismo commit (paso 7 de la receta en `AGENTS.md`). Al integrar 2.6–2.8, se mueven sus entradas de `upcoming` a `components`.
