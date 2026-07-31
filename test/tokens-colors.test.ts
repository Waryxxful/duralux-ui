import { describe, expect, test } from 'vitest'
import { tokens } from '../src/tokens'

describe('tokens sincronizados con duralux-v2', () => {
  test('colores semanticos coinciden con la paleta v2', () => {
    expect(tokens.colors.success).toBe('#25b865')
    expect(tokens.colors.warning).toBe('#e49e3d')
    expect(tokens.colors.info).toBe('#02a0e4')
    expect(tokens.colors.danger).toBe('#d13b4c')
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
