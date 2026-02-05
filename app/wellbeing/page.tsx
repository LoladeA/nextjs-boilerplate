'use client'

import Sidebar from '../components/Sidebar'
import { useState } from 'react'
import { Heart, Wind, Sun, Volume2, CheckCircle, Save, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function WellbeingLog() {
  const supabase = createClientComponentClient()
  const [selectedMood, setSelectedMood] = useState<number | null>(null)
  const [loggedTags, setLoggedTags] = useState<string[]>([])
  const [note, setNote] = useState('')
  const [isSaved, setIsSaved] = useState(false)

  // 1. SOMATIC STATES (The "Truth" Metric)
  const moods = [
    { val: 1, label: 'Dysregulated', desc: 'Overwhelmed / Bracing', color: 'bg-red-400/20 border-red-400/50 text-red-400' },
    { val: 2, label: 'High Vigilance', desc: 'Scanning / Distracted', color: 'bg-orange-400/20 border-orange-400/50 text-orange-400' },
    { val: 3, label: 'Functional', desc: 'Present / Neutral', color: 'bg-[#c9ccbb]/10 border-[#c9ccbb]/30 text-[#c9ccbb]' },
    { val: 4, label: 'Regulated', desc: 'Calm / Connected', color: 'bg-[#b5a642]/20 border-[#b5a642]/50 text-[#b5a642]' },
    { val: 5, label: 'Restorative', desc: 'Deeply at Ease', color: 'bg-emerald-400/20 border-emerald-400/50 text-emerald-400' }
  ]

  // 2. ENVIRONMENTAL TAGS (Context)
  const envTags = [
    { id: 'air', label: 'Ventilated Space', icon: <Wind size={16} /> },
    { id: 'light_morning', label: 'Morning Sunlight', icon: <Sun size={16} /> },
    { id: 'light_dim', label: 'Dimmed (PM)', icon: <Sun size={16} /> },
    { id: 'sound_buffer', label: 'Buffered Noise', icon: <Volume2 size={16} /> },
    { id: 'sound_nature', label: 'Nature Sounds', icon: <Volume2 size={16} /> },
    { id: 'space_clear', label: 'Cleared Surface', icon: <CheckCircle size={16} /> },
  ]

  const toggleTag = (id: string) => {
    setLoggedTags(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const handleSave = async () => {
    // In a real app, this writes to Supabase 'wellbeing_logs' table
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
      <div className="md:ml-64 min-h-screen p-6 md:p-12 flex flex-col justify-center max-w-4xl mx-auto">
        
        <div className="mb-8">
          <h1 className="text-4xl font-serif text-[#c9ccbb] mb-2">Somatic Check-In</h1>
          <p className="text-[#c9ccbb]/60">
            Pause. Observe your nervous system state. Log the truth, not the optimisation.
          </p>
        </div>

        {/* 1. STATE SELECTOR */}
        <div className="mb-12">
          <label className="text-[#b5a642] text-xs font-bold uppercase tracking-widest mb-4 block">
            Current Nervous System State
          </label>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {moods.map((mood) => (
              <button
                key={mood.val}
                onClick={() => setSelectedMood(mood.val)}
                className={`p-6 rounded-2xl border transition-all text-left flex flex-col justify-between h-40 group relative overflow-hidden ${
                  selectedMood === mood.val 
                    ? `${mood.color} shadow-[0_0_30px_rgba(0,0,0,0.5)] scale-105` 
                    : 'bg-[#000]/20 border-[#c9ccbb]/10 text-[#c9ccbb]/40 hover:bg-[#c9ccbb]/5'
                }`}
              >
                <span className="text-2xl font-serif font-bold relative z-10">{mood.val}</span>
                <div className="relative z-10">
                  <div className={`font-bold text-sm mb-1 ${selectedMood === mood.val ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>
                    {mood.label}
                  </div>
                  <div className="text-[10px] opacity-60">
                    {mood.desc}
                  </div>
                </div>
                {/* Subtle Glow Effect on Selection */}
                {selectedMood === mood.val && (
                   <div className="absolute inset-0 bg-white/5 blur-xl" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 2. ENVIRONMENTAL TAGGING */}
        <div className="mb-12">
           <label className="text-[#b5a642] text-xs font-bold uppercase tracking-widest mb-4 block">
            Environmental Context (Tags)
          </label>
          <div className="flex flex-wrap gap-3">
            {envTags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => toggleTag(tag.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full border text-xs font-bold uppercase tracking-widest transition-all ${
                  loggedTags.includes(tag.id)
                    ? 'bg-[#b5a642] border-[#b5a642] text-[#1b270e] shadow-[0_0_15px_rgba(181,166,66,0.3)]'
                    : 'bg-[#000]/20 border-[#c9ccbb]/10 text-[#c9ccbb]/60 hover:border-[#c9ccbb]/30 hover:text-[#c9ccbb]'
                }`}
              >
                {tag.icon}
                {tag.label}
              </button>
            ))}
            
            {/* Add Custom Tag Placeholder */}
            <button className="flex items-center gap-2 px-6 py-3 rounded-full border border-dashed border-[#c9ccbb]/20 text-[#c9ccbb]/40 text-xs font-bold uppercase tracking-widest hover:text-[#c9ccbb] hover:border-[#c9ccbb]/40 transition-all">
              <span className="text-lg">+</span> Add Tag
            </button>
          </div>
        </div>

        {/* 3. OPTIONAL NOTES */}
        <div className="mb-12">
          <label className="text-[#b5a642] text-xs font-bold uppercase tracking-widest mb-4 block">
            Observations (Optional)
          </label>
          <textarea 
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Did specific lighting, sound, or clutter trigger a shift today?"
            className="w-full h-32 bg-[#000]/20 border border-[#c9ccbb]/10 rounded-2xl p-6 text-[#c9ccbb] placeholder:text-[#c9ccbb]/20 focus:outline-none focus:border-[#b5a642]/50 resize-none font-serif text-lg leading-relaxed"
          />
        </div>

        {/* ACTION BAR */}
        <div className="flex justify-end items-center gap-6 pt-8 border-t border-[#c9ccbb]/10">
           <AnimatePresence>
             {isSaved && (
               <motion.div 
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0 }}
                 className="flex items-center gap-2 text-[#b5a642] text-xs font-bold uppercase tracking-widest"
               >
                 <CheckCircle size={16} /> Log Recorded
               </motion.div>
             )}
           </AnimatePresence>
           
           <button 
             onClick={handleSave}
             disabled={selectedMood === null}
             className={`flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-sm uppercase tracking-widest transition-all ${
               selectedMood !== null 
                 ? 'bg-[#c9ccbb] text-[#1b270e] hover:bg-white hover:scale-105' 
                 : 'bg-[#c9ccbb]/10 text-[#c9ccbb]/20 cursor-not-allowed'
             }`}
           >
             <Save size={18} />
             Save Check-In
           </button>
        </div>

      </div>
    </div>
  )
}
