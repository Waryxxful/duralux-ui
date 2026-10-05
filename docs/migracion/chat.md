# Migración: chat (dock)

- **Ruta:** `/home/admincrm/chat/frontend`
- **SHA fijado:** `b2f945d` (2.0.0). Destino: `a013852` (2.5.0).
- **Rol:** remoto MF `chat` que **no** comparte `@duralux/ui`. Ojo: `chat-frontend` declara el mismo nombre de remoto (ver [chat-frontend.md](chat-frontend.md)).

## Qué cambia

- 2.4 refinó el chat: `ChatDaySeparator`, `groupChatMessages`, estado de entrega con ícono y texto, compositor `multiline`, lista `listbox` con no leídos, `.gcu-chat` responsivo. Revisar si el dock reimplementa algo de eso.
- Los overrides oscuros con hex no cubren navy.

## Patrones detectados

| Patrón | Dónde | Reemplazo |
|---|---|---|
| Hex (80) | `src/dock.css` (p. ej. `:541-543` `#17181d`, `#3a3b42`, `#6d84e6`), `src/styles.css`, `src/avatar.ts` | Tokens `--gcu-surface*`, `--gcu-border`, `--gcu-primary`; colores de avatar desde `Avatar` |
| `.app-skin-dark` (15) y `!important` (17) | `src/dock.css`, `src/styles.css`, `src/dev.tsx` | Tokens semánticos |
| Sticky manual | `src/styles.css:82` | Revisar contra `ChatWindow` |

`optimizeDeps.exclude: ['@duralux/ui']` en `vite.config.ts` es solo para el arnés de capturas (`VITE_MOCK=1`); no afecta producción.

## Pasos

1. Subir el SHA y reinstalar.
2. Reemplazar burbujas, separadores y compositor propios por los de 2.4 si los hay.
3. Pasar `dock.css` y `styles.css` a tokens.
4. Validar en DEV en tres temas.

## Bloqueos para 3.0

Ninguno: no usa APIs retiradas en 3.0 (relevado el 2026-10-05).
