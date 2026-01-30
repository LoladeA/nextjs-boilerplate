'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

interface UserResponse {
  assessment_step: number
  question_key: string
  answer: { response: string | number }
}

interface TrendChartProps {
  responses: UserResponse[]
}

export default function TrendChart({ responses }: TrendChartProps) {
  // Aggregate signals per assessment_step
  const assessmentsMap: Record<number, { environmentalLoad: number; spatialDysregulation: number; biologicalMismatch: number }> = {}

  responses.forEach((r) => {
    const step = r.assessment_step
    const val = Number(r.answer.response) || 0
    if (!assessmentsMap[step]) {
      assessmentsMap[step] = { environmentalLoad: 0, spatialDysregulation: 0, biologicalMismatch: 0 }
    }

    if (['thermal_friction', 'stress_spikes', 'cognitive_fog', 'circadian_sync'].includes(r.question_key)) {
      assessmentsMap[step].environmentalLoad += val
    } else if (
      [
        'visual_entropy',
        'acoustic_intrusions',
        'lighting_fatigue',
        'tactile_grounding',
        'spatial_resonance',
        'movement_flow',
        'zoning_conflict',
        'glare_sensitivity',
        'internal_noise',
        'acoustic_privacy',
        'tactile_aversions'
      ].includes(r.question_key)
    ) {
      assessmentsMap[step].spatialDysregulation += val
    } else {
      assessmentsMap[step].biologicalMismatch += val
    }
  })

  const chartData = Object.keys(assessmentsMap).map((step) => ({
    step: `Assessment ${step}`,
    ...assessmentsMap[Number(step)]
  }))

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <LineChart data={chartData}>
          <CartesianGrid stroke="#c9ccbb" strokeDasharray="3 3" />
          <XAxis dataKey="step" stroke="#cfc993" />
          <YAxis stroke="#cfc993" />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="environmentalLoad" stroke="#f5d76e" />
          <Line type="monotone" dataKey="spatialDysregulation" stroke="#c9ccbb" />
          <Line type="monotone" dataKey="biologicalMismatch" stroke="#cfc993" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
