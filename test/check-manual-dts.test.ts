import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { afterEach, describe, expect, test } from 'vitest'

const execFileAsync = promisify(execFile)
const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = join(__dirname, '..')
const scriptPath = join(rootDir, 'scripts', 'check-manual-dts.mjs')
const dtsScriptPath = join(rootDir, 'scripts', 'write-index-dts.mjs')

async function runCheck() {
  try {
    const { stdout, stderr } = await execFileAsync('node', [scriptPath], { cwd: rootDir })
    return { code: 0, stdout, stderr }
  } catch (err) {
    return { code: err.code ?? 1, stdout: err.stdout ?? '', stderr: err.stderr ?? '' }
  }
}

describe('check-manual-dts', () => {
  test('pasa contra el estado real del repo (ningún componente .jsx sin tipos manuales)', async () => {
    const { code, stdout } = await runCheck()
    expect(code).toBe(0)
    expect(stdout).toMatch(/cubre los \d+ componentes/)
  })

  describe('detecta drift', () => {
    let original

    afterEach(async () => {
      if (original !== undefined) await writeFile(dtsScriptPath, original, 'utf8')
      original = undefined
    })

    test('falla si un componente .jsx exportado pierde su declaración manual', async () => {
      original = await readFile(dtsScriptPath, 'utf8')
      const mutated = original.replace(
        'export declare function Avatar',
        'export declare function AvatarRenamed',
      )
      expect(mutated).not.toBe(original)
      await writeFile(dtsScriptPath, mutated, 'utf8')

      const { code, stderr } = await runCheck()
      expect(code).toBe(1)
      expect(stderr).toMatch(/Avatar/)
    })
  })
})
