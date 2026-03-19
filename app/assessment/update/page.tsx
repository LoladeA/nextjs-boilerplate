'use client'

// =============================================================================
// FILE: app/assessment/update/page.tsx
// =============================================================================
//
// WHAT THIS PAGE DOES:
//   Renders the update assessment in 4 parts.
//   On submit, POSTs to /api/submit-update-assessment.
//   On success, redirects to /results/update/[snapshot_id].
//
// PARTS:
//   Part 0 — Nervous System Snapshot     (3 questions: current state)
//   Part 1 — Domain Re-Survey            (5 domains × 2–3 questions = 15 questions)
//   Part 2 — Change Detection            (3 multi-select questions)
//   Part 3 — Subjective Progress Marker  (1 choice question)
//
// PART 1 ARCHITECTURE:
//   All questions are present-tense mirrors of the onboarding assessment.
//   No comparative or delta questions. The user answers honestly about
//   right now — the engine computes the delta by comparing to the stored
//   snapshot in assessment_snapshots. This eliminates memory dependency
//   and produces a cleaner, more accurate before/after picture.
//
// QUESTION KEY MAPPING (Part 1):
//   CII — q5, q6, q7       (Circadian: alertness, sleep onset, energy rhythm)
//   ALI — q10, q11, q12    (Autonomic: reactivity, activation, relaxation)
//   PLI — q15, q17, q19    (Legibility: room clarity, visual hierarchy, navigation)
//   STL — q20, q21, q24    (Sensory: focus, noise, lighting)
//   RCI — q28, q29, q33    (Recovery: restoration, wind-down, recovery — q33 reverse scored)
//
// =============================================================================

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, CheckCircle, Loader2 } from 'lucide-react'

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

type Response = {
  question_key: string
  answer: { response: any }
}

type StepId = 0 | 1 | 2 | 3

// ─────────────────────────────────────────────
// PART LABELS
// ─────────────────────────────────────────────

const PART_LABELS = [
  'Nervous System Snapshot',
  'Domain Check-In',
  'What Has Changed',
  'The Felt Sense'
]

// ─────────────────────────────────────────────
// PART 1 — DOMAIN SECTIONS
//
// Present-tense mirrors of the onboarding assessment questions.
// Keys match the original question ids so the backend can compare
// directly against the stored snapshot without any mapping layer.
//
// No comparative questions. No memory dependency.
// The delta is a computed engine output, not a user-reported input.
// ─────────────────────────────────────────────

const DOMAIN_SECTIONS = [
  {
    domain: 'cii',
    label:  'Sleep & Energy Rhythm',
    description: 'How your body is managing its energy and sleep signals right now.',
    questions: [
      { id: 'q5', text: 'I feel alert in the morning without needing to push myself.' },
      { id: 'q6', text: 'I feel naturally tired at night and fall asleep without difficulty.' },
      { id: 'q7', text: 'My energy rises and falls at predictable times throughout the day.' },
    ]
  },
  {
    domain: 'ali',
    label:  'Nervous System Activation',
    description: 'How hard your nervous system is working to stay regulated at home.',
    questions: [
      { id: 'q10', text: 'Small changes in sound, light, or temperature quickly make me tense.' },
      { id: 'q11', text: 'I feel on edge at home even when nothing is wrong.' },
      { id: 'q12', text: 'I find it hard to fully relax, even when nothing is wrong.' },
    ]
  },
  {
    domain: 'pli',
    label:  'Spatial Clarity',
    description: 'How easily your brain is reading and navigating your home.',
    questions: [
      { id: 'q15', text: 'When I enter a room in my home, I immediately know what it\'s for.' },
      { id: 'q17', text: 'In most rooms, my eyes naturally settle on one main feature.' },
      { id: 'q19', text: 'Moving through my home feels automatic rather than mentally effortful.' },
    ]
  },
  {
    domain: 'stl',
    label:  'Sensory Environment',
    description: 'The cumulative impact of your home\'s sensory conditions right now.',
    questions: [
      { id: 'q20', text: 'Too many visible objects make it hard for me to focus.' },
      { id: 'q21', text: 'Background noise in my home makes it hard to fully relax.' },
      { id: 'q24', text: 'Overhead lighting feels harsh or tiring and causes strain.' },
    ]
  },
  {
    domain: 'rci',
    label:  'Recovery Capacity',
    description: 'How effectively your home is helping you restore right now.',
    questions: [
      { id: 'q28', text: 'Time at home does not always leave me feeling fully restored.' },
      { id: 'q29', text: 'It takes me a long time to mentally wind down at night.' },
      { id: 'q33', text: 'My home helps me recover, not just get through the day.', reverse: true },
    ]
  },
]

