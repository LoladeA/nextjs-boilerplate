'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Fingerprint, Activity, Shield, Zap } from 'lucide-react'
import { SENSORY_DOSSIERS, DossierProfile } from '../data/sensory-dossiers'

interface SensoryModalProps {
  isOpen: boolean
  onClose: () => void
  profile: string
}

export default function SensoryModal({ isOpen, onClose, profile }: SensoryModalProps) {
  const safeProfile = (profile?.toLowerCase() || 'anchor') as DossierProfile
  const data = SENSORY_DOSSIERS[safeProfile] || SENSORY_DOSSIERS.anchor

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* BACKDROP */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#1b270e]/80 backdrop-blur-sm z-[100] cursor-pointer"
          />

          {/* MODAL — full screen on mobile, centered card on desktop */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 16 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-0 z-[101] flex items-end md:items-center justify-center pointer-events-none md:p-4"
          >
            {/* Card — bottom sheet on mobile, centered modal on desktop */}
            <div className="
              bg-[#1b270e] border-t border-[#b5a642]/30
              md:border md:rounded-3xl
              w-full md:max-w-lg
              rounded-t-3xl
              max-h-[92vh] md:max-h-[85vh]
              overflow-y-auto
              shadow-2xl shadow-black/50
              pointer-events-auto relative
              flex flex-col
            ">

              {/* Gold accent bar */}
              <div className="h-1 w-full bg-gradient-to-r from-[#1b270e] via-[#b5a642] to-[#1b270e] shrink-0" />

              {/* Drag handle — mobile only hint */}
              <div className="flex justify-center pt-3 pb-1 md:hidden shrink-0">
                <div className="w-10 h-1 rounded-full bg-[#c9ccbb]/20" />
              </div>

              {/* Header row — title + close always visible */}
              <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-0 md:px-8 md:pt-7 shrink-0">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#b5a642]/10 border border-[#b5a642]/30 flex items-center justify-center shrink-0">
                    <Fingerprint size={24} className="text-[#b5a642] md:hidden" />
                    <Fingerprint size={28} className="text-[#b5a642] hidden md:block" />
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-serif text-[#c9ccbb] mb-1 leading-snug">
                      {data.title}
                    </h2>
                    <p className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest">
                      Archetype: {data.archetype}
                    </p>
                  </div>
                </div>

                {/* Close — always in header, never off-screen */}
                <button
                  onClick={onClose}
                  className="shrink-0 w-9 h-9 flex items-center justify-center rounded-full bg-[#000]/20 text-[#c9ccbb]/50 hover:text-[#b5a642] hover:bg-[#b5a642]/10 transition-all mt-0.5"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable content body */}
              <div className="px-6 pt-6 pb-8 md:px-8 md:pb-10 space-y-5 overflow-y-auto">

                {/* 1. MECHANISM */}
                <div className="bg-[#b5a642]/5 p-4 rounded-xl border border-[#b5a642]/10">
                  <div className="flex items-center gap-2 mb-2 text-[#b5a642]">
                    <Activity size={15} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">The Mechanism</span>
                  </div>
                  <p className="text-[#c9ccbb]/80 text-sm leading-relaxed">
                    {data.mechanism}
                  </p>
                </div>

                {/* 2. EXPERIENCE */}
                <div className="px-2">
                  <div className="flex items-center gap-2 mb-2 text-[#c9ccbb]/60">
                    <Zap size={15} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">The Experience</span>
                  </div>
                  <p className="text-[#c9ccbb] text-sm leading-relaxed italic">
                    "{data.experience}"
                  </p>
                </div>

                {/* 3. MANDATE */}
                <div className="bg-gradient-to-br from-[#b5a642]/10 to-transparent p-5 rounded-xl border-l-4 border-[#b5a642]">
                  <div className="flex items-center gap-2 mb-2 text-[#b5a642]">
                    <Shield size={15} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">The Home Mandate</span>
                  </div>
                  <p className="text-[#c9ccbb] text-sm font-medium leading-relaxed">
                    {data.mandate}
                  </p>
                </div>

                {/* Footer */}
                <div className="pt-4 border-t border-[#c9ccbb]/10 flex justify-between items-center text-[10px] text-[#c9ccbb]/30 uppercase tracking-widest">
                  <span>Sentient Home Analysis</span>
                  <span>Confidential</span>
                </div>

              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
