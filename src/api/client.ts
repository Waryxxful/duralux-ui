function getCsrfToken(): string {
  const match = document.cookie.match(/csrftoken=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}

interface FetchOptions extends RequestInit {
  json?: unknown;
}

// Nombre del CustomEvent que apiFetch dispara en `window` ante un 401.
// Es un mecanismo aparte del `EventBus.emit('sessionExpired', ...)` del
// contrato (src/contract.ts): apiFetch no tiene acceso a la instancia `bus`
// que el shell inyecta como prop, así que no puede llamar `bus.emit` por sí
// mismo. Sirve para apps standalone (sin shell) que quieran reaccionar a
// una sesión expirada escuchando en `window`; las apps montadas en el shell
// deben seguir llamando `bus.emit('sessionExpired')` explícitamente tras un
// 401 (ver docs/GUIA_APP_SATELITE_UI.md). Usar esta constante en vez de
// hardcodear el string evita que un typo rompa el listener en silencio.
export const SESSION_EXPIRED_EVENT = 'grancrm:sessionExpired';

export async function apiFetch(url: string, options: FetchOptions = {}): Promise<Response> {
  const { json, ...rest } = options;
  const headers: Record<string, string> = {
    'X-CSRFToken': getCsrfToken(),
    ...(json !== undefined ? { 'Content-Type': 'application/json' } : {}),
    ...(rest.headers as Record<string, string> | undefined ?? {}),
  };

  const response = await fetch(url, {
    credentials: 'same-origin',
    ...rest,
    headers,
    ...(json !== undefined ? { body: JSON.stringify(json) } : {}),
  });

  if (response.status === 401) {
    window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
  }

  return response;
}
