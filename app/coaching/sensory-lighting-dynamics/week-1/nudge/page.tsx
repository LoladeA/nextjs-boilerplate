'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { ShieldCheck, ArrowRight, CheckCircle, Eye, Zap, Loader2 } from 'lucide-react'
import Sidebar from '@/app/components/Sidebar'

// =============================================================================
// MODULE 2 — WEEK 1 NUDGE
//
// This page is the gate between week 1 and week 2.
// /api/complete-week is called here — not in the quiz — because the nudge
// is the deliberate transitional moment where the user confirms they are
// ready to proceed. The quiz assesses comprehension. The nudge closes the week.
//
// module_number: 2, week_number: 1
// On advance: current_week moves from 1 → 2
// =============================================================================

const MODULE_NUMBER = 2
const WEEK_NUMBER   = 1

export default function Week1Nudge() {
  const router   = useRouter()
  const supabase = createClientComponentClient()

  const [score,     setScore]     = useState<number | null>(null)
  const [advancing, setAdvancing] = useState(false)
  const [error,     setError]     = useState<string | null>(null)

  useEffect(() => {
    const fetchScore = async () => {
      const { data } = await supabase
        .from('quiz_submissions')
        .select('score')
        .eq('module_id', 'sensory-lighting-dynamics-week-1')
        .order('completed_at', { ascending: false })
        .limit(1)
        .single()

      if (data) setScore(data.score)
    }
    fetchScore()
  }, [supabase])

  const handleContinue = async () => {
    setAdvancing(true)
    setError(null)

    try {
      const res  = await fetch('/api/complete-week', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          module_number: MODULE_NUMBER,
          week_number:   WEEK_NUMBER,
        })
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setError('Could not save your progress. Please try again.')
        setAdvancing(false)
        return
      }

      router.push('/coaching/sensory-lighting-dynamics/week-2')

    } catch (err) {
      console.error('Complete week error:', err)
      setError('Connection error. Please check your network and try again.')
      setAdvancing(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#1b270e] font-sans selection:bg-[#b5a642] selection:text-[#1b270e]">
      <Sidebar />
      <main className="md:ml-64 min-h-screen p-6 md:p-12 lg:p-20">
        <div className="max-w-4xl mx-auto text-[#c9ccbb]">

          <header className="mb-20">
            <h1 className="text-4xl md:text-5xl font-serif mb-6 leading-tight text-[#c9ccbb]">
              Week 1: Integration Strategy
            </h1>
            <p className="text-[#c9ccbb]/60 text-xl italic">
              Mitigating environmental load through sensory hierarchy.
            </p>
          </header>

          <div className="grid gap-12 mb-20">

            {/* Action 1: Visual Clutter Hierarchy */}
            <div className="glass-panel p-10 rounded-[2rem] border border-[#b5a642]/20 bg-[#b5a642]/5 shadow-xl">
              <div className="flex items-center gap-6 mb-8">
                <div className="w-14 h-14 bg-[#b5a642] text-[#1b270e] rounded-full flex items-center justify-center">
                  <Eye size={28} />
                </div>
                <h3 className="text-2xl font-serif">Visual Hierarchy Audit</h3>
              </div>
              <p className="mb-8 leading-[1.8] text-lg opacity-80">
                Visual clutter is not simply too many things. It is high object variability without hierarchy. Identify a primary field of view in your workspace or rest zone where the prefrontal cortex must continuously inhibit distraction.
              </p>
              <div className="bg-[#1b270e]/40 p-8 rounded-2xl border border-[#c9ccbb]/10">
                <span className="text-[#b5a642] text-xs font-bold uppercase tracking-widest block mb-4">Immediate Shift</span>
                <p className="text-lg text-[#c9ccbb]/70 italic leading-relaxed">
                  Group disparate objects into a single, unified container or visual cluster. Reducing the number of individual items the visual cortex must parse preserves working memory.
                </p>
              </div>
            </div>

            {/* Action 2: Edge Density & Spatial Geometry */}
            <div className="glass-panel p-10 rounded-[2rem] border border-[#b5a642]/20 bg-[#b5a642]/5 shadow-xl">
              <div className="flex items-center gap-6 mb-8">
                <div className="w-14 h-14 bg-[#b5a642] text-[#1b270e] rounded-full flex items-center justify-center">
                  <Zap size={28} />
                </div>
                <h3 className="text-2xl font-serif">Geometric Workload Reduction</h3>
              </div>
              <p className="mb-8 leading-[1.8] text-lg opacity-80">
                Spatial configuration is not aesthetic preference. It is neurological workload. Sharp angles and rectilinear dominance increase edge density, requiring more visual parsing and contrast detection.
              </p>
              <ul className="space-y-6">
                <li className="flex gap-4 items-start text-lg text-[#c9ccbb]/80">
                  <CheckCircle size={24} className="text-[#b5a642] shrink-0 mt-1" />
                  <span>Introduce one curved or organic form into your high-vigilance zones to signal biological safety to the nervous system.</span>
                </li>
                <li className="flex gap-4 items-start text-lg text-[#c9ccbb]/80">
                  <CheckCircle size={24} className="text-[#b5a642] shrink-0 mt-1" />
                  <span>Identify discordant multisensory inputs — such as bright light paired with unpredictable background noise — and harmonise them to reduce ACC conflict monitoring.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Gate — transition to Week 2 */}
          <div className="flex flex-col items-center border-t border-[#c9ccbb]/10 pt-20">
            <h4 className="text-[#c9ccbb] font-serif text-3xl mb-4">Ready to deepen the shift?</h4>
            <p className="text-[#c9ccbb]/40 text-sm mb-10 text-center max-w-md leading-relaxed">
              Confirming this closes Week 1 and unlocks Week 2. Take your time with the actions above before continuing.
            </p>

            {error && (
              <p className="text-red-400 text-xs mb-6 text-center leading-relaxed">{error}</p>
            )}

            <button
              onClick={handleContinue}
              disabled={advancing}
              className={`group flex items-center gap-4 px-14 py-6 font-bold rounded-full transition-all shadow-2xl shadow-[#b5a642]/20 ${
                advancing
                  ? 'bg-[#b5a642]/40 text-[#1b270e]/60 cursor-not-allowed'
                  : 'bg-[#c9ccbb] text-[#1b270e] hover:bg-[#b5a642]'
              }`}
            >
              {advancing ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Saving progress...
                </>
              ) : (
                <>
                  Continue to Week 2: Circadian Stability & Sensory Filtering
                  <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
                </>
              )}
            </button>
          </div>

        </div>
      </main>
    </div>
  )
}
