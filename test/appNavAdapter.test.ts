import { describe, expect, test } from 'vitest'
import { adaptAppNavItems, appNavHref } from '../src/contract'

describe('AppNavItem navigation adapter', () => {
  test('maps inner paths for both href and Router consumers, recursively', () => {
    const items = adaptAppNavItems([
      {
        label: 'Llamadas',
        icon: 'feather-phone',
        children: [
          { label: 'Bandeja', icon: 'feather-inbox', inner: '/calls/' },
          { label: 'Revisión', icon: 'feather-check', inner: '/callreviews/reviews' },
        ],
      },
    ], { routePrefix: '/callreviews/', role: 'agente' })

    expect(items).toEqual([
      {
        label: 'Llamadas',
        icon: 'phone',
        children: [
          { label: 'Bandeja', icon: 'inbox', href: '/callreviews/calls/', to: '/callreviews/calls/' },
          { label: 'Revisión', icon: 'check', href: '/callreviews/reviews', to: '/callreviews/reviews' },
        ],
      },
    ])
  })

  test('filters roles presentationally at every level and never treats it as authorization', () => {
    const items = adaptAppNavItems([
      {
        label: 'Administración',
        icon: 'settings',
        roles: ['admin_cuenta'],
        children: [{ label: 'Usuarios', icon: 'users', inner: '/users' }],
      },
      {
        label: 'Operación',
        icon: 'activity',
        children: [
          { label: 'Visible', icon: 'eye', inner: '/visible', roles: ['agente'] },
          { label: 'Oculto', icon: 'lock', inner: '/hidden', roles: ['admin_cuenta'] },
        ],
      },
    ], { routePrefix: '/app', role: 'agente' })

    expect(items).toEqual([
      {
        label: 'Operación',
        icon: 'activity',
        children: [{ label: 'Visible', icon: 'eye', href: '/app/visible', to: '/app/visible' }],
      },
    ])
  })

  test('keeps navigation inside the app prefix for malformed or external inner values', () => {
    expect(appNavHref('https://evil.example/phish', '/callreviews')).toBe('/callreviews')
    expect(appNavHref('/other-app/path', '/callreviews')).toBe('/callreviews/other-app/path')
    expect(appNavHref('/callreviews/calls?tab=mine#today', '/callreviews/')).toBe('/callreviews/calls?tab=mine#today')
  })

  test('rejects literal, encoded, double-encoded and malformed traversal before URL normalization', () => {
    const prefix = '/callreviews'
    expect(appNavHref('/../admin', prefix)).toBe(prefix)
    expect(appNavHref('/callreviews/%2e%2e/admin', prefix)).toBe(prefix)
    expect(appNavHref('/callreviews/%2E%2E%2Fadmin', prefix)).toBe(prefix)
    expect(appNavHref('/callreviews/%252e%252e/admin', prefix)).toBe(prefix)
    expect(appNavHref('/callreviews/reviews%2fadmin', prefix)).toBe(prefix)
    expect(appNavHref('/callreviews/reviews%5Cadmin', prefix)).toBe(prefix)
    expect(appNavHref('/callreviews/reviews%ZZ', prefix)).toBe(prefix)
  })

  test('falls back safely when the route prefix itself contains traversal', () => {
    expect(appNavHref('/reports', '/callreviews/../admin')).toBe('/reports')
    expect(appNavHref('/reports', '/callreviews/%2e%2e/admin')).toBe('/reports')
  })

  test('canonicalizes same-origin paths while preserving valid query and hash', () => {
    expect(appNavHref('/reviews?tab=mine#today', '/callreviews/'))
      .toBe('/callreviews/reviews?tab=mine#today')
    expect(appNavHref('/reviews/%20?filter=a%20b#section-1', '/callreviews'))
      .toBe('/callreviews/reviews/%20?filter=a%20b#section-1')
  })
})
