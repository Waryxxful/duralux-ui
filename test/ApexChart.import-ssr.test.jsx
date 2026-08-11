// @vitest-environment node

import React from 'react'
import { renderToString } from 'react-dom/server'
import { expect, test } from 'vitest'
import { ApexChart } from '../src/components/charts/ApexChart.jsx'

test('imports the real Apex adapter without browser globals during SSR', () => {
  expect(globalThis.document).toBeUndefined()
  expect(globalThis.window).toBeUndefined()
  expect(() => renderToString(
    <ApexChart
      ariaLabel="Ventas reales"
      series={[{ name: 'Ventas', data: [10] }]}
    />,
  )).not.toThrow()
})
