'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function AssessmentStep0() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [answers, setAnswers] = useState<{ [key: string]: string | number }>({})
  const [error, setError] = useState<string | null>(null)

  const questions = [
    { key: 'physiological_state', label: 'Current Physiological State: How does your body feel right now?', type: 'select', options: ['Alert', 'Calm', 'Restless', 'Tired', 'Tense'] },
    { key: 'energy_tax', label: 'The Energy Tax: % of energy spent managing your environment', type: 'range', min: 0, max: 100 },
    { key: 'core_aspiration', label: 'The Core Aspiration: If your home supported you perfectly, what would change first?', type: 'text' },
    { key: 'neurological_lens', label: 'Neurological Lens: My sensory processing is influenced by', type: 'select', options: ['HSP', 'ADHD', 'Autism', 'Dyslexia', 'SPD', 'None'] }
  ]

  function handleChange(key: string, value: string | number) {
    setAnswers({ ...answers, [key]: value })
  }

  async function handleNext() {
    setError(null)
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    
    if (authError || !session) return setError('User not authenticated. Please sign in.')
    
    try {
      const responseEntries = Object.entries(answers).map(([key, value]) => ({
        user_id: session.user.id,
        assessment_step: 0,
        question_key: key,
        answer: { response: value }
      }))
      const { error: insertError } = await supabase.from('user_responses').insert(responseEntries)
      if (insertError) throw insertError

      // Note: Points to the new folder name 'step1' (no space)
      router.push('/assessments/step1')
    } catch (e: any) {
      setError(e.message)
    }
  }

  return (
    <div className="min-h-screen p-6 bg-[#1b270e] text-[#c9ccbb]">
      <div className="max-w-2xl mx-auto py-12">
        <h1 className="text-3xl font-serif mb-8 text-[#b5a642]">Baseline Assessment</h1>
        <div className="space-y-8">
          {questions.map((q) => (
            <div key={q.key} className="bg-[#c9ccbb]/5 p-6 rounded-2xl border border-[#c9ccbb]/10">
              <label className="block mb-4 font-light">{q.label}</label>
              {q.type === 'text' && <input type="text" onChange={(e) => handleChange(q.key, e.target.value)} className="w-full bg-transparent border-b border-[#c9ccbb]/20 py-2 focus:border-[#b5a642]" />}
              {q.type === 'range' && <input type="range" min={q.min} max={q.max} onChange={(e) => handleChange(q.key, Number(e.target.value))} className="w-full accent-[#b5a642]" />}
              {q.type === 'select' && <select onChange={(e) => handleChange(q.key, e.target.value)} className="w-full bg-[#1b270e] border border-[#c9ccbb]/20 p-3 rounded-lg"><option value="">Select...</option>{q.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select>}
            </div>
          ))}
        </div>
        {error && <p className="text-red-400 mt-6 text-sm italic">{error}</p>}
        <button onClick={handleNext} className="mt-12 w-full py-4 bg-[#c9ccbb] text-[#1b270e] rounded-full font-medium hover:bg-[#b5a642]">Proceed to Step 1</button>
      </div>
    </div>
  )
}
