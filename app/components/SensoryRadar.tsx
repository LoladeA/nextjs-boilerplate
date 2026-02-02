'use client'

import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts'

export default function SensoryRadar({ data }: { data: any[] }) {
  // Transform the raw assessment data into chart format
  // We expect data keys to match the questions from Step 2
  const chartData = [
    { subject: 'Visual', A: data.find(d => d.question_key === 'visual_entropy')?.answer?.response || 0, fullMark: 5 },
    { subject: 'Acoustic', A: data.find(d => d.question_key === 'acoustic_intrusions')?.answer?.response || 0, fullMark: 5 },
    { subject: 'Lighting', A: data.find(d => d.question_key === 'lighting_fatigue')?.answer?.response || 0, fullMark: 5 },
    { subject: 'Tactile', A: data.find(d => d.question_key === 'tactile_grounding')?.answer?.response || 0, fullMark: 5 },
    { subject: 'Spatial', A: data.find(d => d.question_key === 'spatial_resonance')?.answer?.response || 0, fullMark: 5 },
  ]

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
          <PolarGrid stroke="#c9ccbb" strokeOpacity={0.2} />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#c9ccbb', fontSize: 12 }} />
          <PolarRadiusAxis angle={30} domain={[0, 5]} tick={false} axisLine={false} />
          <Radar
            name="Sensory Load"
            dataKey="A"
            stroke="#b5a642"
            strokeWidth={2}
            fill="#b5a642"
            fillOpacity={0.3}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1b270e', borderColor: '#b5a642', color: '#c9ccbb' }}
            itemStyle={{ color: '#b5a642' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
