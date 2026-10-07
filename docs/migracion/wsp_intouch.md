# Migración: wsp_intouch

- **Ruta:** `/home/admincrm/wsp_intouch/frontend`
- **SHA fijado:** `cd062eb` (3.0.0) desde el 2026-10-07. Antes: `89b1681` (1.0.0).
- **Rol:** remoto MF (`wsp_intouch`) que **no** comparte `@duralux/ui`.

## Estado 2026-10-07: migrado a 3.0

Mismo código base que wsp_demo (comparten linaje: Dashboard, Chat, Leads, Campañas,
Agendamientos y los paneles de configuración), así que se migró con el mismo patrón que
`wsp_demo.md` («Estado 2026-10-07»), sin pasar por 2.5:

- Props retiradas (24 usos): `StatsCard iconBg` → `tone`, `trend` → `delta` (número) o
  `context` (los conteos `↓usuario ↑asistente` de «Mensajes hoy»), `FormField hint` → `helpText`.
  Charts desde `@duralux/ui/charts/apex`.
- 16 hex fuera: gráficos sin `colors` (la serie sale del tema) y embudo con `theme.monochrome`
  sobre `--gcu-status-primary`.
- 6 inputs nativos de fecha u hora → `RangePicker` / `TimeRangePicker` de `@duralux/ui/antd`
  (`antd@^6`, `dayjs@^1.11`, un `DuraluxAntdProvider` en `App.tsx`).
- `<table>` → `Table`; `.progress` → `Progress` (el crudo deja el riel blanco en oscuro y navy).
- 21 voseos → tuteo.
- `tests/duralux3_canon.test.ts` y `tests/duralux_version.test.ts`, como en wsp_demo.

Las ramas abiertas en ese momento (`fix/agenda-demo-llamada`, `fix/val-replay-informe`,
`integra/agenda-medicion`) no tocaban `frontend/`.

## Pendiente

- Publicar el build y revisar en DEV montado en el shell (que sigue en 2.0): conviven el
  `grancrm-ui.css` 2.0 del shell y el 3.0 del remoto.
