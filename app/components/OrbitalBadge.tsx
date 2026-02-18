'use client'

import { Fingerprint } from 'lucide-react'
import { useState } from 'react'
import SensoryModal from './SensoryModal'

export default function OrbitalBadge({ profile }: { profile: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="group relative flex items-center gap-3 px-5 py-2 rounded-full overflow-hidden transition-all hover:scale-105"
      >
        {/* 1. THE ORBITAL GLOW (CSS Animation) */}
        {/* We use a conic gradient that spins behind the content to create the 'border' effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#b5a642]/0 via-[#b5a642]/40 to-[#b5a642]/0 opacity-30 group-hover:opacity-100 transition-opacity duration-1000 animate-pulse-slow" />
        
        {/* 2. THE BORDER (Static) */}
        <div className="absolute inset-0 rounded-full border border-[#b5a642]/30 group-hover:border-[#b5a642] transition-colors" />

        {/* 3. THE BACKGROUND */}
        <div className="absolute inset-0 bg-[#b5a642]/5 group-hover:bg-[#b5a642]/10 transition-colors" />

        {/* 4. CONTENT */}
        <Fingerprint size={18} className="text-[#b5a642] relative z-10" />
        
        <div className="flex flex-col relative z-10 text-left">
          <span className="text-[10px] uppercase tracking-widest text-[#b5a642] font-bold flex items-center gap-1">
            Sensory Profile
            {/* The 'Flash' Icon that appears on hover */}
            <span className="w-1.5 h-1.5 rounded-full bg-[#b5a642] opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_0_8px_#b5a642]" />
          </span>
          <span className="text-[#c9ccbb] text-sm capitalize">
            The {profile}
          </span>
        </div>
      </button>

      {/* THE MODAL */}
      <SensoryModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        profile={profile} 
      />
    </>
  )
}
