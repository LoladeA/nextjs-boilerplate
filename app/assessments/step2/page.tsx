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
    { key: 'visual_entropy', label: 'Visual Entropy: The presence of clutter disrupts my train of thought.' },
    { key: 'acoustic_intrusions', label: 'Acoustic Intrusions: Low-level background noises prevent me from resting.' },
    { key: 'lighting_fatigue', label: 'Lighting Fatigue: Overhead lighting feels aggressive or tiring.' },
    { key: 'tactile_grounding', label: 'Tactile Grounding: Materials affect my mood.' },
    { key: 'spatial_resonance', label: 'Spatial Resonance: My physical tension changes when moving rooms.' }
  ]

  function handleChange(key: string, value: number) {
    setAnswers({ ...answers, [key]: value })
  }

  async function handleNext() {
    setError(null)
    
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    
    if (authError || !session) {
      return setError('User not authenticated. Please sign in.')
    }

    try {
      const responseEntries = Object.entries(answers).map(([key, value]) => ({
        user_id: session.user.id,
        assessment_step: 2,
        question_key: key,
        answer: { response: value }
      }))

      const { error: insertError } = await supabase
        .from('user_responses')
        .insert(responseEntries)

      if (insertError) throw insertError

      router.push('/assessments/step3')
    } catch (e: any) {
      setError(e.message)
    }
  }

  return (
    <div className="min-h-screen p-6 bg-[#1b270e] text-[#c9ccbb]">
      <div className="max-w-2xl mx-auto py-12">
        <h1 className="text-3xl font-serif mb-8 text-[#b5a642]">Assessment Step 2: Sensory Thresholds</h1>

        <div className="space-y-8">
          {questions.map((q) => (
            <div key={q.key} className="bg-[#c9ccbb]/5 p-6 rounded-2xl border border-[#c9ccbb]/10">
              <label className="block mb-4 font-light">{q.label}</label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    onClick={() => handleChange(q.key, val)}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      answers[q.key] === val
                        ? 'bg-[#b5a642] text-[#1b270e] font-semibold'
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
          <button
            onClick={() => router.push('/assessments/step1')}
            className="flex-1 py-4 border border-[#c9ccbb]/20 text-[#c9ccbb] rounded-full font-medium hover:bg-[#c9ccbb]/5 transition-all"
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            className="flex-2 w-full py-4 bg-[#c9ccbb] text-[#1b270e] rounded-full font-medium hover:bg-[#b5a642] transition-all"
          >
            Next Step
          </button>
        </div>
      </div>
    </div>
  )
}
