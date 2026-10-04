import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import { IconRobot } from '@tabler/icons-react'
import { describe, expect, test } from 'vitest'
import { Icon } from '../src/components/ui/Icon'
import { renderIconSlot } from '../src/utils/iconSlot'

describe('Icon refinado (receta de componente 2.3)', () => {
  test('reenvía ref al glifo Feather', () => {
    const ref = createRef<HTMLElement>()
    render(<Icon ref={ref} name="plus" />)
    expect(ref.current?.tagName).toBe('I')
  })

  test('con `icon` conserva style, className y atributos extra (DX-034)', () => {
    const { container } = render(
      <Icon icon={<IconRobot />} className="text-primary" style={{ opacity: 0.5 }} data-testid="robot" />,
    )
    const svg = container.querySelector('svg')
    expect(svg).toHaveClass('gcu-icon-svg', 'text-primary')
    expect(svg).toHaveAttribute('data-testid', 'robot')
    expect(svg?.style.opacity).toBe('0.5')
  })

  test('con `icon` el ref llega al SVG', () => {
    const ref = createRef<SVGSVGElement>()
    render(<Icon ref={ref} icon={<IconRobot />} />)
    expect(ref.current?.tagName.toLowerCase()).toBe('svg')
  })

  test('el glifo Feather con tamaño fusiona el style del consumidor', () => {
    const { container } = render(<Icon name="plus" size="lg" style={{ color: 'red' }} />)
    const glyph = container.querySelector('i')
    expect(glyph?.style.fontSize).toBe('1.25rem')
    expect(glyph?.style.color).toBe('red')
  })
})

describe('renderIconSlot respeta la accesibilidad propia del elemento (DX-035)', () => {
  test('un SVG con aria-label propio no se oculta', () => {
    render(<>{renderIconSlot(<IconRobot aria-label="Asistente" />)}</>)
    const svg = screen.getByRole('img', { name: 'Asistente' })
    expect(svg).not.toHaveAttribute('aria-hidden')
  })

  test('un SVG con aria-labelledby propio no se oculta', () => {
    render(
      <>
        <span id="robot-name">Robot</span>
        {renderIconSlot(<IconRobot aria-labelledby="robot-name" />)}
      </>,
    )
    expect(screen.getByRole('img', { name: 'Robot' })).not.toHaveAttribute('aria-hidden')
  })

  test('sin nombre propio sigue siendo decorativo', () => {
    const { container } = render(<>{renderIconSlot(<IconRobot />)}</>)
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })
})
