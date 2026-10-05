# Migración: e-learning

- **Ruta:** `/home/admincrm/e-learning`
- **SHA fijado:** `2b968ad` (2.0.0). Destino: el SHA del shell (`a013852`, 2.5.0).
- **Rol:** remoto MF con `@duralux/ui` singleton: dentro del shell ya corre con la 2.5. Alinear SHA.

## Qué cambia

- Sin hex ni overrides oscuros: la app está limpia de deuda CSS.
- `PageHeader className="sticky-top"` (21 usos) cumple la regla vigente; al integrar 2.6 se quita la clase.
- Muchas props deprecadas de `Card` y `StatsCard` (avisos en consola de dev).

## Patrones detectados

| Patrón | Dónde | Reemplazo |
|---|---|---|
| Inputs date nativos (6) | `src/paginas/Reportes.tsx:83,86` (desde/hasta), `GestionCursos.tsx:106`, `Asignaciones.tsx:90,107,110` | `DateRangeFilter` en Reportes; `DatePicker` en el resto (`@duralux/ui/antd`) |
| Select de rango | `src/paginas/Panel.tsx:15` («Últimos 90 días») | `DateRangeFilter` con presets |
| `headerRight` deprecado | `Reportes.tsx:99,114`, `GestionCursos.tsx:332`, `DetalleCurso.tsx:20`, `Panel.tsx:103,117`, `Resultado.tsx:196` | `Card` con `actions` |
| `iconBg` deprecado | `Panel.tsx:96` (`StatsCard`) | `StatsCard` sin `iconBg` (tono por `tone`) o `KpiCard` |
| `style={{ width: 150 }}` | `GestionCursos.tsx:106` | Ancho por contenedor o `controlSize` |
| `sticky-top` | `App.tsx:34`, `Reportes.tsx:62`, `GestionCursos.tsx:390`, `DetalleCurso.tsx:65,88`, `Panel.tsx:78`… | Mantener hasta 2.6; luego quitar |

`lazy(() => import('../componentes/VisorPdf'))` es válido en una app.

## Pasos

1. Subir el SHA junto con el shell.
2. Agregar `antd@^6` y `dayjs@^1.11`, `DuraluxAntdProvider` en la raíz y reemplazar los inputs date.
3. Reemplazar `headerRight` e `iconBg`.
4. Validar en DEV en tres temas.

## Bloqueos para 3.0

Usos de APIs retiradas en 3.0 (relevado el 2026-10-05). Reemplazos en `README.md` («De 2.x a 3.0»).

| API retirada | Dónde |
|---|---|
| `Card headerRight` | `src/paginas/Asignaciones.tsx:176`, `src/paginas/Aula.tsx:129`, `src/paginas/DetalleCurso.tsx:20`, `src/paginas/Evaluacion.tsx:74,90`, `src/paginas/FichaAgente.tsx:117,131`, `src/paginas/GestionCursos.tsx:325`, `src/paginas/MiAprendizaje.tsx:190`, `src/paginas/Panel.tsx:103,117`, `src/paginas/Reportes.tsx:99,114`, `src/paginas/Resultado.tsx:196` |
| `Table ariaLabel` | `src/paginas/DetalleCurso.tsx:21`, `src/paginas/FichaAgente.tsx:118`, `src/paginas/GestionCursos.tsx:300`, `src/paginas/MiAprendizaje.tsx:191`, `src/paginas/Panel.tsx:104`, `src/paginas/Resultado.tsx:220` |
| `StatsCard iconBg` | `src/paginas/Panel.tsx:96` |
