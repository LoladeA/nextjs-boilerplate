'use client'

import { supabaseBrowser } from '@/lib/supabase-browser'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AssessmentStep4() {
  const router = useRouter()
  const [answers, setAnswers] = useState<{ [key: string]: string | number }>({})
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const questions: {
    key: string
    label: string
    type: 'scale' | 'select'
    options?: string[]
  }[] = [
    { key: 'movement_flow', label: 'Movement Flow: My movement through the house feels effortful due to physical bottlenecks or awkward layouts.', type: 'scale' },
    { key: 'zoning_conflict', label: 'Zoning Conflict: Work and relaxation spaces collide in the same physical space.', type: 'scale' },
    { key: 'natural_light_quality', label: 'Natural Light Quality: The natural light in my primary living space feels', type: 'select', options: ['Too Dim', 'Adequate', 'Too Harsh'] },
    { key: 'glare_sensitivity', label: 'Glare Sensitivity: I experience discomfort from light reflecting off surfaces/screens.', type: 'scale' },
    { key: 'internal_noise', label: 'Internal Noise: Sounds from HVAC, appliances, or plumbing disrupt me.', type: 'scale' },
    { key: 'acoustic_privacy', label: 'Acoustic Privacy: I can hear footsteps/conversations from other rooms when focusing.', type: 'scale' },
    { key: 'tactile_aversions', label: 'Tactile Aversions: Certain textures (synthetic fibers, cold tiles) feel unpleasant.', type: 'scale' },
    { key: 'thermal_profile', label: 'Thermal Profile: My body typically runs', type: 'select', options: ['Hot', 'Cold', 'Balanced', 'Variable'] },
    { key: 'biophilic_connection', label: 'Biophilic Connection: I have a clear and restorative view of nature from my primary windows.', type: 'scale' }
  ]

  function handleChange(key: string, value: string | number) {
    setAnswers({ ...answers, [key]: value })
  }

  async function handleSubmit() {
    setLoading(true)
    setError(null)

    const user = await supabaseBrowser.auth.getUser()
    const userId = user.data.user?.id
    if (!userId) {
      setError('User not authenticated')
      setLoading(false)
      return
    }

    try {
      for (const q of questions) {
        await supabaseBrowser.from('user_responses').insert({
          user_id: userId,
          assessment_step: 4,
          question_key: q.key,
          answer: { response: answers[q.key] || null }
        })
      }

      // Optional: mark assessment complete
      await supabaseBrowser.from('assessments').insert({
        user_id: userId,
        completed_at: new Date().toISOString()
      })

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (e: any) {
      setError(e.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-6 bg-green-900 text-cfc993">
      <h1 className="text-3xl font-semibold mb-6">Assessment Step 4: Spatial Design Metrics</h1>

      {questions.map((q) => (
        <div key={q.key} className="mb-6">
          <label className="block mb-2">{q.label}</label>

          {q.type === 'scale' && (
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
          )}

          {q.type === 'select' && (
            <select
              value={answers[q.key] || ''}
              onChange={(e) => handleChange(q.key, e.target.value)}
              className="w-full p-3 rounded border"
            >
              <option value="">Select...</option>
              {q.options?.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          )}
        </div>
      ))}

      {error && <p className="text-red-600 mb-3">{error}</p>}

      <div className="flex justify-between">
        <button
          onClick={() => router.push('/assessments/step3')}
          className="bg-gray-700 text-white py-3 px-6 rounded-lg"
        >
          Previous
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-yellow-500 text-green-900 font-semibold py-3 px-6 rounded-lg"
        >
          {loading ? 'Submitting...' : 'Submit Assessment'}
        </button>
      </div>
    </div>
  )
}
