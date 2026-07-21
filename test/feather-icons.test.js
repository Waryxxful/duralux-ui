import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { expect, test } from 'vitest'

test('the exported Feather stylesheet owns its scoped font setup', () => {
  const stylesheetPath = resolve(process.cwd(), 'src/styles/feather-icons.css')
  const css = readFileSync(stylesheetPath, 'utf8')

  expect(css).toContain('@font-face{font-family:feather')
  expect(css).toContain('url("./fonts/feather.woff")')
  expect(css).toContain('[class^="feather-"],[class*=" feather-"]')
  expect(css).not.toMatch(/(^|})\s*i\s*{/m)
  expect(existsSync(resolve(process.cwd(), 'src/styles/fonts/feather.woff'))).toBe(true)
})
