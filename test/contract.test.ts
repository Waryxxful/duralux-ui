import { expect, test } from 'vitest';
import { topLevelApps, type AppManifestEntry } from '../src/contract';

function app(overrides: Partial<AppManifestEntry>): AppManifestEntry {
  return {
    id: 1,
    nombre: 'App',
    slug: 'app',
    icono: 'feather-grid',
    categoria: 'General',
    estado: 'activo',
    modo: 'spa_remote',
    url_publica: '/app/',
    route_prefix: '/app/',
    ...overrides,
  };
}

test('excludes an app nested under another app in the same manifest', () => {
  const parent = app({ id: 1, nombre: 'WSP Platform', route_prefix: '/wsp/' });
  const child = app({ id: 2, nombre: 'Bot Demo WhatsApp', route_prefix: '/wsp/demo/' });
  const unrelated = app({ id: 3, nombre: 'Call Reviews', route_prefix: '/callreviews/' });

  const result = topLevelApps([parent, child, unrelated]);

  expect(result.map(a => a.id)).toEqual([1, 3]);
});

test('keeps every app when none is nested under another', () => {
  const a = app({ id: 1, route_prefix: '/wsp/' });
  const b = app({ id: 2, route_prefix: '/callreviews/' });

  expect(topLevelApps([a, b]).map(x => x.id)).toEqual([1, 2]);
});

test('does not exclude an app by comparing it against itself', () => {
  const solo = app({ id: 1, route_prefix: '/wsp/' });

  expect(topLevelApps([solo])).toEqual([solo]);
});

test('tolerates route_prefix without leading/trailing slashes', () => {
  const parent = app({ id: 1, route_prefix: 'wsp' });
  const child = app({ id: 2, route_prefix: 'wsp/demo' });

  expect(topLevelApps([parent, child]).map(a => a.id)).toEqual([1]);
});
