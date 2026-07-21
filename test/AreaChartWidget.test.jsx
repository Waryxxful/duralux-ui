import { render, screen } from '@testing-library/react'
import { expect, test, vi } from 'vitest'

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
  AreaChart: ({ children }) => <svg>{children}</svg>,
  Area: ({ dataKey, fill }) => <path data-testid="area" data-series={dataKey} fill={fill} />,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
}))

import { AreaChartWidget } from '../src/components/charts/AreaChartWidget.jsx'

test('uses safe instance-unique gradient IDs for matching series keys', () => {
  const series = [{ key: 'net / sales', color: '#3455db' }]
  const { container } = render(
    <>
      <AreaChartWidget series={series} />
      <AreaChartWidget series={series} />
    </>,
  )

  const gradientIds = Array.from(container.querySelectorAll('linearGradient'), gradient => gradient.id)
  const fills = screen.getAllByTestId('area').map(area => area.getAttribute('fill'))

  expect(gradientIds).toHaveLength(2)
  expect(new Set(gradientIds).size).toBe(2)
  expect(gradientIds.every(id => /^[A-Za-z][A-Za-z0-9_-]*$/.test(id))).toBe(true)
  expect(gradientIds.every(id => id.endsWith('-net-sales-0'))).toBe(true)
  expect(fills).toEqual(gradientIds.map(id => `url(#${id})`))
})

test('disambiguates series keys that sanitize to the same ID part', () => {
  const series = [
    { key: 'net / sales', color: '#3455db' },
    { key: 'net ! sales', color: '#db5434' },
  ]
  const { container } = render(<AreaChartWidget series={series} />)

  const gradientIds = Array.from(container.querySelectorAll('linearGradient'), gradient => gradient.id)
  const fills = screen.getAllByTestId('area').map(area => area.getAttribute('fill'))

  expect(gradientIds).toHaveLength(2)
  expect(new Set(gradientIds).size).toBe(2)
  expect(gradientIds[0]).toMatch(/-net-sales-0$/)
  expect(gradientIds[1]).toMatch(/-net-sales-1$/)
  expect(fills).toEqual(gradientIds.map(id => `url(#${id})`))
})
