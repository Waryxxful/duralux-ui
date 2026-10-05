# Migración: call_reviews

- **Ruta:** `/home/admincrm/call_reviews/frontend`
- **SHA fijado:** `a013852` (2.5.0 + fixes), alineado con el shell. Ya usa `@duralux/ui/antd` (3 imports).
- **Rol:** remoto MF con `@duralux/ui` singleton. Mantener su SHA idéntico al del shell y plataformas.

## Qué queda por hacer

El paquete está al día; la deuda está en el código de la app.

## Patrones detectados

| Patrón | Dónde | Reemplazo |
|---|---|---|
| `DuraluxBridge` (35 usos) | `src/components/DuraluxBridge.tsx` y consumidores (`CompliancePanel`, `CostPanel`, `DisagreementsTable`, `CallResultsTable`…) | `Card` y `LinkButton` de `@duralux/ui` directos; borrar el puente (usa `elementRef`, deprecado) |
| Hex (227) | `src/call-reviews.css`, `src/main.tsx`, `DisagreementsTable.tsx`, `ConcordancePanel.tsx`, `LiveStatusStrip.tsx`, `SourceMapPanel.tsx` | Tokens `var(--gcu-*)` |
| `.app-skin-dark` (50) y `!important` (44) | `src/call-reviews.css`, `AgentListPage.tsx`, `TrendsPage.tsx`, `AgentDetailPage.tsx`, `DashboardPage.tsx` | Tokens semánticos |
| Sticky manual | `src/main.tsx:125` (barra con `#1e2a3a`), `call-reviews.css:1020,1069,1358,1991` | `PageHeader className="sticky-top"`; `Table`/`DataTable stickyHeader`; tokens de superficie |
| `datetime-local` nativo | `src/pages/ProcessingSettingsPage.tsx:871` | `DatePicker showTime` de `/antd` |
| Selects de rango | `src/components/ConcordancePanel.tsx:20` («Últimos 30 días»), `PeriodFilter.tsx`, `dashboardPageModel.ts`, `calibrationPageModel.ts` | `DateRangeFilter` de `/antd` |
| Tablas crudas (19) | `CallResultsTable.tsx`, `CostPanel.tsx`, `ConcordancePanel.tsx`, `CallCostCard.tsx`, `SourceMapPanel.tsx`, `UploadPage.tsx` | `Table` / `DataTable` |
| `<select>` nativo (12) | `FilterSelect.tsx`, `AudioPlayer.tsx`, `EvaluationTab.tsx` | `Select` / `SearchableSelect` |
| `StatCard` propio con `iconBg` | `src/components/StatCard.tsx`, `ConfigVersionHistory.tsx:69` | `KpiCard` / `StatsCard` con `delta` y `context` |
| Voseo | `CopyConfigFrom.tsx:36` «podés», `DuraluxBridge.tsx:30` «usá» (comentarios) | «puedes», «usa» |

En 2.7 (pendiente) llegan `Transcript`, `AudioPlayer`, `CriterionRow`, `CallRow` y `CallList`: reemplazarán componentes propios de esta app.

## Pasos

1. Eliminar `DuraluxBridge` (el cambio de mayor alcance).
2. Reemplazar selects de periodo por `DateRangeFilter` y `datetime-local` por `DatePicker`.
3. Pasar `call-reviews.css` a tokens por secciones, borrando overrides oscuros.
4. Validar en DEV en tres temas. Cualquier cambio de SHA, en conjunto con shell y plataformas.
