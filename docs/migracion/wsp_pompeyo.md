# Migración: wsp_pompeyo

- **Ruta:** `/home/admincrm/wsp_pompeyo/frontend`
- **Dependencia actual:** `"@duralux/ui": "file:./vendor/duralux-ui"`. El vendor solo trae `dist/index.js` y `dist/index.cjs` del 2026-06-26 (anterior a 1.0, sin `package.json`, sin estilos ni tipos). Destino: `github:Waryxxful/duralux-ui#a013852` (2.5.0).
- **Rol:** remoto MF que **no** comparte `@duralux/ui`.

## Qué cambia

Es la app más atrasada y la única que viola la regla «siempre vía git, nunca `file:`». El salto incluye todo lo de 1.0, 2.0 y 2.1–2.5.

## Patrones detectados

| Patrón | Dónde | Reemplazo |
|---|---|---|
| Dependencia `file:` vendorizada | `package.json:12`, `vendor/duralux-ui/` | Dependencia git por SHA; borrar `vendor/` |
| `bg-{tono}-100` (prohibido por el canon) | `src/pages/DashboardPage.tsx:115,130,139,151` (`iconBg`) | `StatsCard` con `tone` o `KpiCard` |
| `btn-outline-secondary` (prohibido) | `src/pages/ChatOperatorPage.tsx:89,649` | `Button variant="light-brand"` o `Dropdown` |
| `headerRight` deprecado | `DashboardPage.tsx:224,249,276` | `Card` con `actions` |
| Inputs date/time nativos (6) | `ChatOperatorPage.tsx:526,536` (rango), `panels/LogsPanel.tsx:74,80` (desde/hasta), `panels/BusinessHoursPanel.tsx:84,88` | `DateRangeFilter` y `TimeRangePicker` de `/antd` |
| Tablas crudas (3) | `panels/BusinessHoursPanel.tsx`, `AuditPanel.tsx`, `LogsPanel.tsx` | `Table` / `DataTable` |
| `<select>` nativo (3) | `ChatOperatorPage.tsx` | `Select` |
| Voseo en texto visible (6) | `ChatOperatorPage.tsx:440` «Revisá…», `:569` «Seleccioná…», `panels/HandoffPanel.tsx:191` «Podés…», `:225` «Escribí…», `ServicePricesPanel.tsx:152` «agregá…», `ReportsPanel.tsx:181` «Revisá…» | Tuteo: «Revisa», «Selecciona», «Puedes», «Escribe», «agrega» |
| `alert()` | `ChatOperatorPage.tsx:440` | `Toast` |
| Hex (3) | `ChatOperatorPage.tsx`, `DashboardPage.tsx` | Tokens |

## Pasos

1. Corregir voseo y clases prohibidas (independiente del SHA).
2. Cambiar a la dependencia git, borrar `vendor/`, importar los tres CSS (`bootstrap.css`, `theme.css`, `styles/grancrm-ui.css`) si corre standalone.
3. Compilar y corregir tipos y exports.
4. `/antd` para fechas y horarios; `Table` para paneles.
5. Validar en tres temas.
