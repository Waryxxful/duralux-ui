import { describe, expect, test } from 'vitest'
import { tokens } from '../src/tokens'

describe('tokens sincronizados con duralux-v2', () => {
  test('colores semanticos coinciden con $theme-colors final (y --gcu-*)', () => {
    // Final SCSS re-assign: $success:$green, $danger:$red, etc.
    expect(tokens.colors.primary).toBe('#3454d1')
    expect(tokens.colors.success).toBe('#17c666')
    expect(tokens.colors.warning).toBe('#ffa21d')
    expect(tokens.colors.info).toBe('#3dc7be')
    expect(tokens.colors.danger).toBe('#ea4d4d')
    expect(tokens.colors.secondary).toBe('#727981')
    expect(tokens.colors.brandBody).toBe('#6b7885')
    expect(tokens.colors.brandMuted).toBe('#7587a7')
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
