import { cpSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import * as sass from 'sass'
import { describe, expect, test } from 'vitest'
import { tokens } from '../src/tokens'
import { checkArtifacts } from '../scripts/generate-tokens.mjs'

const root = process.cwd()
const dtcg = JSON.parse(readFileSync(resolve(root, 'tokens/tokens.json'), 'utf8'))
const source = { colors: Object.fromEntries(Object.entries(dtcg.color.base).map(([name, token]) => [name, (token as { $value: string }).$value])) }

describe('tokens sincronizados con duralux-v2', () => {
  test('colores semanticos coinciden con $theme-colors final (y --gcu-*)', () => {
    // Final SCSS re-assign: $success:$green, $danger:$red, etc.
    expect(tokens.colors.primary).toBe('#3454d1')
    expect(tokens.colors.success).toBe('#17c666')
    expect(tokens.colors.warning).toBe('#ffa21d')
    expect(tokens.colors.info).toBe('#3dc7be')
    expect(tokens.colors.danger).toBe('#ea4d4d')
    expect(tokens.colors.secondary).toBe('#64748b')
    expect(tokens.colors.indigo).toBe('#6610f2')
    expect(tokens.colors.bg).toBe('#f0f2f8')
    expect(tokens.colors.body).toBe('#4b5563')
    expect(tokens.colors.canvas).toBe('#f3f4f6')
    expect(tokens.colors.brandBody).toBe('#6b7885')
    expect(tokens.colors.brandMuted).toBe('#5f6f8a')
  })

  test('el runtime TS refleja todos los colores de la fuente machine-readable', () => {
    expect(tokens.colors).toMatchObject(source.colors)
  })

  test('el SCSS compilado refleja la fuente semantica', () => {
    const compiled = sass.compile(resolve(root, 'scss/theme.scss'), {
      style: 'expanded',
      loadPaths: [resolve(root, 'scss')],
      silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'abs-percent'],
    }).css

    const themeUtilityColors = Object.keys(source.colors).filter(
      name => !['bg', 'body', 'canvas'].includes(name),
    )
    for (const name of themeUtilityColors) {
      expect(compiled).toContain(`.bg-${name} {\n  background-color: ${source.colors[name]} !important;`)
    }

    const bodyRuleStart = compiled.indexOf('body {')
    expect(bodyRuleStart).toBeGreaterThanOrEqual(0)
    const bodyRule = compiled.slice(bodyRuleStart, compiled.indexOf('}', bodyRuleStart) + 1)
    expect(bodyRule).toContain('color: #4b5563;')
    expect(bodyRule).toContain('background-color: #f3f4f6;')

    const bootstrapBodyVariables = sass.compileString(
      '@import "bootstrap/functions";\n@import "themes/variables";\n.body-vars { background-color: $body-bg; color: $body-color; }',
      {
        loadPaths: [resolve(root, 'scss')],
        silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'abs-percent'],
      },
    ).css
    expect(bootstrapBodyVariables).toContain('background-color: #f0f2f8;')
    expect(bootstrapBodyVariables).toContain('color: #4b5563;')
  })

  test('las custom properties CSS reflejan la fuente semantica', () => {
    const css = readFileSync(resolve(root, 'src/styles/grancrm-ui.css'), 'utf8')

    for (const [name, value] of Object.entries(source.colors)) {
      expect(css).toMatch(new RegExp(`--gcu-${name}\\s*:\\s*${value}\\s*;`))
    }
    expect(css).not.toMatch(/--gcu-[a-z]+[A-Z]/)
    expect(css).not.toContain('#727981')
    expect(css).not.toContain('#4d2fb0')
    expect(css).toContain('rgba(var(--gcu-indigo-rgb),.12)')
    expect(css).toContain('rgba(var(--gcu-widget-soft-rgb),.18)')
  })

  test('la cascada de page-header conserva 30px en desktop y 20px hasta 575px', () => {
    const css = readFileSync(resolve(root, 'src/styles/grancrm-ui.css'), 'utf8')
    const desktopRule = css.lastIndexOf('.page-header {\n  padding: 0 30px !important;\n}')
    const mobileRule = css.lastIndexOf('@media (max-width:575.98px)')

    expect(desktopRule).toBeGreaterThan(-1)
    expect(mobileRule).toBeGreaterThan(desktopRule)
    expect(css.slice(mobileRule)).toContain('.page-header{padding:0 20px!important}')
  })

  test('el check de artefactos generados pasa sin drift', () => {
    expect(checkArtifacts(root)).toEqual([])
  })

  test('el check detecta drift en un artefacto generado', () => {
    const tempRoot = mkdtempSync(join(tmpdir(), 'duralux-token-check-'))

    try {
      for (const directory of ['tokens', 'src/generated', 'src/styles', 'scss/themes']) {
        mkdirSync(resolve(tempRoot, directory), { recursive: true })
      }
      cpSync(resolve(root, 'tokens/tokens.json'), resolve(tempRoot, 'tokens/tokens.json'))
      for (const file of ['semantic-colors.ts', 'tokens.ts', 'antd-theme.ts']) {
        cpSync(resolve(root, `src/generated/${file}`), resolve(tempRoot, `src/generated/${file}`))
      }
      cpSync(resolve(root, 'src/styles/tokens.css'), resolve(tempRoot, 'src/styles/tokens.css'))
      cpSync(resolve(root, 'scss/themes/_semantic-tokens.generated.scss'), resolve(tempRoot, 'scss/themes/_semantic-tokens.generated.scss'))
      cpSync(resolve(root, 'src/styles/grancrm-ui.css'), resolve(tempRoot, 'src/styles/grancrm-ui.css'))
      cpSync(resolve(root, 'src/tokens.ts'), resolve(tempRoot, 'src/tokens.ts'))
      cpSync(resolve(root, 'scss/themes/_bs-custom-variables.scss'), resolve(tempRoot, 'scss/themes/_bs-custom-variables.scss'))

      const generatedPath = resolve(tempRoot, 'src/generated/semantic-colors.ts')
      writeFileSync(generatedPath, readFileSync(generatedPath, 'utf8').replace('#3454d1', '#3454d2'))

      expect(checkArtifacts(tempRoot)).toContain(generatedPath)
    } finally {
      rmSync(tempRoot, { recursive: true, force: true })
    }
  })

  test('shadow expone las 6 escalas de v2', () => {
    expect(Object.keys(tokens.shadow).sort()).toEqual(
      ['lg', 'md', 'none', 'sm', 'xl', 'xxl'].sort(),
    )
  })

  test('border expone las 6 escalas de contraste de v2', () => {
    expect(Object.keys(tokens.border).sort()).toEqual(
      ['contrast', 'hard', 'medium', 'none', 'normal', 'soft'].sort(),
    )
  })

  test('radius incluye none y circle ademas de la escala existente', () => {
    expect(tokens.radius.none).toBe(0)
    expect(tokens.radius.circle).toBe(50)
  })
})
