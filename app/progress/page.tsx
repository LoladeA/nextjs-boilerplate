'use client'

import Sidebar from '../components/Sidebar'
import { useState, useEffect } from 'react'
import { Heart, Wind, Sun, Volume2, CheckCircle, TrendingUp, Activity, AlertCircle, Zap, ShieldAlert, Loader2, Moon, Sunrise } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function Progress() {
  const supabase = createClientComponentClient()
  
  // TABS: MORNING vs EVENING
  const [activeTab, setActiveTab] = useState<'morning' | 'evening'>('morning')

  // LOGGING STATE
  // Morning Data
  const [morningMood, setMorningMood] = useState<number | null>(null)
  const [morningTags, setMorningTags] = useState<string[]>([])
  const [morningNote, setMorningNote] = useState('')
  const [luxScore, setLuxScore] = useState<string>('') 
  const [dbScore, setDbScore] = useState<string>('')

  // Evening Data
  const [eveningMood, setEveningMood] = useState<number | null>(null)
  const [eveningTags, setEveningTags] = useState<string[]>([])
  const [eveningNote, setEveningNote] = useState('')

  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  
  // CHART STATE
  const [chartData, setChartData] = useState<any[]>([])

  // AUTOMATICALLY SET TAB BASED ON TIME OF DAY
  useEffect(() => {
    const hour = new Date().getHours()
    if (hour >= 17) setActiveTab('evening') // If after 5 PM, default to Evening
  }, [])

  // 1. MOOD SCALES (Reused for both, but could differ if needed)
  const moods = [
    { val: 1, label: 'Dysregulated', desc: 'Overwhelmed', color: 'bg-red-500/20 border-red-500/50 text-red-400' },
    { val: 2, label: 'High Alert', desc: 'Vigilant', color: 'bg-orange-500/20 border-orange-500/50 text-orange-400' },
    { val: 3, label: 'Neutral', desc: 'Functional', color: 'bg-[#c9ccbb]/70 border-[#c9ccbb]/50 text-[#c9ccbb]' },
    { val: 4, label: 'Regulated', desc: 'Calm', color: 'bg-[#b5a642]/20 border-[#b5a642]/50 text-[#b5a642]' },
    { val: 5, label: 'Resonant', desc: 'Restorative', color: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' }
  ]

  // 2. HABIT TAGS DEFINITIONS
  const morningTagOptions = [
    { id: 'ventilation', label: 'Ventilated Home (Air Exchange)', icon: <Wind size={14} /> },
    { id: 'sunlight', label: 'Got Early Morning Sunlight', icon: <Sun size={14} /> },
    { id: 'noise_buffer', label: 'Buffered Against Intrustive Noise', icon: <Volume2 size={14} /> },
    { id: 'declutter', label: 'Cleared/ Decluttered One Priority Area', icon: <CheckCircle size={14} /> },
  ]

  const eveningTagOptions = [
    { 
      id: 'low_horizon', 
      label: 'Turned Off The Big Lights & Switched To Warm, Low-Level Lighting', 
      icon: <Zap size={14} /> 
    },
    { 
      id: 'entropy_reset', 
      label: 'Decluttered The First Surface I See In The Morning', 
      icon: <CheckCircle size={14} /> 
    },
    { 
      id: 'acoustic_seal', 
      label: 'Using Sound-Softening Barriers (Curtains, Doors & Mechanical Noise)', 
      icon: <Volume2 size={14} /> 
    },
    { 
      id: 'tactile_enclosure', 
      label: 'Using Gentle Weight & Soft Textures for Sleep', 
      icon: <Heart size={14} /> 
    },
  ]

  // --- INITIAL DATA FETCH ---
  useEffect(() => {
    fetchTodayLog()
    fetchHistory()
  }, [])

  const fetchTodayLog = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const today = new Date().toISOString().split('T')[0]
    
    const { data } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .single()

    if (data) {
      // Load Morning Data
      setMorningMood(data.mood_score)
      setMorningTags(data.tags || [])
      setMorningNote(data.note || '')
      if (data.lux_score) setLuxScore(data.lux_score.toString())
      if (data.db_score) setDbScore(data.db_score.toString())

      // Load Evening Data
      setEveningMood(data.evening_mood_score)
      setEveningTags(data.evening_tags || [])
      setEveningNote(data.evening_note || '')
    }
  }

  const fetchHistory = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('daily_logs')
      .select('date, mood_score')
      .eq('user_id', user.id)
      .order('date', { ascending: true })
      .limit(7)

    if (data) {
        const formatted = data.map(d => ({
            day: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }),
            score: d.mood_score
        }))
        setChartData(formatted)
    }
  }

  // --- SAVE HANDLER ---
  const toggleTag = (id: string) => {
    if (activeTab === 'morning') {
        setMorningTags(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
    } else {
        setEveningTags(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
    }
  }

  const handleSave = async () => {
    setStatus('saving')
    setErrorMessage('')

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("No user logged in")

        const today = new Date().toISOString().split('T')[0]

        // Prepare the payload (Merge existing state)
        const payload = {
            user_id: user.id,
            date: today,
            // Morning Fields
            mood_score: morningMood,
            tags: morningTags,
            note: morningNote,
            lux_score: luxScore ? parseInt(luxScore) : null,
            db_score: dbScore ? parseInt(dbScore) : null,
            // Evening Fields
            evening_mood_score: eveningMood,
            evening_tags: eveningTags,
            evening_note: eveningNote
        }

        const { error } = await supabase
        .from('daily_logs')
        .upsert(payload, { onConflict: 'user_id, date' })

        if (error) throw error

        setStatus('success')
        fetchHistory() 
        setTimeout(() => setStatus('idle'), 2000)

    } catch (err: any) {
        console.error("Save Error:", err)
        setStatus('error')
        setErrorMessage(err.message || "Failed to save")
    }
  }

  // Helper vars for current view
  const currentMood = activeTab === 'morning' ? morningMood : eveningMood
  const setCurrentMood = activeTab === 'morning' ? setMorningMood : setEveningMood
  const currentTags = activeTab === 'morning' ? morningTags : eveningTags
  const currentNote = activeTab === 'morning' ? morningNote : eveningNote
  const setCurrentNote = activeTab === 'morning' ? setMorningNote : setEveningNote
  const currentOptions = activeTab === 'morning' ? morningTagOptions : eveningTagOptions

  return (
    <div className="min-h-screen bg-[#1b270e] font-sans selection:bg-[#b5a642] selection:text-[#1b270e]">
      <Sidebar />
      <div className="md:ml-64 min-h-screen p-6 md:p-12">
        
        <div className="max-w-4xl mx-auto">
          
          <div className="mb-12">
            <h1 className="text-4xl font-serif text-[#c9ccbb] mb-2">Progress & Tracking</h1>
            <p className="text-[#c9ccbb]/80">
              Log your daily state to train the system and reveal long-term patterns.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-3xl mb-16 relative overflow-hidden border border-[#c9ccbb]/10">
            
            {/* --- TAB TOGGLE --- */}
            <div className="flex justify-center mb-8">
                <div className="bg-[#000]/30 p-1 rounded-full flex gap-1 border border-[#c9ccbb]/10">
                    <button 
                        onClick={() => setActiveTab('morning')}
                        className={`flex items-center gap-2 px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                            activeTab === 'morning' ? 'bg-[#b5a642] text-[#1b270e]' : 'text-[#c9ccbb]/70 hover:text-[#c9ccbb]'
                        }`}
                    >
                        <Sunrise size={14} /> Morning
                    </button>
                    <button 
                        onClick={() => setActiveTab('evening')}
                        className={`flex items-center gap-2 px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                            activeTab === 'evening' ? 'bg-[#b5a642] text-[#1b270e]' : 'text-[#c9ccbb]/70 hover:text-[#c9ccbb]'
                        }`}
                    >
                        <Moon size={14} /> Evening
                    </button>
                </div>
            </div>

            {/* 1. MOOD CHECK-IN */}
            <div className="flex items-center gap-3 mb-8">
               <div className="w-10 h-10 rounded-full bg-[#b5a642]/10 flex items-center justify-center text-[#b5a642]">
                 <Heart size={20} />
               </div>
               <h2 className="text-2xl font-serif text-[#c9ccbb]">
                   {activeTab === 'morning' ? 'Morning Baseline' : 'Evening Wind-Down'}
               </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
              {moods.map((mood) => (
                <button
                  key={mood.val}
                  onClick={() => setCurrentMood(mood.val)}
                  className={`p-4 rounded-xl border transition-all text-left flex flex-col justify-between h-28 group relative overflow-hidden ${
                    currentMood === mood.val 
                      ? `${mood.color} shadow-lg scale-105` 
                      : 'bg-[#000]/20 border-[#c9ccbb]/10 text-[#c9ccbb]/40 hover:bg-[#c9ccbb]/5'
                  }`}
                >
                  <span className="text-xl font-serif font-bold relative z-10">{mood.val}</span>
                  <div className="relative z-10">
                    <div className={`font-bold text-xs mb-1 ${currentMood === mood.val ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>
                      {mood.label}
                    </div>
                  </div>
                  {currentMood === mood.val && <div className="absolute inset-0 bg-white/5 blur-md" />}
                </button>
              ))}
            </div>

            {/* 2. SENSORY DATA (MORNING ONLY) */}
            {activeTab === 'morning' && (
                <div className="mb-8 p-6 bg-[#000]/20 rounded-2xl border border-[#c9ccbb]/5 animate-fade-in">
                    <label className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest mb-4 block flex items-center gap-2">
                        <Activity size={12} /> Objective Metrics (Optional)
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2 text-[#c9ccbb]/70 text-xs font-bold uppercase tracking-widest">
                                <Zap size={14} className="text-orange-400" /> Morning Light (Lux)
                            </div>
                            <input 
                                type="number" 
                                placeholder="e.g. 500"
                                value={luxScore}
                                onChange={(e) => setLuxScore(e.target.value)}
                                className="w-full bg-[#1b270e] border border-[#c9ccbb]/10 rounded-xl p-3 text-[#c9ccbb] focus:outline-none focus:border-[#b5a642]/50 text-sm"
                            />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-2 text-[#c9ccbb]/70 text-xs font-bold uppercase tracking-widest">
                                <ShieldAlert size={14} className="text-blue-400" /> Avg Noise (dB)
                            </div>
                            <input 
                                type="number" 
                                placeholder="e.g. 45"
                                value={dbScore}
                                onChange={(e) => setDbScore(e.target.value)}
                                className="w-full bg-[#1b270e] border border-[#c9ccbb]/10 rounded-xl p-3 text-[#c9ccbb] focus:outline-none focus:border-[#b5a642]/50 text-sm"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* 3. HABIT TAGS (DYNAMIC) */}
            <div className="flex flex-wrap gap-2 mb-8 animate-fade-in">
              {currentOptions.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  className={`flex items-center gap-2 px-4 py-3 h-auto rounded-full border text-[10px] font-bold uppercase tracking-widest transition-all ${
                    currentTags.includes(tag.id)
                      ? 'bg-[#b5a642] border-[#b5a642] text-[#1b270e]'
                      : 'bg-[#000]/20 border-[#c9ccbb]/10 text-[#c9ccbb]/50 hover:text-[#c9ccbb]'
                  }`}
                >
                  {tag.icon} 
                  <span className="whitespace-normal text-left leading-tight">{tag.label}</span>
                </button>
              ))}
            </div>

            {/* 4. NOTES */}
            <div className="mb-8">
              <textarea 
                value={currentNote}
                onChange={(e) => setCurrentNote(e.target.value)}
                placeholder={activeTab === 'morning' ? "Morning Observations? (e.g. 'Woke up feeling rested')" : "Evening Observations? (e.g. 'Felt calmer after dimming lights')"}
                className="w-full h-24 bg-[#000]/20 border border-[#c9ccbb]/10 rounded-xl p-4 text-[#c9ccbb] text-sm placeholder:text-[#c9ccbb]/50 focus:outline-none focus:border-[#b5a642]/50 resize-none font-sans"
              />
            </div>

            {status === 'error' && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400 text-xs font-bold uppercase tracking-widest">
                    <AlertCircle size={16} />
                    <span>Error: {errorMessage}</span>
                </div>
            )}

            <div className="flex justify-end items-center gap-4 pt-6 border-t border-[#c9ccbb]/10">
               <AnimatePresence>
                 {status === 'success' && (
                   <motion.span 
                     initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                     className="text-[#b5a642] text-xs font-bold uppercase tracking-widest flex items-center gap-1"
                   >
                     <CheckCircle size={14} /> Saved
                   </motion.span>
                 )}
               </AnimatePresence>
               <button 
                 onClick={handleSave}
                 disabled={currentMood === null || status === 'saving'}
                 className={`px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${
                   currentMood !== null 
                     ? 'bg-[#c9ccbb] text-[#1b270e] hover:bg-white' 
                     : 'bg-[#c9ccbb]/10 text-[#c9ccbb]/50 cursor-not-allowed'
                 }`}
               >
                 {status === 'saving' ? (
                    <>Saving <Loader2 size={14} className="animate-spin" /></>
                 ) : 'Log Entry'}
               </button>
            </div>
          </div>

          {/* --- CHART SECTION --- */}
          <div className="animate-fade-in-up delay-100">
              <div className="flex items-center gap-2 mb-6 text-[#c9ccbb]/80 text-xs font-bold uppercase tracking-widest">
                <TrendingUp size={14} /> Nervous System Rhythm (Morning Baseline)
              </div>
              {chartData.length > 0 ? (
                <div className="glass-panel p-8 rounded-3xl border border-[#c9ccbb]/10">
                   <div className="h-[250px] w-full">
                     <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={chartData}>
                         <defs>
                           <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#b5a642" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#b5a642" stopOpacity={0}/>
                           </linearGradient>
                         </defs>
                         <XAxis dataKey="day" stroke="#c9ccbb" opacity={0.3} tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                         <YAxis hide={true} domain={[0, 6]} />
                         <Tooltip contentStyle={{ backgroundColor: '#1b270e', borderColor: '#c9ccbb33', color: '#c9ccbb' }} itemStyle={{ color: '#b5a642' }} cursor={{ stroke: '#c9ccbb', strokeWidth: 1, strokeDasharray: '3 3' }} />
                         <Area type="monotone" dataKey="score" stroke="#b5a642" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                       </AreaChart>
                     </ResponsiveContainer>
                   </div>
                </div>
              ) : (
                <div className="glass-panel p-12 rounded-3xl border border-dashed border-[#c9ccbb]/10 flex flex-col items-center text-center">
                   <Activity size={32} className="text-[#b5a642] mb-4 opacity-70" />
                   <p className="text-[#c9ccbb]/70 text-sm">Log your first check-in to see your trend.</p>
                </div>
              )}
          </div>

        </div>
      </div>
    </div>
  )
}
