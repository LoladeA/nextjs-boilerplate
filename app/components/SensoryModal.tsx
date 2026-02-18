'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Fingerprint, Activity, Shield, Zap } from 'lucide-react'
import { SENSORY_DOSSIERS, DossierProfile } from '../data/sensory-dossiers'

interface SensoryModalProps {
  isOpen: boolean
  onClose: () => void
  profile: string // 'anchor' | 'seeker' | 'sensor'
}

export default function SensoryModal({ isOpen, onClose, profile }: SensoryModalProps) {
  // Safe fallback if profile is missing/typo
  const safeProfile = (profile?.toLowerCase() || 'anchor') as DossierProfile
  const data = SENSORY_DOSSIERS[safeProfile] || SENSORY_DOSSIERS.anchor

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* BACKDROP BLUR */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#1b270e]/80 backdrop-blur-sm z-[100] cursor-pointer"
          />

          {/* THE DOSSIER CARD */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 flex items-center justify-center z-[101] pointer-events-none p-4"
          >
            <div className="bg-[#1b270e] border border-[#b5a642]/30 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl shadow-black/50 pointer-events-auto relative">
              
              {/* DECORATIVE: Gold Top Bar */}
              <div className="h-1.5 w-full bg-gradient-to-r from-[#1b270e] via-[#b5a642] to-[#1b270e]" />

              {/* CLOSE BUTTON */}
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 text-[#c9ccbb]/50 hover:text-[#b5a642] transition-colors p-2"
              >
                <X size={20} />
              </button>

              <div className="p-8">
                
                {/* HEADER */}
                <div className="flex items-start gap-4 mb-8">
                  <div className="w-14 h-14 rounded-full bg-[#b5a642]/10 border border-[#b5a642]/30 flex items-center justify-center shrink-0">
                    <Fingerprint size={28} className="text-[#b5a642]" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-serif text-[#c9ccbb] mb-1">
                      {data.title}
                    </h2>
                    <p className="text-[#b5a642] text-xs font-bold uppercase tracking-widest">
                      Archetype: {data.archetype}
                    </p>
                  </div>
                </div>

                {/* CONTENT BLOCKS */}
                <div className="space-y-6">
                  
                  {/* 1. MECHANISM */}
                  <div className="bg-[#b5a642]/5 p-4 rounded-xl border border-[#b5a642]/10">
                    <div className="flex items-center gap-2 mb-2 text-[#b5a642]">
                      <Activity size={16} />
                      <span className="text-xs font-bold uppercase tracking-widest">The Mechanism</span>
                    </div>
                    <p className="text-[#c9ccbb]/80 text-sm leading-relaxed">
                      {data.mechanism}
                    </p>
                  </div>

                  {/* 2. EXPERIENCE */}
                  <div className="p-2">
                     <div className="flex items-center gap-2 mb-2 text-[#c9ccbb]/60">
                      <Zap size={16} />
                      <span className="text-xs font-bold uppercase tracking-widest">The Experience</span>
                    </div>
                    <p className="text-[#c9ccbb] text-sm leading-relaxed italic">
                      "{data.experience}"
                    </p>
                  </div>

                  {/* 3. MANDATE */}
                  <div className="bg-gradient-to-br from-[#b5a642]/10 to-transparent p-5 rounded-xl border-l-4 border-[#b5a642]">
                     <div className="flex items-center gap-2 mb-2 text-[#b5a642]">
                      <Shield size={16} />
                      <span className="text-xs font-bold uppercase tracking-widest">The Home Mandate</span>
                    </div>
                    <p className="text-[#c9ccbb] text-sm font-medium leading-relaxed">
                      {data.mandate}
                    </p>
                  </div>

                </div>

                {/* FOOTER */}
                <div className="mt-8 pt-6 border-t border-[#c9ccbb]/10 flex justify-between items-center text-[10px] text-[#c9ccbb]/40 uppercase tracking-widest">
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
