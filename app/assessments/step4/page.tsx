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
    { key: 'movement_flow', label: 'Movement Flow: I find it difficult to move around the house due to physical bottlenecks and awkward layouts.', type: 'scale' },
    { key: 'zoning_conflict', label: 'Zoning Conflict: My work and leisure activities often take place in the same physical space.', type: 'scale' },
    { key: 'natural_light_quality', label: 'Natural Light Quality: The natural lighting in my primary living space feels', type: 'select', options: ['Too Dim', 'Adequate', 'Too Harsh'] },
    { key: 'glare_sensitivity', label: 'Glare Sensitivity: I experience physical discomfort from light reflecting off surfaces or device screens.', type: 'scale' },
    { key: 'internal_noise', label: 'Internal Noise: The sounds of HVAC, appliances, or plumbing are a constant source of disruption.', type: 'scale' },
    { key: 'acoustic_privacy', label: 'Acoustic Privacy: I can hear footsteps or conversations from other rooms when I am attempting to focus.', type: 'scale' },
    { key: 'tactile_aversions', label: 'Tactile Aversions: Certain textures in my home, such as synthetic fibres and cold tiles, feel unpleasant to the touch.', type: 'scale' },
    { key: 'thermal_profile', label: 'Thermal Profile: My body typically runs', type: 'select', options: ['Hot', 'Cold', 'Balanced', 'Variable'] },
    { key: 'biophilic_connection', label: 'Biophilic Connection: I have a clear and restorative view of nature (trees, sky, plants) in my home or from my primary windows.', type: 'scale' }
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

    try {
      const responseEntries = Object.entries(answers).map(([key, value]) => ({
        user_id: session.user.id,
        assessment_step: 4,
        question_key: key,
        answer: { response: value }
      }))

      const [responsesRes, assessmentRes] = await Promise.all([
        supabase.from('user_responses').insert(responseEntries),
        supabase.from('assessments').insert({
          user_id: session.user.id,
          status: 'completed',
          completed_at: new Date().toISOString()
        })
      ])

      if (responsesRes.error) throw responsesRes.error
      if (assessmentRes.error) throw assessmentRes.error

      router.push('/dashboard')
    } catch (e: any) {
      setError(e.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-6 bg-[#1b270e] text-[#c9ccbb]">
      <div className="max-w-2xl mx-auto py-12">
        <h1 className="text-2xl font-serif mb-8 text-[#b5a642]">Part 4: Spatial Design Metrics</h1>

        <div className="space-y-8">
          {questions.map((q) => (
            <div key={q.key} className="bg-[#c9ccbb]/5 p-6 rounded-2xl border border-[#c9ccbb]/10">
              <label className="block mb-4 font-light leading-relaxed">{q.label}</label>
              {q.type === 'scale' && (
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
              )}
              {q.type === 'select' && (
                <select
                  value={answers[q.key] || ''}
                  onChange={(e) => handleChange(q.key, e.target.value)}
                  className="w-full bg-[#1b270e] border border-[#c9ccbb]/20 p-3 rounded-lg focus:outline-none focus:border-[#b5a642]"
                >
                  <option value="">Select...</option>
                  {q.options?.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              )}
            </div>
          ))}
        </div>
        {error && <p className="text-red-400 mt-6 text-sm italic">{error}</p>}
        <div className="flex gap-4 mt-12">
          <button onClick={() => router.push('/assessments/step3')} className="flex-1 py-4 border border-[#c9ccbb]/20 text-[#c9ccbb] rounded-full font-medium hover:bg-[#c9ccbb]/5">Previous</button>
          <button onClick={handleSubmit} disabled={loading} className="flex-2 w-full py-4 bg-[#c9ccbb] text-[#1b270e] rounded-full font-medium hover:bg-[#b5a642] disabled:opacity-50">
            {loading ? 'Processing...' : 'Complete Assessment'}
          </button>
        </div>
      </div>
    </div>
  )
}
