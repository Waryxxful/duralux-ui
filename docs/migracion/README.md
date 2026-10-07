# Migración de apps a @duralux/ui (2.5 y 3.0)

Una guía por app consumidora. Cada guía indica el SHA que fija hoy, qué cambia al subir y los patrones detectados con `grep` en su código (relevado el 2026-10-04, solo lectura). La ejecución de cada migración es aparte (spec maestro §10): estas guías no se aplican solas.

## Apps y SHA actual

| App | Ruta | SHA fijado | Versión | Module Federation | `@duralux/ui` compartido (singleton) | Guía |
|---|---|---|---|---|---|---|
| Shell GranCRM | `grancrm-shell` | `a013852` | 2.5.0 + fixes | host | sí | [grancrm-shell.md](grancrm-shell.md) |
| Plataformas | `plataformas/frontend` | `7d0f41e` | 2.0.0 | remoto | sí | [plataformas.md](plataformas.md) |
| Call Reviews | `call_reviews/frontend` | `a013852` | 2.5.0 + fixes | remoto | sí | [call_reviews.md](call_reviews.md) |
| E-learning | `e-learning` | `2b968ad` | 2.0.0 | remoto | sí | [e-learning.md](e-learning.md) |
| Tablero TI | `tablero-ti/frontend` | `b2f945d` | 2.0.0 | remoto | sí | [tablero-ti.md](tablero-ti.md) |
| Dashboard de cupos | `dashboard-cupos` | `b2f945d` | 2.0.0 | remoto | no | [dashboard-cupos.md](dashboard-cupos.md) |
| Chat (dock) | `chat/frontend` | `b2f945d` | 2.0.0 | remoto | no | [chat.md](chat.md) |
| Chat remoto (`chat-remote`) | `chat-frontend` | `b2f945d` | 2.0.0 | remoto | no | [chat-frontend.md](chat-frontend.md) |
| WSP Platform | `wsp_platform/frontend` | `2b968ad` (master); `cd062eb` en la rama local `feat/duralux-ui-3` | 2.0.0; 3.0.0 en la rama | remoto | no | [wsp_platform.md](wsp_platform.md) |
| WSP InTouch | `wsp_intouch/frontend` | `cd062eb` | 3.0.0 | remoto | no | [wsp_intouch.md](wsp_intouch.md) |
| WSP Cavem | `wsp_cavem/frontend` | `89b1681` | 1.0.0 (llega a 3.0 con la fusión de wsp_demo) | remoto | no | [wsp_cavem.md](wsp_cavem.md) |
| WSP Demo | `wsp_demo/frontend` | `89b1681` (master); `cd062eb` en la rama `fusion/cavem` | 1.0.0; 3.0.0 en la fusión | remoto | no | [wsp_demo.md](wsp_demo.md) |
| WSP Pompeyo | `wsp_pompeyo/frontend` | `file:./vendor/duralux-ui` (dist del 2026-06-26) | anterior a 1.0 | remoto | no | [wsp_pompeyo.md](wsp_pompeyo.md) |
| Scraper | `scraper/frontend` | `6b3757c` | 1.0.0 | remoto | no | [scraper.md](scraper.md) |

SHA destino recomendado: la punta de `spec/design-system-2x` al momento de migrar (hoy `a013852`, versión 2.5.0), el mismo que ya fijan el shell y call_reviews.

## Alinear el SHA entre shell, plataformas y call_reviews (y todo remoto que comparta)

El shell, plataformas, call_reviews, e-learning y tablero-ti declaran `'@duralux/ui': { singleton: true, requiredVersion: '^2.0.0' }` en `vite.config`. Con singleton, Module Federation sirve **una sola copia** a todos: la de versión más alta disponible en el share scope. Consecuencias:

- Hasta 2.0.0 todas las copias decían `2.0.0`, así que MF no distinguía SHA distintos (lo advierten los comentarios de `grancrm-shell/vite.config.ts` y `plataformas/frontend/vite.config.ts`).
- Desde 2.5.0 la versión sí sube. Un remoto fijado en 2.0.0 que corre dentro del shell **recibe en runtime la 2.5 del shell**, aunque su build y sus tests se hicieron contra 2.0. Lo que ves en DEV no es lo que probaste localmente.
- Regla: **shell, plataformas y call_reviews fijan el mismo SHA**, y los demás remotos que comparten (e-learning, tablero-ti) también. Se suben juntos, en el mismo ciclo de despliegue: primero se valida en DEV con el shell, luego se cambian los remotos.
- Los remotos que no comparten (`dashboard-cupos`, `chat`, `wsp_*`, `scraper`) empaquetan su propia copia: pueden subir a su ritmo, pero conviven en la misma página con la del shell (dos copias de CSS global). Conviene alinearlos también para no tener dos versiones de `grancrm-ui.css` peleando.
- No existe el subpath `@duralux/ui/agent` que mencionan los comentarios de los `vite.config`: el motivo real para compartir es el estado de tema y la consistencia de CSS.

