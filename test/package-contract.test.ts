import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, test } from 'vitest'

import {
  parsePackResult,
  requiredPackagePaths,
  validatePackageManifest,
} from '../scripts/check-package.mjs'

const root = resolve(process.cwd())
const manifest = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'))

describe('public package contract', () => {
  test('declares the 2.0 multi-entry package shape without chart engines in root', () => {
    expect(manifest.version).toMatch(/^3\.\d+\.\d+$/)
    expect(manifest.exports['.']).toEqual({
      types: './dist/index.d.ts',
      import: './dist/index.js',
      require: './dist/index.cjs',
    })
    expect(manifest.exports['./charts']).toEqual({
      types: './dist/charts/index.d.ts',
      import: './dist/charts/index.js',
      require: './dist/charts/index.cjs',
    })
    expect(manifest.exports['./charts/apex']).toEqual({
      types: './dist/charts/apex.d.ts',
      import: './dist/charts/apex.js',
      require: './dist/charts/apex.cjs',
    })
    expect(manifest.exports['./charts/recharts']).toEqual({
      types: './dist/charts/recharts.d.ts',
      import: './dist/charts/recharts.js',
      require: './dist/charts/recharts.cjs',
    })
    expect(manifest.peerDependencies.apexcharts).toBe('^5.15.2 || ^6.0.0')
    expect(manifest.peerDependenciesMeta).toMatchObject({
      apexcharts: { optional: true },
      'react-apexcharts': { optional: true },
      recharts: { optional: true },
    })
    // 2.5: las únicas dependencias de runtime son TanStack (headless, sin estilos). DataTable las usa;
    // el gate de bundle verifica que una app que solo importa Button no las arrastre.
    expect(Object.keys(manifest.dependencies ?? {}).sort()).toEqual(['@tanstack/react-table', '@tanstack/react-virtual'])
  })

  test('keeps the install lifecycle outside the package smoke gate', () => {
    expect(manifest.scripts.prepare).toBe('npm run build:prepare')
    expect(manifest.scripts['build:prepare']).not.toContain('gate:package')
    expect(manifest.scripts.build).toContain('npm run gate:package')
  })

  test('parses npm 10 pack JSON after prepare lifecycle output', () => {
    expect(parsePackResult('audit-contract: OK\n[\n  { "files": [] }\n]\n')).toEqual([
      { files: [] },
    ])
  })

  test('keeps every export target and packaged asset explicit', () => {
    const targets = requiredPackagePaths(manifest)

    expect(targets).toEqual(expect.arrayContaining([
      'dist/index.d.ts',
      'dist/index.js',
      'dist/index.cjs',
      'dist/charts/index.d.ts',
      'dist/charts/index.js',
      'dist/charts/index.cjs',
      'dist/charts/apex.d.ts',
      'dist/charts/apex.js',
      'dist/charts/apex.cjs',
      'dist/charts/recharts.d.ts',
      'dist/charts/recharts.js',
      'dist/charts/recharts.cjs',
      'dist/styles/grancrm-ui.css',
      'dist/styles/feather-icons.css',
      'dist/styles/fonts/feather.woff',
      'dist/bootstrap.css',
      'dist/bootstrap.min.css',
      'dist/theme.css',
      'dist/theme.min.css',
      'CHANGELOG.md',
      'scss',
    ]))
    expect(() => validatePackageManifest(manifest)).not.toThrow()
  })
})
