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

    // 1. Await the authentication layer to identify the inhabitant
    const { data: userData, error: authError } = await supabase.auth.getUser()
    
    if (authError || !userData.user) {
      setError('You must be logged in to submit an assessment.')
      return
    }

    const userId = userData.user.id

    // 2. Insert the data into the system with a structured path
    const { error: insertError } = await supabase.from('assessments').insert([
      { 
        user_id: userId, 
        data: answers 
      },
    ])

    if (insertError) {
      setError(insertError.message)
    } else {
      // 3. Direction: Moving the user toward their new regulated environment
      router.push('/Dashboard')
    }
  }

  return (
    <div className="p-8 bg-green-900 min-h-screen text-[#cfc993]">
      <h1 className="text-3xl font-semibold mb-4">Assessment</h1>
      <p className="mb-6 opacity-80">
        This is where we measure the alignment between your environment and your nervous system.
      </p>
      
      {/* Placeholder for future questions - maintaining structural integrity */}
      <div className="bg-[#6d6f52]/20 p-6 rounded-lg border border-[#6d6f52]">
        <p>Assessment questions will be mapped here.</p>
      </div>

      <button
        onClick={handleSubmit}
        className="mt-6 px-8 py-3 bg-yellow-500 text-green-900 font-bold rounded-lg transform transition duration-300 hover:scale-105"
      >
        Submit Assessment
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-900/50 border border-red-500 rounded text-red-200">
          {error}
        </div>
      )}
    </div>
  )
}
