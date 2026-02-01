'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function AssessmentsPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [answers, setAnswers] = useState<Record<string, any>>({
    light_sensitivity: 'medium',
    acoustic_load: 'low',
    restorative_capacity: 'high'
  })
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit() {
    setError(null)
    setIsSubmitting(true)

    // 1. Await the authentication layer to identify the inhabitant
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      setError('You must be logged in to submit an assessment.')
      setIsSubmitting(false)
      return
    }

    // 2. Insert the data into the system with a structured path
    // Note: Ensure your Supabase table is named 'assessments'
    const { error: insertError } = await supabase.from('assessments').insert([
      { 
        user_id: user.id, 
        data: answers 
      },
    ])

    if (insertError) {
      setError(insertError.message)
    } else {
      // 3. Direction: Moving the user toward their new regulated environment
      // Ensure you have a 'dashboard' or 'Dashboard' folder (check casing!)
      router.push('/Dashboard')
    }
    setIsSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-[#1b270e] p-8 md:p-16 text-[#c9ccbb]">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-serif mb-4">Environmental Assessment</h1>
        <p className="mb-12 text-[#c9ccbb]/70 font-light leading-relaxed">
          This is where we measure the alignment between your home environment and your nervous system. 
          By identifying invisible stress cues, we empower the user.
        </p>
        
        {/* Placeholder for future questions - maintaining structural integrity */}
        <div className="bg-[#c9ccbb]/5 p-10 rounded-[2rem] border border-[#c9ccbb]/10 backdrop-blur-sm">
          <p className="text-sm uppercase tracking-widest opacity-50 mb-4">Module 01: Sensory Baseline</p>
          <p className="italic font-serif text-xl text-[#b5a642]">
            "The environment should adapt to the human, not demand endurance."
          </p>
          <div className="mt-8 space-y-4 opacity-30">
            <div className="h-px bg-[#c9ccbb]/20 w-full" />
            <div className="h-px bg-[#c9ccbb]/20 w-3/4" />
            <div className="h-px bg-[#c9ccbb]/20 w-1/2" />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="mt-12 px-10 py-4 bg-[#c9ccbb] text-[#1b270e] font-medium rounded-full transition-all hover:bg-[#b5a642] active:scale-95 disabled:opacity-50"
        >
          {isSubmitting ? 'Calibrating...' : 'Submit Assessment'}
        </button>

        {error && (
          <div className="mt-6 p-4 bg-red-900/20 border border-red-500/50 rounded-xl text-red-200 text-sm italic">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
