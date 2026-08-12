import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as sass from 'sass'
import { describe, expect, test } from 'vitest'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const scssLoadPaths = [resolve(repoRoot, 'scss')]
const sassOptions = {
  loadPaths: scssLoadPaths,
  silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'abs-percent'],
} as const

function compileTheme() {
  return sass.compile(resolve(repoRoot, 'scss/theme.scss'), {
    ...sassOptions,
    style: 'expanded',
  }).css
}

function compileForm() {
  return sass.compileString(
    '@import "bootstrap/functions";\n@import "themes/variables";\n@import "themes/components/form";',
    sassOptions,
  ).css
}

const runtimeCss = readFileSync(resolve(repoRoot, 'src/styles/grancrm-ui.css'), 'utf8')

type CssRule = {
  selectors: string[]
  declarations: Record<string, string>
}

function parseRules(css: string): CssRule[] {
  return [...css.matchAll(/([^{}]+)\{([^{}]*)\}/gs)].map(([, rawSelector, body]) => ({
    selectors: rawSelector
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .trim()
      .split(',')
      .map((selector) => selector.trim()),
    declarations: Object.fromEntries(
      [...body.matchAll(/(?:^|;)\s*([\w-]+)\s*:\s*([^;]+)\s*/g)].map(([, property, value]) => [
        property,
        value.trim(),
      ]),
    ),
  }))
}

function ruleWithDeclarations(css: string, selector: string, properties: string[]) {
  const rule = parseRules(css).find(({ selectors, declarations }) => (
    selectors.includes(selector) && properties.every((property) => declarations[property])
  ))

  if (!rule) {
    throw new Error(`Missing CSS rule for ${selector} with ${properties.join(', ')}`)
  }

  return rule.declarations
}

function parseColor(value: string): [number, number, number] {
  const clean = value.replace(/\s*!important\s*$/, '').trim()

  if (/^#[0-9a-f]{3}$/i.test(clean)) {
    return parseColor(clean.replace(/[0-9a-f]/gi, (digit) => `${digit}${digit}`))
  }

  if (/^#[0-9a-f]{6}$/i.test(clean)) {
    return [
      Number.parseInt(clean.slice(1, 3), 16),
      Number.parseInt(clean.slice(3, 5), 16),
      Number.parseInt(clean.slice(5, 7), 16),
    ]
  }

  const rgb = clean.match(/^rgba?\(([^)]+)\)$/i)
  if (rgb) {
    return rgb[1].split(',').slice(0, 3).map((component) => {
      const valuePart = component.trim()
      return valuePart.endsWith('%')
        ? Number.parseFloat(valuePart) * 2.55
        : Number.parseFloat(valuePart)
    }) as [number, number, number]
  }

  throw new Error(`Unsupported color in compiled CSS: ${value}`)
}

function parseColorWithAlpha(value: string) {
  const clean = value.replace(/\s*!important\s*$/, '').trim()
  const rgb = clean.match(/^rgba?\(([^)]+)\)$/i)
  if (!rgb) return { channels: parseColor(clean), alpha: 1 }

  const parts = rgb[1].split(',').map((part) => part.trim())
  const channels = parts.slice(0, 3).map((part) => (
    part.endsWith('%') ? Number.parseFloat(part) * 2.55 : Number.parseFloat(part)
  )) as [number, number, number]
  return { channels, alpha: parts[3] === undefined ? 1 : Number.parseFloat(parts[3]) }
}

function compositeColor(foreground: string, background: string, alpha: number) {
  const foregroundChannels = parseColor(foreground)
  const backgroundChannels = parseColor(background)
  const channels = foregroundChannels.map((channel, index) => (
    Math.round(channel * alpha + backgroundChannels[index] * (1 - alpha))
  ))
  return `#${channels.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`
}

function luminance(value: string) {
  const [red, green, blue] = parseColor(value).map((channel) => channel / 255)
  const linear = (channel: number) => (
    channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  )

  return 0.2126 * linear(red) + 0.7152 * linear(green) + 0.0722 * linear(blue)
}

