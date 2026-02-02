'use client'

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

export default function TrendChart({ data }: { data: any[] }) {
  // Filter for 'energy_tax' data points across all assessments
  const chartData = data
    .filter(d => d.question_key === 'energy_tax')
    .map((d, i) => ({
      name: `Session ${i + 1}`,
      value: d.answer?.response || 0
    }))

  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#c9ccbb" strokeOpacity={0.1} vertical={false} />
          <XAxis dataKey="name" stroke="#c9ccbb" strokeOpacity={0.5} fontSize={10} tickLine={false} axisLine={false} />
          <YAxis stroke="#c9ccbb" strokeOpacity={0.5} fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1b270e', borderColor: '#b5a642', color: '#c9ccbb' }}
          />
          <Line type="monotone" dataKey="value" stroke="#b5a642" strokeWidth={2} dot={{ fill: '#1b270e', stroke: '#b5a642', strokeWidth: 2 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
