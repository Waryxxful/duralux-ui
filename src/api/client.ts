/** Compatibility event emitted alongside grancrm:unauthorized on a 401 response. */
export const SESSION_EXPIRED_EVENT = 'grancrm:sessionExpired'

function getCsrfToken(): string {
  if (typeof document === 'undefined') {
    return '';
  }

  const cookie = document.cookie.split(';').find((part) => {
    const separator = part.indexOf('=');
    return separator !== -1 && part.slice(0, separator).trim() === 'csrftoken';
  });

  if (!cookie) {
    return '';
  }

  const value = cookie.slice(cookie.indexOf('=') + 1);

  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

interface FetchOptions extends RequestInit {
  json?: unknown;
}

export async function apiFetch(url: string, options: FetchOptions = {}): Promise<Response> {
  const { json, ...rest } = options;
  const body = json !== undefined ? JSON.stringify(json) : rest.body;
  const headers = new Headers(rest.headers);

  // Caller-provided values win over inferred CSRF and content type defaults.
  if (!headers.has('X-CSRFToken')) {
    headers.set('X-CSRFToken', getCsrfToken());
  }

  if (!headers.has('Content-Type') && json !== undefined) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...rest,
    credentials: 'same-origin',
    headers,
    ...(json !== undefined ? { body } : {}),
  });

  if (response.status === 401 && typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('grancrm:unauthorized'));
    // Keep the previous DOM event as a compatibility alias for existing shells.
    window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
  }

  return response;
}
