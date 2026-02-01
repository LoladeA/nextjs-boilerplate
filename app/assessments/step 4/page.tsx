'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function AssessmentStep4() {
  const router = useRouter()
  const supabase = createClientComponentClient()
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

    const { data: { session }, error: authError } = await supabase.auth.getSession()
    
    if (authError || !session) {
      setLoading(false)
      return setError('User not authenticated')
    }

    const userId = session.user.id

    try {
      // 1. Prepare responses for bulk insertion
      const responseEntries = Object.entries(answers).map(([key, value]) => ({
        user_id: userId,
        assessment_step: 4,
        question_key: key,
        answer: { response: value }
      }))

      // 2. Perform both database operations
      const [responsesRes, assessmentRes] = await Promise.all([
        supabase.from('user_responses').insert(responseEntries),
        supabase.from('assessments').insert({
          user_id: userId,
          status: 'completed',
          completed_at: new Date().toISOString()
        })
      ])

      if (responsesRes.error) throw responsesRes.error
      if (assessmentRes.error) throw assessmentRes.error

      // 3. Direction: Final transition to the Dashboard (Capital D)
      router.push('/Dashboard')
    } catch (e: any) {
      setError(e.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-6 bg-[#1b270e] text-[#c9ccbb]">
      <div className="max-w-2xl mx-auto py-12">
        <h1 className="text-3xl font-serif mb-8 text-[#b5a642]">Step 4: Spatial Design Metrics</h1>

        <div className="space-y-8">
          {questions.map((q) => (
            <div key={q.key} className="bg-[#c9ccbb]/5 p-6 rounded-2xl border border-[#c9ccbb]/10">
              <label className="block mb-4 font-light leading-relaxed">{q.label}</label>

              {q.type === 'scale' && (
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
              )}

              {q.type === 'select' && (
                <select
                  value={answers[q.key] || ''}
                  onChange={(e) => handleChange(q.key, e.target.value)}
                  className="w-full bg-[#1b270e] border border-[#c9ccbb]/20 p-3 rounded-lg focus:outline-none focus:border-[#b5a642]"
                >
                  <option value="">Select...</option>
                  {q.options?.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              )}
            </div>
          ))}
        </div>

        {error && <p className="text-red-400 mt-6 text-sm italic">{error}</p>}

        <div className="flex gap-4 mt-12">
          <button
            onClick={() => router.push('/assessments/step3')}
            className="flex-1 py-4 border border-[#c9ccbb]/20 text-[#c9ccbb] rounded-full font-medium hover:bg-[#c9ccbb]/5 transition-all"
          >
            Previous
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-2 w-full py-4 bg-[#c9ccbb] text-[#1b270e] rounded-full font-medium hover:bg-[#b5a642] transition-all disabled:opacity-50"
          >
            {loading ? 'Analyzing Data...' : 'Complete Assessment'}
          </button>
        </div>
      </div>
    </div>
  )
}
