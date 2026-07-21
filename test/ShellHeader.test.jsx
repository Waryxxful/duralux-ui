import { afterEach, expect, test, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ShellHeader } from '../src/index.js'

afterEach(() => {
  vi.unstubAllGlobals()
})

test('opens the user menu by click without Bootstrap', async () => {
  const user = userEvent.setup()
  const mediaQuery = {
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }
  vi.stubGlobal('matchMedia', vi.fn(() => mediaQuery))

  render(
    <ShellHeader
      nombre="Ada Lovelace"
      email="ada@example.com"
      rol="agente"
      viewAsSa={false}
      cuentaNombre={null}
      cuentas={[]}
      apps={[]}
      dark={false}
      mini={false}
      onToggleDark={vi.fn()}
      onToggleMini={vi.fn()}
      onToggleMobileNav={vi.fn()}
      onOpenApp={vi.fn()}
      onSelectCuenta={vi.fn()}
      onVolverSa={vi.fn()}
      appHref={() => '/'}
      csrfToken="csrf-token"
    />,
  )

  const trigger = screen.getByRole('button', { name: 'Menú de usuario' })
  const menu = document.getElementById(trigger.getAttribute('aria-controls'))
  expect(trigger).not.toHaveAttribute('data-bs-toggle')
  expect(menu).not.toHaveClass('show')

  await user.click(trigger)

  expect(trigger).toHaveAttribute('aria-expanded', 'true')
  expect(menu).toHaveClass('show')
})
