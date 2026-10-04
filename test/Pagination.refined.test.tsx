import { createRef } from 'react'
import { render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { Pagination } from '../src/components/data/Pagination'

afterEach(() => vi.restoreAllMocks())

describe('Pagination refinada (receta de componente 2.3)', () => {
  test('reenvía ref al <nav> y expone la clase del componente', () => {
    const ref = createRef<HTMLElement>()
    render(<Pagination ref={ref} page={1} totalPages={5} onPageChange={() => {}} />)
    expect(ref.current?.tagName).toBe('NAV')
    expect(ref.current).toHaveClass('gcu-pagination')
    expect(within(ref.current as HTMLElement).getByRole('list')).toHaveClass('pagination')
  })

  test('muestra el rango visible «11–20 de 248» con miles es-CL', () => {
    const { rerender } = render(<Pagination page={2} totalPages={25} pageSize={10} totalItems={248} onPageChange={() => {}} />)
    expect(screen.getByText('11–20 de 248')).toHaveClass('gcu-pagination__range')
    rerender(<Pagination page={25} totalPages={25} pageSize={10} totalItems={248} onPageChange={() => {}} />)
    expect(screen.getByText('241–248 de 248')).toBeInTheDocument()
    rerender(<Pagination page={1} totalPages={124} pageSize={10} totalItems={1240} onPageChange={() => {}} />)
    expect(screen.getByText('1–10 de 1.240')).toBeInTheDocument()
  })

  test('sin totalItems o pageSize no inventa un rango', () => {
    const { container } = render(<Pagination page={1} totalPages={5} onPageChange={() => {}} />)
    expect(container.querySelector('.gcu-pagination__range')).toBeNull()
  })

  test('una sola página actual con aria-current y botones anterior/siguiente nombrados', () => {
    render(<Pagination page={3} totalPages={5} onPageChange={() => {}} />)
    const nav = screen.getByRole('navigation', { name: 'Paginación' })
    expect(nav.querySelectorAll('[aria-current="page"]')).toHaveLength(1)
    expect(within(nav).getByRole('button', { name: 'Página 3' })).toHaveAttribute('aria-current', 'page')
    expect(within(nav).getByRole('button', { name: 'Página anterior' })).toBeEnabled()
    expect(within(nav).getByRole('button', { name: 'Página siguiente' })).toBeEnabled()
  })

  test('valores de rango inválidos se registran y se omite el rango', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { container } = render(<Pagination page={1} totalPages={5} pageSize={-3} totalItems={50} onPageChange={() => {}} />)
    expect(container.querySelector('.gcu-pagination__range')).toBeNull()
    expect(warn).toHaveBeenCalledWith('[duralux]', expect.stringContaining('pageSize'))
  })
})
