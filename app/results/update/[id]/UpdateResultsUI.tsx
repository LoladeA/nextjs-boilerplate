'use client'

// =============================================================================
// FILE: app/results/update/[id]/UpdateResultsUI.tsx
// =============================================================================

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, ArrowRight, TrendingDown, TrendingUp,
  Minus, AlertTriangle, CheckCircle, Sparkles
} from 'lucide-react'

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

interface DomainDeltaResult {
  domain:     string
  delta:      number
  direction:  'improved' | 'worsened' | 'stable'
  self_delta: number
  outcome:    string
  narrative:  string
}

interface DeltaReport {
  domain_results:          DomainDeltaResult[]
  load_delta:              number
  load_direction:          'improved' | 'worsened' | 'stable'
  energy_tax_delta:        number
  system_state_change:     string
  system_state_shifted:    boolean
  sensory_pattern_change:  boolean
  subjective_score:        number
  subjective_direction:    'improved' | 'worsened' | 'stable'
  subjective_matches_data: boolean
  overall_progress:        string
  priority_attention:      string[]
  context_flags: {
    env_change_sleep:    string[]
    env_change_day:      string[]
    life_context_change: string[]
    strain_shift:        boolean
  }
}

interface Snapshot {
  neuro_load:   number
  system_state: string
  created_at:   string
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

const DOMAIN_LABELS: Record<string, string> = {
  cii: 'Sleep & Energy Rhythm',
  ali: 'Nervous System Activation',
  pli: 'Spatial Clarity',
  stl: 'Sensory Environment',
  rci: 'Recovery Capacity'
}

const PROGRESS_CONFIG: Record<string, {
  label:    string
  sublabel: string
  color:    string
  icon:     'up' | 'down' | 'neutral' | 'warn'
}> = {
  clear_progress: {
    label:    'Clear Progress',
    sublabel: 'Your scores improved and you feel the difference. The changes are working.',
    color:    'text-emerald-400',
    icon:     'up'
  },
  data_progress: {
    label:    'Measurable Shift',
    sublabel: 'Your environment scores have improved. Your nervous system may take a few more weeks to fully register it.',
    color:    'text-[#b5a642]',
    icon:     'up'
  },
  felt_progress: {
    label:    'Felt Improvement',
    sublabel: 'You feel better at home. The data has not fully caught up yet. This often reflects changes not yet captured in the assessment.',
    color:    'text-[#b5a642]',
    icon:     'up'
  },
  stable: {
    label:    'Holding Steady',
    sublabel: 'No significant change in either direction. This is not neutral. Stability after a period of friction is a meaningful outcome.',
    color:    'text-[#c9ccbb]/60',
    icon:     'neutral'
  },
  under_external_pressure: {
    label:    'External Pressure Detected',
    sublabel: 'Scores have shifted, but your context flags suggest life circumstances are the primary driver, not your environment.',
    color:    'text-orange-400',
    icon:     'warn'
  },
  needs_attention: {
    label:    'Needs Attention',
    sublabel: 'Friction has increased since your baseline. A targeted intervention in your priority domains is recommended.',
    color:    'text-orange-400',
    icon:     'warn'
  }
}

const OUTCOME_COLORS: Record<string, string> = {
  confirmed_improvement:    'border-l-emerald-500/50 bg-emerald-500/5',
  partial_improvement:      'border-l-[#b5a642]/40 bg-[#b5a642]/5',
  external_pressure:        'border-l-orange-500/30 bg-orange-500/5',
  intervention_insufficient:'border-l-red-500/30 bg-red-500/5',
  stable_maintained:        'border-l-[#c9ccbb]/20 bg-transparent',
  stable_unresolved:        'border-l-orange-500/20 bg-orange-500/5'
}

const DirectionIcon = ({ direction, size = 14 }: { direction: 'improved' | 'worsened' | 'stable', size?: number }) => {
  if (direction === 'improved') return <TrendingDown size={size} className="text-emerald-400" />
  if (direction === 'worsened') return <TrendingUp   size={size} className="text-orange-400" />
  return <Minus size={size} className="text-[#c9ccbb]/40" />
}

const ProgressIcon = ({ icon }: { icon: 'up' | 'down' | 'neutral' | 'warn' }) => {
  if (icon === 'up')      return <TrendingDown size={20} className="text-emerald-400" />
  if (icon === 'warn')    return <AlertTriangle size={20} className="text-orange-400" />
  if (icon === 'neutral') return <Minus size={20} className="text-[#c9ccbb]/40" />
  return <TrendingUp size={20} className="text-red-400" />
}

const formatDelta = (delta: number): string => {
  if (delta === 0) return '—'
  return delta < 0 ? `↓ ${Math.abs(delta)} pts` : `↑ ${Math.abs(delta)} pts`
}

const formatDate = (iso: string): string => {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric'
  })
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────

