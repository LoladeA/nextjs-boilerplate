'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, RefreshCw, Lock, Zap, Brain, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { neuroInsights } from '../data/neuro-insights'

interface Props {
  isPremium?: boolean
  scores?: {
    light: number
    visual: number
    acoustic: number
  }
}

// ---------------------------------------------------------------------------
// NeuroFlashcard
//
// Front (free for all users):
//   Science Fact + Why This Matters
//
// Back (Core tier and above):
//   Full protocol — Primary Adjustment, Refinement, Why It Works,
//   Integration Cue
//
// Access is resolved entirely by the `isPremium` prop passed from
// DashboardUI, which reads from /api/subscription-status. There is no
// internal auth check here — the component trusts the prop and renders
// accordingly. God mode is handled upstream in DashboardUI.
// ---------------------------------------------------------------------------

export default function NeuroFlashcard({ isPremium = false, scores }: Props) {
  const [currentCard, setCurrentCard] = useState(neuroInsights[0])
  const [isFlipped, setIsFlipped] = useState(false)

  // Intelligent card selection — surface a light-relevant card when
  // the circadian load reading is below threshold
  useEffect(() => {
    if (scores && scores.light < 50) {
      const alertCard = neuroInsights.find(c => c.id === 3)
      if (alertCard) {
        setCurrentCard(alertCard)
        return
      }
    }
    const randomIndex = Math.floor(Math.random() * neuroInsights.length)
    setCurrentCard(neuroInsights[randomIndex])
  }, [scores])

  const nextCard = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsFlipped(false)
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * neuroInsights.length)
      setCurrentCard(neuroInsights[randomIndex])
    }, 300)
  }

  return (
    <div className="h-full flex flex-col">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Brain className="text-[#b5a642]" size={20} />
          <h3 className="text-[#c9ccbb] font-serif text-lg">Neuro Somatic Insights</h3>
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
        className="relative flex-grow cursor-pointer group perspective-1000 min-h-[400px]"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <AnimatePresence mode="wait">
          {!isFlipped ? (

            // ── FRONT — always free ──────────────────────────────────────
            <motion.div
              key="front"
              initial={{ opacity: 0, rotateY: -90 }}
              animate={{ opacity: 1, rotateY: 0 }}
              exit={{ opacity: 0, rotateY: 90 }}
              transition={{ duration: 0.3 }}
              className="glass-panel p-8 rounded-2xl h-full border border-[#c9ccbb]/10 flex flex-col justify-between text-left hover:bg-[#c9ccbb]/5 transition-colors relative overflow-hidden"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="inline-block px-3 py-1 text-[10px] font-bold tracking-widest uppercase text-[#b5a642] bg-[#b5a642]/10 rounded-full">
                    {currentCard.category}
                  </span>
                  <Sparkles size={16} className="text-[#b5a642]/40" />
                </div>

                <h4 className="text-2xl font-serif text-[#c9ccbb] mb-6 leading-tight">
                  {currentCard.title}
                </h4>

                <div className="mb-6">
                  <span className="text-[#b5a642] text-[10px] uppercase font-bold block mb-2 opacity-70">Science Fact</span>
                  <p className="text-sm text-[#c9ccbb] leading-relaxed border-l-2 border-[#b5a642]/30 pl-4 italic">
                    "{currentCard.free.sciencefact}"
                  </p>
                </div>
              </div>

              <div className="mt-auto">
                <span className="text-[#b5a642] text-[10px] uppercase font-bold block mb-2 opacity-70">Why This Matters</span>
                <p className="text-sm text-[#c9ccbb]/80 leading-relaxed">
                  {currentCard.free.whyitmatters}
                </p>
                <div className="w-full mt-6 py-3 border-t border-[#c9ccbb]/10 text-center">
                  <p className="text-[#c9ccbb]/70 text-xs uppercase tracking-[0.2em]">
                    Tap to Reveal Protocol
                  </p>
                </div>
              </div>
            </motion.div>

          ) : (

            // ── BACK — Core tier and above ───────────────────────────────
            <motion.div
              key="back"
              initial={{ opacity: 0, rotateY: 90 }}
              animate={{ opacity: 1, rotateY: 0 }}
              exit={{ opacity: 0, rotateY: -90 }}
              transition={{ duration: 0.3 }}
              className={`glass-panel p-6 rounded-2xl h-full flex flex-col text-left relative overflow-hidden ${
                isPremium
                  ? 'bg-[#b5a642]/5 border-[#b5a642]/30'
                  : 'bg-[#000]/20 border border-[#c9ccbb]/10'
              }`}
            >
              <div className="overflow-y-auto pr-2 custom-scrollbar h-full">

                {isPremium ? (

                  // ── CORE / BLUEPRINT — full protocol ────────────────────
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 border-b border-[#b5a642]/20 pb-4">
                      <Zap size={16} className="text-[#b5a642]" />
                      <span className="text-[#b5a642] text-xs font-bold uppercase tracking-widest">
                        {currentCard.paid.protocol}
                      </span>
                    </div>

                    <div>
                      <span className="text-[#c9ccbb]/70 text-[10px] uppercase font-bold block mb-2">Primary Adjustment</span>
                      <p className="text-base text-[#c9ccbb] font-serif leading-relaxed">
                        {currentCard.paid.primaryadjustment}
                      </p>
                    </div>

                    <div>
                      <span className="text-[#c9ccbb]/70 text-[10px] uppercase font-bold block mb-3">Refinement</span>
                      <ul className="space-y-3">
                        {currentCard.paid.refinement.map((step, i) => (
                          <li key={i} className="flex gap-3 text-sm text-[#c9ccbb]/70 leading-relaxed">
                            <ArrowRight size={14} className="text-[#b5a642] shrink-0 mt-1" />
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 bg-[#b5a642]/5 rounded-xl border border-[#b5a642]/10 space-y-4">
                      <div>
                        <span className="text-[#b5a642] text-[10px] uppercase font-bold block mb-1">Why It Works</span>
                        <p className="text-xs text-[#c9ccbb]/70">{currentCard.paid.whyitWorks}</p>
                      </div>
                      <div>
                        <span className="text-[#b5a642] text-[10px] uppercase font-bold block mb-1">Integration Cue</span>
                        <p className="text-xs text-[#c9ccbb] italic">"{currentCard.paid.integrationcue}"</p>
                      </div>
                    </div>
                  </div>

                ) : (

                  // ── FREE USER — locked state ─────────────────────────────
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                    <div className="p-4 rounded-full bg-[#000]/40 border border-[#c9ccbb]/10">
                      <Lock size={32} className="text-[#c9ccbb]/40" />
                    </div>
                    <div>
                      <h4 className="text-lg text-[#c9ccbb] font-serif mb-2">Members Already Feel the Difference</h4>
                      <p className="text-sm text-[#c9ccbb]/70 max-w-[200px] mx-auto">
                        Translate the <strong>{currentCard.paid.protocol}</strong> into actionable strategies.
                      </p>
                    </div>
                    <Link href="/upgrade" className="w-full max-w-[200px]">
                      <button className="w-full py-3 bg-[#c9ccbb] text-[#1b270e] text-xs font-bold uppercase tracking-widest rounded-full hover:bg-white transition-all transform hover:scale-105 shadow-lg shadow-[#c9ccbb]/10">
                        Upgrade to Core
                      </button>
                    </Link>
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
