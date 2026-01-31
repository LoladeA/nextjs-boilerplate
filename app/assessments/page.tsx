'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabaseClient } from '@/lib/useSupabaseClient'

export default function AssessmentsPage() {
  const router = useRouter()
  const supabase = useSupabaseClient()
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    setError(null)
    const user = supabase.auth.getUser
    const { error } = await supabase.from('assessments').insert([
      { user_id: supabase.auth.getUser()?.id, data: answers },
    ])
    if (error) setError(error.message)
    else router.push('/dashboard')
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-4">Assessment Page</h1>
      <p>Render all assessment questions here.</p>
      <button
        onClick={handleSubmit}
        className="mt-6 px-6 py-3 bg-green-800 text-white rounded-lg"
      >
        Submit Assessment
      </button>
      {error && <p className="text-red-600 mt-2">{error}</p>}
    </div>
  )
}
