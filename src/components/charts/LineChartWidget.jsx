import {
  ResponsiveContainer, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts'

/**
 * LineChartWidget — gráfico de líneas estilo Duralux.
 *
 * Props:
 *   data    — [{ name, ...series }]
 *   series  — [{ key, color, label, dashed }]
 *   height  — número de px (default 260)
 */
export function LineChartWidget({ data = [], series = [], height = 260 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--gcu-border, #f0f0f0)" />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--gcu-muted, #8c8c8c)' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: 'var(--gcu-muted, #8c8c8c)' }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{
            background: 'var(--gcu-surface, #fff)',
            color: 'var(--gcu-text, #283c50)',
            borderRadius: 8,
            border: 'none',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            fontSize: 12,
          }}
        />
        {series.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
        {series.map((s) => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.label || s.key}
            stroke={s.color}
            strokeWidth={2}
            strokeDasharray={s.dashed ? '5 5' : undefined}
            dot={false}
            activeDot={{ r: 5 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
