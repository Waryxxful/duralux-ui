import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { apiFetch, SESSION_EXPIRED_EVENT } from '../src/api/client';

describe('apiFetch', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));
    document.cookie = 'csrftoken=cookie-token; path=/';
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    fetchMock.mockReset();
    document.cookie = 'csrftoken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
  });

  test('conserva los headers de objeto y añade el CSRF por defecto', async () => {
    await apiFetch('/resource', {
      headers: {
        'X-Request-ID': 'request-1',
      },
    });

    const [, init] = fetchMock.mock.calls[0];
    const headers = new Headers(init.headers);
    expect(headers.get('X-Request-ID')).toBe('request-1');
    expect(headers.get('X-CSRFToken')).toBe('cookie-token');
    expect(init.credentials).toBe('same-origin');
  });

  test('acepta una instancia Headers y respeta sus valores case-insensitive', async () => {
    const callerHeaders = new Headers({
      'x-csrftoken': 'caller-token',
      'content-type': 'application/vnd.api+json',
      'X-Request-ID': 'request-2',
    });

    await apiFetch('/resource', {
      headers: callerHeaders,
      json: { enabled: true },
    });

    const [, init] = fetchMock.mock.calls[0];
    const headers = new Headers(init.headers);
    expect(headers.get('X-CSRFToken')).toBe('caller-token');
    expect(headers.get('Content-Type')).toBe('application/vnd.api+json');
    expect(headers.get('x-request-id')).toBe('request-2');
    expect(init.body).toBe('{"enabled":true}');
  });

  test('acepta headers como tuplas y aplica defaults sin sobrescribir el caller', async () => {
    await apiFetch('/resource', {
      headers: [
        ['X-Request-ID', 'request-3'],
        ['x-csrftoken', 'tuple-token'],
      ],
    });

    const [, init] = fetchMock.mock.calls[0];
    const headers = new Headers(init.headers);
    expect(headers.get('X-Request-ID')).toBe('request-3');
    expect(headers.get('X-CSRFToken')).toBe('tuple-token');
    expect(headers.get('Content-Type')).toBeNull();
  });

  test('serializa json y asigna Content-Type cuando el caller no lo define', async () => {
    await apiFetch('/resource', {
      method: 'POST',
      json: { name: 'Ada' },
    });

    const [, init] = fetchMock.mock.calls[0];
    expect(init.body).toBe('{"name":"Ada"}');
    expect(init.headers.get('Content-Type')).toBe('application/json');
  });

  test('deja un body string sin Content-Type implícito ni serialización JSON', async () => {
    await apiFetch('/resource', {
      method: 'POST',
      body: 'plain text',
    });

    const [, init] = fetchMock.mock.calls[0];
    const headers = new Headers(init.headers);
    expect(init.body).toBe('plain text');
    expect(headers.get('Content-Type')).toBeNull();
  });

  test('no fija Content-Type para FormData', async () => {
    const formData = new FormData();
    formData.append('attachment', 'contents');

    await apiFetch('/resource', {
      method: 'POST',
      body: formData,
    });

    const [, init] = fetchMock.mock.calls[0];
    expect(init.body).toBe(formData);
    expect(init.headers.get('Content-Type')).toBeNull();
  });

  test('no fija Content-Type para Blob', async () => {
    const blob = new Blob(['contents'], { type: 'text/plain' });

    await apiFetch('/resource', {
      method: 'POST',
      body: blob,
    });

    const [, init] = fetchMock.mock.calls[0];
    expect(init.body).toBe(blob);
    expect(init.headers.get('Content-Type')).toBeNull();
  });

  test('solo lee la cookie CSRF con nombre exacto y deja vacío si falta', async () => {
    document.cookie = 'csrftoken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    document.cookie = 'notcsrftoken=partial-token; path=/';

    await apiFetch('/resource');

    const [, init] = fetchMock.mock.calls[0];
    expect(new Headers(init.headers).get('X-CSRFToken')).toBe('');
  });

  test('decodifica una cookie CSRF codificada y tolera valores malformados', async () => {
    document.cookie = 'csrftoken=encoded%20token%2Bvalue; path=/';

    await apiFetch('/resource');

    let [, init] = fetchMock.mock.calls[0];
    expect(new Headers(init.headers).get('X-CSRFToken')).toBe('encoded token+value');

    fetchMock.mockClear();
    document.cookie = 'csrftoken=%E0%A4%A; path=/';

    await apiFetch('/resource');

    [, init] = fetchMock.mock.calls[0];
    expect(new Headers(init.headers).get('X-CSRFToken')).toBe('%E0%A4%A');
  });

  test('emite grancrm:unauthorized ante una respuesta 401', async () => {
    const unauthorized = vi.fn();
    const sessionExpired = vi.fn();
    window.addEventListener('grancrm:unauthorized', unauthorized);
    window.addEventListener(SESSION_EXPIRED_EVENT, sessionExpired);
    const response = new Response(null, { status: 401 });
    fetchMock.mockResolvedValue(response);

    try {
      await expect(apiFetch('/resource')).resolves.toBe(response);
      expect(unauthorized).toHaveBeenCalledTimes(1);
      expect(sessionExpired).toHaveBeenCalledTimes(1);
    } finally {
      window.removeEventListener('grancrm:unauthorized', unauthorized);
      window.removeEventListener(SESSION_EXPIRED_EVENT, sessionExpired);
    }
  });

  test('devuelve la misma Response para una respuesta 503', async () => {
    const response = new Response('service unavailable', {
      status: 503,
      statusText: 'Service Unavailable',
    });
    fetchMock.mockResolvedValue(response);

    await expect(apiFetch('/resource')).resolves.toBe(response);
  });

  test('fuerza credentials same-origin aunque el caller solicite otro modo', async () => {
    await apiFetch('/resource', { credentials: 'include' });

    const [, init] = fetchMock.mock.calls[0];
    expect(init.credentials).toBe('same-origin');
  });
});
