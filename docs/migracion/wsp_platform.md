# Migración: wsp_platform

- **Ruta:** `/home/admincrm/wsp_platform/frontend`
- **SHA fijado:** `2b968ad` (2.0.0). Destino: `a013852` (2.5.0).
- **Rol:** remoto MF que **no** comparte `@duralux/ui`.

## Patrones detectados

Ninguno: 8 archivos fuente y un solo import de `@duralux/ui`, sin hex, overrides oscuros, inputs nativos ni props deprecadas.

## Pasos

1. Cambiar el SHA, reinstalar limpio y compilar.
2. Revisión visual en DEV en claro, oscuro y navy (cambios globales de Bootstrap de 2.1).

## Bloqueos para 3.0

Ninguno: no usa APIs retiradas en 3.0 (relevado el 2026-10-05).

## Estado 2026-10-07: fijado en 3.0 en una rama

`package.json` declaraba `@duralux/ui` sin SHA (la versión la decidía el lock, y el
`node_modules` instalado traía 1.0.0). Se fijó en `cd062eb` (3.0.0) en la rama local
`feat/duralux-ui-3` (`ecaa598`): no hizo falta tocar código, sólo el lock, un test que exige 3.x
(`src/duralux_version.test.ts`) y `vitest` limitado a `src/**`. Tests, `tsc` y build pasan; el
catálogo se revisó en claro, oscuro y navy.

**No está en `master`:** al migrar había cambios sin commitear de otra sesión en
`frontend/` (`manifest.ts`, `CatalogPage.tsx`, `pnpm-lock.yaml`, desde el 2026-09-21) que chocan
con el lock. Integrar la rama cuando ese trabajo se cierre.

⚠️ `vite.config.ts` tiene `outDir: '/home/admincrm/staticfiles/mf/wsp'`: `pnpm build` publica.
Para verificar, `vite build --outDir /tmp/...`.
