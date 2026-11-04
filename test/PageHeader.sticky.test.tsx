import { render } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { PageHeader } from '../src/components/layout/PageHeader'

// Regla (PAGE-STRUCTURE.md): cabecera fija solo a pedido, en páginas largas cuya acción
// principal vive en ella. Por defecto no se fija ni deja el centinela del observador.
describe('PageHeader sticky', () => {
  test('por defecto no se fija', () => {
    const { container } = render(<PageHeader title="Llamadas" />)
    expect(container.querySelector('.page-header')).not.toHaveClass('gcu-page-header--sticky')
    expect(container.querySelector('.gcu-page-header__sentinel')).toBeNull()
  })

  test('con `sticky` se fija y pone el centinela', () => {
    const { container } = render(<PageHeader title="Editar campaña" sticky />)
    expect(container.querySelector('.page-header')).toHaveClass('gcu-page-header--sticky')
    expect(container.querySelector('.gcu-page-header__sentinel')).not.toBeNull()
  })
})
