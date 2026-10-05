# Migración: grancrm-shell

- **Ruta:** `/home/admincrm/grancrm-shell`
- **SHA fijado:** `a013852` (2.5.0 + fixes). Ya está en el destino.
- **Rol:** host de Module Federation; comparte `@duralux/ui` como singleton con plataformas, call_reviews, e-learning y tablero-ti. **Su SHA manda**: lo que fija el shell es lo que corren esos remotos en runtime (ver `README.md`).

## Qué cambia para el shell

- `ThemeProvider` (en `src/Layout.tsx`) ya fija `data-gcu-theme`; el selector de tema puede ofrecer navy y sistema. En 2.6 llegará `ThemeToggle` con los cuatro modos: reemplazar el `toggleDark` actual cuando se integre.
- 2.6 (pendiente) divide `ShellHeader` en `AppSwitcher`, `TenantSwitcher`, `NotificationsMenu`, `ProfileMenu`, `ThemeToggle` sin cambiar sus props; requiere verificación visual en DEV.

## Patrones detectados

| Patrón | Dónde | Reemplazo |
|---|---|---|
| Hex en CSS (66) | `src/notifications/notification-toasts.css`, `src/assistant/ChatPanel.css`, `src/assistant/AssistantLauncher.css`, `src/pages/UserSettings/UserSettings.css` | Tokens `var(--gcu-*)` |
| `.app-skin-dark` (25) y `!important` (11) | `src/assistant/*.css`, `src/brand/brand-mark.css` | Tokens semánticos (ya cambian por tema, incluido navy) |
| `<select>` nativo (3) | `src/pages/UserSettings/ProfileTab.tsx`, `NotificationsTab.tsx`, `NotificationSettingsPage.tsx` | `Select` o `Segmented` en `FormField` |
| Prop deprecada `noPad` | `src/components/hub/AppCard.tsx:27` | `Card` sin `noPad` (o `EntityCard`) |
| Voseo | `NotificationSettingsPage.tsx:111` «Todavía no tenés…» | «Todavía no tienes…» |

`import()` en `src/main.tsx` son los `lib` del share scope de MF: correcto, no tocar.

## Pasos

1. Antes de subir el SHA del shell, preparar los remotos compartidos (plataformas, e-learning, tablero-ti) con el mismo SHA.
2. Corregir voseo, `noPad` y selects nativos.
3. Pasar los CSS del asistente y de notificaciones a tokens; quitar los overrides `.app-skin-dark`.
4. Validar en DEV en claro, oscuro y navy con cada remoto montado.

## Bloqueos para 3.0

Usos de APIs retiradas en 3.0 (relevado el 2026-10-05). Reemplazos en `README.md` («De 2.x a 3.0»).

| API retirada | Dónde |
|---|---|
| `Card noPad` | `src/components/hub/AppCard.tsx:27` |
| `Input icon` | `src/pages/UserSettings/PasswordTab.tsx:167,191,246`, `src/pages/UserSettings/ProfileTab.tsx:282,294,306,323` |
