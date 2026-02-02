'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function AssessmentStep1() {
  const router = useRouter()
  const supabase = createClientComponentClient() 
  const [answers, setAnswers] = useState<{ [key: string]: number }>({})
  const [error, setError] = useState<string | null>(null)

  const questions = [
    { key: 'thermal_friction', label: 'Thermal Friction: I feel distracted or uncomfortable due to sudden temperature changes that interfere with my sleep or focus.' },
    { key: 'stress_spikes', label: 'Stress Spikes: I feel easily frustrated or irritated by minor environmental stressors (noise, light, clutter or visual mess).' },
    { key: 'cognitive_fog', label: 'Cognitive Fog: I struggle to prioritise tasks or maintain clarity while inside my home.' },
    { key: 'circadian_sync', label: 'Circadian Sync: My sleep quality, mood and energy levels are heavily influenced by the seasons or the amount of daylight available.' }
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
        assessment_step: 1,
        question_key: key,
        answer: { response: value }
      }))
      const { error: insertError } = await supabase.from('user_responses').insert(responseEntries)
      if (insertError) throw insertError
      router.push('/assessments/step2')
    } catch (e: any) {
      setError(e.message)
    }
  }

  return (
    <div className="min-h-screen p-6 bg-[#1b270e] text-[#c9ccbb]">
      <div className="max-w-2xl mx-auto py-12">
        <h1 className="text-2xl font-serif mb-2 text-[#b5a642]">Part 1: Stress & Rhythm (HPA Axis)</h1>
        
        {/* SCALE DESCRIPTION */}
        <div className="mb-8 p-4 bg-[#c9ccbb]/10 rounded-lg text-sm text-[#c9ccbb]/80 flex justify-between items-center font-mono">
           <span>1 = Strongly Disagree</span>
           <span className="h-px bg-[#c9ccbb]/30 flex-1 mx-4"></span>
           <span>5 = Strongly Agree</span>
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
        <button onClick={handleNext} className="mt-12 w-full py-4 bg-[#c9ccbb] text-[#1b270e] rounded-full font-medium hover:bg-[#b5a642] transition-colors">Next Step</button>
      </div>
    </div>
  )
}
