import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, test } from 'vitest'
import { ThemeProvider } from '../src/theme/ThemeProvider'
import { ThemeScope } from '../src/components/shell/ThemeScope'
import { Modal } from '../src/components/ui/Modal.jsx'
import { Toast } from '../src/components/ui/Toast.tsx'

afterEach(() => {
  document.documentElement.classList.remove('app-skin-dark', 'minimenu')
  document.body.querySelectorAll('#gcu-toast-viewport').forEach(element => element.remove())
})

test('ThemeScope declares its explicit appearance while an inherited scope stays unmarked', () => {
  const { container } = render(
    <ThemeProvider enableResponsiveMini={false}>
      <ThemeScope theme="dark"><span>Dark</span></ThemeScope>
      <ThemeScope><span>Inherited</span></ThemeScope>
    </ThemeProvider>,
  )

  const scopes = container.querySelectorAll('.gcu-theme')
  expect(scopes[0]).toHaveAttribute('data-gcu-theme', 'dark')
  expect(scopes[1]).not.toHaveAttribute('data-gcu-theme')
})

test('ThemeScope propagates its resolved mode to Modal and Toast portals', async () => {
  render(
    <ThemeScope theme="dark">
      <Modal open title="Modal oscuro" onClose={() => {}}>Contenido</Modal>
      <Toast variant="success" title="Toast oscuro" show onClose={() => {}} autoHideMs={0} />
    </ThemeScope>,
  )

  await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())
  expect(screen.getByRole('dialog')).toHaveClass('gcu-theme')
  expect(screen.getByRole('dialog')).toHaveAttribute('data-gcu-theme', 'dark')
  const toast = screen.getByRole('status', { hidden: true })
  expect(toast).toHaveClass('gcu-theme')
  expect(toast).toHaveAttribute('data-gcu-theme', 'dark')
})
