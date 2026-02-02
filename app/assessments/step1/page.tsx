'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function AssessmentStep1() { // Updated name for Step 1
  const router = useRouter()
  const supabase = createClientComponentClient() 
  const [answers, setAnswers] = useState<{ [key: string]: number }>({})
  const [error, setError] = useState<string | null>(null)

  const questions = [
    { key: 'thermal_friction', label: 'Thermal Friction: Minor temperature shifts frequently interrupt my sleep or focus.' },
    { key: 'stress_spikes', label: 'Stress Spikes: I feel a surge of irritability triggered by small stressors like a humming appliance or visual mess.' },
    { key: 'cognitive_fog', label: 'Cognitive Fog: I struggle to prioritise tasks or maintain clarity while inside my home.' },
    { key: 'circadian_sync', label: 'Circadian Sync: My mood and energy levels are heavily dictated by the seasons or the amount of daylight available.' }
  ]

  function handleChange(key: string, value: number) {
    setAnswers({ ...answers, [key]: value })
  }

  async function handleNext() {
    setError(null)
    
    // 1. Identify the inhabitant through the session
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    
    if (authError || !session) {
      return setError('User not authenticated. Please sign in.')
    }

    const userId = session.user.id

    try {
      // 2. Map answers for bulk insertion (Systemic Efficiency)
      const responseEntries = Object.entries(answers).map(([key, value]) => ({
        user_id: userId,
        assessment_step: 1, // Correct step number for this file
        question_key: key,
        answer: { response: value }
      }))

      // 3. Insert into the intelligence layer
      const { error: insertError } = await supabase
        .from('user_responses')
        .insert(responseEntries)

      if (insertError) throw insertError

      router.push('/assessments/step2')
    } catch (e: any) {
      setError(e.message)
    }
  }

  return (
    <div className="min-h-screen p-6 bg-[#1b270e] text-[#c9ccbb]">
      <div className="max-w-2xl mx-auto py-12">
        <h1 className="text-3xl font-serif mb-8 text-[#b5a642]">Assessment Step 1: Stress & Rhythm</h1>

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
                        : 'bg-[#1b270e] text-[#c9ccbb] border border-[#c9ccbb]/20'
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

        <button
          onClick={handleNext}
          className="mt-12 w-full py-4 bg-[#c9ccbb] text-[#1b270e] rounded-full font-medium hover:bg-[#b5a642] transition-all"
        >
          Next Step
        </button>
      </div>
    </div>
  )
}
