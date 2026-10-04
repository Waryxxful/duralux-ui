# 2.3–2.4 — Refinamiento del núcleo (sub-spec + plan)

Deriva del spec maestro §5.1, §5.1.1 y §6 (subproyecto 2). El objetivo «termina todas las entregas» autoriza ejecutarlo sin esperar aprobación por entrega.

## Objetivo

Cada componente existente cumple la **definición de terminado** (spec §5.1) siguiendo `docs/RECETA-COMPONENTE.md` (ejemplar: Button). Al terminar baja la deuda: `!important`, selectores `.app-skin-dark` y hex del presupuesto CSS; react-doctor ≥ 75; demo Vite reemplazada por stories.

## Lotes (áreas disjuntas: se pueden trabajar en paralelo)

| Lote | Componentes | Defectos que cierra |
|---|---|---|
| L1 Formularios | Input, Textarea, Select, Checkbox, Radio, FileInput, InputGroup, FormField, SearchableSelect, MultiSelect | DX-010 (FileInput oscuro), DX-017 (estado ajustado tras prop en SearchableSelect / selectCoreModel) |
| L2 Feedback y capas | Alert, Modal, Toast, Dropdown, ConfirmDialog, EmptyState, ErrorState, LoadingState, CardLoader | DX-019 (Modal → `<dialog>` o patrón APG completo, sin regresión de foco), DX-016 (Tabs no aplica), entrada/salida animadas |
| L3 Presentación | Badge, Avatar, AvatarGroup, Card, Progress, ProgressRing, Timeline, ActivityFeed, Tabs, Icon | DX-016 (Tabs: setState en efecto y estado al padre vía efecto), DX-029 (Card en inglés), DX-034 (Icon descarta rest) |
| L4 Indicadores | StatsCard, MiniStatCard, ColoredStatCard, QuickLinkGrid, ConnectionCard, ChartMetricsFooter, GranCrmExtras (CardHeader, CardBody, CardFooter, StatusBadge, StatusButton, StatCard) | DX-020 (role en StatsCard), DX-021 (export no-componente en GranCrmExtras) |
| L5 Tablas | Table, ResponsiveTable, Pagination, DataTableToolbar | DX-039 (alineación vertical), DX-040 (filas atenuadas en oscuro) |
| L6 Gráficos | ApexChart, ChartCard, ChartLegend, Area/Bar/Line/PieChartWidget | DX-004 (interactivo anidado), DX-006 (nivel de encabezado), DX-023 (tipos públicos inseguros), DX-031 (test intermitente) |
| L7 Chat | ChatBubble, MessageBubble, ChatInputBar, ChatSidebar, ChatWindow | DX-017 (ChatSidebar) |

Layout y shell (AppLayout, Header, Sidebar, PageHeader, Footer, AuthLayout, ShellHeader, ShellNav, ThemeScope) van en 2.6 (subproyecto 4). DataTable va en 2.5 sobre TanStack.

## Reglas para cada lote

- Seguir `docs/RECETA-COMPONENTE.md` al pie de la letra (TDD, TSX + forwardRef, API congelada con `deprecate`, CSS en `src/styles/components/<nombre>.css`, story en `stories/componentes/<Área>/`, logging).
- Borrar de `src/styles/grancrm-ui.css` y del SCSS las reglas que el CSS nuevo reemplaza, incluidos los overrides `.app-skin-dark` del componente: la deuda debe bajar.
- Los tests existentes del componente siguen pasando sin cambios de expectativa, salvo correcciones de defectos documentadas.
- Página de la demo Vite del área: se reemplaza por stories (la demo se elimina en 2.4 cuando no quede ninguna página).
- `npm test`, `npm run build` y captura de Storybook con axe en claro, oscuro y navy en verde antes de entregar.

## Entregas

- **2.3.0:** L1, L2, L3 (+ despliegue DEV y capturas de apps).
- **2.4.0:** L4, L5, L6, L7 + eliminación de la demo Vite + react-doctor ≥ 75.
