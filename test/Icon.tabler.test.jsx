import { render, screen } from '@testing-library/react'
import { IconRobot } from '@tabler/icons-react'
import { describe, expect, test } from 'vitest'
import { Icon } from '../src/components/ui/Icon'
import { Button, IconButton } from '../src/components/ui/Button'

describe('Icon acepta Feather (string) y Tabler (ReactNode)', () => {
  test('string sigue renderizando el glifo Feather', () => {
    const { container } = render(<Icon name="plus" />)
    expect(container.querySelector('i.feather-plus')).not.toBeNull()
  })

  test('un icono Tabler se normaliza a 16px, trazo 2 y decorativo', () => {
    const { container } = render(<Icon icon={<IconRobot />} size="md" />)
    const svg = container.querySelector('svg')
    expect(svg).not.toBeNull()
    expect(svg.getAttribute('width')).toBe('16')
    expect(svg.getAttribute('stroke-width')).toBe('2')
    expect(svg.getAttribute('aria-hidden')).toBe('true')
  })

  test('con aria-label el icono Tabler se anuncia como imagen', () => {
    render(<Icon icon={<IconRobot />} aria-label="Asistente" />)
    expect(screen.getByRole('img', { name: 'Asistente' }).tagName.toLowerCase()).toBe('svg')
  })

  test('Button acepta un icono Tabler en startIcon y endIcon', () => {
    const { container } = render(<Button startIcon={<IconRobot />} endIcon={<IconRobot />}>Analizar</Button>)
    expect(container.querySelectorAll('button svg')).toHaveLength(2)
    expect(screen.getByRole('button', { name: 'Analizar' })).toBeInTheDocument()
  })

  test('IconButton acepta un icono Tabler', () => {
    const { container } = render(<IconButton icon={<IconRobot />} label="Asistente" />)
    expect(container.querySelector('button svg')).not.toBeNull()
    expect(screen.getByRole('button', { name: 'Asistente' })).toBeInTheDocument()
  })
})
