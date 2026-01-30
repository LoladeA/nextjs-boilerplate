'use client'

import { supabaseBrowser } from '@/lib/supabase-browser'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AssessmentStep2() {
  const router = useRouter()
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
    const user = await supabaseBrowser.auth.getUser()
    const userId = user.data.user?.id
    if (!userId) return setError('User not authenticated')

    try {
      for (const q of questions) {
        await supabaseBrowser.from('user_responses').insert({
          user_id: userId,
          assessment_step: 2,
          question_key: q.key,
          answer: { response: answers[q.key] || null }
        })
      }
      router.push('/assessments/step3')
    } catch (e: any) {
      setError(e.message)
    }
  }

  return (
    <div className="min-h-screen p-6 bg-green-900 text-cfc993">
      <h1 className="text-3xl font-semibold mb-6">Assessment Step 2: Sensory Thresholds</h1>

      {questions.map((q) => (
        <div key={q.key} className="mb-6">
          <label className="block mb-2">{q.label}</label>
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((val) => (
              <button
                key={val}
                onClick={() => handleChange(q.key, val)}
                className={`px-4 py-2 rounded-lg ${
                  answers[q.key] === val
                    ? 'bg-yellow-500 text-green-900 font-semibold'
                    : 'bg-green-800 text-white'
                }`}
              >
                {val}
              </button>
            ))}
          </div>
        </div>
      ))}

      {error && <p className="text-red-600 mb-3">{error}</p>}

      <div className="flex justify-between">
        <button
          onClick={() => router.push('/assessments/step1')}
          className="bg-gray-700 text-white py-3 px-6 rounded-lg"
        >
          Previous
        </button>
        <button
          onClick={handleNext}
          className="bg-yellow-500 text-green-900 font-semibold py-3 px-6 rounded-lg"
        >
          Next
        </button>
      </div>
    </div>
  )
}
