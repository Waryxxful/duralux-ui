import { build } from 'vite'
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
// Motores opcionales (charts y antd/dayjs): nunca deben aparecer en el bundle raíz.
const CHART_ENGINE_PATTERN = /(?:^|[^A-Za-z0-9_])(?:apexcharts|react-apexcharts|recharts|antd|dayjs)(?:$|[^A-Za-z0-9_])/m
// Huellas de TanStack Table/Virtual (nombres internos que sobreviven a la minificación como strings).
const TANSTACK_PATTERN = /@tanstack\/|table\.getSortedRowModel|rowSortingFeature|virtual-core/
const EXTERNAL_PACKAGES = [
  'react',
  'react-dom',
  'react/jsx-runtime',
  'react-dom/client',
  'react-router-dom',
  'apexcharts',
  'react-apexcharts',
  'recharts',
  'antd',
  'dayjs',
]

function isExternal(id) {
  return EXTERNAL_PACKAGES.some((packageName) => (
    id === packageName || id.startsWith(`${packageName}/`)
  ))
}

function rootBundlePaths(distDir) {
  return ['index.js', 'index.cjs', 'index.d.ts'].map(file => join(distDir, file))
}

export function assertRootBundleIsolated(distDir) {
  const paths = rootBundlePaths(distDir)
  const missing = paths.filter(path => !existsSync(path))
  if (missing.length > 0) {
    throw new Error(`Root bundle is missing targets: ${missing.join(', ')}`)
  }

  const offenders = paths.filter(path => CHART_ENGINE_PATTERN.test(readFileSync(path, 'utf8')))
  if (offenders.length > 0) {
    throw new Error(`Root bundle contains optional engine specs (charts/antd): ${offenders.join(', ')}`)
  }
  return paths
}

export async function bundleButtonInMemory(distDir) {
  const rootEntry = join(distDir, 'index.js')
  if (!existsSync(rootEntry)) throw new Error(`Missing ${rootEntry}; run Vite before the bundle gate.`)

  const tempDirectory = mkdtempSync(join(tmpdir(), 'duralux-ui-consumer-'))
  const consumerEntry = join(tempDirectory, 'consumer.mjs')
  writeFileSync(
    consumerEntry,
    `import { Button } from ${JSON.stringify(rootEntry)};\nexport { Button };\n`,
  )

  try {
    const result = await build({
      root: tempDirectory,
      configFile: false,
      logLevel: 'silent',
      build: {
        write: false,
        emptyOutDir: false,
        lib: {
          entry: consumerEntry,
          formats: ['es'],
          fileName: 'consumer',
        },
        rollupOptions: {
          external: isExternal,
        },
      },
    })
    const output = Array.isArray(result) ? result.flatMap(item => item.output) : result.output
    const code = output
      .filter(chunk => chunk.type === 'chunk')
      .map(chunk => chunk.code)
      .join('\n')
    return {
      code,
      gzipBytes: gzipSync(code, { level: 9 }).length,
    }
  } finally {
    rmSync(tempDirectory, { recursive: true, force: true })
  }
}

export async function runBundleGate({ distDir = join(ROOT, 'dist'), maxGzipBytes = 20 * 1024 } = {}) {
  assertRootBundleIsolated(distDir)
  const result = await bundleButtonInMemory(distDir)
  if (result.gzipBytes > maxGzipBytes) {
    throw new Error(`Button consumer bundle is ${result.gzipBytes} gzip bytes; limit is ${maxGzipBytes}.`)
  }
  if (CHART_ENGINE_PATTERN.test(result.code)) {
    throw new Error('Button consumer bundle contains a chart engine specifier.')
  }
  // DataTable usa TanStack (dependencia): una app que solo importa Button no debe arrastrarlo.
  if (TANSTACK_PATTERN.test(result.code)) {
    throw new Error('Button consumer bundle contains TanStack Table/Virtual code.')
  }
  return result
}

if (resolve(process.argv[1] ?? '') === resolve(fileURLToPath(import.meta.url))) {
  runBundleGate()
    .then(({ gzipBytes }) => console.log(`bundle gate: OK (${gzipBytes} gzip bytes for Button consumer)`))
    .catch((error) => {
      console.error(`bundle gate: ${error instanceof Error ? error.message : String(error)}`)
      process.exitCode = 1
    })
}
