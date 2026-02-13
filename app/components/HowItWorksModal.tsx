'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Activity, Zap, RefreshCw, X, BookOpen, Sparkles } from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export default function HowItWorksModal({ isOpen, onClose }: Props) {
  // Animation Variants
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } }
  }

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 10 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.4, ease: "easeIn" } }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          
          {/* 1. Ambient Backdrop */}
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={overlayVariants}
            onClick={onClose}
            className="absolute inset-0 bg-[#1b270e]/90 backdrop-blur-sm"
          />

          {/* 2. The Glass Modal */}
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={modalVariants}
            className="relative w-full max-w-4xl bg-[#1b270e] border border-[#b5a642]/30 rounded-3xl shadow-2xl shadow-[#b5a642]/10 overflow-hidden"
          >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#b5a642]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

            <div className="p-8 md:p-12 relative z-10 max-h-[90vh] overflow-y-auto">
              
              {/* Header */}
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-[#c9ccbb] font-serif text-3xl mb-3">Calibration Roadmap</h2>
                  <p className="text-[#c9ccbb]/80 text-base max-w-xl leading-relaxed">
                    We are calibrating your home environment to become your ultimate nervous system ally, with intention. 
                    This is not a to-do list; it is a continuous loop of regulation.
                  </p>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-[#c9ccbb]/5 text-[#c9ccbb]/40 hover:text-[#b5a642] transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* SECTION 1: THE ACTIVE LOOP */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {/* STEP 1: MEASURE */}
                <div className="group p-6 rounded-2xl border border-[#c9ccbb]/10 bg-[#c9ccbb]/5 hover:border-[#b5a642]/30 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-[#b5a642]/10 text-[#b5a642] flex items-center justify-center mb-4">
                    <Activity size={20} />
                  </div>
                  <div className="text-[10px] text-[#b5a642] font-bold uppercase tracking-widest mb-2">Bi-Monthly</div>
                  <h3 className="text-[#c9ccbb] font-bold text-base mb-2">1. Measure</h3>
                  <p className="text-[#c9ccbb]/80 text-xs leading-relaxed">
                    Retake the Assessment every 14 days. This updates your <strong>NeuroLoad Score™</strong> and recalibrates the logic engine.
                  </p>
                </div>

                {/* STEP 2: TUNE */}
                <div className="group p-6 rounded-2xl border border-[#c9ccbb]/10 bg-[#c9ccbb]/5 hover:border-[#b5a642]/30 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-[#b5a642]/10 text-[#b5a642] flex items-center justify-center mb-4">
                    <Zap size={20} />
                  </div>
                  <div className="text-[10px] text-[#b5a642] font-bold uppercase tracking-widest mb-2">Daily Ritual</div>
                  <h3 className="text-[#c9ccbb] font-bold text-base mb-2">2. Tune</h3>
                  <p className="text-[#c9ccbb]/80 text-xs leading-relaxed">
                    Check your Dashboard 2x/3x a day. The system automatically prescribes the specific <strong>Alignment Suggestion</strong> needed for that moment.
                  </p>
                </div>

                {/* STEP 3: VERIFY */}
                <div className="group p-6 rounded-2xl border border-[#c9ccbb]/10 bg-[#c9ccbb]/5 hover:border-[#b5a642]/30 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-[#b5a642]/10 text-[#b5a642] flex items-center justify-center mb-4">
                    <RefreshCw size={20} />
                  </div>
                  <div className="text-[10px] text-[#b5a642] font-bold uppercase tracking-widest mb-2">As Needed</div>
                  <h3 className="text-[#c9ccbb] font-bold text-base mb-2">3. Verify</h3>
                  <p className="text-[#c9ccbb]/80 text-xs leading-relaxed">
                    Use the <strong>Toolkit</strong> to audit new and existing spaces. Ensure that your lighting and sound levels align with your biological safety needs.
                  </p>
                </div>
              </div>

              {/* SECTION 2: DEEPEN YOUR PRACTICE (NEW) */}
              <div className="border-t border-[#b5a642]/20 pt-8 mb-6">
                 <h3 className="text-[#c9ccbb] font-serif text-xl mb-6 text-center">Deepen Your Understanding</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* INSIGHTS */}
                    <div className="flex gap-5 p-5 rounded-2xl bg-[#141d0b] border border-[#c9ccbb]/10 hover:border-[#b5a642]/30 transition-colors">
                        <div className="shrink-0 w-12 h-12 rounded-full bg-[#b5a642]/10 text-[#b5a642] flex items-center justify-center border border-[#b5a642]/20">
                            <BookOpen size={20} />
                        </div>
                        <div>
                             <h4 className="text-[#c9ccbb] font-bold text-sm uppercase tracking-wide mb-1">Insights Library & Somatic Cards</h4>
                             <p className="text-[#c9ccbb]/80 text-xs leading-relaxed">
                                Access 120+ somatic cards and dedicated, research based library: decode the neuropsychology influencing the dynamic between you and your home environment. Understand the <em>why</em> behind every suggestion.
                             </p>
                        </div>
                    </div>

                    {/* COACHING */}
                    <div className="flex gap-5 p-5 rounded-2xl bg-[#141d0b] border border-[#c9ccbb]/10 hover:border-[#b5a642]/30 transition-colors">
                        <div className="shrink-0 w-12 h-12 rounded-full bg-[#b5a642]/10 text-[#b5a642] flex items-center justify-center border border-[#b5a642]/20">
                            <Sparkles size={20} />
                        </div>
                        <div>
                             <h4 className="text-[#c9ccbb] font-bold text-sm uppercase tracking-wide mb-1">Coaching Modules</h4>
                             <p className="text-[#c9ccbb]/80 text-xs leading-relaxed">
                                Self-paced coaching modules and audio guides. Move from quick fixes to deep, intentional home calibration, which will help you to achieve long-term solutions.
                             </p>
                        </div>
                    </div>

                 </div>
              </div>
              
              <div className="mt-8 text-center">
                 <button 
                    onClick={onClose}
                    className="px-10 py-3 bg-[#b5a642] text-[#1b270e] font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-[#c4b550] transition-colors shadow-lg shadow-[#b5a642]/20"
                 >
                    Begin Calibration
                 </button>
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
