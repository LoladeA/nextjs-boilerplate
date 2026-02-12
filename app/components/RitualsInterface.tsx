'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { determineProtocol, mapScoreToStress, getCurrentTimeOfDay } from '../lib/sensory-logic'
import { Clock, ExternalLink, ChevronDown, ChevronUp, Zap } from 'lucide-react'
import Link from 'next/link'

interface Props {
  neuroLoadScore: number
}

export default function RitualsInterface({ neuroLoadScore }: Props) {
  // 1. State
  const [timeOfDay, setTimeOfDay] = useState<'morning'|'afternoon'|'evening'>('morning')
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false) // Default to closed (clutter-free)

  useEffect(() => {
    setMounted(true)
    setTimeOfDay(getCurrentTimeOfDay())
  }, [])

  // 2. Logic Connection
  const stressLevel = mapScoreToStress(neuroLoadScore)
  const activeProtocol = determineProtocol(timeOfDay, stressLevel)

  if (!mounted) return null

  return (
    <div className="w-full">
        {/* SECTION HEADER */}
        <div className="flex items-center gap-3 mb-4">
             <div className="h-px bg-[#c9ccbb]/10 flex-grow"></div>
             <h3 className="text-[#c9ccbb]/40 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <Zap size={12} className="text-[#b5a642]" /> Protocol Recommendation
             </h3>
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
                        shrink-0 w-12 h-12 rounded-full flex items-center justify-center border transition-colors
                        ${isOpen 
                            ? 'bg-[#b5a642] text-[#1b270e] border-[#b5a642]' 
                            : 'bg-[#b5a642]/10 text-[#b5a642] border-[#b5a642]/20 group-hover:border-[#b5a642]'
                        }
                    `}>
                        {isOpen ? <ChevronUp size={24} /> : <Zap size={24} />}
                    </div>

                    <div>
                        <div className="flex items-center gap-3 mb-1">
                             <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                                isOpen ? 'text-[#b5a642] border-[#b5a642]/30 bg-[#b5a642]/5' : 'text-[#c9ccbb]/60 border-[#c9ccbb]/20'
                             }`}>
                                {timeOfDay} Ritual
                            </span>
                            <span className="text-[#c9ccbb]/40 text-[10px] uppercase tracking-widest hidden md:inline-block">
                                • Status: {stressLevel} Load
                            </span>
                        </div>
                        <h2 className={`font-serif text-2xl md:text-3xl transition-colors ${isOpen ? 'text-[#c9ccbb]' : 'text-[#c9ccbb]/80 group-hover:text-[#c9ccbb]'}`}>
                            {activeProtocol.name}
                        </h2>
                    </div>
                </div>

                {/* Right: Tagline or Chevron */}
                <div className="flex items-center gap-4 pl-16 md:pl-0">
                     <p className="text-[#b5a642] text-xs font-bold uppercase tracking-widest hidden md:block text-right">
                        {isOpen ? "Active Protocol" : "Tap to Expand"}
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
                        <div className="px-6 md:px-8 pb-8 pt-0 relative z-10 border-t border-[#b5a642]/10 mt-2">
                            
                            {/* Description */}
                            <div className="py-6">
                                <p className="text-[#b5a642] text-xs font-bold uppercase tracking-widest mb-3">
                                    {activeProtocol.tagline}
                                </p>
                                <p className="text-[#c9ccbb]/80 text-base leading-relaxed max-w-3xl">
                                    {activeProtocol.description}
                                </p>
                            </div>
                            
                            {/* Steps Grid */}
                            <div className="grid grid-cols-1 gap-3">
                                {activeProtocol.steps.map((step, i) => (
                                    <div key={i} className="flex gap-4 p-4 rounded-xl bg-[#c9ccbb]/5 border border-[#b5a642]/10 hover:border-[#b5a642]/30 transition-colors">
                                        <div className="shrink-0 w-6 h-6 rounded-full bg-[#b5a642]/10 text-[#b5a642] flex items-center justify-center font-serif text-xs font-bold border border-[#b5a642]/20 mt-0.5">
                                            {i + 1}
                                        </div>
                                        
                                        <div className="space-y-1 w-full">
                                            <div className="flex justify-between items-start">
                                                <h4 className="text-[#c9ccbb] font-bold text-sm uppercase tracking-wide">
                                                    {step.label}
                                                </h4>
                                                <div className="flex gap-2">
                                                    {step.duration && (
                                                        <span className="flex items-center gap-1 text-[10px] text-[#b5a642] uppercase font-bold bg-[#b5a642]/10 px-2 py-0.5 rounded border border-[#b5a642]/20">
                                                            <Clock size={10} /> {step.duration}
                                                        </span>
                                                    )}
                                                    {step.toolLink && (
                                                        <Link href={step.toolLink} onClick={(e) => e.stopPropagation()}>
                                                            <span className="flex items-center gap-1 text-[10px] text-[#c9ccbb]/60 hover:text-[#b5a642] uppercase font-bold border border-[#c9ccbb]/20 hover:border-[#b5a642] px-2 py-0.5 rounded transition-colors cursor-pointer">
                                                                <ExternalLink size={10} /> Tool
                                                            </span>
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-[#c9ccbb]/70 text-sm leading-relaxed">
                                                {step.instruction}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Collapse Button (Bottom) */}
                            <button 
                                onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                                className="w-full mt-6 py-3 border border-[#c9ccbb]/10 text-[#c9ccbb]/40 hover:text-[#b5a642] hover:border-[#b5a642]/30 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all"
                            >
                                Close Protocol
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    </div>
  )
}
