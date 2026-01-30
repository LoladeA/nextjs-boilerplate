'use client'

import { supabaseBrowser } from '@/lib/supabase-browser'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AssessmentStep0() {
  const router = useRouter()
  const [answers, setAnswers] = useState<{ [key: string]: string | number }>({})
  const [error, setError] = useState<string | null>(null)

  // Baseline questions
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
    const user = await supabaseBrowser.auth.getUser()
    const userId = user.data.user?.id
    if (!userId) return setError('User not authenticated')

    try {
      for (const q of questions) {
        await supabaseBrowser.from('user_responses').insert({
          user_id: userId,
          assessment_step: 0,
          question_key: q.key,
          answer: { response: answers[q.key] || null }
        })
      }
      router.push('/assessments/step1')
    } catch (e: any) {
      setError(e.message)
    }
  }

  return (
    <div className="min-h-screen p-6 bg-green-900 text-cfc993">
      <h1 className="text-3xl font-semibold mb-6">Baseline Assessment</h1>

      {questions.map((q) => (
        <div key={q.key} className="mb-4">
          <label className="block mb-1">{q.label}</label>
          {q.type === 'text' && (
            <input
              type="text"
              value={answers[q.key] || ''}
              onChange={(e) => handleChange(q.key, e.target.value)}
              className="w-full p-3 rounded border"
            />
          )}
          {q.type === 'range' && (
            <>
              <input
                type="range"
                min={q.min}
                max={q.max}
                value={answers[q.key] || 50}
                onChange={(e) => handleChange(q.key, Number(e.target.value))}
                className="w-full"
              />
              <span className="ml-2">{answers[q.key] || 50}%</span>
            </>
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
      <button
        onClick={handleNext}
        className="bg-green-800 text-white py-3 px-6 rounded-lg"
      >
        Next
      </button>
    </div>
  )
}
