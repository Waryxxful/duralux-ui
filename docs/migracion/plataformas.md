# Migración: plataformas

- **Ruta:** `/home/admincrm/plataformas/frontend`
- **SHA fijado:** `7d0f41e` (2.0.0). Destino: el mismo SHA que el shell (`a013852`, 2.5.0).
- **Rol:** remoto MF con `@duralux/ui` singleton. **Hoy está desalineado con el shell**: dentro del shell ya corre con la 2.5 del shell aunque su build sea contra 2.0. Prioridad alta.

## Qué cambia

- Temas: los overrides `.app-skin-dark` no cubren navy; pasar a tokens.
- `DataTable` (4 usos) pasa a TanStack con la misma API: probar orden, paginación y acciones de fila; aprovechar `density`, `stickyHeader`, `error` + `onRetry`.
- `Input type="date"` usa `invalid` (deprecado) y debería ser `DatePicker`/`RangePicker` de `/antd`.
- PageHeader (6 usos): hoy hay CSS propio `plt-page-header-sticky`; usar `className="sticky-top"` y, con 2.6, nada.

## Patrones detectados

| Patrón | Dónde | Reemplazo |
|---|---|---|
| Hex (83) | `src/styles/llamadas-en-espera-toasts.css`, `report-charts.css`, `campanas-hint.css`, `src/lib/chartPalette.ts`, `src/lib/reportLabels.ts`, `src/components/ReportPanels.tsx` | Tokens; paleta de gráficos desde `ChartCard`/`ApexChart` (ya es por tema) |
| `.app-skin-dark` (24) | mismos CSS y `ReportPanels.tsx` | Tokens semánticos |
| Sticky manual | `src/styles/page-header-sticky.css:13`, `report-charts.css:180,193,203` | `PageHeader className="sticky-top"`; `Table stickyHeader` para encabezados de tabla |
| Inputs date nativos (7) | `src/pages/ModuloReportePage.tsx:233,242,342,353,362,411` | `DateRangeFilter` (desde/hasta con presets) o `DatePicker` de `@duralux/ui/antd` |
| Prop `invalid` | `ModuloReportePage.tsx:411` | `aria-invalid` o `error` de `FormField` |
| Tablas crudas (5) | `src/components/MoverCargaForm.tsx`, `ReportPanels.tsx` | `Table` o `DataTable` |
| `<select>` nativo | `src/components/mantenedor/FilterField.tsx` | `Select` / `SearchableSelect` |
| `noPad={false}` | `ReportPanels.tsx:1882` | Quitar la prop |

`lazy(() => import('./pages/ModuloReportePage'))` en `src/App.tsx` es válido en una app.

## Pasos

1. Subir el SHA junto con el shell y call_reviews (mismo SHA en los tres).
2. Agregar `antd@^6` y `dayjs@^1.11`; montar `DuraluxAntdProvider` en `ModuloReportePage` y reemplazar los inputs date.
3. Pasar CSS de reportes, toasts y hints a tokens; borrar `page-header-sticky.css`.
4. Probar `DataTable` y validar en DEV en tres temas.
