import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vitest'

vi.mock('react-apexcharts', () => ({
  default: ({ options, type, series }: { options: unknown; type: string; series: unknown }) => (
    <div data-testid="apex-chart" data-type={type} data-series={JSON.stringify(series)} data-options={JSON.stringify(options)} />
  ),
}))

import { Donut, Gauge, Sparkline, TrendLine } from '../src/charts/apex'
import { designTokens } from '../src/tokens'

afterEach(() => vi.restoreAllMocks())

const optionsOf = async () => JSON.parse((await screen.findByTestId('apex-chart')).getAttribute('data-options') ?? '{}')

describe('Gráficos compactos (lote N2)', () => {
  test('Sparkline: figura con nombre, descripción automática es-CL y tabla oculta', async () => {
    const ref = createRef<HTMLElement>()
    render(<Sparkline ref={ref} ariaLabel="Llamadas por hora" data={[1200, 1840.5, 2840]} tone="success" />)
    const figure = screen.getByRole('figure', { name: 'Llamadas por hora' })
    expect(ref.current).toBe(figure)
    expect(figure).toHaveAccessibleDescription('De 1.200 a 2.840 en 3 puntos; mínimo 1.200, máximo 2.840.')
    expect(screen.getByRole('table', { name: 'Llamadas por hora' })).toBeInTheDocument()
    const options = await optionsOf()
    expect(options.chart.sparkline.enabled).toBe(true)
    expect(options.colors[0]).toBe(designTokens.themes.light.colors['status-success'])
  })

  test('Sparkline onColor: línea clara sobre superficie de color', async () => {
    render(<Sparkline ariaLabel="Tendencia" data={[1, 2]} onColor />)
    const options = await optionsOf()
    expect(options.colors[0]).toBe(designTokens.palette.slate['50'])
    expect(options.chart.background).toBe('transparent')
  })

  test('TrendLine: comparación punteada y meta anotada', async () => {
    render(
      <TrendLine
        ariaLabel="Nivel de servicio por semana"
        categories={['S1', 'S2', 'S3']}
        series={[{ name: 'Este año', data: [78, 81, 86] }, { name: 'Año pasado', data: [70, 72, 75] }]}
        target={{ value: 80, label: 'Meta 80 %' }}
      />,
    )
    expect(screen.getByRole('figure', { name: 'Nivel de servicio por semana' })).toHaveAccessibleDescription(/Este año: De 78 a 86.*Meta 80 %/)
    const options = await optionsOf()
    expect(options.stroke.dashArray).toEqual([0, 5, 2])
    expect(options.annotations.yaxis[0].y).toBe(80)
  })

  test('Gauge: recorta fuera de rango, avisa y describe la cifra', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<Gauge ariaLabel="Cumplimiento de meta" value={120} />)
    expect(warn).toHaveBeenCalledWith('[duralux]', expect.stringContaining('fuera de 0–100'))
    expect(screen.getByRole('figure', { name: 'Cumplimiento de meta' })).toHaveAccessibleDescription('100 % de 100 %.')
    expect((await screen.findByTestId('apex-chart')).getAttribute('data-series')).toBe('[100]')
  })

  test('Donut: total al centro y aviso con más de 6 categorías', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<Donut ariaLabel="Resultado de las gestiones" labels={['Contactado', 'Buzón']} values={[540, 60]} />)
    expect(screen.getByRole('figure', { name: 'Resultado de las gestiones' })).toHaveAccessibleDescription('Total 600. Contactado: 540 (90 %); Buzón: 60 (10 %).')
    const options = await optionsOf()
    expect(options.plotOptions.pie.donut.size).toBe('68%')
    const labels = ['a', 'b', 'c', 'd', 'e', 'f', 'g']
    render(<Donut ariaLabel="Muchas" labels={labels} values={labels.map(() => 1)} />)
    expect(warn).toHaveBeenCalledWith('[duralux]', expect.stringContaining('usa RankList'))
  })
})