// ─────────────────────────────────────────────
// PART 2 — CHANGE DETECTION
// ─────────────────────────────────────────────

const CHANGE_QUESTIONS = [
  {
    id:      'env_change_sleep',
    text:    'Since your last assessment, have you made any changes to your bedroom or sleep setup?',
    options: ['Changed lighting', 'Changed bedding or temperature setup', 'Reduced noise sources', 'Rearranged furniture', 'Moved bedroom', 'No changes']
  },
  {
    id:      'env_change_day',
    text:    'Since your last assessment, have you made any changes to your primary daytime space?',
    options: ['Changed lighting', 'Reduced clutter or visual complexity', 'Changed acoustic conditions', 'Added natural elements', 'Moved or reorganised workspace', 'No changes']
  },
  {
    id:      'life_context_change',
    text:    'Has anything significant changed in your daily life since your last assessment?',
    options: ['New or increased work demands', 'Change in household members', 'Health changes', 'Seasonal shift', 'Significant travel', 'Relationship changes', 'Nothing significant']
  }
]

// ─────────────────────────────────────────────
// PART 3 — SUBJECTIVE OPTIONS
// ─────────────────────────────────────────────

const SUBJECTIVE_OPTIONS = [
  { label: 'Significantly worse', value: 1 },
  { label: 'Slightly worse',      value: 2 },
  { label: 'About the same',      value: 3 },
  { label: 'Slightly better',     value: 4 },
  { label: 'Significantly better',value: 5 }
]

// ─────────────────────────────────────────────
// SCALE COMPONENT
// Used for all domain questions (1–5)
// ─────────────────────────────────────────────

