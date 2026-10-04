import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, test } from 'vitest'

const read = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8')
const chatCss = read('src/styles/components/chat.css')
const runtimeCss = read('src/styles/grancrm-ui.css')
const chatScss = read('scss/themes/applications/_chat.scss')

const rule = (selector: string) => {
  const start = chatCss.indexOf(`\n${selector}{`)
  return start === -1 ? '' : chatCss.slice(start + 1, chatCss.indexOf('}', start) + 1)
}

describe('chat.css (lote L7)', () => {
  test('se importa desde grancrm-ui.css y solo usa tokens', () => {
    expect(runtimeCss).toContain('@import "./components/chat.css";')
    expect(chatCss).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
    expect(chatCss).not.toContain('!important')
    expect(chatCss).not.toContain('.app-skin-dark')
    expect(chatCss).not.toContain('data-gcu-theme')
  })

  test('burbuja entrante en surface-raised y saliente en primary con texto on-primary', () => {
    expect(rule('.gcu-message-bubble')).toContain('background:var(--gcu-surface-raised)')
    expect(rule('.gcu-message-bubble')).toContain('color:var(--gcu-text)')
    expect(rule('.gcu-message-bubble--outgoing')).toContain('background:var(--gcu-primary)')
    expect(rule('.gcu-message-bubble--outgoing')).toContain('color:var(--gcu-on-primary)')
  })

  test('meta con cifras tabulares, sin opacidad y con color AA en ambos lados', () => {
    const meta = rule('.gcu-message-bubble__meta')
    expect(meta).toContain('font-variant-numeric:tabular-nums')
    expect(meta).toContain('color:var(--gcu-muted)')
    expect(meta).not.toContain('opacity')
    expect(rule('.gcu-message-bubble--outgoing .gcu-message-bubble__meta')).toContain('color:var(--gcu-on-primary)')
  })

  test('radios: cola sutil y radio anidado para lo que va dentro de la burbuja', () => {
    expect(rule('.gcu-message-bubble--incoming')).toContain('border-start-start-radius:var(--gcu-radius-sm)')
    expect(rule('.gcu-message-bubble__media')).toContain('max(0px,calc(var(--gcu-message-radius) - var(--gcu-message-pad)))')
  })

  test('responsivo por contenedor: dos columnas a una bajo 42rem, sin breakpoints de viewport', () => {
    expect(rule('.gcu-chat')).toContain('container:gcu-chat / inline-size')
    expect(chatCss).toMatch(/@container gcu-chat \(max-width:42rem\)\{[\s\S]*\.gcu-chat--thread-open>\.gcu-chat-sidebar\{display:none\}/)
    expect(chatCss).toMatch(/@container \(max-width:28rem\)\{\.gcu-message-bubble\{max-width:88%\}\}/)
    expect(chatCss).not.toMatch(/@media \((max|min)-width/)
  })

  test('hover instantáneo solo con puntero y foco con el anillo del sistema', () => {
    expect(chatCss).toMatch(/@media \(hover:hover\)\{button\.gcu-chat-contact:hover\{[^}]*\}\}/)
    expect(rule('button.gcu-chat-contact')).not.toContain('transition')
    expect(rule('button.gcu-chat-contact:focus-visible')).toContain('box-shadow:var(--gcu-focus-ring)')
  })

  test('las reglas viejas se borraron de grancrm-ui.css y del SCSS', () => {
    expect(runtimeCss).not.toContain('gcu-message')
    expect(chatScss).not.toMatch(/\.chat-(sidebar__|input-bar|window|online-status|bubble-content|typing-dot)/)
    expect(chatScss).not.toContain('html.app-skin-dark .chat-online-status')
  })
})
