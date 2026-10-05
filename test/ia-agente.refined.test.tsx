import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { ApprovalCard, DiffView, InlineEdit, lineDiff, wordDiff } from '../src'
import { log } from '../src/utils/log'

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('ApprovalCard (2.8 agente)', () => {
  test('no ejecuta: emite la intención una sola vez y anuncia la decisión', async () => {
    const fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)
    const infoSpy = vi.spyOn(log, 'info').mockImplementation(() => {})
    const onApprove = vi.fn()
    const onReject = vi.fn()
    const params = { campaña: 'Retención octubre', destinatarios: 12 }
    render(
      <ApprovalCard
        title="Enviar correo de seguimiento a 12 clientes"
        description="Clientes con reclamo abierto hace más de 48 h."
        intentId="act-7"
        tool="send_followup_email"
        params={params}
        onApprove={onApprove}
        onReject={onReject}
      />,
    )
    expect(screen.getByRole('region', { name: 'Enviar correo de seguimiento a 12 clientes' })).toBeInTheDocument()
    expect(screen.getByText('send_followup_email')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Aprobar' }))
    expect(onApprove).toHaveBeenCalledTimes(1)
    expect(onApprove).toHaveBeenCalledWith({ id: 'act-7', tool: 'send_followup_email', params })
    expect(onReject).not.toHaveBeenCalled()
    expect(fetchSpy).not.toHaveBeenCalled()
    // Sin botones tras decidir: no hay doble emisión.
    expect(screen.queryByRole('button', { name: 'Aprobar' })).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Aprobado')
    // El log no lleva los parámetros (pueden traer datos personales).
    expect(JSON.stringify(infoSpy.mock.calls)).not.toContain('Retención octubre')
  })

  test('disabledReason bloquea la decisión y la explica', async () => {
    const onApprove = vi.fn()
    render(<ApprovalCard title="Reasignar 30 casos" onApprove={onApprove} onReject={vi.fn()} disabledReason="No tienes permiso para reasignar casos de otra cola." />)
    const approve = screen.getByRole('button', { name: 'Aprobar' })
    expect(approve).toBeDisabled()
    expect(approve).toHaveAccessibleDescription('No tienes permiso para reasignar casos de otra cola.')
    await userEvent.click(approve)
    expect(onApprove).not.toHaveBeenCalled()
  })
})

describe('diff (2.8 contenido)', () => {
  test('lineDiff respeta orden y líneas repetidas', () => {
    const parts = lineDiff('a\nb\na\nc', 'a\na\nc\nd')
    expect(parts).toEqual([
      { text: 'a', kind: 'same' },
      { text: 'b', kind: 'del' },
      { text: 'a', kind: 'same' },
      { text: 'c', kind: 'same' },
      { text: 'd', kind: 'add' },
    ])
  })

  test('wordDiff conserva espacios y reconstruye ambos textos', () => {
    const before = 'Hola, revisaremos tu caso pronto'
    const after = 'Hola, revisaremos tu caso hoy mismo'
    const parts = wordDiff(before, after)
    expect(parts.filter((p) => p.kind !== 'add').map((p) => p.text).join('')).toBe(before)
    expect(parts.filter((p) => p.kind !== 'del').map((p) => p.text).join('')).toBe(after)
    expect(parts.filter((p) => p.kind === 'del').map((p) => p.text)).toEqual(['pronto'])
  })

  test('texto enorme: reemplazo completo con aviso que no incluye el contenido', () => {
    const warn = vi.spyOn(log, 'warn').mockImplementation(() => {})
    const before = Array.from({ length: 700 }, (_, i) => `x${i}`).join('\n')
    const after = Array.from({ length: 700 }, (_, i) => `y${i}`).join('\n')
    const parts = lineDiff(before, after)
    expect(parts.filter((p) => p.kind === 'del')).toHaveLength(700)
    expect(parts.filter((p) => p.kind === 'add')).toHaveLength(700)
    expect(warn).toHaveBeenCalledTimes(1)
    expect(String(warn.mock.calls[0]?.[0])).not.toContain('x1')
  })

  test('DiffView cuenta +/− y emite la decisión por archivo', async () => {
    const onDecide = vi.fn()
    render(<DiffView files={[{ name: 'pauta-calidad.md', before: 'Saludo\nCierre', after: 'Saludo\nVerificación\nCierre' }]} onDecide={onDecide} />)
    expect(screen.getByLabelText('1 líneas agregadas')).toHaveTextContent('+1')
    expect(screen.getByLabelText('0 líneas quitadas')).toHaveTextContent('−0')
    await userEvent.click(screen.getByRole('button', { name: 'Aceptar' }))
    expect(onDecide).toHaveBeenCalledWith('pauta-calidad.md', true)
    expect(screen.getByText('Aceptado')).toBeInTheDocument()
  })
})

describe('InlineEdit (2.8 contenido)', () => {
  const props = { original: 'Su caso fue cerrado.', suggestion: 'Tu caso quedó resuelto.' }

  test('Enter en la sugerencia acepta y emite el texto sugerido', async () => {
    const onAccept = vi.fn()
    const onReject = vi.fn()
    render(<InlineEdit {...props} onAccept={onAccept} onReject={onReject} autoFocus />)
    expect(screen.getByRole('textbox', { name: 'Texto sugerido' })).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    expect(onAccept).toHaveBeenCalledWith('Tu caso quedó resuelto.')
    expect(onReject).not.toHaveBeenCalled()
  })

  test('Esc descarta desde cualquier parte; Enter sobre «Descartar» no acepta', async () => {
    const onAccept = vi.fn()
    const onReject = vi.fn()
    render(<InlineEdit {...props} onAccept={onAccept} onReject={onReject} />)
    screen.getByRole('button', { name: 'Descartar' }).focus()
    await userEvent.keyboard('{Enter}')
    expect(onReject).toHaveBeenCalledTimes(1)
    expect(onAccept).not.toHaveBeenCalled()
    screen.getByRole('button', { name: 'Aceptar' }).focus()
    await userEvent.keyboard('{Escape}')
    expect(onReject).toHaveBeenCalledTimes(2)
    expect(onAccept).not.toHaveBeenCalled()
  })
})
