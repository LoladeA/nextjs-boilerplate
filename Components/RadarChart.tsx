'use client'

import { Radar, RadarChart as RC, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'

interface RadarChartProps {
  data: {
    environmentalLoad: number
    spatialDysregulation: number
    biologicalMismatch: number
  }
}

export default function RadarChart({ data }: RadarChartProps) {
  const chartData = [
    { subject: 'Environmental Load', value: data.environmentalLoad },
    { subject: 'Spatial Dysregulation', value: data.spatialDysregulation },
    { subject: 'Biological Mismatch', value: data.biologicalMismatch }
  ]

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <RC outerRadius={100} data={chartData}>
          <PolarGrid stroke="#c9ccbb" />
          <PolarAngleAxis dataKey="subject" stroke="#cfc993" />
          <PolarRadiusAxis stroke="#c9ccbb" />
          <Radar
            name="Signals"
            dataKey="value"
            stroke="#f5d76e"
            fill="#f5d76e"
            fillOpacity={0.5}
          />
        </RC>
      </ResponsiveContainer>
    </div>
  )
}
