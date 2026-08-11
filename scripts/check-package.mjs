import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, normalize, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const REQUIRED_OPTIONAL_PEERS = ['apexcharts', 'react-apexcharts', 'recharts']
const REQUIRED_EXPORTS = {
  '.': {
    types: './dist/index.d.ts',
    import: './dist/index.js',
    require: './dist/index.cjs',
  },
  './charts': {
    types: './dist/charts/index.d.ts',
    import: './dist/charts/index.js',
    require: './dist/charts/index.cjs',
  },
  './charts/apex': {
    types: './dist/charts/apex.d.ts',
    import: './dist/charts/apex.js',
    require: './dist/charts/apex.cjs',
  },
  './charts/recharts': {
    types: './dist/charts/recharts.d.ts',
    import: './dist/charts/recharts.js',
    require: './dist/charts/recharts.cjs',
  },
}
const REQUIRED_ASSETS = [
  'dist/styles/grancrm-ui.css',
  'dist/styles/feather-icons.css',
  'dist/styles/fonts/feather.woff',
  'dist/bootstrap.css',
  'dist/bootstrap.min.css',
  'dist/theme.css',
  'dist/theme.min.css',
  'CHANGELOG.md',
  'scss',
]

function packagePath(value) {
  return normalize(String(value).replace(/^\.\//, '').replace(/^package[\\/]/, ''))
}

/** Return every string target in a conditional exports object. */
export function collectExportTargets(exportsField) {
  const targets = new Set()

  function visit(value) {
    if (typeof value === 'string') {
      targets.add(packagePath(value))
      return
    }
    if (!value || typeof value !== 'object') return
    Object.values(value).forEach(visit)
  }

  visit(exportsField)
  return [...targets].sort()
}

function assertEqual(actual, expected, label) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${label} does not match the release contract.`)
  }
}

/** Validate the manifest without touching the filesystem or running npm. */
export function validatePackageManifest(manifest) {
  if (!manifest || typeof manifest !== 'object') {
    throw new Error('package.json must contain an object manifest.')
  }
  if (manifest.version !== '2.0.0') {
    throw new Error(`Expected package version 2.0.0, received ${manifest.version}.`)
  }

  assertEqual(manifest.main, './dist/index.cjs', 'package main')
  assertEqual(manifest.module, './dist/index.js', 'package module')
  assertEqual(manifest.types, './dist/index.d.ts', 'package types')

  for (const [subpath, expected] of Object.entries(REQUIRED_EXPORTS)) {
    assertEqual(manifest.exports?.[subpath], expected, `exports[${subpath}]`)
  }

  const dependencies = manifest.dependencies ?? {}
  for (const engine of REQUIRED_OPTIONAL_PEERS) {
    if (Object.prototype.hasOwnProperty.call(dependencies, engine)) {
      throw new Error(`${engine} must not remain in dependencies.`)
    }
    if (!Object.prototype.hasOwnProperty.call(manifest.devDependencies ?? {}, engine)) {
      throw new Error(`${engine} must remain available in devDependencies.`)
    }
    if (manifest.peerDependencies?.[engine] === undefined) {
      throw new Error(`${engine} must be declared as a peerDependency.`)
    }
    if (manifest.peerDependenciesMeta?.[engine]?.optional !== true) {
      throw new Error(`${engine} must be an optional peerDependency.`)
    }
  }

  const files = new Set(manifest.files ?? [])
  for (const requiredDirectory of ['dist', 'scss']) {
    if (!files.has(requiredDirectory)) {
      throw new Error(`package files must include ${requiredDirectory}.`)
    }
  }

  return true
}

export function requiredPackagePaths(manifest) {
  validatePackageManifest(manifest)
  return [...new Set([
    ...collectExportTargets(manifest.exports),
    ...REQUIRED_ASSETS,
  ])].sort()
}

/** npm 10 prints prepare lifecycle output before the --json payload for npm pack. */
export function parsePackResult(output) {
  try {
    return JSON.parse(output)
  } catch (error) {
    const start = output.lastIndexOf('\n[')
    if (start === -1) throw error
    return JSON.parse(output.slice(start + 1))
  }
}

function archiveFilesFromPackResult(packResult) {
  if (!Array.isArray(packResult) || !packResult[0]?.files) {
    throw new Error('npm pack did not return a JSON file list.')
  }
  return packResult[0].files.map(file => packagePath(file.path ?? file))
}

export function assertPackagedFiles(manifest, files) {
  const available = new Set(files.map(packagePath))
  const missing = requiredPackagePaths(manifest).filter((path) => {
    if (path === 'scss') return ![...available].some(file => file === 'scss' || file.startsWith('scss/'))
    return !available.has(path)
  })
  if (missing.length > 0) {
    throw new Error(`Package archive is missing: ${missing.join(', ')}`)
  }
  return true
}

export function runPackSmokeGate({ cwd = ROOT } = {}) {
  const manifest = JSON.parse(readFileSync(join(cwd, 'package.json'), 'utf8'))
  validatePackageManifest(manifest)

  const destination = mkdtempSync(join(tmpdir(), 'duralux-ui-pack-'))
  try {
    const output = execFileSync(
      'npm',
      ['pack', '--ignore-scripts', '--json', '--pack-destination', destination],
      {
        cwd,
        encoding: 'utf8',
        env: {
          ...process.env,
          npm_config_audit: 'false',
          npm_config_fund: 'false',
          npm_config_update_notifier: 'false',
        },
      },
    )
    const result = parsePackResult(output)
    const files = result[0]?.files
      ? archiveFilesFromPackResult(result)
      : archiveFilesFromArchive(destination)
    assertPackagedFiles(manifest, files)
    return { files }
  } finally {
    rmSync(destination, { recursive: true, force: true })
  }
}

function archiveFilesFromArchive(destination) {
  const archive = readDirectory(destination).find(name => name.endsWith('.tgz'))
  if (!archive) throw new Error('npm pack did not create a tarball in the temporary directory.')
  const output = execFileSync('tar', ['-tzf', join(destination, archive)], { encoding: 'utf8' })
  return output.split('\n').filter(Boolean)
}

function readDirectory(path) {
  return readdirSync(path)
}

if (resolve(process.argv[1] ?? '') === resolve(fileURLToPath(import.meta.url))) {
  try {
    const manifest = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'))
    validatePackageManifest(manifest)
    const files = runPackSmokeGate().files
    console.log(`package gate: OK (${files.length} archived paths)`)
  } catch (error) {
    console.error(`package gate: ${error instanceof Error ? error.message : String(error)}`)
    process.exitCode = 1
  }
}
