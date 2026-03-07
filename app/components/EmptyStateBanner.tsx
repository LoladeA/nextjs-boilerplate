'use client'

// =============================================================================
// FILE: app/components/EmptyStateBanner.tsx
// =============================================================================
//
// Shown on the dashboard when a user has authenticated but not yet completed
// their baseline assessment. Replaces the calibrating spinner with a proper
// onboarding moment that feels intentional, not broken.
//
// USAGE:
//   {!hasAssessment && <EmptyStateBanner />}
//
// =============================================================================

import { useRouter } from 'next/navigation'
import { ArrowRight, Fingerprint } from 'lucide-react'

export default function EmptyStateBanner() {
  const router = useRouter()

  return (
    <div className="relative w-full rounded-3xl overflow-hidden mb-8 border border-[#b5a642]/20">

      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#b5a642]/10 via-[#1b270e] to-[#1b270e]" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#b5a642]/8 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">

        {/* Left — context */}
        <div className="flex items-start gap-5">
          <div className="w-12 h-12 rounded-2xl bg-[#b5a642]/10 border border-[#b5a642]/20 flex items-center justify-center shrink-0 mt-0.5">
            <Fingerprint size={22} className="text-[#b5a642]" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[#b5a642]/70 font-bold mb-2">
              No Baseline Established
            </p>
            <h2 className="text-xl md:text-2xl font-serif text-[#c9ccbb] mb-2 leading-snug">
              Your home has not been assessed yet.
            </h2>
            <p className="text-sm text-[#c9ccbb]/50 leading-relaxed max-w-md">
              The NeuroDesign Blueprint™ starts with understanding how your current environment is affecting your nervous system. The assessment takes 8–10 minutes and establishes your personal baseline across five sensory domains.
            </p>

            {/* Domain pills */}
            <div className="flex flex-wrap gap-2 mt-4">
              {['Circadian', 'Autonomic', 'Predictive', 'Sensory', 'Recovery'].map(d => (
                <span
                  key={d}
                  className="text-[9px] uppercase tracking-widest px-3 py-1 rounded-full border border-[#c9ccbb]/10 text-[#c9ccbb]/30 font-bold"
                >
                  {d}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right — CTA */}
        <div className="shrink-0 flex flex-col items-start md:items-end gap-3">
          <button
            onClick={() => router.push('/assessments/step0')}
            className="flex items-center gap-3 px-8 py-4 bg-[#b5a642] text-[#1b270e] rounded-full font-bold text-sm uppercase tracking-widest hover:bg-[#c9b84e] transition-all active:scale-[0.98] whitespace-nowrap"
          >
            Begin Assessment <ArrowRight size={14} />
          </button>
          <p className="text-[10px] text-[#c9ccbb]/25 uppercase tracking-widest">
            8–10 minutes · One time setup
          </p>
        </div>

      </div>
    </div>
  )
}