export default function UpdateResultsUI({
  snapshot,
  deltaReport
}: {
  snapshot:    Snapshot
  deltaReport: DeltaReport
}) {
  const router  = useRouter()
  const config  = PROGRESS_CONFIG[deltaReport.overall_progress] || PROGRESS_CONFIG.stable
  const hasContextFlags = deltaReport.context_flags.life_context_change.length > 0 &&
    !deltaReport.context_flags.life_context_change.includes('Nothing significant')

  return (
    <div className="min-h-screen bg-[#1b270e]">

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-[#c9ccbb]/10">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-[#c9ccbb]/40 hover:text-[#c9ccbb] transition-colors text-xs uppercase tracking-widest font-bold"
        >
          <ArrowLeft size={13} /> Dashboard
        </Link>
        <span className="text-[10px] uppercase tracking-widest text-[#c9ccbb]/30 font-bold">
          Check-In Results
        </span>
        <span className="text-[10px] text-[#c9ccbb]/30 uppercase tracking-widest">
          {formatDate(snapshot.created_at)}
        </span>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-12 space-y-10">

        {/* ════════════════════════════════════════
            SECTION 1 — OVERALL PROGRESS HEADER
        ════════════════════════════════════════ */}
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-widest text-[#b5a642]/60 font-bold">
            Overall Progress
          </p>
          <div className="flex items-start gap-4">
            <div className="mt-1">
              <ProgressIcon icon={config.icon} />
            </div>
            <div>
              <h1 className={`text-3xl font-serif mb-2 ${config.color}`}>
                {config.label}
              </h1>
              <p className="text-[#c9ccbb]/60 text-sm leading-relaxed max-w-lg">
                {config.sublabel}
              </p>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════
            SECTION 2 — SCORE SUMMARY CARDS
        ════════════════════════════════════════ */}
        <div className="grid grid-cols-3 gap-3">

          {/* NeuroLoad delta */}
          <div className="bg-[#c9ccbb]/5 border border-[#c9ccbb]/10 rounded-2xl p-5 space-y-2">
            <p className="text-[9px] uppercase tracking-widest text-[#c9ccbb]/40 font-bold">
              NeuroLoad
            </p>
            <p className={`text-2xl font-serif ${
              deltaReport.load_direction === 'improved' ? 'text-emerald-400' :
              deltaReport.load_direction === 'worsened' ? 'text-orange-400' :
              'text-[#c9ccbb]/60'
            }`}>
              {snapshot.neuro_load}
            </p>
            <p className="text-[10px] text-[#c9ccbb]/40">
              {formatDelta(deltaReport.load_delta)} since baseline
            </p>
          </div>

          {/* System state */}
          <div className="bg-[#c9ccbb]/5 border border-[#c9ccbb]/10 rounded-2xl p-5 space-y-2">
            <p className="text-[9px] uppercase tracking-widest text-[#c9ccbb]/40 font-bold">
              System State
            </p>
            <p className="text-sm font-medium text-[#c9ccbb] leading-tight">
              {snapshot.system_state}
            </p>
            {deltaReport.system_state_shifted && (
              <p className="text-[10px] text-[#b5a642]/60">State changed</p>
            )}
          </div>

          {/* Energy tax delta */}
          <div className="bg-[#c9ccbb]/5 border border-[#c9ccbb]/10 rounded-2xl p-5 space-y-2">
            <p className="text-[9px] uppercase tracking-widest text-[#c9ccbb]/40 font-bold">
              Energy Tax
            </p>
            <p className={`text-2xl font-serif ${
              deltaReport.energy_tax_delta < -10 ? 'text-emerald-400' :
              deltaReport.energy_tax_delta > 10  ? 'text-orange-400' :
              'text-[#c9ccbb]/60'
            }`}>
              {formatDelta(deltaReport.energy_tax_delta)}
            </p>
            <p className="text-[10px] text-[#c9ccbb]/40">
              Environmental load
            </p>
          </div>
        </div>

        {/* ════════════════════════════════════════
            SECTION 3 — SUBJECTIVE ALIGNMENT
        ════════════════════════════════════════ */}
        <div className={`
          p-5 rounded-2xl border flex items-start gap-4
          ${deltaReport.subjective_matches_data
            ? 'bg-[#b5a642]/5 border-[#b5a642]/20'
            : 'bg-orange-500/5 border-orange-500/20'
          }
        `}>
          <div className="mt-0.5 shrink-0">
            {deltaReport.subjective_matches_data
              ? <CheckCircle size={16} className="text-[#b5a642]" />
              : <AlertTriangle size={16} className="text-orange-400" />
            }
          </div>
          <div>
            <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${
              deltaReport.subjective_matches_data ? 'text-[#b5a642]/70' : 'text-orange-400/70'
            }`}>
              {deltaReport.subjective_matches_data ? 'Data and felt sense aligned' : 'Data and felt sense diverge'}
            </p>
            <p className="text-sm text-[#c9ccbb]/60 leading-relaxed">
              {deltaReport.subjective_matches_data
                ? 'What your nervous system is registering matches what the data is showing. That alignment is itself a signal of progress.'
                : 'Your environment scores and your felt experience are pointing in different directions. This is the most useful finding in your check-in. It means there is a friction source worth investigating that the assessment questions have not yet named.'
              }
            </p>
          </div>
        </div>

        {/* ════════════════════════════════════════
            SECTION 4 — DOMAIN NARRATIVES
        ════════════════════════════════════════ */}
        <div className="space-y-4">
          <p className="text-[10px] uppercase tracking-widest text-[#c9ccbb]/40 font-bold">
            Domain by Domain
          </p>

          {deltaReport.domain_results.map(result => (
            <div
              key={result.domain}
              className={`
                border-l-4 rounded-r-2xl p-5 space-y-3
                ${OUTCOME_COLORS[result.outcome] || 'border-l-[#c9ccbb]/20 bg-transparent'}
                border border-[#c9ccbb]/8
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DirectionIcon direction={result.direction} />
                  <span className="text-xs font-bold uppercase tracking-widest text-[#c9ccbb]/70">
                    {DOMAIN_LABELS[result.domain] || result.domain}
                  </span>
                </div>
                <span className={`text-xs font-mono ${
                  result.direction === 'improved' ? 'text-emerald-400' :
                  result.direction === 'worsened' ? 'text-orange-400' :
                  'text-[#c9ccbb]/30'
                }`}>
                  {formatDelta(result.delta)}
                </span>
              </div>

              <p className="text-sm text-[#c9ccbb]/60 leading-relaxed">
                {result.narrative}
              </p>

              {/* Self-delta indicator */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[9px] uppercase tracking-widest text-[#c9ccbb]/25 font-bold">
                  Your sense:
                </span>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(n => (
                    <div
                      key={n}
                      className={`w-4 h-1.5 rounded-full transition-all ${
                        n <= result.self_delta ? 'bg-[#b5a642]/60' : 'bg-[#c9ccbb]/10'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[9px] text-[#c9ccbb]/25 uppercase tracking-widest">
                  {result.self_delta <= 2 ? 'Feels worse' : result.self_delta >= 4 ? 'Feels better' : 'About the same'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* ════════════════════════════════════════
            SECTION 5 — CONTEXT FLAGS
            Only rendered if life context changes were reported
        ════════════════════════════════════════ */}
        {hasContextFlags && (
          <div className="bg-[#c9ccbb]/5 border border-[#c9ccbb]/10 rounded-2xl p-5 space-y-3">
            <p className="text-[10px] uppercase tracking-widest text-[#c9ccbb]/40 font-bold">
              Context noted
            </p>
            <p className="text-sm text-[#c9ccbb]/50 leading-relaxed">
              You reported the following life context changes since your baseline:{' '}
              <span className="text-[#c9ccbb]/70">
                {deltaReport.context_flags.life_context_change.join(', ').toLowerCase()}.
              </span>{' '}
              These have been factored into the domain narratives above. Environmental friction scores are interpreted in light of this context rather than in isolation.
            </p>
          </div>
        )}

        {/* ════════════════════════════════════════
            SECTION 6 — PRIORITY ATTENTION
            Only rendered if domains need work
        ════════════════════════════════════════ */}
        {deltaReport.priority_attention.length > 0 && (
          <div className="bg-orange-500/5 border border-orange-500/15 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles size={13} className="text-orange-400" />
              <p className="text-[10px] uppercase tracking-widest text-orange-400/70 font-bold">
                Priority Domains
              </p>
            </div>
            <p className="text-sm text-[#c9ccbb]/50 leading-relaxed">
              These areas still carry elevated friction:{' '}
              <span className="text-[#c9ccbb]/70">
                {deltaReport.priority_attention
                  .map(d => DOMAIN_LABELS[d] || d)
                  .join(' and ')}.
              </span>{' '}
              Your next coaching module recommendations have been updated to reflect this.
            </p>
          </div>
        )}

        {/* ════════════════════════════════════════
            SECTION 7 — EXIT ACTIONS
        ════════════════════════════════════════ */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[#c9ccbb]/10">
          <Link
            href="/dashboard"
            className="flex-1 flex items-center justify-center gap-2 py-4 bg-[#b5a642] text-[#1b270e] rounded-full font-bold text-sm uppercase tracking-widest hover:bg-[#c9b84e] transition-colors"
          >
            Back to Dashboard <ArrowRight size={13} />
          </Link>
          <Link
            href="/assessment"
            className="flex-1 flex items-center justify-center gap-2 py-4 bg-transparent border border-[#c9ccbb]/20 text-[#c9ccbb]/60 rounded-full font-bold text-sm uppercase tracking-widest hover:border-[#c9ccbb]/40 hover:text-[#c9ccbb] transition-colors"
          >
            Full Assessment
          </Link>
        </div>

      </div>
    </div>
  )
}
