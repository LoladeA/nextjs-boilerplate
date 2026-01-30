'use client'

import { supabaseBrowser } from '@/lib/supabase-browser'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AssessmentStep1() {
  const router = useRouter()
  const [answers, setAnswers] = useState<{ [key: string]: number }>({})
  const [error, setError] = useState<string | null>(null)

  // Part 1: Stress & Rhythm (HPA Axis)
  const questions = [
    {
      key: 'thermal_friction',
      label: 'Thermal Friction: Minor temperature shifts frequently interrupt my sleep or focus.'
    },
    {
      key: 'stress_spikes',
      label: 'Stress Spikes: I feel a surge of irritability triggered by small stressors like a humming appliance or visual mess.'
    },
    {
      key: 'cognitive_fog',
      label: 'Cognitive Fog: I struggle to prioritise tasks or maintain clarity while inside my home.'
    },
    {
      key: 'circadian_sync',
      label: 'Circadian Sync: My mood and energy levels are heavily dictated by the seasons or the amount of daylight available.'
    }
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
          assessment_step: 1,
          question_key: q.key,
          answer: { response: answers[q.key] || null }
        })
      }
      router.push('/assessments/step2')
    } catch (e: any) {
      setError(e.message)
    }
  }

  return (
    <div className="min-h-screen p-6 bg-green-900 text-cfc993">
      <h1 className="text-3xl font-semibold mb-6">Assessment Step 1: Stress & Rhythm</h1>

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

      <button
        onClick={handleNext}
        className="bg-yellow-500 text-green-900 font-semibold py-3 px-6 rounded-lg"
      >
        Next
      </button>
    </div>
  )
}
