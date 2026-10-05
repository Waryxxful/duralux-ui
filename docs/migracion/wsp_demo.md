# Migración: wsp_demo

- **Ruta:** `/home/admincrm/wsp_demo/frontend`
- **SHA fijado:** `89b1681` (1.0.0, anterior a 2.0). Destino: `a013852` (2.5.0).
- **Rol:** remoto MF que **no** comparte `@duralux/ui`.

## Qué cambia

Salta de 1.0 a 2.5: además de lo de `README.md`, revisar los cambios de 2.0 (tipos públicos y exports de Modal/Breadcrumb). `DataTable` (5 usos) pasa a TanStack con la misma API.

## Patrones detectados

| Patrón | Dónde | Reemplazo |
|---|---|---|
| Voseo en texto visible (12) | `src/api.ts:33` «No tenés permiso…», `pages/ChatOperatorPage.tsx:189` «Seleccioná…», `panels/FiltersPanel.tsx:44`, `QuickResponsesPanel.tsx:54`, `ScrapingConfigPanel.tsx:96`, `SnippetsPanel.tsx:47` «Agregá…», `LlmConfigPanel.tsx:41,55,67`, `ScrapingLlmConfigPanel.tsx:36,50,62` «intentá…» | «No tienes permiso…», «Selecciona…», «Agrega…», «inténtalo de nuevo» |
| `iconBg` deprecado (8) | `src/pages/DashboardPage.tsx:202-336` | `StatsCard` con `tone` o `KpiCard` |
| Select de rango | `DashboardPage.tsx:63` («Últimos 7 días») | `DateRangeFilter` de `/antd` |
| `type="time"` nativo con `style` | `src/panels/BusinessHoursPanel.tsx:35,41` | `TimeRangePicker` de `/antd` |
| Hex (5) | `ChatOperatorPage.tsx`, `DashboardPage.tsx` | Tokens |

## Pasos

1. Corregir el voseo (no depende del SHA).
2. Subir el SHA, reinstalar, compilar y corregir tipos.
3. `antd@^6` + `dayjs@^1.11` y `DuraluxAntdProvider` para horarios y periodo.
4. Validar en tres temas.

## Bloqueos para 3.0

Usos de APIs retiradas en 3.0 (relevado el 2026-10-05). Reemplazos en `README.md` («De 2.x a 3.0»).

| API retirada | Dónde |
|---|---|
| `StatsCard iconBg` | `src/pages/DashboardPage.tsx:200,215,224,236,310,318,326,334` |
| `StatsCard trend` | `src/pages/DashboardPage.tsx:200,215,224` |
| `FormField hint` | `src/panels/LlmConfigPanel.tsx:77,84`, `src/panels/ScrapingConfigPanel.tsx:66,74,79`, `src/panels/ScrapingLlmConfigPanel.tsx:70,77` |
