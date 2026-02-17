'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
// 🟢 UPDATE: Removed old logic imports that would break
import { getCurrentTimeOfDay } from '../lib/sensory-logic' 
import { RITUALS } from '../data/protocols' 
import { Clock, ExternalLink, ChevronDown, ChevronUp, Zap, Check } from 'lucide-react'
import Link from 'next/link'

interface Props {
  neuroLoadScore: number
  // 🟢 NEW: Accept the profile so we show the right content
  profile?: 'anchor' | 'seeker' | 'sensor'
}

export default function RitualsInterface({ neuroLoadScore, profile = 'standard' }: Props) {
  // 1. State
  const [timeOfDay, setTimeOfDay] = useState<'morning'|'afternoon'|'evening'>('morning')
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false) 
  const [completedSteps, setCompletedSteps] = useState<number[]>([]) 

  useEffect(() => {
    setMounted(true)
    // Safe fallback if getCurrentTimeOfDay isn't perfectly synced
    setTimeOfDay(getCurrentTimeOfDay() || 'morning')
  }, [])

  // 2. Logic Connection (The "Bridge")
  // ---------------------------------------------------------
  // Map time of day to the specific ID in your new protocols.ts file
  const ritualIdMap: Record<string, string> = {
    'morning': 'morning-activation',
    'afternoon': 'afternoon-focus',
    'evening': 'evening-taper'
  }

  const activeRitualId = ritualIdMap[timeOfDay]
  const parentRitual = RITUALS[activeRitualId] || RITUALS['morning-activation']
  
  // 🟢 BRANCHING LOGIC: Select the correct variant
  // This is the "Heart Transplant" - picking the right data for the user
  const activeVariant = parentRitual.variants[profile] || parentRitual.variants['anchor']

  // Create the composite object your UI expects (Merging Parent Name + Variant Details)
  const activeProtocol = {
    name: parentRitual.name,          // From Parent
    tagline: activeVariant.tagline,   // From Variant
    description: activeVariant.description, // From Variant
    steps: activeVariant.steps        // From Variant
  }
  // ---------------------------------------------------------

  // 3. Interaction Handler
  const toggleStep = (index: number) => {
    setCompletedSteps(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index) // Uncheck
        : [...prev, index]              // Check
    )
  }

  // 4. Progress Calculation
  const progress = Math.round((completedSteps.length / activeProtocol.steps.length) * 100)
  const isComplete = progress === 100

  if (!mounted) return null

  return (
    <div className="w-full">
        {/* SECTION HEADER */}
        <div className="flex items-center gap-3 mb-4">
             <div className="h-px bg-[#c9ccbb]/10 flex-grow"></div>
             <div className="text-[#c9ccbb]/40 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <Zap size={12} className="text-[#b5a642]" /> 
                {/* 🟢 DISPLAY: Capitalize 'anchor' to 'Anchor' */}
                {profile.charAt(0).toUpperCase() + profile.slice(1)} Protocol
             </div>
             <div className="h-px bg-[#c9ccbb]/10 flex-grow"></div>
        </div>

        {/* ACCORDION CARD */}
        <div 
            onClick={() => setIsOpen(!isOpen)}
            className={`
                group relative overflow-hidden rounded-3xl border transition-all duration-500 cursor-pointer
                ${isOpen 
                    ? 'bg-[#1b270e] border-[#b5a642]/30 shadow-2xl shadow-[#b5a642]/10' 
                    : 'glass-panel border-[#c9ccbb]/10 hover:border-[#b5a642]/30 hover:bg-[#b5a642]/5'
                }
            `}
        >
            {/* --- HEADER (ALWAYS VISIBLE) --- */}
            <div className="p-6 md:p-8 relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                
                {/* Left: Identity */}
                <div className="flex items-center gap-6">
                    {/* Icon Circle */}
                    <div className={`
                        shrink-0 w-12 h-12 rounded-full flex items-center justify-center border transition-all duration-500
                        ${isComplete && !isOpen
                            ? 'bg-[#b5a642] text-[#1b270e] border-[#b5a642] scale-110' 
                            : isOpen 
                                ? 'bg-[#b5a642] text-[#1b270e] border-[#b5a642]' 
                                : 'bg-[#b5a642]/10 text-[#b5a642] border-[#b5a642]/20 group-hover:border-[#b5a642]'
                        }
                    `}>
                        {isComplete && !isOpen ? <Check size={24} strokeWidth={3} /> : isOpen ? <ChevronUp size={24} /> : <Zap size={24} />}
                    </div>

                    <div>
                        <div className="flex items-center gap-3 mb-1">
                             <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                                isOpen ? 'text-[#b5a642] border-[#b5a642]/30 bg-[#b5a642]/5' : 'text-[#c9ccbb]/60 border-[#c9ccbb]/20'
                             }`}>
                                {timeOfDay} Ritual
                             </span>
                             {/* Progress Indicator */}
                             {!isOpen && completedSteps.length > 0 && (
                                <span className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest">
                                    {progress}% Complete
                                </span>
                             )}
                        </div>
                        <h2 className={`font-serif text-2xl md:text-3xl transition-colors ${
                            isOpen ? 'text-[#c9ccbb]' : 'text-[#c9ccbb]/80 group-hover:text-[#c9ccbb]'
                        }`}>
                            {activeProtocol.name}
                        </h2>
                    </div>
                </div>

                {/* Right: Tagline or Chevron */}
                <div className="flex items-center gap-4 pl-16 md:pl-0">
                      <p className="text-[#b5a642] text-xs font-bold uppercase tracking-widest hidden md:block text-right transition-all">
                         {isComplete ? "Protocol Complete" : isOpen ? "Active Protocol" : "Tap to Expand"}
                      </p>
                      <ChevronDown 
                        size={20} 
                        className={`text-[#c9ccbb]/40 transition-transform duration-500 ${isOpen ? 'rotate-180 opacity-0' : 'rotate-0 opacity-100'}`} 
                      />
                </div>
            </div>

            {/* --- BODY (COLLAPSIBLE) --- */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                    >
                        <div className="px-6 md:px-8 pb-8 pt-0 relative z-10 border-t border-[#b5a642]/10 mt-2 cursor-default" onClick={(e) => e.stopPropagation()}>
                            
                            {/* Description */}
                            <div className="py-6">
                                <p className="text-[#b5a642] text-xs font-bold uppercase tracking-widest mb-3">
                                    {activeProtocol.tagline}
                                </p>
                                <p className="text-[#c9ccbb]/80 text-base leading-relaxed max-w-3xl">
                                    {activeProtocol.description}
                                </p>
                            </div>
                            
                            {/* INTERACTIVE STEPS GRID */}
                            <div className="grid grid-cols-1 gap-3">
                                {activeProtocol.steps.map((step, i) => {
                                    const isChecked = completedSteps.includes(i)
                                    return (
                                        <div 
                                            key={i} 
                                            onClick={() => toggleStep(i)}
                                            className={`
                                                flex gap-4 p-4 rounded-xl border transition-all cursor-pointer group/step select-none
                                                ${isChecked 
                                                    ? 'bg-[#1b270e] border-[#b5a642]/10 opacity-60 hover:opacity-100' // Checked State
                                                    : 'bg-[#c9ccbb]/5 border-[#b5a642]/10 hover:border-[#b5a642]/40 hover:bg-[#c9ccbb]/10' // Active State
                                                }
                                            `}
                                        >
                                            {/* Checkbox / Number */}
                                            <div className={`
                                                shrink-0 w-6 h-6 rounded-full flex items-center justify-center font-serif text-xs font-bold border mt-0.5 transition-all
                                                ${isChecked 
                                                    ? 'bg-[#b5a642] text-[#1b270e] border-[#b5a642]' 
                                                    : 'bg-[#b5a642]/10 text-[#b5a642] border-[#b5a642]/20 group-hover/step:border-[#b5a642]'
                                                }
                                            `}>
                                                {isChecked ? <Check size={14} strokeWidth={3} /> : i + 1}
                                            </div>
                                            
                                            <div className="space-y-1 w-full">
                                                <div className="flex justify-between items-start">
                                                    <h4 className={`font-bold text-sm uppercase tracking-wide transition-colors ${isChecked ? 'text-[#c9ccbb]/40 line-through decoration-[#b5a642]/50' : 'text-[#c9ccbb]'}`}>
                                                        {step.label}
                                                    </h4>
                                                    <div className="flex gap-2">
                                                        {step.duration && (
                                                            <span className={`flex items-center gap-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded border transition-colors ${isChecked ? 'text-[#c9ccbb]/30 border-[#c9ccbb]/10' : 'text-[#b5a642] bg-[#b5a642]/10 border-[#b5a642]/20'}`}>
                                                                <Clock size={10} /> {step.duration}
                                                            </span>
                                                        )}
                                                        {step.toolLink && (
                                                            <Link href={step.toolLink} onClick={(e) => e.stopPropagation()}>
                                                                <span className={`flex items-center gap-1 text-[10px] uppercase font-bold border px-2 py-0.5 rounded transition-colors cursor-pointer ${isChecked ? 'text-[#c9ccbb]/30 border-[#c9ccbb]/10' : 'text-[#c9ccbb]/60 hover:text-[#b5a642] border-[#c9ccbb]/20 hover:border-[#b5a642]'}`}>
                                                                    <ExternalLink size={10} /> Tool
                                                                </span>
                                                            </Link>
                                                        )}
                                                    </div>
                                                </div>
                                                <p className={`text-sm leading-relaxed transition-colors ${isChecked ? 'text-[#c9ccbb]/30' : 'text-[#c9ccbb]/70'}`}>
                                                    {step.instruction}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Collapse Button (Bottom) */}
                            <button 
                                onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                                className="w-full mt-6 py-3 border border-[#c9ccbb]/10 text-[#c9ccbb]/40 hover:text-[#b5a642] hover:border-[#b5a642]/30 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all"
                            >
                                {isComplete ? "Complete Ritual" : "Close Protocol"}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    </div>
  )
}
