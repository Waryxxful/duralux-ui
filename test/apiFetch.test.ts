import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { apiFetch, SESSION_EXPIRED_EVENT } from '../src/api/client'

function setCookie(value: string) {
  Object.defineProperty(document, 'cookie', {
    writable: true,
    configurable: true,
    value,
  })
}

function mockFetch(status: number) {
  const response = new Response(null, { status })
  return vi.spyOn(global, 'fetch').mockResolvedValue(response)
}

describe('apiFetch', () => {
  beforeEach(() => {
    setCookie('csrftoken=abc123')
  })

  afterEach(() => {
    vi.restoreAllMocks()
    setCookie('')
  })

  test('agrega X-CSRFToken leyendo la cookie', async () => {
    const fetchSpy = mockFetch(200)
    await apiFetch('/api/thing')

    const [, init] = fetchSpy.mock.calls[0]
    const headers = init?.headers as Record<string, string>
    expect(headers['X-CSRFToken']).toBe('abc123')
  })

  test('decodifica la cookie CSRF si viene URL-encodeada', async () => {
    setCookie('csrftoken=abc%2F123')
    const fetchSpy = mockFetch(200)
    await apiFetch('/api/thing')

    const [, init] = fetchSpy.mock.calls[0]
    const headers = init?.headers as Record<string, string>
    expect(headers['X-CSRFToken']).toBe('abc/123')
  })

  test('usa string vacio si no hay cookie csrftoken', async () => {
    setCookie('')
    const fetchSpy = mockFetch(200)
    await apiFetch('/api/thing')

    const [, init] = fetchSpy.mock.calls[0]
    const headers = init?.headers as Record<string, string>
    expect(headers['X-CSRFToken']).toBe('')
  })

  test('credentials es same-origin por defecto', async () => {
    const fetchSpy = mockFetch(200)
    await apiFetch('/api/thing')

    const [, init] = fetchSpy.mock.calls[0]
    expect(init?.credentials).toBe('same-origin')
  })

  test('serializa options.json como body y setea Content-Type', async () => {
    const fetchSpy = mockFetch(200)
    await apiFetch('/api/thing', { json: { a: 1 } })

    const [, init] = fetchSpy.mock.calls[0]
    const headers = init?.headers as Record<string, string>
    expect(headers['Content-Type']).toBe('application/json')
    expect(init?.body).toBe(JSON.stringify({ a: 1 }))
  })

  test('no setea Content-Type cuando no se pasa json', async () => {
    const fetchSpy = mockFetch(200)
    await apiFetch('/api/thing')

    const [, init] = fetchSpy.mock.calls[0]
    const headers = init?.headers as Record<string, string>
    expect(headers['Content-Type']).toBeUndefined()
  })

  test('headers custom del caller pisan los defaults', async () => {
    const fetchSpy = mockFetch(200)
    await apiFetch('/api/thing', { headers: { 'Content-Type': 'text/plain' } })

    const [, init] = fetchSpy.mock.calls[0]
    const headers = init?.headers as Record<string, string>
    expect(headers['Content-Type']).toBe('text/plain')
  })

  test('dispara SESSION_EXPIRED_EVENT en window cuando la respuesta es 401', async () => {
    mockFetch(401)
    const handler = vi.fn()
    window.addEventListener(SESSION_EXPIRED_EVENT, handler)

    await apiFetch('/api/thing')

    expect(handler).toHaveBeenCalledTimes(1)
    window.removeEventListener(SESSION_EXPIRED_EVENT, handler)
  })

  test('no dispara SESSION_EXPIRED_EVENT en respuestas exitosas', async () => {
    mockFetch(200)
    const handler = vi.fn()
    window.addEventListener(SESSION_EXPIRED_EVENT, handler)

    await apiFetch('/api/thing')

    expect(handler).not.toHaveBeenCalled()
    window.removeEventListener(SESSION_EXPIRED_EVENT, handler)
  })

  test('devuelve la Response tal cual', async () => {
    const fetchSpy = mockFetch(200)
    const response = await apiFetch('/api/thing')

    expect(response).toBe(await fetchSpy.mock.results[0].value)
  })
})
