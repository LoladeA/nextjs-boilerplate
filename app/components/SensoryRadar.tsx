'use client'

import { ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts'

const defaultData = [
  { subject: 'Visual', A: 120, fullMark: 150 },
  { subject: 'Acoustic', A: 98, fullMark: 150 },
  { subject: 'Lighting', A: 86, fullMark: 150 },
  { subject: 'Nature', A: 99, fullMark: 150 },
  { subject: 'Scent', A: 85, fullMark: 150 },
  { subject: 'Space', A: 65, fullMark: 150 },
]

export default function SensoryRadar({ data = defaultData }) {
  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#c9ccbb" strokeOpacity={0.1} />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: '#b5a642', fontSize: 14, opacity: 0.6 }} 
          />
          <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
          <Radar
            name="My Environment"
            dataKey="A"
            stroke="#b5a642"
            strokeWidth={2}
            fill="#b5a642"
            fillOpacity={0.3}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
