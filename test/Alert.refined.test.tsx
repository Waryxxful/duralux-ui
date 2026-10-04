import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { IconAlertTriangle } from '@tabler/icons-react'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { Alert } from '../src/components/ui/Alert'

afterEach(() => vi.restoreAllMocks())

describe('Alert refinado (receta de componente 2.3)', () => {
  test('reenvía ref al contenedor de la alerta', () => {
    const ref = createRef<HTMLDivElement>()
    render(<Alert ref={ref}>Guardado</Alert>)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
    expect(ref.current).toHaveClass('gcu-alert')
  })

  test('acepta un icono Tabler además de la clase Feather histórica', () => {
    const { container } = render(<Alert variant="warning" icon={<IconAlertTriangle />}>Revisa la meta</Alert>)
    const svg = container.querySelector('.gcu-alert__icon svg')
    expect(svg).toHaveAttribute('aria-hidden', 'true')
  })

  test('una variante desconocida avisa con prefijo [duralux] y cae en primary', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    // SAFETY: se fuerza un tono fuera del tipo público para probar el fallback en runtime.
    const { container } = render(<Alert variant={'rosa' as never}>Mensaje</Alert>)
    expect(container.querySelector('.gcu-alert')).toHaveClass('gcu-alert--primary')
    expect(warn).toHaveBeenCalledWith('[duralux]', expect.stringContaining('rosa'))
  })

  test('el cierre nombra la acción, quita la alerta y avisa al consumidor', async () => {
    const user = userEvent.setup()
    const onDismiss = vi.fn()
    const { container } = render(<Alert title="Exportación lista" onDismiss={onDismiss}>Descarga el archivo.</Alert>)
    await user.click(screen.getByRole('button', { name: 'Cerrar' }))
    expect(onDismiss).toHaveBeenCalledOnce()
    expect(container.querySelector('.gcu-alert')).not.toBeInTheDocument()
  })

  test('el contenido vive en un cuerpo propio para el CSS del componente', () => {
    const { container } = render(<Alert title="Atención">Hay 3 agentes en pausa.</Alert>)
    const body = container.querySelector('.gcu-alert__body')
    expect(body).toHaveTextContent('Atención Hay 3 agentes en pausa.')
    expect(body?.querySelector('.gcu-alert__title')).toHaveTextContent('Atención')
  })
})
