import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { AiLoader, PromptComposer, SourceList, StreamingAnswer } from '../src'

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('StreamingAnswer: anuncia por bloques terminados, no por token', () => {
  test('mientras se genera solo anuncia los bloques cerrados; al terminar, todos', () => {
    const sources = [{ id: 1, title: 'Informe diario', domain: 'Cobranza' }]
    const { rerender } = render(<StreamingAnswer streaming text="El nivel de servicio fue 82 % [1]." sources={sources} />)
    const live = screen.getByTestId('ai-answer-live')
    expect(live).toHaveAttribute('aria-live', 'polite')
    expect(live.querySelectorAll('p')).toHaveLength(0)

    rerender(<StreamingAnswer streaming text={'El nivel de servicio fue 82 % [1].\n\nLa espera me'} sources={sources} />)
    expect(live.querySelectorAll('p')).toHaveLength(1)
    expect(live).toHaveTextContent('82 % (fuente 1).')

    rerender(<StreamingAnswer streaming text={'El nivel de servicio fue 82 % [1].\n\nLa espera media subió'} sources={sources} />)
    expect(live.querySelectorAll('p')).toHaveLength(1)

    rerender(<StreamingAnswer text={'El nivel de servicio fue 82 % [1].\n\nLa espera media subió a 48 s.'} sources={sources} />)
    expect(live.querySelectorAll('p')).toHaveLength(2)
    expect(screen.getByRole('list', { name: 'Fuentes' })).toBeInTheDocument()
  })

  test('un mensaje del historial (nunca en streaming) no se anuncia', () => {
    render(<StreamingAnswer text={'Uno.\n\nDos.'} />)
    expect(screen.getByTestId('ai-answer-live').querySelectorAll('p')).toHaveLength(0)
  })
})

describe('AiLoader: tiempo transcurrido', () => {
  test('cuenta segundos y pasa a minutos', () => {
    vi.useFakeTimers()
    render(<AiLoader label="Analizando 1.284 llamadas" />)
    const time = screen.getByTestId('ai-loader-time')
    expect(time).toHaveTextContent('0 s')
    act(() => { vi.advanceTimersByTime(8000) })
    expect(time).toHaveTextContent('8 s')
    act(() => { vi.advanceTimersByTime(57000) })
    expect(time).toHaveTextContent('1 min 05 s')
    expect(time).toHaveAttribute('aria-hidden', 'true')
  })
})

describe('PromptComposer: Enter envía, Shift+Enter salta de línea', () => {
  test('envía el texto recortado con Enter y conserva el aviso fijo', () => {
    const onSubmit = vi.fn()
    render(<PromptComposer onSubmit={onSubmit} />)
    const field = screen.getByRole('textbox', { name: 'Pregunta al asistente' })
    fireEvent.change(field, { target: { value: '  ¿Cuántas llamadas abandonadas hubo ayer?  ' } })

    fireEvent.keyDown(field, { key: 'Enter', shiftKey: true })
    expect(onSubmit).not.toHaveBeenCalled()

    fireEvent.keyDown(field, { key: 'Enter' })
    expect(onSubmit).toHaveBeenCalledWith('¿Cuántas llamadas abandonadas hubo ayer?', [])
    expect(field).toHaveValue('')
    expect(screen.getByText('El asistente puede equivocarse. Revisa las fuentes antes de tomar decisiones.')).toBeInTheDocument()
  })

  test('busy: Enter no envía y el botón es «Detener respuesta»', () => {
    const onSubmit = vi.fn()
    const onStop = vi.fn()
    render(<PromptComposer onSubmit={onSubmit} busy onStop={onStop} defaultValue="Otra pregunta" />)
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' })
    expect(onSubmit).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Detener respuesta' }))
    expect(onStop).toHaveBeenCalled()
  })
})

describe('Fuentes: enlaces no confiables', () => {
  test('solo http/https son enlace; javascript: queda como texto', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(
      <SourceList
        sources={[
          { id: 1, title: 'Informe semanal', href: 'https://crm.example.cl/informe' },
          { id: 2, title: 'Fuente maliciosa', href: 'javascript:alert(1)' },
        ]}
      />,
    )
    expect(screen.getByRole('link', { name: /Informe semanal/ })).toHaveAttribute('href', 'https://crm.example.cl/informe')
    expect(screen.queryByRole('link', { name: /Fuente maliciosa/ })).toBeNull()
    expect(screen.getByText('Fuente maliciosa')).toBeInTheDocument()
    expect(String(vi.mocked(console.warn).mock.calls.flat().join(' '))).not.toContain('javascript')
  })
})
