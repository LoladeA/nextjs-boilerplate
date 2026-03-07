'use client'

// =============================================================================
// FILE: app/components/UpdateNudgeBanner.tsx
// =============================================================================
//
// Renders a soft nudge prompting the user to complete their two-week check-in.
// Dismisses per session via React state — no localStorage needed.
// Re-appears on next dashboard visit if check-in still not completed.
//
// USAGE IN DashboardUI:
//   <UpdateNudgeBanner nudge={nudge} />
//
// nudge is produced by shouldShowNudge() in dashboard/page.tsx (server side).
// If nudge.show is false, this component returns null silently.
//
// =============================================================================

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, ArrowRight } from 'lucide-react'

export interface NudgeConfig {
  show:         boolean
  level:        'soft' | 'present' | 'none'
  days_elapsed: number
  label:        string
  sublabel:     string
}

export default function UpdateNudgeBanner({ nudge }: { nudge: NudgeConfig }) {
  const [dismissed, setDismissed] = useState(false)
  const router = useRouter()

  // Nothing to render
  if (!nudge?.show || dismissed) return null

  const isPresent = nudge.level === 'present'

  return (
    <div className={`
      relative w-full rounded-2xl border p-5 mb-8 flex items-start justify-between gap-4
      transition-all duration-300
      ${isPresent
        ? 'bg-[#b5a642]/10 border-[#b5a642]/30'
        : 'bg-[#c9ccbb]/5 border-[#c9ccbb]/10'
      }
    `}>
      {/* Gold accent bar */}
      <div className="absolute left-0 top-4 bottom-4 w-[3px] bg-[#b5a642]/60 rounded-r-full" />

      <div className="pl-4 flex-1">
        <p className={`text-sm font-semibold mb-1 ${
          isPresent ? 'text-[#b5a642]' : 'text-[#c9ccbb]/80'
        }`}>
          {nudge.label}
        </p>
        <p className="text-xs text-[#c9ccbb]/40 mb-4">
          {nudge.sublabel}
        </p>
        <button
          onClick={() => router.push('/assessment/update')}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#c9ccbb]/60 hover:text-[#b5a642] transition-colors"
        >
          Begin Check-In <ArrowRight size={11} />
        </button>
      </div>

      {/* Dismiss — session only, no localStorage */}
      <button
        onClick={() => setDismissed(true)}
        className="text-[#c9ccbb]/20 hover:text-[#c9ccbb]/50 transition-colors mt-0.5 shrink-0"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  )
}
