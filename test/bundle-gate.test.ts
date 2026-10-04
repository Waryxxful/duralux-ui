import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { TextEncoder as NodeTextEncoder } from 'node:util'
import { afterEach, beforeAll, describe, expect, test } from 'vitest'

let runBundleGate: typeof import('../scripts/check-bundle.mjs').runBundleGate

const temporaryDirectories: string[] = []

beforeAll(async () => {
  globalThis.TextEncoder = NodeTextEncoder
  globalThis.Uint8Array = Object.getPrototypeOf(new NodeTextEncoder().encode('')).constructor
  ;({ runBundleGate } = await import('../scripts/check-bundle.mjs'))
})

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true })
  }
})

function createRootDist(indexSource = 'export const Button = () => null;') {
  const directory = mkdtempSync(join(tmpdir(), 'duralux-ui-bundle-test-'))
  temporaryDirectories.push(directory)
  writeFileSync(join(directory, 'index.js'), indexSource)
  writeFileSync(join(directory, 'index.cjs'), 'exports.Button = function Button() {}')
  writeFileSync(join(directory, 'index.d.ts'), 'export declare const Button: unknown;')
  return directory
}

describe('root bundle gate', () => {
  test('bundles a Button consumer in memory without chart engines', async () => {
    const result = await runBundleGate({ distDir: createRootDist() })

    expect(result.gzipBytes).toBeLessThanOrEqual(20 * 1024)
    expect(result.code).not.toMatch(/apexcharts|react-apexcharts|recharts/)
  })

  test('rejects chart engine specifications in any root target', async () => {
    await expect(runBundleGate({
      distDir: createRootDist('import ApexChart from "react-apexcharts"; export { ApexChart };'),
    })).rejects.toThrow(/optional engine specs/)
  })

  test('rejects antd or dayjs in the root bundle (only @duralux/ui/antd may import them)', async () => {
    await expect(runBundleGate({
      distDir: createRootDist('import { DatePicker } from "antd"; export { DatePicker };'),
    })).rejects.toThrow(/optional engine specs/)
  })
})