function ScaleInput({
  questionKey,
  value,
  onChange,
  lowLabel  = 'Strongly Disagree',
  highLabel = 'Strongly Agree',
  reverse,
}: {
  questionKey: string
  value:       number | null
  onChange:    (key: string, val: number) => void
  lowLabel?:   string
  highLabel?:  string
  reverse?:    boolean
}) {
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(questionKey, n)}
            className={`
              flex-1 h-11 rounded-xl border text-sm font-semibold transition-all duration-200
              ${value === n
                ? 'bg-[#b5a642] border-[#b5a642] text-[#1b270e]'
                : 'bg-[#c9ccbb]/5 border-[#c9ccbb]/15 text-[#c9ccbb]/50 hover:border-[#b5a642]/40 hover:text-[#c9ccbb]'
              }
            `}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-[10px] uppercase tracking-widest text-[#c9ccbb]/30 px-1">
        <span>{reverse ? highLabel : lowLabel}</span>
        <span>{reverse ? lowLabel  : highLabel}</span>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// MAIN PAGE COMPONENT
// ─────────────────────────────────────────────

export default function UpdateAssessmentPage() {
  const router = useRouter()

  const [step, setStep]           = useState<StepId>(0)
  const [responses, setResponses] = useState<Record<string, any>>({})
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState<string | null>(null)

  // ── Response handlers ──────────────────────

  const setResponse = (key: string, value: any) => {
    setResponses(prev => ({ ...prev, [key]: value }))
  }

  const toggleMultiSelect = (key: string, option: string) => {
    const current: string[] = responses[key] || []
    if (option === 'No changes' || option === 'Nothing significant') {
      setResponse(key, [option])
      return
    }
    const filtered = current.filter(o => o !== 'No changes' && o !== 'Nothing significant')
    const updated  = filtered.includes(option)
      ? filtered.filter(o => o !== option)
      : [...filtered, option]
    setResponse(key, updated)
  }

  // ── Step validation ────────────────────────

  const isStepComplete = (): boolean => {
    switch (step) {
      case 0:
        return (
          !!responses.q_state &&
          responses.energy_tax !== undefined &&
          !!responses.primary_strain
        )
      case 1:
        // All 15 domain questions answered
        return DOMAIN_SECTIONS.every(section =>
          section.questions.every(q => responses[q.id] !== undefined)
        )
      case 2:
        return CHANGE_QUESTIONS.every(q =>
          Array.isArray(responses[q.id]) && responses[q.id].length > 0
        )
      case 3:
        return responses.subjective_alignment_score !== undefined
      default:
        return false
    }
  }

  // ── Submit ─────────────────────────────────

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    const formatted: Response[] = Object.entries(responses).map(([key, val]) => ({
      question_key: key,
      answer: { response: val }
    }))

    try {
      const res = await fetch('/api/submit-update-assessment', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ responses: formatted })
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setError(data.error || 'Something went wrong. Please try again.')
        setLoading(false)
        return
      }

      router.push(`/results/update/${data.snapshot_id}`)

    } catch (err) {
      setError('Connection error. Please check your network and try again.')
      setLoading(false)
    }
  }

  // ── Progress ───────────────────────────────

  const progress = (step / 4) * 100

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#1b270e] flex flex-col">

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-[#c9ccbb]/10">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-[#c9ccbb]/40 hover:text-[#c9ccbb] transition-colors text-xs uppercase tracking-widest font-bold"
        >
          <ArrowLeft size={13} /> Dashboard
        </Link>
        <span className="text-[10px] uppercase tracking-widest text-[#c9ccbb]/30 font-bold">
          Two-Week Check-In
        </span>
        <span className="text-[10px] text-[#c9ccbb]/30 uppercase tracking-widest">
          {step + 1} of 4
        </span>
      </div>

      {/* ── Progress bar ── */}
      <div className="h-[2px] bg-[#c9ccbb]/10">
        <div
          className="h-full bg-[#b5a642] transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* ── Content ── */}
      <div className="flex-1 flex flex-col items-center justify-start px-6 py-12">
        <div className="w-full max-w-xl">

          {/* Step label */}
          <p className="text-[10px] uppercase tracking-widest text-[#b5a642]/70 font-bold mb-3">
            Part {step + 1} — {PART_LABELS[step]}
          </p>

          {/* ════════════════════════════════════════
              PART 0 — NERVOUS SYSTEM SNAPSHOT
              Unchanged from original.
          ════════════════════════════════════════ */}
          {step === 0 && (
            <div className="space-y-10 animate-fade-in">
              <div>
                <h1 className="text-3xl font-serif text-[#c9ccbb] mb-2">
                  Before we look at what changed —
                </h1>
                <p className="text-[#c9ccbb]/50 text-sm leading-relaxed">
                  Tell us how your nervous system state feels right now.
                </p>
              </div>

              {/* q_state */}
              <div className="space-y-4">
                <label className="block text-sm text-[#c9ccbb]/80 leading-relaxed">
                  How does your body feel in your home environment right now?
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Alert', 'Calm', 'Wired', 'Flat', 'Tense'].map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setResponse('q_state', opt)}
                      className={`
                        px-5 py-2.5 rounded-full border text-sm font-medium transition-all duration-200
                        ${responses.q_state === opt
                          ? 'bg-[#b5a642] border-[#b5a642] text-[#1b270e]'
                          : 'bg-transparent border-[#c9ccbb]/20 text-[#c9ccbb]/60 hover:border-[#b5a642]/40 hover:text-[#c9ccbb]'
                        }
                      `}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* energy_tax */}
              <div className="space-y-4">
                <label className="block text-sm text-[#c9ccbb]/80 leading-relaxed">
                  What percentage of your energy goes toward managing your environment vs. living in it?
                </label>
                <div className="space-y-3">
                  <div className="flex justify-between text-[10px] uppercase tracking-widest text-[#c9ccbb]/30">
                    <span>Living in it (0%)</span>
                    <span className="text-[#b5a642] font-bold text-sm">
                      {responses.energy_tax ?? 50}%
                    </span>
                    <span>Managing it (100%)</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={responses.energy_tax ?? 50}
                    onChange={e => setResponse('energy_tax', Number(e.target.value))}
                    className="w-full accent-[#b5a642] cursor-pointer"
                  />
                </div>
              </div>

              {/* primary_strain */}
              <div className="space-y-4">
                <label className="block text-sm text-[#c9ccbb]/80 leading-relaxed">
                  Which feels most true right now?
                </label>
                <div className="space-y-2">
                  {['Mental overload', 'Physical tension', 'Emotional volatility', 'Sleep disruption', 'None of the above'].map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setResponse('primary_strain', opt)}
                      className={`
                        w-full text-left px-5 py-3.5 rounded-xl border text-sm transition-all duration-200
                        ${responses.primary_strain === opt
                          ? 'bg-[#b5a642]/10 border-[#b5a642]/50 text-[#c9ccbb]'
                          : 'bg-transparent border-[#c9ccbb]/10 text-[#c9ccbb]/50 hover:border-[#c9ccbb]/25 hover:text-[#c9ccbb]'
                        }
                      `}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════
              PART 1 — DOMAIN RE-SURVEY
              Present-tense questions only.
              No comparative questions.
              Engine computes delta from stored snapshot.
          ════════════════════════════════════════ */}
          {step === 1 && (
            <div className="space-y-10 animate-fade-in">
              <div>
                <h1 className="text-3xl font-serif text-[#c9ccbb] mb-2">
                  Five areas. How are they right now?
                </h1>
                <p className="text-[#c9ccbb]/50 text-sm leading-relaxed">
                  Answer based on how things feel today. Do not try to compare
                  to where you started — that comparison is made for you.
                </p>
              </div>

              {DOMAIN_SECTIONS.map((section, i) => (
                <div key={section.domain} className="space-y-6">

                  {/* Domain divider */}
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] uppercase tracking-widest text-[#b5a642]/60 font-bold whitespace-nowrap">
                      {String(i + 1).padStart(2, '0')} — {section.label}
                    </span>
                    <div className="flex-1 h-px bg-[#c9ccbb]/10" />
                  </div>

                  <p className="text-[#c9ccbb]/40 text-xs leading-relaxed -mt-2">
                    {section.description}
                  </p>

                  {/* Present-tense questions */}
                  {section.questions.map(q => (
                    <div key={q.id} className="space-y-3">
                      <label className="block text-sm text-[#c9ccbb]/80 leading-relaxed">
                        {q.text}
                      </label>
                      <ScaleInput
                        questionKey={q.id}
                        value={responses[q.id] ?? null}
                        onChange={setResponse}
                        reverse={'reverse' in q ? q.reverse : false}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* ════════════════════════════════════════
              PART 2 — CHANGE DETECTION
              Unchanged from original.
          ════════════════════════════════════════ */}
          {step === 2 && (
            <div className="space-y-10 animate-fade-in">
              <div>
                <h1 className="text-3xl font-serif text-[#c9ccbb] mb-2">
                  What has changed?
                </h1>
                <p className="text-[#c9ccbb]/50 text-sm leading-relaxed">
                  This helps us understand whether shifts in your score are likely
                  linked to your environment or to other factors. Select all that apply.
                </p>
              </div>

              {CHANGE_QUESTIONS.map(q => (
                <div key={q.id} className="space-y-4">
                  <label className="block text-sm text-[#c9ccbb]/80 leading-relaxed">
                    {q.text}
                  </label>
                  <div className="space-y-2">
                    {q.options.map(opt => {
                      const selected = (responses[q.id] || []).includes(opt)
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => toggleMultiSelect(q.id, opt)}
                          className={`
                            w-full text-left px-5 py-3.5 rounded-xl border text-sm transition-all duration-200 flex items-center gap-3
                            ${selected
                              ? 'bg-[#b5a642]/10 border-[#b5a642]/50 text-[#c9ccbb]'
                              : 'bg-transparent border-[#c9ccbb]/10 text-[#c9ccbb]/50 hover:border-[#c9ccbb]/25 hover:text-[#c9ccbb]'
                            }
                          `}
                        >
                          <span className={`
                            w-4 h-4 rounded border shrink-0 flex items-center justify-center transition-all
                            ${selected ? 'bg-[#b5a642] border-[#b5a642]' : 'border-[#c9ccbb]/20'}
                          `}>
                            {selected && (
                              <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                                <path d="M1 3L3 5L7 1" stroke="#1b270e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            )}
                          </span>
                          {opt}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ════════════════════════════════════════
              PART 3 — SUBJECTIVE PROGRESS MARKER
              Unchanged from original.
          ════════════════════════════════════════ */}
          {step === 3 && (
            <div className="space-y-10 animate-fade-in">
              <div>
                <h1 className="text-3xl font-serif text-[#c9ccbb] mb-2">
                  One final question.
                </h1>
                <p className="text-[#c9ccbb]/50 text-sm leading-relaxed">
                  No analysis. Just your gut response.
                </p>
              </div>

              <div className="space-y-4">
                <label className="block text-base text-[#c9ccbb]/80 leading-relaxed">
                  Compared to when you started, how does your home feel?
                </label>
                <div className="space-y-2">
                  {SUBJECTIVE_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setResponse('subjective_alignment_score', opt.value)}
                      className={`
                        w-full text-left px-5 py-4 rounded-xl border text-sm transition-all duration-200
                        ${responses.subjective_alignment_score === opt.value
                          ? 'bg-[#b5a642]/10 border-[#b5a642]/50 text-[#c9ccbb] font-medium'
                          : 'bg-transparent border-[#c9ccbb]/10 text-[#c9ccbb]/50 hover:border-[#c9ccbb]/25 hover:text-[#c9ccbb]'
                        }
                      `}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}
            </div>
          )}

          {/* ── Navigation ── */}
          <div className="flex items-center justify-between mt-12 pt-8 border-t border-[#c9ccbb]/10">

            {step > 0 ? (
              <button
                type="button"
                onClick={() => setStep(prev => (prev - 1) as StepId)}
                className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#c9ccbb]/40 hover:text-[#c9ccbb] transition-colors font-bold"
              >
                <ArrowLeft size={12} /> Back
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep(prev => (prev + 1) as StepId)}
                disabled={!isStepComplete()}
                className={`
                  flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-bold uppercase tracking-widest transition-all duration-200
                  ${isStepComplete()
                    ? 'bg-[#b5a642] text-[#1b270e] hover:bg-[#c9b84e]'
                    : 'bg-[#c9ccbb]/10 text-[#c9ccbb]/20 cursor-not-allowed'
                  }
                `}
              >
                Continue <ArrowRight size={13} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!isStepComplete() || loading}
                className={`
                  flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-bold uppercase tracking-widest transition-all duration-200
                  ${isStepComplete() && !loading
                    ? 'bg-[#b5a642] text-[#1b270e] hover:bg-[#c9b84e]'
                    : 'bg-[#c9ccbb]/10 text-[#c9ccbb]/20 cursor-not-allowed'
                  }
                `}
              >
                {loading ? (
                  <><Loader2 size={13} className="animate-spin" /> Calculating...</>
                ) : (
                  <><CheckCircle size={13} /> See What Shifted</>
                )}
              </button>
            )}
          </div>

        </div>
      </div>

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.35s ease-out both;
        }
      `}</style>
    </div>
  )
}
