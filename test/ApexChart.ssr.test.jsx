// @vitest-environment node

import React from 'react'
import { renderToString } from 'react-dom/server'
import { expect, test, vi } from 'vitest'

import { ApexChart } from '../src/components/charts/ApexChart.jsx'

test('is safe to render on the server without browser globals', () => {
  expect(() => renderToString(
    <ApexChart
      title="Ventas"
      description="Ventas por mes"
      options={{ xaxis: { categories: ['Ene'] } }}
      series={[{ name: 'Ventas', data: [10] }]}
    />,
  )).not.toThrow()

  const html = renderToString(
    <ApexChart
      ariaLabel="Ventas"
      options={{}}
      series={[{ name: 'Ventas', data: [10] }]}
    />,
  )
  expect(html).toContain('role="img"')
  expect(html).toContain('aria-label="Ventas"')
  expect(html).toContain('data-chart-ssr-placeholder="true"')
  expect(html).toContain('El gráfico se cargará en el navegador.')
  expect(html).not.toContain('ReactApexChart must not be invoked')
})

test('renders the explicit SSR fallback when Apex cannot paint a canvas', () => {
  const html = renderToString(
    <ApexChart
      ssrFallback={<p>Tabla de ventas</p>}
      series={[{ name: 'Ventas', data: [10] }]}
    />,
  )
  expect(html).toContain('Tabla de ventas')
  expect(html).toContain('data-chart-frame="true"')
  const visualStart = html.indexOf('class="chart-frame__visual"')
  const visualEnd = html.indexOf('</div>', visualStart)
  expect(visualStart).toBeGreaterThan(-1)
  expect(visualEnd).toBeLessThan(html.indexOf('Tabla de ventas'))
})

test('keeps state fallback and SSR fallback as separate contracts', () => {
  const html = renderToString(
    <ApexChart
      fallback={<p>Estado del gráfico</p>}
      ssrFallback={<p>SSR del gráfico</p>}
      series={[{ name: 'Ventas', data: [10] }]}
    />,
  )

  expect(html).toContain('SSR del gráfico')
  expect(html).not.toContain('Estado del gráfico')
})
