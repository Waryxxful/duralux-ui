function getCsrfToken(): string {
  const match = document.cookie.match(/csrftoken=([^;]+)/);
  return match ? match[1] : '';
}

interface FetchOptions extends RequestInit {
  json?: unknown;
}

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
    window.dispatchEvent(new CustomEvent('grancrm:sessionExpired'));
  }

  return response;
}
