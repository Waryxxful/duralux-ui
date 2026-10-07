import { createRef } from 'react'
import { act, render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'
import { AudioPlayer, type AudioPlayerHandle } from '../src'

describe('AudioPlayer playerRef', () => {
  test('seek deja la posición, mueve la barra y avisa; el ref del componente sigue en el div', () => {
    const playerRef = createRef<AudioPlayerHandle>()
    const rootRef = createRef<HTMLDivElement>()
    const onTimeChange = vi.fn()
    render(<AudioPlayer ref={rootRef} playerRef={playerRef} duration={120} onTimeChange={onTimeChange} />)

    expect(rootRef.current).toBeInstanceOf(HTMLDivElement)
    expect(rootRef.current?.tagName).toBe('DIV')

    act(() => {
      playerRef.current?.seek(42)
    })

    expect(playerRef.current?.currentTime).toBe(42)
    expect(screen.getByRole('slider', { name: 'Posición del audio' })).toHaveValue('42')
    expect(onTimeChange).toHaveBeenCalledTimes(1)
    expect(onTimeChange).toHaveBeenCalledWith(42)
    expect(rootRef.current).toBeInstanceOf(HTMLDivElement)
  })

  test('seek acota por debajo a 0 y por arriba a la duración', () => {
    const playerRef = createRef<AudioPlayerHandle>()
    const onTimeChange = vi.fn()
    render(<AudioPlayer playerRef={playerRef} duration={90} onTimeChange={onTimeChange} />)
    const slider = screen.getByRole('slider', { name: 'Posición del audio' })

    act(() => {
      playerRef.current?.seek(-5)
    })
    expect(playerRef.current?.currentTime).toBe(0)
    expect(slider).toHaveValue('0')
    expect(onTimeChange).toHaveBeenLastCalledWith(0)

    act(() => {
      playerRef.current?.seek(9999)
    })
    expect(playerRef.current?.currentTime).toBe(90)
    expect(slider).toHaveValue('90')
    expect(onTimeChange).toHaveBeenLastCalledWith(90)
  })

  test('play y pause cambian la simulación cuando no hay src', () => {
    const playerRef = createRef<AudioPlayerHandle>()
    render(<AudioPlayer playerRef={playerRef} duration={30} />)

    act(() => {
      playerRef.current?.play()
    })
    expect(screen.getByRole('button', { name: 'Pausar' })).toBeInTheDocument()

    act(() => {
      playerRef.current?.pause()
    })
    expect(screen.getByRole('button', { name: 'Reproducir' })).toBeInTheDocument()
  })
})
