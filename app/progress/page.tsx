'use client'

import Sidebar from '../components/Sidebar'
import { useState } from 'react'
import { Heart, Wind, Sun, Volume2, CheckCircle, Save, TrendingUp, Calendar, Activity } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function Progress() {
  const supabase = createClientComponentClient()
  
  // LOGGING STATE
  const [selectedMood, setSelectedMood] = useState<number | null>(null)
  const [loggedTags, setLoggedTags] = useState<string[]>([])
  const [note, setNote] = useState('')
  const [isSaved, setIsSaved] = useState(false)

  // 1. SOMATIC STATES
  const moods = [
    { val: 1, label: 'Dysregulated', desc: 'Overwhelmed', color: 'bg-red-400/20 border-red-400/50 text-red-400' },
    { val: 2, label: 'High Alert', desc: 'Vigilant', color: 'bg-orange-400/20 border-orange-400/50 text-orange-400' },
    { val: 3, label: 'Neutral', desc: 'Functional', color: 'bg-[#c9ccbb]/10 border-[#c9ccbb]/30 text-[#c9ccbb]' },
    { val: 4, label: 'Regulated', desc: 'Calm', color: 'bg-[#b5a642]/20 border-[#b5a642]/50 text-[#b5a642]' },
    { val: 5, label: 'Resonant', desc: 'Restorative', color: 'bg-emerald-400/20 border-emerald-400/50 text-emerald-400' }
  ]

  // 2. ENVIRONMENTAL TAGS
  const envTags = [
    { id: 'air', label: 'Fresh Air', icon: <Wind size={14} /> },
    { id: 'light', label: 'Light Reset', icon: <Sun size={14} /> },
    { id: 'sound', label: 'Sound Buffer', icon: <Volume2 size={14} /> },
    { id: 'space', label: 'Surface Clear', icon: <CheckCircle size={14} /> },
  ]

  const toggleTag = (id: string) => {
    setLoggedTags(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const handleSave = async () => {
    // Simulate API call
    setIsSaved(true)
    setTimeout(() => {
      setIsSaved(false)
      setSelectedMood(null)
      setLoggedTags([])
      setNote('')
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-[#1b270e] font-sans selection:bg-[#b5a642] selection:text-[#1b270e]">
      <Sidebar />
      <div className="md:ml-64 min-h-screen p-6 md:p-12">
        
        <div className="max-w-4xl mx-auto">
          
          {/* HEADER */}
          <div className="mb-12">
            <h1 className="text-4xl font-serif text-[#c9ccbb] mb-2">Progress & Tracking</h1>
            <p className="text-[#c9ccbb]/60">
              Log your daily state to train the system and reveal long-term patterns.
            </p>
          </div>

          {/* --- SECTION 1: THE INPUT (DAILY LOG) --- */}
          <div className="glass-panel p-8 rounded-3xl mb-16 relative overflow-hidden border border-[#c9ccbb]/10">
            
            <div className="flex items-center gap-3 mb-8">
               <div className="w-10 h-10 rounded-full bg-[#b5a642]/10 flex items-center justify-center text-[#b5a642]">
                 <Heart size={20} />
               </div>
               <h2 className="text-2xl font-serif text-[#c9ccbb]">Daily Check-In</h2>
            </div>

            {/* MOOD GRID */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
              {moods.map((mood) => (
                <button
                  key={mood.val}
                  onClick={() => setSelectedMood(mood.val)}
                  className={`p-4 rounded-xl border transition-all text-left flex flex-col justify-between h-28 group relative overflow-hidden ${
                    selectedMood === mood.val 
                      ? `${mood.color} shadow-lg scale-105` 
                      : 'bg-[#000]/20 border-[#c9ccbb]/10 text-[#c9ccbb]/40 hover:bg-[#c9ccbb]/5'
                  }`}
                >
                  <span className="text-xl font-serif font-bold relative z-10">{mood.val}</span>
                  <div className="relative z-10">
                    <div className={`font-bold text-xs mb-1 ${selectedMood === mood.val ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>
                      {mood.label}
                    </div>
                  </div>
                  {selectedMood === mood.val && <div className="absolute inset-0 bg-white/5 blur-md" />}
                </button>
              ))}
            </div>

            {/* TAGS & SAVE */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pt-6 border-t border-[#c9ccbb]/10">
              
              <div className="flex flex-wrap gap-2">
                {envTags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => toggleTag(tag.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border text-[10px] font-bold uppercase tracking-widest transition-all ${
                      loggedTags.includes(tag.id)
                        ? 'bg-[#b5a642] border-[#b5a642] text-[#1b270e]'
                        : 'bg-[#000]/20 border-[#c9ccbb]/10 text-[#c9ccbb]/50 hover:text-[#c9ccbb]'
                    }`}
                  >
                    {tag.icon} {tag.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto">
                 <AnimatePresence>
                   {isSaved && (
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
                   disabled={selectedMood === null}
                   className={`flex-grow md:flex-grow-0 px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
                     selectedMood !== null 
                       ? 'bg-[#c9ccbb] text-[#1b270e] hover:bg-white' 
                       : 'bg-[#c9ccbb]/10 text-[#c9ccbb]/20 cursor-not-allowed'
                   }`}
                 >
                   Log Entry
                 </button>
              </div>
            </div>
          </div>

          {/* --- SECTION 2: THE OUTPUT (TRENDS PLACEHOLDER) --- */}
          <div className="opacity-60 hover:opacity-100 transition-opacity duration-500">
             <div className="flex items-center gap-2 mb-6 text-[#c9ccbb]/40 text-xs font-bold uppercase tracking-widest">
               <TrendingUp size={14} /> Long-term Analysis
             </div>

             <div className="glass-panel p-12 rounded-3xl border border-dashed border-[#c9ccbb]/10 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-[#b5a642]/10 rounded-full flex items-center justify-center text-[#b5a642] mb-6">
                <Activity size={32} />
              </div>

              <h2 className="text-2xl font-serif text-[#c9ccbb] mb-3">Data Accumulation In Progress</h2>
              <p className="text-[#c9ccbb]/50 max-w-lg mb-8 text-sm leading-relaxed">
                As you log your daily check-ins, this dashboard will begin to visualize your recovery rate, circadian alignment, and stress correlation patterns.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl text-left">
                <div className="p-4 bg-[#000]/20 rounded-xl border border-[#c9ccbb]/5">
                  <Calendar className="text-[#b5a642]/50 mb-2" size={20} />
                  <h4 className="text-[#c9ccbb] font-bold text-xs mb-1">Timeline</h4>
                  <p className="text-[#c9ccbb]/30 text-[10px]">Monthly trends</p>
                </div>
                <div className="p-4 bg-[#000]/20 rounded-xl border border-[#c9ccbb]/5">
                  <Activity className="text-[#b5a642]/50 mb-2" size={20} />
                  <h4 className="text-[#c9ccbb] font-bold text-xs mb-1">Correlation</h4>
                  <p className="text-[#c9ccbb]/30 text-[10px]">Environment vs Mood</p>
                </div>
                <div className="p-4 bg-[#000]/20 rounded-xl border border-[#c9ccbb]/5">
                  <TrendingUp className="text-[#b5a642]/50 mb-2" size={20} />
                  <h4 className="text-[#c9ccbb] font-bold text-xs mb-1">Recovery</h4>
                  <p className="text-[#c9ccbb]/30 text-[10px]">Restoration metrics</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
