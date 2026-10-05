# Migración: wsp_platform

- **Ruta:** `/home/admincrm/wsp_platform/frontend`
- **SHA fijado:** `2b968ad` (2.0.0). Destino: `a013852` (2.5.0).
- **Rol:** remoto MF que **no** comparte `@duralux/ui`.

## Patrones detectados

Ninguno: 8 archivos fuente y un solo import de `@duralux/ui`, sin hex, overrides oscuros, inputs nativos ni props deprecadas.

## Pasos

1. Cambiar el SHA, reinstalar limpio y compilar.
2. Revisión visual en DEV en claro, oscuro y navy (cambios globales de Bootstrap de 2.1).
