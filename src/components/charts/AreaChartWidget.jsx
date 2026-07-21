import { useId } from 'react'
import {
  ResponsiveContainer, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts'

function sanitizeIdPart(value) {
  return String(value).replace(/[^A-Za-z0-9_-]+/g, '-')
}

/**
 * AreaChartWidget — gráfico de área con gradiente estilo Duralux.
 *
 * Props:
 *   data     — [{ name, ...series }]
 *   series   — [{ key, color, label }]
 *   height   — número de px (default 260)
 *   grid     — mostrar grilla (default true)
 */
export function AreaChartWidget({ data = [], series = [], height = 260, grid = true }) {
  const gradientIdPrefix = `area-gradient-${sanitizeIdPart(useId())}`
  const gradientId = (key, index) => `${gradientIdPrefix}-${sanitizeIdPart(key)}-${index}`

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          {series.map((s, index) => (
            <linearGradient key={s.key} id={gradientId(s.key, index)} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={s.color} stopOpacity={0.25} />
              <stop offset="95%" stopColor={s.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        {grid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#8c8c8c' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#8c8c8c' }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }}
        />
        {series.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
        {series.map((s, index) => (
          <Area
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.label || s.key}
            stroke={s.color}
            fill={`url(#${gradientId(s.key, index)})`}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 5 }}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  )
}
