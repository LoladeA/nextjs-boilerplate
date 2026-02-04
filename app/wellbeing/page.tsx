'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, TrendingUp, Activity, Zap } from 'lucide-react'

// Reusable slider component
const RangeSlider = ({ label, value, onChange, minLabel, maxLabel }: any) => (
  <div className="mb-8">
    <div className="flex justify-between mb-2">
      <label className="text-[#c9ccbb] font-serif text-lg">{label}</label>
      <span className="text-[#b5a642] font-bold">{value}/10</span>
    </div>
    <input 
      type="range" 
      min="1" 
      max="10" 
      value={value} 
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-2 bg-[#c9ccbb]/20 rounded-lg appearance-none cursor-pointer accent-[#b5a642]"
    />
    <div className="flex justify-between text-xs text-[#c9ccbb]/50 mt-2 uppercase tracking-widest">
      <span>{minLabel}</span>
      <span>{maxLabel}</span>
    </div>
  </div>
)

export default function WellbeingTracker() {
  const supabase = createClientComponentClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [mood, setMood] = useState(5)
  const [stress, setStress] = useState(5)
  const [focus, setFocus] = useState(5)
  const [notes, setNotes] = useState('')
  const [history, setHistory] = useState<any[]>([])

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const { data } = await supabase
      .from('wellbeing_logs')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(7)

    if (data) setHistory(data)
  }

  const handleSubmit = async () => {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session) {
      await supabase.from('wellbeing_logs').insert({
        user_id: session.user.id,
        mood,
        stress,
        focus,
        notes
      })
      
      // Reset and refresh
      setNotes('')
      fetchHistory()
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen p-6 md:p-12">
      <Link href="/dashboard" className="flex items-center text-[#c9ccbb]/60 hover:text-[#b5a642] mb-8 transition-colors">
        <ArrowLeft size={20} className="mr-2" /> Back to Dashboard
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* LEFT COLUMN: INPUT */}
        <div>
          <h1 className="text-4xl font-serif text-[#c9ccbb] mb-2">Log Your State</h1>
          <p className="text-[#c9ccbb]/60 mb-8 font-light italic">"Awareness is the first step of regulation."</p>

          <div className="glass-panel p-8 rounded-2xl mb-8">
            <RangeSlider label="Current Mood" value={mood} onChange={setMood} minLabel="Very Low" maxLabel="Very High" />
            <RangeSlider label="Stress Level" value={stress} onChange={setStress} minLabel="Calm" maxLabel="Overwhelmed" />
            <RangeSlider label="Focus Clarity" value={focus} onChange={setFocus} minLabel="Scattered" maxLabel="Sharp" />
            
            <div className="mb-8">
              <label className="block text-[#c9ccbb] font-serif text-lg mb-2">Observations (Optional)</label>
              <textarea 
                className="w-full bg-[#c9ccbb]/5 border border-[#c9ccbb]/20 rounded-xl p-4 text-[#c9ccbb] placeholder-[#c9ccbb]/30 focus:outline-none focus:border-[#b5a642]"
                rows={3}
                placeholder="How does your environment feel right now?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <button 
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-4 bg-[#c9ccbb] text-[#1b270e] font-bold rounded-xl hover:bg-[#e3e6d5] transition-all flex justify-center items-center gap-2"
            >
              {loading ? 'Saving...' : <><Save size={20} /> Log Entry</>}
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: HISTORY */}
        <div>
          <h2 className="text-2xl font-serif text-[#c9ccbb] mb-6">Recent 7 Days</h2>
          <div className="space-y-4">
            {history.length === 0 && (
              <p className="text-[#c9ccbb]/40 italic">No logs yet. Create your first entry.</p>
            )}
            {history.map((log) => (
              <div key={log.id} className="glass-panel p-6 rounded-xl flex justify-between items-center">
                <div>
                  <p className="text-xs text-[#b5a642] uppercase tracking-widest mb-1">
                    {new Date(log.created_at).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                  </p>
                  <p className="text-[#c9ccbb] text-sm opacity-80 line-clamp-1">{log.notes || "No notes recorded."}</p>
                </div>
                <div className="flex gap-4">
                  <div className="text-center">
                    <span className="block text-xs text-[#c9ccbb]/50">MOOD</span>
                    <span className="font-bold text-[#c9ccbb]">{log.mood}</span>
                  </div>
                  <div className="text-center">
                    <span className="block text-xs text-[#c9ccbb]/50">STRESS</span>
                    <span className="font-bold text-[#c9ccbb]">{log.stress}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
