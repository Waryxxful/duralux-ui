# Migración: dashboard-cupos

- **Ruta:** `/home/admincrm/dashboard-cupos`
- **SHA fijado:** `b2f945d` (2.0.0). Destino: `a013852` (2.5.0).
- **Rol:** remoto MF que **no** comparte `@duralux/ui` (empaqueta su copia). Puede subir a su ritmo, pero conviene alinearlo con el shell para no cargar dos versiones de CSS global.

## Qué cambia

- Detecta el tema observando `.app-skin-dark` / `data-pc-theme` (`src/App.jsx:14-26`). Con 2.1 basta leer `data-gcu-theme` de `<html>` (`light | dark | navy`), o usar `ThemeScope`. navy hoy no se detecta.
- Gráficos con paleta propia (`src/components/charts/apexTheme.js`): `ApexChart`/`ChartCard` de `@duralux/ui/charts/apex` ya tienen paleta por tema.

## Patrones detectados

| Patrón | Dónde | Reemplazo |
|---|---|---|
| Detección de tema manual | `src/App.jsx:14-26` | `data-gcu-theme` o `useThemeOptional()` |
| Hex (8) | `src/index.css`, `charts/ByEspecialidadChart.jsx`, `ByFechaChart.jsx`, `apexTheme.js`, `TreemapChart.jsx` | Tokens; paleta de `ApexChart` |
| `.app-skin-dark` (4) | `src/index.css` | Tokens |
| Sticky manual | `src/index.css:25,42`, `EspecialidadModal.jsx:88` (con `--surface-bg` propio) | `Table stickyHeader`; tokens `--gcu-surface` |
| Tablas crudas | `PivotTable.jsx`, `EspecialidadModal.jsx` | `Table` (`columns[].numeric`) |
| `iconBg` deprecado | `CuposOverview.jsx:35-59` | `StatsCard` con `tone` o `KpiCard` |
| `headerRight` y `noPad` | `PivotTable.jsx:30-31` | `Card` con `actions`; sin `noPad` |

## Pasos

1. Subir el SHA y reinstalar.
2. Reemplazar la detección de tema y la paleta propia de Apex.
3. Pasar tablas y props deprecadas.
4. Validar en DEV en tres temas.

## Bloqueos para 3.0

Usos de APIs retiradas en 3.0 (relevado el 2026-10-05). Reemplazos en `README.md` («De 2.x a 3.0»).

| API retirada | Dónde |
|---|---|
| `Card headerRight` | `src/components/PivotTable.jsx:27` |
| `Card noPad` | `src/components/PivotTable.jsx:27` |
| `StatsCard iconBg` (objetos con spread) | `src/components/CuposOverview.jsx:35,41,47,53,59` (render en `:78`) |
