// @vitest-environment node

import React from 'react'
import { renderToString } from 'react-dom/server'
import { expect, test } from 'vitest'
import { usePrefersReducedMotion } from '../src/components/charts/chartMotion.js'

function MotionProbe() {
  const reducedMotion = usePrefersReducedMotion()
  return <output>{String(reducedMotion)}</output>
}

test('keeps reduced-motion SSR snapshot stable without browser globals', () => {
  expect(renderToString(<MotionProbe />)).toContain('<output>false</output>')
})