## Qué cambia al subir de 2.0 a 2.5

Detalle en `CHANGELOG.md`. Lo que más afecta a las apps:

1. **Temas (2.1).** `ThemeMode` = `light | dark | navy | system`. `ThemeProvider` fija `data-gcu-theme` en `<html>` además de `.app-skin-dark` (en dark y navy). `mode === 'dark'` ya no basta: usa `dark` o `resolved` de `useTheme()`. Los overrides `.app-skin-dark` de las apps deben pasar a tokens `var(--gcu-*)`, que ya cambian por tema (también en navy, donde un hex fijo se ve mal).
2. **Bootstrap recalculado (2.1).** Paletas `--bs-*` de marca, Inter, radios, controles de 36 px. Revisar layouts que dependían de alturas o paddings exactos.
3. **Formularios (2.3).** `FormField` usa grilla por contenedor (apila en angosto). `controlSize`. Deprecados: `invalid` (usa `aria-invalid` o el error de `FormField`), `icon`/`prefix` de `Input`, `hint` de `FormField`. Las reglas genéricas de input ya no alcanzan a los inputs de antd (fix posterior a 2.5.0).
4. **Card e indicadores (2.3–2.4).** Deprecados `noPad`, `headerRight`, `elementRef` de `Card`; `iconBg` y `trend` de `StatsCard`; `bg`/`trend`/`trendUp` de `ColoredStatCard`; `iconBg` de `Timeline`; `noPad` de `ChartCard`. Siguen funcionando con aviso en consola (dev) hasta 3.0. Usar `delta` y `context` en indicadores.
5. **Tablas (2.4–2.5).** Toda `.table` cambia: celdas centradas, encabezado 11 px, paginación con botones de 32 px. `DataTable` pasa a TanStack Table con la misma API más orden múltiple, menú de columnas, `density`, `stickyHeader`, `virtualized`, `error`/`onRetry` y `renderBulkActions`. Las tablas crudas (`<table className="table">`) deberían pasar a `Table` o `DataTable`.
6. **Componentes nuevos (2.5).** Tooltip, Segmented, Switch, Drawer, Skeleton, Tag, KpiCard, StatGroup, DescriptionList, BulkBar, ActiveFilters, EntityCard, etc. Ver `docs/manifest.json`.
7. **antd (2.2, 2.5.1).** `@duralux/ui/antd` con `DuraluxAntdProvider`, `DatePicker`, `DateRangeFilter`, `TimePicker`, `TimeRangePicker`, `NumberInput`, `TreeSelect`, `FileDrop`, etc. Requiere `antd@^6` y `dayjs@^1.11` en la app. Reemplaza `<input type="date|time|datetime-local">` y los `<select>` de «Últimos N días». Nunca importar `antd` directo.
8. **PageHeader sticky.** Hoy la regla es `PageHeader className="sticky-top"` (`PAGE-STRUCTURE.md`). En **2.6** (pendiente de integración) PageHeader será sticky por defecto con sombra al hacer scroll: al subir a 2.6 se quita `sticky-top` y todo CSS sticky propio del encabezado.

## De 2.x a 3.0

3.0 retira todo lo que 2.1–2.8 marcaron como deprecado. No hay componentes nuevos ni cambios visuales: solo se borran props, campos, tipos y un componente. En 2.x cada uso avisaba en consola (`[duralux] Deprecado: …`); en 3.0 el aviso desaparece y el uso deja de funcionar. En TypeScript falla el typecheck; en JavaScript la prop se ignora o, si el componente reenvía el resto de props, llega al DOM como atributo desconocido.

### Reemplazos

| Retirado (2.x) | Componente | Reemplazo en 3.0 |
|---|---|---|
| `headerRight` | `Card` | `actions` |
| `noPad` | `Card`, `ChartCard` | `noPadding` (`noPad={false}`: quitar la prop) |
| `elementRef` | `Card` | `ref` (Card reenvía el ref al `<div class="card">`) |
| `outline` | `Button`, `LinkButton`, `IconButton` | Quitar la prop (ya se ignoraba). Secundario: `variant="light-brand"`; destructivo: `variant="danger"` |
| `trend` (`{ value, up }`) y tipo `StatsCardTrend` | `StatsCard` | `delta={{ value: número, unit, label, goodWhen }}` |
| `iconBg` | `StatsCard` | `tone` (`"primary"`, `"info"`, `"success"`, `"warning"`, `"danger"`, `"teal"`…). `bg-soft-info text-info` → `tone="info"` |
| `bg` | `ColoredStatCard` | `tone` (`bg-primary` → `tone="primary"`). `bg-light` ya no tiene equivalente: usa `StatsCard` o `KpiCard` |
| `trend` + `trendUp` | `ColoredStatCard` | `delta={{ value: número, unit }}` (el signo define la flecha) |
| `icon` | `Input` | `startAddon={<i className="feather-…" aria-hidden="true" />}` |
| `prefix` | `Input` | `startAddon` |
| `invalid` | `Input`, `Select`, `Textarea`, `Checkbox`, `Radio` | `error` (booleano o texto) o el `error` de `FormField` |
| `hint` | `FormField` | `helpText` |
| `iconBg` (campo del ítem) | `Timeline` | `variant` (o `color`, alias que se mantiene) |
| `striped` | `Table` | Quitar la prop (ya se ignoraba; el canon es `table-hover`) |
| `header`, `renderHeader` | `Table` | `head` |
| `renderBody` | `Table` | `body` |
| `ariaLabel` | `Table` | `aria-label` |
| `ResponsiveTable` y tipo `ResponsiveTableProps` | — | `Table` y `TableProps` (Table ya trae el contenedor con scroll) |

