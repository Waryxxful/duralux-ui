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

## Estado 2026-10-07: migrado a 3.0 en la rama de fusión

La migración se hizo directo de 1.0 a 3.0 (`cd062eb`), sin pasar por 2.5, en la rama
`fusion/cavem` de `wsp_demo` (worktree `/home/admincrm/wsp_demo_fusion`), que es donde viven los
perfiles de Volvo y Honda. `master` de wsp_demo sigue en `89b1681` hasta que la fusión llegue a master.

Las tablas de arriba se relevaron sobre `master` y se quedaron cortas: con la fusión, el
typecheck contra 3.0 dio **33 errores** (`StatsCard iconBg` 17, `trend` 3, `FormField hint` 14,
y los imports de `ApexChart`/`ChartCard` desde la raíz), no 18. Se sumaron la página de
Postventa y los paneles de LLM.

Qué se hizo, además de los reemplazos de la tabla de 3.0:

- `apexcharts` y `react-apexcharts` como dependencias directas (charts en `@duralux/ui/charts/apex`).
- `antd@^6` y `dayjs@^1.11`, con un solo `DuraluxAntdProvider` en `App.tsx`. Fechas del
  Dashboard y del chat → `RangePicker`; horario comercial → `TimeRangePicker`.
- Gráficos sin `colors`: la serie sale del tema. El embudo usa `theme.monochrome` con el
  `--gcu-status-primary` resuelto (la librería no expone un helper para eso, ver abajo).
- Tabla de templates → `Table`; barras del embudo → `Progress` (el `.progress` crudo deja el
  riel blanco en oscuro y navy).
- Voseo → tuteo en textos visibles.
- `tests/duralux3_canon.test.ts` falla si vuelve un hex, un input nativo de fecha u hora, una
  `<table>` cruda, `iconBg`, `hint=`, un `.progress` crudo o voseo; `tests/duralux_version.test.ts`
  exige 3.x.
- El selector de periodo del Dashboard sigue siendo `Select`: el backend recibe
  `range=7d|today|month|prev_month`, y `DateRangeFilter` entrega fechas.

Para la librería (pendiente, no bloquea):

- `ApexChart` sigue el tema en la serie categórica, pero `theme.monochrome` necesita un color
  literal. Un remoto sin `ThemeProvider` tiene que leer `--gcu-status-primary` del DOM y observar
  `<html>` para cambiar de tema. Un `monochrome: 'primary'` (o un hook público del tema de
  gráficos) evitaría ese código en cada app.
- Bootstrap deja `.progress` con `--bs-progress-bg: #f0f2f8` fijo en oscuro y navy. Sólo
  `Progress` (`gcu-progress`) lo corrige.

El shell sigue en 2.0 (`2b968ad`). Como este remoto no comparte `@duralux/ui`, en la misma
página conviven el `grancrm-ui.css` 2.0 del shell y el 3.0 del remoto: validar en DEV montado
en el shell.
