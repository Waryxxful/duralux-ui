import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { ApprovalCard } from '../src'

const base = {
  title: 'Enviar correo de seguimiento a 12 clientes',
  onApprove: () => {},
  onReject: () => {},
}

describe('ApprovalCard approveVariant', () => {
  test('light-brand pone btn-light-brand y no btn-primary', () => {
    render(<ApprovalCard {...base} approveVariant="light-brand" />)
    const approve = screen.getByRole('button', { name: 'Aprobar' })
    expect(approve).toHaveClass('btn-light-brand')
    expect(approve).not.toHaveClass('btn-primary')
  })

  test('destructive sigue en danger aunque approveVariant diga otra cosa', () => {
    render(<ApprovalCard {...base} destructive approveVariant="light-brand" />)
    const approve = screen.getByRole('button', { name: 'Aprobar' })
    expect(approve).toHaveClass('btn-danger')
    expect(approve).not.toHaveClass('btn-light-brand')
    expect(approve).not.toHaveClass('btn-primary')
  })

  test('sin la prop el botón de aprobar es primary', () => {
    render(<ApprovalCard {...base} />)
    expect(screen.getByRole('button', { name: 'Aprobar' })).toHaveClass('btn-primary')
  })
})
