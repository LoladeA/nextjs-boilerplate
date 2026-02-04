'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, RefreshCw, ArrowRight } from 'lucide-react'
import { neuroInsights } from '../data/neuro-insights' // Import the data

export default function NeuroFlashcard() {
  // Select a random card on load
  const [currentCard, setCurrentCard] = useState(neuroInsights[0])
  const [isFlipped, setIsFlipped] = useState(false)

  // Hydration fix: Randomize only on client side to match server
  useEffect(() => {
    const random = neuroInsights[Math.floor(Math.random() * neuroInsights.length)]
    setCurrentCard(random)
  }, [])

  const nextCard = () => {
    setIsFlipped(false)
    setTimeout(() => {
      const random = neuroInsights[Math.floor(Math.random() * neuroInsights.length)]
      setCurrentCard(random)
    }, 300)
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
           <Sparkles className="text-[#b5a642]" size={20} />
           <h3 className="text-[#c9ccbb] font-serif text-lg">NeuroDesign Insight</h3>
        </div>
        <button onClick={nextCard} className="text-[#c9ccbb]/40 hover:text-[#b5a642] transition-colors">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* THE CARD */}
      <div 
        className="relative flex-grow cursor-pointer group perspective-1000"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <AnimatePresence mode="wait">
          {!isFlipped ? (
            // FRONT OF CARD (THE SCIENCE)
            <motion.div 
              key="front"
              initial={{ opacity: 0, rotateY: -90 }}
              animate={{ opacity: 1, rotateY: 0 }}
              exit={{ opacity: 0, rotateY: 90 }}
              transition={{ duration: 0.3 }}
              className="glass-panel p-6 rounded-2xl h-full border border-[#c9ccbb]/10 flex flex-col justify-between hover:bg-[#c9ccbb]/5 transition-colors"
            >
              <div>
                <span className="inline-block px-3 py-1 mb-4 text-[10px] font-bold tracking-widest uppercase text-[#1b270e] bg-[#c9ccbb] rounded-full">
                  {currentCard.category}
                </span>
                <h4 className="text-xl font-serif text-[#c9ccbb] mb-4">{currentCard.title}</h4>
                <p className="text-sm text-[#c9ccbb]/70 leading-relaxed">
                  "{currentCard.science}"
                </p>
              </div>
              <div className="flex items-center gap-2 text-[#b5a642] text-xs font-bold uppercase tracking-widest mt-6">
                See Design Action <ArrowRight size={14} />
              </div>
            </motion.div>
          ) : (
            // BACK OF CARD (THE ACTION)
            <motion.div 
              key="back"
              initial={{ opacity: 0, rotateY: 90 }}
              animate={{ opacity: 1, rotateY: 0 }}
              exit={{ opacity: 0, rotateY: -90 }}
              transition={{ duration: 0.3 }}
              className="glass-panel p-6 rounded-2xl h-full border border-[#b5a642]/30 bg-[#b5a642]/10 flex flex-col justify-between"
            >
              <div>
                 <span className="inline-block px-3 py-1 mb-4 text-[10px] font-bold tracking-widest uppercase text-[#b5a642] bg-[#b5a642]/10 border border-[#b5a642]/20 rounded-full">
                  Design Strategy
                </span>
                <h4 className="text-xl font-serif text-[#b5a642] mb-4">Apply It</h4>
                <p className="text-sm text-[#c9ccbb] leading-relaxed">
                  {currentCard.design_action}
                </p>
              </div>
              <div className="text-[#c9ccbb]/40 text-xs text-center mt-6">
                Tap to flip back
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
