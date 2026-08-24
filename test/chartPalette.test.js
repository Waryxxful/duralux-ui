import { expect, test } from 'vitest'
import { CHART_PALETTE } from '../src/components/charts/chartPalette.js'

function luminance(hex) {
  const channels = hex.slice(1).match(/.{2}/g).map((part) => Number.parseInt(part, 16) / 255)
  const linear = channels.map((channel) => (
    channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  ))
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2]
}

function contrast(first, second) {
  const [light, dark] = [luminance(first), luminance(second)].sort((a, b) => b - a)
  return (light + 0.05) / (dark + 0.05)
}

test('light chart marks meet 3:1 contrast against the canvas', () => {
  CHART_PALETTE.forEach((color) => expect(contrast(color, '#ffffff')).toBeGreaterThanOrEqual(3))
})
