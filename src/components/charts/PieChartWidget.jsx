import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
} from 'recharts'

/**
 * PieChartWidget — gráfico de torta/donut estilo Duralux.
 *
 * Props:
 *   data     — [{ name, value, color }]
 *   donut    — boolean (default true — anillo)
 *   height   — número de px (default 260)
 *   legend   — mostrar leyenda (default true)
 */
export function PieChartWidget({ data = [], donut = true, height = 260, legend = true }) {
  const innerRadius = donut ? '55%' : '0%'

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius="80%"
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }}
        />
        {legend && (
          <Legend
            wrapperStyle={{ fontSize: 12 }}
            formatter={(value) => <span style={{ color: '#555' }}>{value}</span>}
          />
        )}
      </PieChart>
    </ResponsiveContainer>
  )
}
