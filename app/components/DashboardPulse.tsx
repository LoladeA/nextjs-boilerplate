'use client'

import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts'
import { Activity } from 'lucide-react'

export default function DashboardPulse({ logs }: { logs: any[] }) {
  // Format data for Recharts (reverse to show oldest -> newest)
  const data = logs ? [...logs].reverse() : []

  if (data.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-[#c9ccbb]/30">
        <Activity size={24} className="mb-2 opacity-50" />
        <span className="text-xs uppercase tracking-widest">No Signal Yet</span>
      </div>
    )
  }

  return (
    <div className="h-full w-full relative group">
      <div className="absolute inset-0 bg-gradient-to-t from-[#1b270e] to-transparent z-10 opacity-50" />
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="pulseGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#b5a642" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#b5a642" stopOpacity={0} />
            </linearGradient>
          </defs>
          <YAxis hide domain={[0, 6]} />
          <Area
            type="monotone"
            dataKey="mood_score"
            stroke="#b5a642"
            strokeWidth={2}
            fill="url(#pulseGradient)"
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
      
      {/* Current Status Indicator */}
      <div className="absolute top-0 right-0 flex items-center gap-2">
         <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
         <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Live</span>
      </div>
    </div>
  )
}
