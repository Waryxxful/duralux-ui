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

## Bloqueos para 3.0

Usos de APIs retiradas en 3.0 (relevado el 2026-10-05). Reemplazos en `README.md` («De 2.x a 3.0»).

| API retirada | Dónde |
|---|---|
| `Card headerRight` | `src/pages/DashboardPage.tsx:222,247,274`, `src/panels/AdvisorsPanel.tsx:77`, `src/panels/BranchesPanel.tsx:77`, `src/panels/FiltersPanel.tsx:66`, `src/panels/LogsPanel.tsx:62`, `src/panels/PromptPanel.tsx:48`, `src/panels/QuickResponsesPanel.tsx:76`, `src/panels/ServicePricesPanel.tsx:138`, `src/panels/SnippetsPanel.tsx:59` |
| `StatsCard iconBg` | `src/pages/DashboardPage.tsx:113,128,137,149` |
| `StatsCard trend` | `src/pages/DashboardPage.tsx:113,128,137` |
| `Button outline` | `src/panels/AdvisorsPanel.tsx:103`, `src/panels/AstaraConfigPanel.tsx:117`, `src/panels/AuditPanel.tsx:86,91`, `src/panels/BotStatePanel.tsx:38`, `src/panels/BranchesPanel.tsx:103`, `src/panels/FiltersPanel.tsx:93`, `src/panels/LlmConfigPanel.tsx:94`, `src/panels/LogsPanel.tsx:65,131,136`, `src/panels/PromptPanel.tsx:62`, `src/panels/QuickResponsesPanel.tsx:106`, `src/panels/ServicePricesPanel.tsx:165,193,223`, `src/panels/SnippetsPanel.tsx:85` |
| `FormField hint` | `src/panels/AstaraConfigPanel.tsx:84,95`, `src/panels/HandoffPanel.tsx:203`, `src/panels/LlmConfigPanel.tsx:75,85`, `src/panels/QuickResponsesPanel.tsx:113,121` |
| `Input icon` | `src/panels/AstaraConfigPanel.tsx:89,103,107`, `src/panels/FiltersPanel.tsx:99`, `src/panels/LlmConfigPanel.tsx:90` |

Usa una copia vendorizada anterior a 1.0: estos usos solo bloquean cuando pase a fijar un SHA de 3.x.
