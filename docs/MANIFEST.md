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

## 2.6–2.8 integrados

Las entradas de 2.6 (shell), 2.7 (`dominio`) y 2.8 (`ia`) están en `components` con `since`. La clave `patterns` lista los patrones de página (`docs/PATRONES.md`, Storybook «Patrones/…») y `rules.ia` las reglas de los componentes de IA.

## Mantenimiento

Quien agrega, depreca o integra un componente actualiza `manifest.json` en el mismo commit (paso 7 de la receta en `AGENTS.md`).
