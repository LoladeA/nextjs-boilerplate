'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Activity } from 'lucide-react'
import { assessmentProtocol } from '../../data/assessment-protocol'

export default function AssessmentStep0() {
  const supabase = createClientComponentClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [responses, setResponses] = useState<Record<string, any>>({})

  // Helper to update local state
  const handleSelect = (key: string, value: string | number) => {
    setResponses(prev => ({ ...prev, [key]: value }))
  }

  const handleNext = async () => {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    // Prepare data for Supabase
    const updates = Object.entries(responses).map(([key, value]) => ({
      user_id: session.user.id,
      assessment_step: 0,
      question_key: key,
      answer: { response: value } // Storing as JSON
    }))

    // Save to DB
    await supabase.from('user_responses').upsert(updates)
    
    // Move to Step 1
    router.push('/assessments/step1')
  }

  const part = assessmentProtocol.part0
  const questions = part.questions

  return (
    <div className="min-h-screen p-6 md:p-12 flex flex-col max-w-2xl mx-auto">
      {/* HEADER */}
      <div className="mb-8">
        <span className="text-[#b5a642] text-xs font-bold uppercase tracking-widest">Part 0</span>
        <h1 className="text-3xl font-serif text-[#c9ccbb] mb-2">{part.title}</h1>
        <div className="w-full bg-[#c9ccbb]/10 h-1 rounded-full mt-4">
          <div className="bg-[#b5a642] h-1 rounded-full w-[5%]" />
        </div>
      </div>

      {/* QUESTIONS */}
      <div className="flex-grow space-y-12">
        
        {/* Q1: Current State (Choice) */}
        <div className="space-y-4">
          <label className="text-lg text-[#c9ccbb]">{questions[0].text}</label>
          <div className="flex flex-wrap gap-3">
            {questions[0].options?.map((opt) => (
              <button
                key={opt}
                onClick={() => handleSelect(questions[0].id, opt)}
                className={`px-4 py-2 rounded-full border transition-all ${
                  responses[questions[0].id] === opt 
                    ? 'bg-[#b5a642] border-[#b5a642] text-[#1b270e]' 
                    : 'border-[#c9ccbb]/30 text-[#c9ccbb] hover:border-[#b5a642]'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Q2: Energy Tax (Slider) */}
        <div className="space-y-4">
          <label className="text-lg text-[#c9ccbb] flex justify-between">
            {questions[1].text}
            <span className="text-[#b5a642] font-bold">{responses[questions[1].id] || 0}%</span>
          </label>
          <input 
            type="range" 
            min="0" max="100" 
            className="w-full h-2 bg-[#c9ccbb]/20 rounded-lg appearance-none cursor-pointer accent-[#b5a642]"
            onChange={(e) => handleSelect(questions[1].id, Number(e.target.value))}
          />
        </div>

        {/* Q3: Primary Strain (Choice) */}
        <div className="space-y-4">
          <label className="text-lg text-[#c9ccbb]">{questions[2].text}</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {questions[2].options?.map((opt) => (
              <button
                key={opt}
                onClick={() => handleSelect(questions[2].id, opt)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  responses[questions[2].id] === opt 
                    ? 'bg-[#b5a642]/10 border-[#b5a642] text-[#b5a642]' 
                    : 'border-[#c9ccbb]/20 text-[#c9ccbb]/60 hover:border-[#c9ccbb]'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Q4: Neuro Lens (Choice) */}
        <div className="space-y-4">
          <label className="text-lg text-[#c9ccbb]">{questions[3].text}</label>
          <div className="flex flex-wrap gap-3">
            {questions[3].options?.map((opt) => (
              <button
                key={opt}
                onClick={() => handleSelect(questions[3].id, opt)}
                className={`px-4 py-2 rounded-full border transition-all ${
                  responses[questions[3].id] === opt 
                    ? 'bg-[#c9ccbb] border-[#c9ccbb] text-[#1b270e]' 
                    : 'border-[#c9ccbb]/30 text-[#c9ccbb] hover:border-[#c9ccbb]'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* FOOTER */}
      <div className="mt-12 flex justify-end">
        <button 
          onClick={handleNext}
          disabled={loading}
          className="flex items-center gap-2 px-8 py-4 bg-[#b5a642] text-[#1b270e] font-bold rounded-xl hover:bg-[#d4c55e] transition-all disabled:opacity-50"
        >
          {loading ? 'Saving...' : <>Next Part <ArrowRight size={20} /></>}
        </button>
      </div>
    </div>
  )
}
