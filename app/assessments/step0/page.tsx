'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ArrowRight, Save } from 'lucide-react'
import { assessmentProtocol } from '../../data/assessment-protocol'
import { saveGuestAnswer } from '../../utils/guest-storage'

// Scale labels — 1 to 5, used for all three integration questions
const SCALE_LABELS: Record<number, string> = {
  1: 'Not at all',
  2: 'Rarely',
  3: 'Sometimes',
  4: 'Often',
  5: 'Almost always'
}

export default function AssessmentStep0() {
  const supabase = createClientComponentClient()
  const router   = useRouter()
  const [loading, setLoading]     = useState(false)
  const [responses, setResponses] = useState<Record<string, any>>({})

  const handleSelect = (key: string, value: string | number) => {
    setResponses(prev => ({ ...prev, [key]: value }))
  }

  const handleNext = async () => {
    setLoading(true)

    Object.entries(responses).forEach(([key, value]) => {
      saveGuestAnswer(key, value)
    })

    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      const updates = Object.entries(responses).map(([key, value]) => ({
        user_id:         session.user.id,
        assessment_step: 0,
        question_key:    key,
        answer:          { response: value }
      }))
      await supabase.from('user_responses').upsert(updates)
    }

    router.push('/assessments/step1')
  }

  const handleSaveExit = async () => {
    Object.entries(responses).forEach(([key, value]) => {
      saveGuestAnswer(key, value)
    })

    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      const updates = Object.entries(responses).map(([key, value]) => ({
        user_id:         session.user.id,
        assessment_step: 0,
        question_key:    key,
        answer:          { response: value }
      }))
      await supabase.from('user_responses').upsert(updates)
    }

    router.push('/dashboard')
  }

  const part      = assessmentProtocol.part0
  const questions = part.questions

  // Destructure by id so the page is order-independent and
  // survives any future protocol reordering without breaking.
  const q_state        = questions.find(q => q.id === 'q_state')!
  const q_energy       = questions.find(q => q.id === 'energy_tax')!
  const q_strain       = questions.find(q => q.id === 'primary_strain')!
  const q_int1         = questions.find(q => q.id === 'q_int1')!
  const q_int2         = questions.find(q => q.id === 'q_int2')!
  const q_int3         = questions.find(q => q.id === 'q_int3')!
  const q_neuro        = questions.find(q => q.id === 'neuro_lens')!

  const totalRequired  = questions.length  // 7
  const answered       = Object.keys(responses).length
  const canProceed     = answered >= totalRequired && !loading

  return (
    <div className="min-h-screen p-6 md:p-12 flex flex-col max-w-2xl mx-auto">

      {/* HEADER */}
      <div className="mb-8">
        <span className="text-[#b5a642] text-xs font-bold uppercase tracking-widest">Part 0</span>
        <h1 className="text-3xl font-serif text-[#c9ccbb] mb-2">{part.title}</h1>
        <div className="w-full bg-[#c9ccbb]/10 h-1 rounded-full mt-4">
          <div className="bg-[#b5a642] h-1 rounded-full w-[5%]" />
        </div>
      </div>

      {/* QUESTIONS */}
      <div className="flex-grow space-y-12">

        {/* Q1 — Current State */}
        <div className="space-y-4">
          <label className="text-lg text-[#c9ccbb]">{q_state.text}</label>
          <div className="flex flex-wrap gap-3">
            {q_state.options?.map((opt) => (
              <button
                key={opt}
                onClick={() => handleSelect(q_state.id, opt)}
                className={`px-4 py-2 rounded-full border transition-all ${
                  responses[q_state.id] === opt
                    ? 'bg-[#b5a642] border-[#b5a642] text-[#1b270e]'
                    : 'border-[#c9ccbb]/30 text-[#c9ccbb] hover:border-[#b5a642]'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Q2 — Energy Tax */}
        <div className="space-y-4">
          <label className="text-lg text-[#c9ccbb] flex justify-between">
            {q_energy.text}
            <span className="text-[#b5a642] font-bold">{responses[q_energy.id] ?? 0}%</span>
          </label>
          <input
            type="range"
            min="0" max="100"
            value={responses[q_energy.id] ?? 0}
            className="w-full h-2 bg-[#c9ccbb]/20 rounded-lg appearance-none cursor-pointer accent-[#b5a642]"
            onChange={(e) => handleSelect(q_energy.id, Number(e.target.value))}
          />
        </div>

        {/* Q3 — Primary Strain */}
        <div className="space-y-4">
          <label className="text-lg text-[#c9ccbb]">{q_strain.text}</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {q_strain.options?.map((opt) => (
              <button
                key={opt}
                onClick={() => handleSelect(q_strain.id, opt)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  responses[q_strain.id] === opt
                    ? 'bg-[#b5a642]/10 border-[#b5a642] text-[#b5a642]'
                    : 'border-[#c9ccbb]/20 text-[#c9ccbb]/60 hover:border-[#c9ccbb]'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* ----------------------------------------------------------------
            SOFT DIVIDER — register shift before integration questions.
            Reframe line from assessment-protocol.ts UI NOTE.
        ---------------------------------------------------------------- */}
        <div className="flex items-center gap-4 py-2">
          <div className="flex-1 h-px bg-[#b5a642]/20" />
          <p className="text-[#c9ccbb] text-sm text-center leading-relaxed max-w-sm">
            Three more questions. These ones are about how your body handles what it receives, rather than what it is carrying right now.
          </p>
          <div className="flex-1 h-px bg-[#b5a642]/20" />
        </div>

        {/* Q4 — q_int1 */}
        <ScaleQuestion
          question={q_int1}
          value={responses[q_int1.id]}
          onSelect={(v) => handleSelect(q_int1.id, v)}
        />

        {/* Q5 — q_int2 */}
        <ScaleQuestion
          question={q_int2}
          value={responses[q_int2.id]}
          onSelect={(v) => handleSelect(q_int2.id, v)}
        />

        {/* Q6 — q_int3 */}
        <ScaleQuestion
          question={q_int3}
          value={responses[q_int3.id]}
          onSelect={(v) => handleSelect(q_int3.id, v)}
        />

        {/* Q7 — Neuro Lens (corroborative, last position) */}
        <div className="space-y-4">
          <label className="text-lg text-[#c9ccbb]">{q_neuro.text}</label>
          <div className="flex flex-wrap gap-3">
            {q_neuro.options?.map((opt) => (
              <button
                key={opt}
                onClick={() => handleSelect(q_neuro.id, opt)}
                className={`px-4 py-2 rounded-full border transition-all ${
                  responses[q_neuro.id] === opt
                    ? 'bg-[#c9ccbb] border-[#c9ccbb] text-[#1b270e]'
                    : 'border-[#c9ccbb]/30 text-[#c9ccbb] hover:border-[#c9ccbb]'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* FOOTER */}
      <div className="mt-12 flex justify-between items-center">
        <button
          onClick={handleSaveExit}
          className="flex items-center gap-2 px-6 py-4 text-[#c9ccbb]/60 hover:text-[#c9ccbb] transition-colors text-sm font-medium"
        >
          <Save size={16} /> Save & Return Later
        </button>

        <button
          onClick={handleNext}
          disabled={!canProceed}
          className={`flex items-center gap-2 px-8 py-4 font-bold rounded-xl transition-all ${
            canProceed
              ? 'bg-[#b5a642] text-[#1b270e] hover:bg-white shadow-lg shadow-[#b5a642]/20'
              : 'bg-[#c9ccbb]/10 text-[#c9ccbb]/30 cursor-not-allowed'
          }`}
        >
          {loading ? 'Saving...' : <>Next Part <ArrowRight size={20} /></>}
        </button>
      </div>
    </div>
  )
}

// =============================================================================
// SCALE QUESTION COMPONENT
// Renders a 1–5 Likert scale with labelled endpoints and a selected state.
// Used for q_int1, q_int2, q_int3.
// Reusable for any future scale question added to step0.
// =============================================================================

function ScaleQuestion({
  question,
  value,
  onSelect
}: {
  question: { id: string; text: string }
  value:    number | undefined
  onSelect: (v: number) => void
}) {
  return (
    <div className="space-y-5">
      <label className="text-lg text-[#c9ccbb] leading-relaxed block">
        {question.text}
      </label>

      {/* Scale buttons */}
      <div className="flex gap-2 md:gap-3">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => onSelect(n)}
            className={`flex-1 h-12 rounded-xl border font-bold text-sm transition-all ${
              value === n
                ? 'bg-[#b5a642] border-[#b5a642] text-[#1b270e] shadow-md shadow-[#b5a642]/20'
                : 'border-[#c9ccbb]/20 text-[#c9ccbb]/60 hover:border-[#b5a642]/60 hover:text-[#c9ccbb]'
            }`}
          >
            {n}
          </button>
        ))}
      </div>

      {/* Endpoint labels */}
      <div className="flex justify-between text-[10px] text-[#c9ccbb]/40 uppercase tracking-widest px-1">
        <span>{SCALE_LABELS[1]}</span>
        <span>{SCALE_LABELS[5]}</span>
      </div>
    </div>
  )
}
