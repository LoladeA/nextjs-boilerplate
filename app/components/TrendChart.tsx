'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'

interface TrendChartProps {
  responses: any[]
}

export default function TrendChart({ responses }: TrendChartProps) {
  // 1. Group responses by date (assuming your user_responses has a created_at)
  // For this logic, we aggregate the total score for each date found
  const processData = () => {
    const dataMap: { [date: string]: any } = {}

    responses.forEach((r) => {
      const date = new Date(r.created_at || Date.now()).toLocaleDateString('en-GB', {
        month: 'short',
        day: 'numeric'
      })
      
      if (!dataMap[date]) {
        dataMap[date] = { date, load: 0, dysregulation: 0, mismatch: 0 }
      }

      const val = Number(r.answer?.response) || 0
      
      // Categorization Logic (Matching Dashboard)
      if (['thermal_friction', 'stress_spikes', 'cognitive_fog', 'circadian_sync'].includes(r.question_key)) {
        dataMap[date].load += val
      } else if (['visual_entropy', 'acoustic_intrusions', 'lighting_fatigue'].includes(r.question_key)) {
        dataMap[date].dysregulation += val
      } else {
        dataMap[date].mismatch += val
      }
    })

    return Object.values(dataMap).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  const chartData = processData()

  return (
    <div className="w-full h-full min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#c9ccbb20" vertical={false} />
          <XAxis 
            dataKey="date" 
            stroke="#c9ccbb" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
          />
          <YAxis hide />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1b270e', border: '1px solid #c9ccbb20', borderRadius: '12px' }}
            itemStyle={{ fontSize: '12px' }}
          />
          <Legend iconType="circle" />
          <Line 
            type="monotone" 
            dataKey="load" 
            name="Env. Load" 
            stroke="#b5a642" 
            strokeWidth={2} 
            dot={{ fill: '#b5a642' }} 
          />
          <Line 
            type="monotone" 
            dataKey="dysregulation" 
            name="Spatial Dys." 
            stroke="#c9ccbb" 
            strokeWidth={2} 
            dot={{ fill: '#c9ccbb' }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
