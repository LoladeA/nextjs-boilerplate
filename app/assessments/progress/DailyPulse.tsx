'use client'

import { useState } from 'react'
import { Brain, Moon, Activity, Check } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function DailyPulse({ onComplete }: { onComplete?: () => void }) {
  const supabase = createClientComponentClient()
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const [metrics, setMetrics] = useState({
    focus: 0,
    tension: 0,
    wakes: 0
  })

  const handleSubmit = async () => {
    setLoading(true)
    const { error } = await supabase.from('daily_logs').insert({
      focus_hours: metrics.focus,
      morning_tension: metrics.tension,
      sleep_wakes: metrics.wakes,
      date: new Date().toISOString().split('T')[0]
    })

    if (!error) {
      setSubmitted(true)
      if (onComplete) onComplete()
    }
    setLoading(false)
  }

  if (submitted) {
    return (
      <div className="glass-panel p-6 rounded-2xl border border-[#b5a642]/20 text-center animate-fade-in">
        <div className="w-12 h-12 bg-[#b5a642]/10 rounded-full flex items-center justify-center mx-auto mb-3 text-[#b5a642]">
          <Check size={24} />
        </div>
        <h3 className="text-[#c9ccbb] font-serif text-lg">Bio-Data Logged</h3>
        <p className="text-[#c9ccbb]/60 text-sm">Your metrics have been integrated into the correlation engine.</p>
      </div>
    )
  }

  return (
    <div className="glass-panel p-6 md:p-8 rounded-2xl border-l-4 border-[#b5a642] relative overflow-hidden">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-serif text-[#c9ccbb]">Daily Bio-Integration</h3>
          <p className="text-[#c9ccbb]/60 text-sm">Log your biological markers to track environmental impact.</p>
        </div>
        <div className="px-3 py-1 bg-[#b5a642]/10 rounded text-[10px] uppercase tracking-widest text-[#b5a642] font-bold">
          {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* 1. FOCUS METRIC */}
        <div>
          <div className="flex justify-between mb-3">
            <label className="flex items-center gap-2 text-sm text-[#c9ccbb]">
              <Brain size={16} className="text-[#b5a642]" /> Focus
            </label>
            <span className="text-[#b5a642] font-mono">{metrics.focus}h</span>
          </div>
          <input 
            type="range" min="0" max="12" step="0.5"
            value={metrics.focus}
            onChange={(e) => setMetrics({...metrics, focus: parseFloat(e.target.value)})}
            className="w-full accent-[#b5a642] h-1 bg-[#000]/50 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* 2. TENSION METRIC */}
        <div>
          <div className="flex justify-between mb-3">
            <label className="flex items-center gap-2 text-sm text-[#c9ccbb]">
              <Activity size={16} className="text-[#b5a642]" /> Tension
            </label>
            <span className="text-[#b5a642] font-mono">{metrics.tension}/10</span>
          </div>
          <input 
            type="range" min="0" max="10" step="1"
            value={metrics.tension}
            onChange={(e) => setMetrics({...metrics, tension: parseInt(e.target.value)})}
            className="w-full accent-[#b5a642] h-1 bg-[#000]/50 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* 3. SLEEP CONTINUITY */}
        <div>
           <div className="flex justify-between mb-3">
            <label className="flex items-center gap-2 text-sm text-[#c9ccbb]">
              <Moon size={16} className="text-[#b5a642]" /> Wakes
            </label>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setMetrics({...metrics, wakes: Math.max(0, metrics.wakes - 1)})}
                className="w-6 h-6 rounded bg-[#000]/30 text-[#c9ccbb] hover:text-[#b5a642] flex items-center justify-center transition-colors"
              > - </button>
              <span className="text-[#b5a642] font-mono w-4 text-center">{metrics.wakes}</span>
              <button 
                onClick={() => setMetrics({...metrics, wakes: metrics.wakes + 1})}
                className="w-6 h-6 rounded bg-[#000]/30 text-[#c9ccbb] hover:text-[#b5a642] flex items-center justify-center transition-colors"
              > + </button>
            </div>
          </div>
           {/* SUBMIT BUTTON (Inside Grid for Desktop) */}
           <button 
            onClick={handleSubmit}
            disabled={loading}
            className="w-full mt-2 py-2 bg-[#b5a642] text-[#1b270e] text-xs font-bold uppercase tracking-widest rounded hover:bg-[#d4c55e] transition-all disabled:opacity-50"
          >
            {loading ? 'Logging...' : 'Log Data'}
          </button>
        </div>

      </div>
    </div>
  )
}
