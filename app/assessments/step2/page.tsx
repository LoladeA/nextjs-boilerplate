'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function AssessmentStep2() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [answers, setAnswers] = useState<{ [key: string]: number }>({})
  const [error, setError] = useState<string | null>(null)

  const questions = [
    { key: 'visual_entropy', label: 'Visual Entropy: The presence of clutter or visual misalignment/noise actively disrupts my train of thought.' },
    { key: 'acoustic_intrusions', label: 'Acoustic Intrusions: Low-level background noises (traffic, distant voices) prevent me from truly resting.' },
    { key: 'lighting_fatigue', label: 'Lighting Fatigue: The overhead lighting in my home feels aggressive, flat, or physically tiring.' },
    { key: 'tactile_grounding', label: 'Tactile Grounding: The texture or temperature of materials (floors, fabrics, surfaces) significantly alters my mood states.' },
    { key: 'spatial_resonance', label: 'Spatial Resonance: My physical state (tense, calm, restless) changes depending on which room I’m in.' }
  ]

  function handleChange(key: string, value: number) {
    setAnswers({ ...answers, [key]: value })
  }

  async function handleNext() {
    setError(null)
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) return setError('User not authenticated. Please sign in.')

    try {
      const responseEntries = Object.entries(answers).map(([key, value]) => ({
        user_id: session.user.id,
        assessment_step: 2,
        question_key: key,
        answer: { response: value }
      }))
      const { error: insertError } = await supabase.from('user_responses').insert(responseEntries)
      if (insertError) throw insertError
      router.push('/assessments/step3')
    } catch (e: any) {
      setError(e.message)
    }
  }

  return (
    <div className="min-h-screen p-6 bg-[#1b270e] text-[#c9ccbb]">
      <div className="max-w-2xl mx-auto py-12">
        <h1 className="text-2xl font-serif mb-2 text-[#b5a642]">Part 2: Sensory Thresholds</h1>
        
        {/* SCALE DESCRIPTION */}
        <div className="mb-8 p-4 bg-[#c9ccbb]/10 rounded-lg text-sm text-[#c9ccbb]/80 flex justify-between items-center font-mono">
           <span>1 = No Impact</span>
           <span className="h-px bg-[#c9ccbb]/30 flex-1 mx-4"></span>
           <span>5 = Highly Distressing</span>
        </div>

        <div className="space-y-6">
          {questions.map((q) => (
            <div key={q.key} className="bg-[#c9ccbb]/5 p-6 rounded-2xl border border-[#c9ccbb]/10">
              <label className="block mb-4 font-light leading-relaxed">{q.label}</label>
              <div className="flex justify-between gap-2">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    onClick={() => handleChange(q.key, val)}
                    className={`flex-1 py-3 rounded-lg transition-all font-mono text-sm ${
                      answers[q.key] === val
                        ? 'bg-[#b5a642] text-[#1b270e] font-bold shadow-lg scale-105'
                        : 'bg-[#1b270e] text-[#c9ccbb] border border-[#c9ccbb]/20 hover:border-[#b5a642]/50'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        {error && <p className="text-red-400 mt-6 text-sm italic">{error}</p>}
        <div className="flex gap-4 mt-12">
          <button onClick={() => router.push('/assessments/step1')} className="flex-1 py-4 border border-[#c9ccbb]/20 text-[#c9ccbb] rounded-full font-medium hover:bg-[#c9ccbb]/5">Previous</button>
          <button onClick={handleNext} className="flex-2 w-full py-4 bg-[#c9ccbb] text-[#1b270e] rounded-full font-medium hover:bg-[#b5a642]">Next Step</button>
        </div>
      </div>
    </div>
  )
}
