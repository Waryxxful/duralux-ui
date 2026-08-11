import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { expect, test } from 'vitest'

const root = resolve(process.cwd())
const source = readFileSync(resolve(root, 'src/index.ts'), 'utf8')

test('root entry has no chart engine imports or chart component exports', () => {
  expect(source).not.toMatch(/apexcharts|react-apexcharts|recharts/)
  expect(source).not.toMatch(/components\/charts/)
  expect(source).not.toMatch(/\b(ApexChart|AreaChartWidget|BarChartWidget|LineChartWidget|PieChartWidget)\b/)
})
