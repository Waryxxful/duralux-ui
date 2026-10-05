# Migración: tablero-ti

- **Ruta:** `/home/admincrm/tablero-ti/frontend`
- **SHA fijado:** `b2f945d` (2.0.0). Destino: el SHA del shell (`a013852`, 2.5.0).
- **Rol:** remoto MF con `@duralux/ui` singleton: ya corre con la 2.5 dentro del shell. Alinear SHA.

## Qué cambia

- Temas: los overrides `html.app-skin-dark` de `app.css` no cubren navy.
- Formularios con `<input>`/`<select>` crudos de Bootstrap: pasar a `FormField` + controles Duralux.
- `StatsCard iconBg` deprecado.

## Patrones detectados

| Patrón | Dónde | Reemplazo |
|---|---|---|
| `.app-skin-dark` (28) y `!important` (27) | `src/app.css`, `src/components/views/views.css`, `src/components/task/task.css` | Tokens semánticos; borrar overrides |
| Hex (4) | `src/app.css`, `views.css` | Tokens |
| Inputs date nativos (5) | `src/components/board/TaskModal.jsx:248`, `create/ProjectCreateForm.jsx:80,83`, `settings/ProjectTab.jsx:64,67` | `DatePicker` (vencimiento) y `RangePicker` (inicio/fin) de `@duralux/ui/antd`; borrar el parche `color-scheme` de `app.css:181` |
| `<select>` nativo (10) | `KanbanBoard.jsx`, `TaskModal.jsx`, `RecurrenceField.jsx`, `ProjectCreateForm.jsx`, `ProjectTab.jsx`, `BoardSettings.jsx` | `Select` / `SearchableSelect` en `FormField` |
| `<input className="form-control">` crudo | mismos formularios | `Input` en `FormField` (error con `error`, no `is-invalid`) |
| Tablas crudas y referencias a `table-striped` | `views/MetricsView.jsx`, `settings/BoardSettings.jsx`, `app.css:167-169` | `Table` |
| `iconBg` deprecado | `projects/ProjectsOverview.jsx:165-174` | `StatsCard` con `tone` o `KpiCard` |
| `sticky-top` en PageHeader | `pages/*.jsx` (5) | Mantener hasta 2.6; luego quitar |

## Pasos

1. Subir el SHA junto con el shell.
2. Migrar los formularios de proyecto y tarea a `FormField` + `/antd`.
3. Pasar `app.css` y `views.css` a tokens.
4. Validar en DEV en tres temas.
