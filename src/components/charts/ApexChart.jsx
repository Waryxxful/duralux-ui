import ReactApexChart from 'react-apexcharts'

export function ApexChart({ type = 'line', options = {}, series = [], height = 350, width = '100%' }) {
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
