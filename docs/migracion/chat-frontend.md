# Migración: chat-frontend (chat-remote)

- **Ruta:** `/home/admincrm/chat-frontend` (paquete `chat-remote`)
- **SHA fijado:** `b2f945d` (2.0.0). Destino: `a013852` (2.5.0).
- **Rol:** remoto MF que **no** comparte `@duralux/ui`.

## Antes de migrar

`chat-frontend/vite.config.ts` y `chat/frontend/vite.config.ts` declaran el mismo remoto (`name: 'chat'`). Confirmar cuál publica el manifiesto del shell; si `chat-frontend` quedó reemplazado por `chat/frontend`, archivarlo en vez de migrarlo.

## Patrones detectados

| Patrón | Dónde | Reemplazo |
|---|---|---|
| Hex (3) | `src/avatar.ts` | `Avatar` (iniciales con color por tokens) |
| `!important` (5) y `.app-skin-dark` (1) | `src/styles.css` | Tokens semánticos |

Uso acotado de `@duralux/ui` (6 imports): la migración es solo cambio de SHA y limpieza de `styles.css`.

## Pasos

1. Decidir si sigue vigente (ver arriba).
2. Si sigue: subir SHA, limpiar `styles.css` y `avatar.ts`, validar en tres temas.

## Bloqueos para 3.0

Ninguno: no usa APIs retiradas en 3.0 (relevado el 2026-10-05).
