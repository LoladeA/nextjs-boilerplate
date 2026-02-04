'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, RefreshCw, Lock, Zap, Brain } from 'lucide-react'
import { neuroInsights } from '../data/neuro-insights'

interface Props {
  isPremium?: boolean 
  scores?: {
    light: number
    visual: number
    acoustic: number
  }
}

export default function NeuroFlashcard({ isPremium = false, scores }: Props) {
  const [currentCard, setCurrentCard] = useState(neuroInsights[0])
  const [isFlipped, setIsFlipped] = useState(false)

  // INTELLIGENT SELECTION LOGIC
  useEffect(() => {
    // 1. If Light Score is POOR (< 50), FORCE the Light Warning Card (Card 3)
    if (scores && scores.light < 50) {
      const alertCard = neuroInsights.find(c => c.id === 3) // Circadian Misalignment
      if (alertCard) {
        setCurrentCard(alertCard)
        return
      }
    }
    
    // 2. Else, random shuffle (Hydration safe)
    const random = neuroInsights[Math.floor(Math.random() * neuroInsights.length)]
    setCurrentCard(random)
  }, [scores])

  const nextCard = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent flip when clicking shuffle
    setIsFlipped(false)
    setTimeout(() => {
      const random = neuroInsights[Math.floor(Math.random() * neuroInsights.length)]
      setCurrentCard(random)
    }, 300)
  }

  return (
    <div className="h-full flex flex-col">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
           <Brain className="text-[#b5a642]" size={20} />
           <h3 className="text-[#c9ccbb] font-serif text-lg">
             {isPremium ? "NeuroDesign Spec" : "Somatic Insight"}
           </h3>
        </div>
        <button 
          onClick={nextCard} 
          className="text-[#c9ccbb]/40 hover:text-[#b5a642] transition-colors p-2 hover:bg-[#c9ccbb]/5 rounded-full" 
          title="New Insight"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* THE CARD */}
      <div 
        className="relative flex-grow cursor-pointer group perspective-1000 min-h-[340px]"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <AnimatePresence mode="wait">
          {!isFlipped ? (
            // --- FRONT OF CARD (THE MYSTERY) ---
            <motion.div 
              key="front"
              initial={{ opacity: 0, rotateY: -90 }}
              animate={{ opacity: 1, rotateY: 0 }}
              exit={{ opacity: 0, rotateY: 90 }}
              transition={{ duration: 0.3 }}
              className="glass-panel p-8 rounded-2xl h-full border border-[#c9ccbb]/10 flex flex-col justify-center items-center text-center hover:bg-[#c9ccbb]/5 transition-colors relative overflow-hidden"
            >
              {/* Subtle background glow */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#b5a642]/50 to-transparent opacity-50" />
              
              <div className="mb-6 p-4 rounded-full bg-[#1b270e] border border-[#b5a642]/30 text-[#b5a642] shadow-[0_0_30px_rgba(181,166,66,0.1)]">
                <Sparkles size={32} />
              </div>

              <span className="inline-block px-3 py-1 mb-4 text-[10px] font-bold tracking-widest uppercase text-[#b5a642] bg-[#b5a642]/10 rounded-full">
                  {currentCard.category}
              </span>

              <h4 className="text-2xl font-serif text-[#c9ccbb] mb-4 leading-tight">
                {currentCard.title}
              </h4>
              
              <p className="text-[#c9ccbb]/40 text-xs uppercase tracking-[0.2em] mt-2">
                Tap to Reveal Logic
              </p>
            </motion.div>
          ) : (
            // --- BACK OF CARD (THE REVEAL) ---
            <motion.div 
              key="back"
              initial={{ opacity: 0, rotateY: 90 }}
              animate={{ opacity: 1, rotateY: 0 }}
              exit={{ opacity: 0, rotateY: -90 }}
              transition={{ duration: 0.3 }}
              className={`glass-panel p-6 rounded-2xl h-full flex flex-col justify-between text-left relative overflow-hidden ${
                isPremium 
                  ? "bg-[#b5a642]/5 border-[#b5a642]/30" 
                  : "bg-[#000]/20 border border-[#c9ccbb]/10"
              }`}
            >
              <div className="overflow-y-auto pr-2 custom-scrollbar">
                {/* SHARED SCIENCE (Always Visible) */}
                <div className="mb-4">
                   <span className="text-[10px] font-bold tracking-widest uppercase text-[#b5a642] mb-2 block">
                    The Science 
                  </span>
                  <p className="text-sm text-[#c9ccbb] leading-relaxed italic opacity-90">
                    "{currentCard.science_fact}"
                  </p>
                </div>

                {isPremium ? (
                  // --- TIER 2: PAID USER (THE SOLUTION) ---
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="p-3 bg-[#b5a642]/10 rounded-lg border-l-2 border-[#b5a642]">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[#b5a642] text-[10px] uppercase font-bold">Design Specification</span>
                      </div>
                      <p className="text-sm text-[#c9ccbb]">{currentCard.design_spec}</p>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Zap size={16} className="text-[#b5a642] mt-1 shrink-0" />
                      <div>
                        <span className="text-[#b5a642] text-[10px] uppercase font-bold block mb-1">Tool Integration</span>
                        <p className="text-xs text-[#c9ccbb]/70">{currentCard.tool_integration}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  // --- TIER 1: FREE USER (THE SOMATIC PING) ---
                  <div className="space-y-4">
                    <div>
                      <span className="text-red-300 text-[10px] uppercase font-bold mb-1 block">Somatic Check</span>
                      <p className="text-sm text-[#c9ccbb]/80">
                        {currentCard.somatic_prompt || "Does this environment make you feel unregulated?"}
                      </p>
                    </div>

                    {/* THE PAYWALL LOCK */}
                    <div className="mt-4 p-4 rounded-xl bg-[#000]/40 border border-[#c9ccbb]/10 text-center relative overflow-hidden group">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Lock size={20} className="text-[#c9ccbb]/40 group-hover:text-[#b5a642] transition-colors" />
                        <p className="text-xs text-[#c9ccbb]/60 line-clamp-2">
                          {currentCard.cliffhanger}
                        </p>
                        <button className="mt-2 px-4 py-2 bg-[#c9ccbb] text-[#1b270e] text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-[#fff] transition-all transform hover:scale-105">
                          Unlock Protocol
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
