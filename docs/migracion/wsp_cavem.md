# Migración: wsp_cavem

- **Ruta:** `/home/admincrm/wsp_cavem/frontend`
- **SHA fijado:** `89b1681` (1.0.0).
- **Rol:** remoto MF (`wsp_cavem`) que **no** comparte `@duralux/ui`.

## No se migra por separado

wsp_cavem y wsp_demo convergen: la rama `fusion/cavem` de wsp_demo es cavem más un perfil por
cliente, y su Tarea 11 lleva esa rama a wsp_cavem para dejar los dos árboles iguales. El frontend
de cavem no cambió desde que se hizo la fusión, y la fusión ya está en 3.0 (ver
`wsp_demo.md`, «Estado 2026-10-07»). Migrarlo aparte sólo generaría conflictos en ese merge.

Cuando la Tarea 11 llegue a cavem, este frontend queda en 3.0 sin trabajo adicional.
