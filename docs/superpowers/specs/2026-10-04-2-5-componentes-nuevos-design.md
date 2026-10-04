# 2.5 — Componentes nuevos y DataTable sobre TanStack (sub-spec + plan)

Deriva del spec maestro §9 (subproyecto 3). Se porta el **comportamiento** y el patrón de `intouch-ui` (`/home/admincrm/intouch-ui/src/components`), nunca su estética Vireo: sin clases `ax-*` ni `itc-*`; todo con tokens `--gcu-*`, canon de clases Duralux y la receta `docs/RECETA-COMPONENTE.md`. Cada componente nace en TSX, con CSS propio, tests, story en tres temas y textos en español.

## Lotes

### N1 — Controles y estructura (`src/components/ui`, `form`, `layout`)

| Componente | Comportamiento clave |
|---|---|
| `Tooltip` | Aparece con hover (tras 400 ms) y con foco; `aria-describedby`; Esc lo cierra; posición con CSS anchor o cálculo simple; nunca única fuente de información |
| `Segmented` | Grupo de opciones exclusivas (`role="radiogroup"`), flechas para moverse, indicador animado |
| `Switch` | `role="switch"`, `aria-checked`, etiqueta clicable, tamaños sm/md |
| `RadioGroup` / `Fieldset` | Agrupan con `<fieldset>` + `<legend>`; orientación horizontal/vertical; error del grupo |
| `ChoiceCard` | Tarjeta seleccionable (radio o checkbox) con título, descripción e ícono |
| `Accordion` | Patrón APG (botón con `aria-expanded`, región), uno o varios abiertos, animación de altura con reduced-motion |
| `Drawer` | Panel lateral con foco atrapado, Esc, overlay, tamaños sm/md/lg, encabezado y pie fijos |
| `Divider`, `Kbd`, `Spinner`, `Skeleton`, `Tag` | Primitivas: Skeleton usa `.gcu-skeleton`; Tag removible con botón accesible |

### N2 — Datos y composición (`src/components/data`, `composition`)

| Componente | Comportamiento clave |
|---|---|
| `KpiCard` | Cifra + contexto obligatorio (meta, variación o tendencia) + tono; `tabular-nums` |
| `StatGroup` | Fila de 2–4 métricas relacionadas en una sola card (reemplaza 4 StatsCard iguales) |
| `Severity` | Marcador con forma propia (rombo crítico, anillo advertencia, punto normal) + etiqueta; `severityOf(valor, umbrales)` |
| `Score` / `ScoreHero` | Puntaje sobre 100 con rango ok/medio/bajo/anulado y texto |
| `DescriptionList` | Pares etiqueta/valor en 1–3 columnas, valores vacíos como «—» |
| `List` | Lista de entidades con avatar, meta y acción; seleccionable (`listbox`) opcional |
| `ActiveFilters` | Chips de filtros aplicados, quitar uno o «Limpiar filtros» |
| `BulkBar` | Barra de selección masiva («3 seleccionados» + acciones), aparece con animación |
| `Person` | Avatar + nombre + rol en una línea |
| `EntityCard` / `RankList` / `QuickTiles` | Directorio: tarjeta de entidad interactiva, ranking con barra, tiles de acción |
| `ProcessSteps` / `AppStatusCard` | Pasos de un proceso con estado; tarjeta de estado de una app conectada |
| `WelcomeBand` / `Spotlight` | Cabecera «qué atender primero» con acción; cifra protagonista (1 por página) |
| `DashGrid` | Grilla de 12 columnas con filas permitidas (12, 8+4, 7+5, 6+6, 4+4+4, 3+3+3+3) |
| `Sparkline`, `TrendLine`, `Gauge`, `Donut` | En `@duralux/ui/charts/apex`: tamaños compactos, paleta del tema, alternativa textual |

### N3 — DataTable sobre TanStack (`src/components/data/DataTable`)

- `@tanstack/react-table` pasa a `dependencies` (headless; la presentación sigue siendo `.table.table-hover`).
- **Compatibilidad:** las props públicas actuales no cambian y `test/DataTable.test.jsx` pasa sin modificar expectativas.
- **Nuevo (props aditivas):** columnas visibles (`columnVisibility` + menú), orden múltiple con Shift, filas fijas de encabezado (`stickyHeader`), selección con `BulkBar`, densidad (`density="compact" | "comfortable"`), virtualización opcional (`virtualized` con `@tanstack/react-virtual`) para más de 500 filas.
- Se divide el componente (hoy 23 KB) en módulos: tabla, toolbar, paginación, selección. Cierra el hallazgo «componente grande» de react-doctor.

## Entregas

- **2.5.0** = N1 + N2 + N3, publicada, desplegada en DEV con capturas de apps y diferencia de píxeles contra 2.4.
