import ReactApexChart from 'react-apexcharts'

const EMPTY_OPTIONS = {}
const EMPTY_SERIES = []

export function ApexChart({ type = 'line', options = EMPTY_OPTIONS, series = EMPTY_SERIES, height = 350, width = '100%' }) {
  return (
    <ReactApexChart
      type={type}
      options={options}
      series={series}
      height={height}
      width={width}
    />
  )
}
