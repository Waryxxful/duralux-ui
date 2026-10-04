import { createRef } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { Avatar } from '../src/components/ui/Avatar'
import { AvatarGroup } from '../src/components/ui/AvatarGroup'
import { DEBT, THEMES, componentCss, contrast, ruleOf } from './helpers/themeTokens'

afterEach(() => vi.restoreAllMocks())

const TONES = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'teal', 'indigo', 'dark', 'light'] as const

describe('Avatar refinado (receta de componente 2.3)', () => {
  test('reenvía ref al contenedor, con imagen o con iniciales', () => {
    const imageRef = createRef<HTMLDivElement>()
    const initialsRef = createRef<HTMLDivElement>()
    render(<><Avatar ref={imageRef} src="/ada.png" name="Ada" /><Avatar ref={initialsRef} name="Grace Hopper" /></>)
    expect(imageRef.current).toHaveClass('avatar-image')
    expect(initialsRef.current).toHaveClass('avatar-text')
  })

  test('las iniciales semánticas no usan la utilidad bg-* (su prioridad forzada pisaría el token)', () => {
    render(<Avatar name="Ada Lovelace" variant="success" />)
    const avatar = screen.getByText('AL')
    expect(avatar).toHaveClass('gcu-avatar', 'gcu-avatar--semantic', 'gcu-avatar--success')
    expect(avatar.className).not.toMatch(/\bbg-/)
  })

  test('el escape legado `bg` conserva la clase del consumidor', () => {
    render(<Avatar name="Ada" bg="bg-soft-danger" />)
    const avatar = screen.getByText('AD')
    expect(avatar).toHaveClass('bg-soft-danger')
    expect(avatar).not.toHaveClass('gcu-avatar--semantic')
  })

  test('si la imagen falla, cae en las iniciales y lo registra', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { container, rerender } = render(<Avatar src="/rota.png" name="Ada Lovelace" alt="Ada Lovelace" />)
    fireEvent.error(container.querySelector('img') as HTMLImageElement)
    expect(container.querySelector('img')).toBeNull()
    expect(screen.getByRole('img', { name: 'Ada Lovelace' })).toHaveTextContent('AL')
    expect(warn).toHaveBeenCalledWith('[duralux]', expect.stringContaining('/rota.png'))

    rerender(<Avatar src="/nueva.png" name="Ada Lovelace" alt="Ada Lovelace" />)
    expect(container.querySelector('img')).toHaveAttribute('src', '/nueva.png')
  })

  test('la imagen lleva la clase de contorno interior', () => {
    const { container } = render(<Avatar src="/ada.png" name="Ada" />)
    expect(container.firstElementChild).toHaveClass('gcu-avatar', 'gcu-avatar--image')
  })
})

describe('AvatarGroup refinado', () => {
  test('reenvía ref y el contador usa el tamaño del grupo con cifras tabulares', () => {
    const ref = createRef<HTMLDivElement>()
    render(<AvatarGroup ref={ref} size="sm" max={1} items={[{ id: 1, name: 'Ada' }, { id: 2, name: 'Grace' }]} />)
    expect(ref.current).toHaveClass('img-group', 'gcu-avatar-group')
    const overflow = screen.getByRole('img', { name: '1 persona más' })
    expect(overflow).toHaveClass('avatar-sm', 'gcu-avatar', 'gcu-avatar--overflow')
    expect(overflow.className).not.toMatch(/\bbg-|\btext-/)
  })
})

describe('CSS de Avatar (src/styles/components/avatar.css)', () => {
  const css = componentCss('avatar')

  test('sin deuda: 0 !important, 0 hex, 0 overrides de tema', () => {
    expect(css).not.toMatch(DEBT)
  })

  test.each(THEMES)('las iniciales cumplen AA en %s', (theme) => {
    for (const tone of TONES) {
      const rule = ruleOf(css, `.gcu-avatar--${tone}`)
      expect(contrast(theme, rule['--gcu-avatar-fg'], rule['--gcu-avatar-bg']), tone).toBeGreaterThanOrEqual(4.5)
    }
    const overflow = ruleOf(css, '.gcu-avatar--overflow')
    expect(contrast(theme, overflow['--gcu-avatar-fg'], overflow['--gcu-avatar-bg'])).toBeGreaterThanOrEqual(4.5)
  })

  test('imagen e iniciales claras llevan contorno interior fino', () => {
    expect(css).toMatch(/outline:1px solid var\(--gcu-image-outline/)
    expect(css).toContain('outline-offset:-1px')
  })
})
