import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { ConnectionCard } from '../src/components/ui/ConnectionCard'

afterEach(() => vi.restoreAllMocks())

describe('ConnectionCard refinado (lote L4)', () => {
  test('reenvía ref a la raíz con clases propias (sin utilidades de borde del tema)', () => {
    const ref = createRef<HTMLDivElement>()
    render(<ConnectionCard ref={ref} icon={<span />} title="Slack" checked={false} onChange={() => {}} data-testid="cc" />)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
    expect(screen.getByTestId('cc')).toHaveClass('gcu-connection-card', 'gcu-container')
    expect(screen.getByTestId('cc')).not.toHaveClass('border')
  })

  test('el switch se nombra con el título y se opera con teclado', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<ConnectionCard icon={<span />} title="Google Calendar" checked={false} onChange={onChange} />)
    const toggle = screen.getByRole('checkbox', { name: /Google Calendar/ })
    toggle.focus()
    await user.keyboard(' ')
    expect(onChange).toHaveBeenCalledWith(true)
  })

  test('deshabilitado explica por qué (aria-describedby)', () => {
    render(<ConnectionCard icon={<span />} title="WhatsApp" checked={false} onChange={() => {}} disabled disabledReason="Requiere un número verificado." />)
    const toggle = screen.getByRole('checkbox', { name: /WhatsApp/ })
    expect(toggle).toBeDisabled()
    expect(toggle).toHaveAccessibleDescription('Requiere un número verificado.')
  })

  test('sin onChange válido registra el error en lugar de romper', async () => {
    const user = userEvent.setup()
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    // SAFETY: se fuerza un onChange inválido para probar la guarda en runtime.
    render(<ConnectionCard icon={<span />} title="Teams" checked={false} onChange={undefined as never} />)
    await user.click(screen.getByRole('checkbox'))
    expect(error).toHaveBeenCalledWith('[duralux]', expect.stringContaining('ConnectionCard'))
  })
})
