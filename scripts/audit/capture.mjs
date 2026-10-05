// Capturas + axe de las stories de Storybook por tema (la demo Vite se retiró en 2.6).
// Uso: node scripts/audit/capture.mjs [--storybook http://localhost:6006] --out <dir>
//        [--themes light,dark,navy] [--routes patrones-,ia-]   (--routes filtra ids de story por prefijo)
// Storybook debe estar corriendo (npm run storybook) o servido desde build-storybook.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

const PLAYWRIGHT = process.env.PLAYWRIGHT_PATH
  ?? '/home/pancho/.nvm/versions/node/v24.17.0/lib/node_modules/@playwright/cli/node_modules/playwright/index.mjs'
const { chromium } = await import(PLAYWRIGHT)

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`)
  return i === -1 ? fallback : process.argv[i + 1]
}
const log = (...m) => console.log('[capture]', ...m)
if (process.argv.includes('--base')) {
  console.error('[capture] --base ya no existe: la demo Vite se retiró. Usa --storybook <url> (por defecto http://localhost:6006).')
  process.exit(2)
}
const storybook = arg('storybook', 'http://localhost:6006').replace(/\/$/, '')
const out = resolve(arg('out', 'audit-out'))
const themes = arg('themes', 'light,dark').split(',')
const filters = arg('routes', null)?.split(',').filter(Boolean) ?? []

let index
try {
  // index.json de Storybook: una entrada por story (las páginas MDX son type "docs").
  index = await (await fetch(`${storybook}/index.json`)).json()
} catch (error) {
  console.error(`[capture] No se pudo leer ${storybook}/index.json (${error.message}). Levanta Storybook o pasa --storybook <url>.`)
  process.exit(2)
}
const routes = Object.values(index.entries)
  .filter(e => e.type === 'story')
  .map(e => e.id)
  .filter(id => filters.length === 0 || filters.some(f => id.startsWith(f)))
if (routes.length === 0) {
  console.error('[capture] Ninguna story coincide con --routes.')
  process.exit(2)
}
log(`${routes.length} stories × ${themes.length} temas`)
const urlFor = (route, theme) => `${storybook}/iframe.html?id=${route}&viewMode=story&globals=theme:${theme}`
const axeSource = readFileSync(resolve('node_modules/axe-core/axe.min.js'), 'utf8')

mkdirSync(out, { recursive: true })

const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true })
try {
  for (const theme of themes) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
    await context.addInitScript(t => { try { localStorage.setItem("grancrm-theme", t) } catch {} }, theme)
    const page = await context.newPage()
    const errors = []
    page.on('pageerror', e => errors.push(String(e)))
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
    const axeResults = {}

    for (const route of routes) {
      const name = route
      errors.length = 0
      await page.goto(urlFor(route, theme), { waitUntil: 'networkidle' })
      await page.waitForTimeout(400)
      await page.screenshot({ path: join(out, `${theme}-${name}.png`), fullPage: true })
      await page.addScriptTag({ content: axeSource })
      const violations = await page.evaluate(async () => {
        const r = await window.axe.run(document.querySelector('#storybook-root') ?? document, { resultTypes: ['violations'] })
        return r.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.length, help: v.help, targets: v.nodes.slice(0, 8).map(n => ({ target: n.target.join(' '), summary: (n.failureSummary || '').split('\n').slice(1, 2).join(' ').slice(0, 160) })) }))
      })
      axeResults[name] = { violations, consoleErrors: [...errors] }
      log(theme, name, `axe=${violations.length}`, `errores=${errors.length}`)
    }
    writeFileSync(join(out, `axe-${theme}.json`), JSON.stringify(axeResults, null, 2))
    await context.close()
  }
} finally {
  await browser.close()
}
log('listo →', out)