function contrastRatio(foreground: string, background: string) {
  const foregroundLuminance = luminance(foreground)
  const backgroundLuminance = luminance(background)
  const lighter = Math.max(foregroundLuminance, backgroundLuminance)
  const darker = Math.min(foregroundLuminance, backgroundLuminance)
  return (lighter + 0.05) / (darker + 0.05)
}

const solidColors = {
  primary: '#3454d1',
  secondary: '#64748b',
  success: '#17c666',
  warning: '#ffa21d',
  danger: '#ea4d4d',
  info: '#3dc7be',
  teal: '#41b2c4',
  indigo: '#6610f2',
  light: '#eff0f6',
  dark: '#283c50',
} as const

const interactionStates = ['', ':hover', ':focus', ':focus-visible', ':active'] as const
const alertVariants = [
  'primary', 'secondary', 'success', 'danger', 'warning',
  'info', 'light', 'dark', 'teal', 'indigo',
] as const

describe('CSS theme contract', () => {
  const css = compileTheme()

  test('resolves Sass color functions in the compiled theme', () => {
    expect(css).not.toMatch(/\b(?:shift-color|shade-color|tint-color|color-contrast|contrast-ratio)\(/)
  })

  test('keeps the custom checkbox independent from bootstrap-icons', () => {
    const formCss = compileForm()

    expect(formCss).not.toMatch(/bootstrap-icons/i)
    expect(formCss).toMatch(/data:image\/svg\+xml/)
  })

  test('keeps solid button foregrounds AA-compliant while preserving brand backgrounds', () => {
    for (const [variant, background] of Object.entries(solidColors)) {
      for (const state of interactionStates) {
        const declarations = ruleWithDeclarations(css, `.btn-${variant}${state}`, [
          'color',
          'background-color',
        ])

        if (!state) {
          expect(declarations['background-color'].replace(/\s*!important$/, '')).toBe(background)
        }
        expect(
          contrastRatio(declarations.color, declarations['background-color']),
          `${variant}${state}`,
        ).toBeGreaterThanOrEqual(4.5)
      }
    }
  })

  test('keeps soft button foregrounds AA-compliant across interaction states', () => {
    for (const variant of Object.keys(solidColors)) {
      for (const state of interactionStates) {
        const declarations = ruleWithDeclarations(css, `.btn-light-${variant}${state}`, [
          'color',
          'background-color',
        ])

        expect(
          contrastRatio(declarations.color, declarations['background-color']),
          `light-${variant}${state}`,
        ).toBeGreaterThanOrEqual(4.5)
      }
    }
  })

  test('keeps solid and soft badges AA-compliant', () => {
    for (const variant of Object.keys(solidColors)) {
      for (const state of interactionStates) {
        const solid = ruleWithDeclarations(css, `.badge.bg-${variant}${state}`, ['color', 'background-color'])
        const soft = ruleWithDeclarations(css, `.badge.bg-soft-${variant}${state}`, ['color', 'background-color'])

        expect(contrastRatio(solid.color, solid['background-color'])).toBeGreaterThanOrEqual(4.5)
        expect(contrastRatio(soft.color, soft['background-color'])).toBeGreaterThanOrEqual(4.5)

        if (!state) {
          const legacySoft = ruleWithDeclarations(css, `.badge.bg-light-${variant}`, ['color', 'background-color'])
          expect(contrastRatio(legacySoft.color, legacySoft['background-color'])).toBeGreaterThanOrEqual(4.5)
        }
      }
    }

    const lightBadge = ruleWithDeclarations(css, '.badge.gcu-badge--light', [
      'color',
      'background-color',
    ])
    expect(contrastRatio(lightBadge.color, lightBadge['background-color'])).toBeGreaterThanOrEqual(4.5)
  })

  test('provides AA-compliant soft alerts for the complete public semantic matrix', () => {
    for (const variant of alertVariants) {
      const declarations = ruleWithDeclarations(css, `.alert.alert-soft-${variant}-message`, [
        'color',
        'background-color',
      ])

      expect(contrastRatio(declarations.color, declarations['background-color'])).toBeGreaterThanOrEqual(4.5)
      expect(runtimeCss).toContain(`.alert.alert-soft-${variant}-message`)

      const darkDeclarations = ruleWithDeclarations(css, `html.app-skin-dark .alert.alert-soft-${variant}-message`, [
        'color',
        'background-color',
      ])
      expect(contrastRatio(darkDeclarations.color, darkDeclarations['background-color']), `dark alert ${variant}`)
        .toBeGreaterThanOrEqual(4.5)
    }
  })

  test('keeps React widget glue readable on solid and soft brand surfaces', () => {
    const widgetVariants = {
      primary: '#3454d1',
      secondary: '#64748b',
      success: '#17c666',
      danger: '#ea4d4d',
      warning: '#ffa21d',
      info: '#3dc7be',
      teal: '#41b2c4',
      indigo: '#6610f2',
      dark: '#283c50',
      light: '#eff0f6',
      darken: '#001327',
    } as const
    const softForegrounds = {
      primary: '#3454d1',
      secondary: '#283c50',
      success: '#283c50',
      danger: '#283c50',
      warning: '#283c50',
      info: '#283c50',
      teal: '#283c50',
      indigo: '#6610f2',
      dark: '#283c50',
    } as const

    for (const [variant, background] of Object.entries(widgetVariants)) {
      const cardColor = ruleWithDeclarations(css, `.bg-${variant}`, ['background-color'])['background-color']
      const cardForeground = ruleWithDeclarations(css, `.gcu-colored-stat.bg-${variant}`, ['color']).color
      expect(contrastRatio(cardForeground, cardColor), `colored-stat ${variant}`).toBeGreaterThanOrEqual(4.5)

      const glass = ruleWithDeclarations(css, `.gcu-colored-stat.bg-${variant} .gcu-colored-stat__glass`, ['color'])
      const glassBackground = ruleWithDeclarations(css, '.gcu-colored-stat__glass', ['background-color'])['background-color']
      const glassColor = parseColorWithAlpha(glassBackground)
      const glassSurface = compositeColor('#ffffff', background, glassColor.alpha)
      expect(contrastRatio(glass.color, glassSurface), `colored-stat glass ${variant}`).toBeGreaterThanOrEqual(4.5)
    }

    for (const [variant, foreground] of Object.entries(softForegrounds)) {
      const soft = ruleWithDeclarations(css, `.gcu-mini-stat .avatar-text.bg-soft-${variant}`, [
        'color',
        'background-color',
      ])
      const softBackground = parseColorWithAlpha(soft['background-color'])
      const softSurface = compositeColor(
        widgetVariants[variant as keyof typeof widgetVariants],
        '#ffffff',
        softBackground.alpha,
      )
      expect(soft.color.replace(/\s*!important\s*$/, '')).toBe(foreground)
      expect(contrastRatio(soft.color, softSurface), `soft widget ${variant}`).toBeGreaterThanOrEqual(4.5)

      const darkSoft = ruleWithDeclarations(css, `html.app-skin-dark .gcu-mini-stat .avatar-text.bg-soft-${variant}`, [
        'color',
        'background-color',
      ])
      const darkBackground = parseColorWithAlpha(darkSoft['background-color'])
      const darkSurface = compositeColor(
        widgetVariants[variant as keyof typeof widgetVariants],
        '#0f172a',
        darkBackground.alpha,
      )
      expect(parseColor(darkSoft.color)).toEqual([255, 255, 255])
      expect(contrastRatio(darkSoft.color, darkSurface), `dark soft widget ${variant}`).toBeGreaterThanOrEqual(4.5)
    }
  })

  test('keeps Sass and runtime CSS free of unresolved helpers and icon-font drift', () => {
    expect(css).not.toMatch(/\b(?:shift-color|shade-color|tint-color|color-contrast|contrast-ratio)\(/)
    expect(runtimeCss).not.toMatch(/\b(?:shift-color|shade-color|tint-color|color-contrast|contrast-ratio)\(/)
    expect(css).not.toMatch(/bootstrap-icons/i)
    expect(runtimeCss).not.toMatch(/bootstrap-icons/i)
    expect(runtimeCss).not.toContain('.gcu-colored-stat{color:#fff!important}')
    expect(runtimeCss).toContain('.gcu-colored-stat.bg-success')
    expect(runtimeCss).toContain('color:var(--gcu-darken)!important')
    expect(runtimeCss).toContain('color:var(--gcu-dark)!important')
    expect(runtimeCss).toContain('.gcu-btn--outline{background:transparent;color:var(--gcu-btn-outline-text,var(--gcu-btn-color))}')
    expect(readFileSync(resolve(repoRoot, 'scss/themes/components/_motion.scss'), 'utf8')).not.toContain('transition: all')
    expect(readFileSync(resolve(repoRoot, 'scss/themes/applications/_chat.scss'), 'utf8')).not.toContain('transition: all')
  })

  test('keeps Tabs focus-visible, named-track, and narrow-container safeguards in the public CSS', () => {
    expect(runtimeCss).toContain('.gcu-tabs-viewport')
    expect(runtimeCss).toContain('padding:4px')
    expect(runtimeCss).toContain('@container (max-width:40rem)')
    expect(runtimeCss).toContain('outline:2px solid currentColor')
    expect(runtimeCss).toContain('@media (forced-colors:active)')
    expect(runtimeCss).toContain('outline-color:Highlight')
    expect(contrastRatio('#b9c5ff', '#0f172a')).toBeGreaterThanOrEqual(3)
  })

  test('ships a reduced-motion contract for the public progress ring indicator', () => {
    const indicator = ruleWithDeclarations(css, '.gcu-progress-ring__indicator', ['transition'])
    expect(indicator.transition).toMatch(/stroke-dashoffset/)

    const reducedMotion = css.slice(css.lastIndexOf('@media (prefers-reduced-motion: reduce)'))
    expect(reducedMotion).toContain('.gcu-progress-ring__indicator')
    expect(reducedMotion).toContain('.progress-bar-animated')
    expect(reducedMotion).toContain('.spinner-border')
    expect(reducedMotion).toContain('transition: none !important;')
    expect(reducedMotion).toContain('animation: none !important;')

    const chatScss = readFileSync(resolve(repoRoot, 'scss/themes/applications/_chat.scss'), 'utf8')
    expect(chatScss).toMatch(/\.animation-infinite[\s\S]*animation:\s*none/)
    expect(chatScss).toMatch(/\.text\.typing \.wave \.dot[\s\S]*animation:\s*none/)
    expect(chatScss).toMatch(/chat-calling-text-message-sidebar[\s\S]*transition:\s*none/)
  })

  test('keeps the theme entry ordering functions before theme variables', () => {
    const source = readFileSync(resolve(repoRoot, 'scss/theme.scss'), 'utf8')
    expect(source.indexOf('@import "bootstrap/functions"')).toBeLessThan(
      source.indexOf('@import "themes/variables"'),
    )
  })

  test('hides ShellNav caption spans in collapsed minimenu and restores them on hover and mobile', () => {
    const collapsed = ruleWithDeclarations(
      css,
      'html.minimenu .nxl-navigation .navbar-content .nxl-caption span:not(.badge)',
      ['display'],
    )
    expect(collapsed.display).toBe('none')

    const hover = ruleWithDeclarations(
      css,
      'html.minimenu .nxl-navigation:hover .navbar-content .nxl-caption span:not(.badge)',
      ['display'],
    )
    expect(hover.display).toBe('block')

    const captionSpanRules = parseRules(css).filter(({ selectors }) => (
      selectors.includes('html.minimenu .nxl-navigation .navbar-content .nxl-caption span:not(.badge)')
    ))
    expect(captionSpanRules.some((rule) => rule.declarations.display === 'block')).toBe(true)
    expect(runtimeCss).toContain(
      'html.minimenu .nxl-navigation .navbar-content .nxl-caption span:not(.badge){display:block}',
    )
  })
})
