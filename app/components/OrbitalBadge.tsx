'use client'

import { Fingerprint } from 'lucide-react'
import { useState } from 'react'
import SensoryModal from './SensoryModal'

const INTEGRATION_LABELS: Record<string, string> = {
  integrative:  'Integrative Pattern',
  mixed:        'Variable Pattern',
  accumulative: 'Accumulative Pattern'
}

interface OrbitalBadgeProps {
  profile: string
  integrationPattern?: 'integrative' | 'mixed' | 'accumulative'
  profileDescriptor?: string
}

export default function OrbitalBadge({
  profile,
  integrationPattern,
  profileDescriptor
}: OrbitalBadgeProps) {
  const [isOpen, setIsOpen] = useState(false)

  const integrationLabel = integrationPattern
    ? INTEGRATION_LABELS[integrationPattern] ?? null
    : null

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="group relative flex items-center gap-3 px-5 py-2 rounded-full overflow-hidden transition-all hover:scale-105"
      >
        {/* 1. ORBITAL GLOW */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#b5a642]/0 via-[#b5a642]/40 to-[#b5a642]/0 opacity-30 group-hover:opacity-100 transition-opacity duration-1000 animate-pulse-slow" />

        {/* 2. BORDER */}
        <div className="absolute inset-0 rounded-full border border-[#b5a642]/30 group-hover:border-[#b5a642] transition-colors" />

        {/* 3. BACKGROUND */}
        <div className="absolute inset-0 bg-[#b5a642]/5 group-hover:bg-[#b5a642]/10 transition-colors" />

        {/* 4. CONTENT */}
        <Fingerprint size={18} className="text-[#b5a642] relative z-10" />

        <div className="flex flex-col relative z-10 text-left">
          <span className="text-[10px] uppercase tracking-widest text-[#b5a642] font-bold flex items-center gap-1">
            Sensory Profile
            <span className="w-1.5 h-1.5 rounded-full bg-[#b5a642] opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_0_8px_#b5a642]" />
          </span>
          <span className="text-[#c9ccbb] text-sm capitalize">
            The {profile}
          </span>
          {/* Integration pattern label — surfaces the second axis in the badge */}
          {integrationLabel && (
            <span className="text-[9px] uppercase tracking-widest text-[#b5a642]/70 font-medium mt-0.5">
              {integrationLabel}
            </span>
          )}
        </div>
      </button>

      <SensoryModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        profile={profile}
        integrationPattern={integrationPattern}
        profileDescriptor={profileDescriptor}
      />
    </>
  )
}
