// Capturas + axe de la demo por tema (Fase 0 y verificación final).
// Uso: node scripts/audit/capture.mjs --base http://localhost:5200 --out <dir> [--themes light,dark,navy] [--routes a,b]
//      node scripts/audit/capture.mjs --storybook http://localhost:6006 --out <dir>   (todas las stories, tema por globals)
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

const PLAYWRIGHT = process.env.PLAYWRIGHT_PATH
  ?? '/home/pancho/.nvm/versions/node/v24.17.0/lib/node_modules/@playwright/cli/node_modules/playwright/index.mjs'
const { chromium } = await import(PLAYWRIGHT)

const ROUTES = [
  '', 'buttons', 'cards', 'badges', 'modals', 'tabs', 'avatars', 'alerts', 'timeline',
  'connection-card', 'activity-feed', 'progress', 'stats-cards', 'datatable', 'charts',
  'recharts', 'forms', 'chat', 'layout', 'feedback',
]

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`)
  return i === -1 ? fallback : process.argv[i + 1]
}
const base = arg('base', 'http://localhost:5200').replace(/\/$/, '')
const out = resolve(arg('out', 'audit-out'))
const themes = arg('themes', 'light,dark').split(',')
const storybook = arg('storybook', null)?.replace(/\/$/, '')
let routes = arg('routes', null)?.split(',') ?? ROUTES
if (storybook) {
  // index.json de Storybook: una entrada por story (las páginas MDX son type "docs").
  const index = await (await fetch(`${storybook}/index.json`)).json()
  routes = Object.values(index.entries).filter(e => e.type === 'story').map(e => e.id)
}
const urlFor = (route, theme) => storybook
  ? `${storybook}/iframe.html?id=${route}&viewMode=story&globals=theme:${theme}`
  : `${base}/${route}`
const axeSource = readFileSync(resolve('node_modules/axe-core/axe.min.js'), 'utf8')

mkdirSync(out, { recursive: true })
const log = (...m) => console.log('[capture]', ...m)

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
      const name = route || 'intro'
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
