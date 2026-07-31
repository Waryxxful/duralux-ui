import { describe, expect, test } from 'vitest'
import { cx } from '../src/utils/cx'

describe('cx', () => {
  test('concatena strings con espacio', () => {
    expect(cx('btn', 'btn-primary')).toBe('btn btn-primary')
  })

  test('descarta valores falsy', () => {
    expect(cx('btn', false, null, undefined, '', 'btn-sm')).toBe('btn btn-sm')
  })

  test('devuelve string vacio si todo es falsy', () => {
    expect(cx(false, null, undefined)).toBe('')
  })
})
