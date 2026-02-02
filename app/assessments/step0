'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function AssessmentStep0() {
  const router = useRouter()
  const supabase = createClientComponentClient() // Replaces supabaseBrowser
  const [answers, setAnswers] = useState<{ [key: string]: string | number }>({})
  const [error, setError] = useState<string | null>(null)

  const questions = [
    {
      key: 'physiological_state',
      label: 'Current Physiological State: How does your body feel right now?',
      type: 'select',
      options: ['Alert', 'Calm', 'Restless', 'Tired', 'Tense']
    },
    {
      key: 'energy_tax',
      label: 'The Energy Tax: % of energy spent managing your environment',
      type: 'range',
      min: 0,
      max: 100
    },
    {
      key: 'core_aspiration',
      label: 'The Core Aspiration: If your home supported you perfectly, what would change first?',
      type: 'text'
    },
    {
      key: 'neurological_lens',
      label: 'Neurological Lens: My sensory processing is influenced by',
      type: 'select',
      options: ['HSP', 'ADHD', 'Autism', 'Dyslexia', 'SPD', 'None']
    }
  ]

  function handleChange(key: string, value: string | number) {
    setAnswers({ ...answers, [key]: value })
  }

  async function handleNext() {
    setError(null)
    
    // Check for an active session to identify the inhabitant
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    
    if (authError || !session) {
      return setError('User not authenticated. Please sign in.')
    }

    const userId = session.user.id

    try {
      // 1. Prepare data for bulk insertion (High-Efficiency Path)
      const responseEntries = Object.entries(answers).map(([key, value]) => ({
        user_id: userId,
        assessment_step: 0, // Keep this as 0 for this file
        question_key: key,
        answer: { response: value }
      }))

      // 2. Insert into the 'user_responses' table
      const { error: insertError } = await supabase
        .from('user_responses')
        .insert(responseEntries)

      if (insertError) throw insertError

      // 3. Direction: Moving to the next room in the methodology
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
              
              {q.type === 'text' && (
                <input
                  type="text"
                  value={answers[q.key] || ''}
                  onChange={(e) => handleChange(q.key, e.target.value)}
                  className="w-full bg-transparent border-b border-[#c9ccbb]/20 py-2 focus:outline-none focus:border-[#b5a642] transition-colors"
                />
              )}

              {q.type === 'range' && (
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={q.min}
                    max={q.max}
                    value={answers[q.key] || 50}
                    onChange={(e) => handleChange(q.key, Number(e.target.value))}
                    className="flex-1 accent-[#b5a642]"
                  />
                  <span className="text-sm font-mono">{answers[q.key] || 50}%</span>
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
        
        <button
          onClick={handleNext}
          className="mt-12 w-full py-4 bg-[#c9ccbb] text-[#1b270e] rounded-full font-medium hover:bg-[#b5a642] transition-all"
        >
          Proceed to Step 1
        </button>
      </div>
    </div>
  )
}