`deprecate()` sigue exportado para las deprecaciones de 3.x. `Timeline.color`, `Timeline.time`, `TableColumn.header`, `Tabs.ariaLabel` y el mapeo de variantes no canónicas de `Button` (`outline-primary` → `light-brand`, con aviso) no estaban deprecados y se mantienen.

### Module Federation

- Shell, plataformas, call_reviews, e-learning y tablero-ti comparten `@duralux/ui` como singleton con `requiredVersion: '^2.0.0'`. Al subir a 3.0 hay que cambiarlo a `'^3.0.0'` en los cinco `vite.config` en el mismo ciclo.
- Un remoto compartido que siga compilado contra 2.x recibe la 3.0 del shell en runtime. Las props retiradas fallan en silencio (se pierden acciones de cabecera, estilos de error o tonos), pero **`ResponsiveTable` rompe el render**: el import llega como `undefined`. Ningún remoto compartido puede usar `ResponsiveTable` cuando el shell suba.
- Orden: migrar primero los usos de cada remoto compartido (con 2.8, donde las APIs nuevas ya existen), desplegar, y recién entonces subir el SHA del shell y de todos a 3.0.

### Usos por app (relevado el 2026-10-05, solo lectura)

| App | Usos que bloquean 3.0 |
|---|---|
| grancrm-shell | 8: `Card noPad` (1), `Input icon` (7) |
| plataformas | 43: `Input invalid` (17), `Select invalid` (17), `ColoredStatCard bg` (7), `ChartCard noPad` (1), `ResponsiveTable` (1) |
| call_reviews | 12: `ResponsiveTable` (9), `Card elementRef` vía `DuraluxBridge` (1), `Button outline` (1), `Timeline iconBg` (1) |
| e-learning | 21: `Card headerRight` (14), `Table ariaLabel` (6), `StatsCard iconBg` (1) |
| tablero-ti | 4: `StatsCard iconBg` |
| dashboard-cupos | 3 sitios: `StatsCard iconBg` (5 objetos que llegan por spread), `Card headerRight` y `noPad` |
| wsp_demo | Migrado a 3.0 en la rama `fusion/cavem` (2026-10-07); `master` sigue en 1.0. Ver la guía |
| wsp_pompeyo | 47 (copia vendorizada anterior a 1.0): `Button outline` (17), `Card headerRight` (11), `FormField hint` (7), `Input icon` (5), `StatsCard iconBg` (4) y `trend` (3) |
| scraper | 15: `ColoredStatCard bg` (8) y `trend`/`trendUp` (2), `StatsCard iconBg` (4), `Timeline iconBg` (1) |
| wsp_intouch | Migrado a 3.0 en `master` (2026-10-07, `c464e23`) |
| wsp_cavem | Sin migrar aparte: llega a 3.0 con la fusión de wsp_demo. Ver la guía |
| chat, chat-frontend, wsp_platform | Ninguno (wsp_platform ya fijado en 3.0 en una rama, ver la guía) |

El detalle por archivo está en la guía de cada app («Bloqueos para 3.0»).

## Pasos comunes

1. Rama en la app. Cambiar el SHA de `@duralux/ui` en `package.json` y reinstalar limpio (`rm -rf node_modules && pnpm install`: pnpm cachea por commit).
2. Si la app usará `/antd`: agregar `antd@^6` y `dayjs@^1.11`, y montar un `DuraluxAntdProvider` cerca de la raíz de la vista.
3. Compilar y correr los tests de la app. Corregir tipos de `ThemeMode` si aparecen.
4. Revisar la consola en dev: cada `[duralux] … deprecado` indica una prop a reemplazar.
5. Aplicar los reemplazos de la guía de la app, de mayor a menor impacto: hex y `.app-skin-dark` → tokens; inputs de fecha → `/antd`; tablas crudas → `Table`/`DataTable`; props deprecadas.
6. Validar en DEV montada en el shell, en claro, oscuro y navy.
7. Para remotos compartidos: coordinar el SHA con el shell (sección anterior).
