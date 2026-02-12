'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Activity, Zap, RefreshCw, X } from 'lucide-react'

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

            <div className="p-8 md:p-12 relative z-10">
              
              {/* Header */}
              <div className="flex justify-between items-start mb-10">
                <div>
                  <h2 className="text-[#c9ccbb] font-serif text-3xl mb-3">Calibration Roadmap</h2>
                  <p className="text-[#c9ccbb]/80 text-base max-w-xl leading-relaxed">
                    We are slowly calibrating your home environment to become your ultimate nervous system ally. 
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

              {/* The 3-Step Loop */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* STEP 1: MEASURE */}
                <div className="group p-6 rounded-2xl border border-[#c9ccbb]/10 bg-[#c9ccbb]/5 hover:border-[#b5a642]/30 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-[#b5a642]/10 text-[#b5a642] flex items-center justify-center mb-6">
                    <Activity size={24} />
                  </div>
                  <div className="text-[10px] text-[#b5a642] font-bold uppercase tracking-widest mb-2">Bi-Weekly</div>
                  <h3 className="text-[#c9ccbb] font-bold text-lg mb-3">1. Measure</h3>
                  <p className="text-[#c9ccbb]/80 text-sm leading-relaxed">
                    Take the Assessment every 14 days. This updates your <strong>NeuroLoad Score™</strong> and recalibrates the logic engine to your new baseline.
                  </p>
                </div>

                {/* STEP 2: TUNE */}
                <div className="group p-6 rounded-2xl border border-[#c9ccbb]/10 bg-[#c9ccbb]/5 hover:border-[#b5a642]/30 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-[#b5a642]/10 text-[#b5a642] flex items-center justify-center mb-6">
                    <Zap size={24} />
                  </div>
                  <div className="text-[10px] text-[#b5a642] font-bold uppercase tracking-widest mb-2">Daily Ritual</div>
                  <h3 className="text-[#c9ccbb] font-bold text-lg mb-3">2. Tune</h3>
                  <p className="text-[#c9ccbb]/80 text-sm leading-relaxed">
                    Check your Dashboard 3x a day. The system automatically prescribes the specific <strong>Protocol</strong> needed for that moment.
                  </p>
                </div>

                {/* STEP 3: VERIFY */}
                <div className="group p-6 rounded-2xl border border-[#c9ccbb]/10 bg-[#c9ccbb]/5 hover:border-[#b5a642]/30 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-[#b5a642]/10 text-[#b5a642] flex items-center justify-center mb-6">
                    <RefreshCw size={24} />
                  </div>
                  <div className="text-[10px] text-[#b5a642] font-bold uppercase tracking-widest mb-2">As Needed</div>
                  <h3 className="text-[#c9ccbb] font-bold text-lg mb-3">3. Verify</h3>
                  <p className="text-[#c9ccbb]/80 text-sm leading-relaxed">
                    Use the <strong>Toolkit</strong> to audit new spaces. Validate that your lighting and sound levels match biological safety standards.
                  </p>
                </div>

              </div>
              
              <div className="mt-10 text-center">
                 <button 
                    onClick={onClose}
                    className="px-8 py-3 bg-[#b5a642] text-[#1b270e] font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-[#c4b550] transition-colors"
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
