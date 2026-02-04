'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ArrowRight, Save } from 'lucide-react'
import { assessmentProtocol } from '../../data/assessment-protocol'

export default function AssessmentStep2() {
  const part = assessmentProtocol.part2
  const supabase = createClientComponentClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [responses, setResponses] = useState<Record<string, number>>({})

  // SHARED SAVE LOGIC
  const saveProgress = async () => {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return false

    const updates = Object.entries(responses).map(([key, value]) => ({
      user_id: session.user.id,
      assessment_step: 2, // Current Step
      question_key: key,
      answer: { response: value }
    }))

    if (updates.length > 0) {
      await supabase.from('user_responses').upsert(updates)
    }
    return true
  }

  const handleNext = async () => {
    const success = await saveProgress()
    if (success) router.push('/assessments/step3')
  }

  const handleSaveExit = async () => {
    const success = await saveProgress()
    if (success) router.push('/dashboard')
  }

  return (
    <div className="min-h-screen p-6 md:p-12 flex flex-col max-w-2xl mx-auto">
      {/* HEADER */}
      <div className="mb-10 border-b border-[#c9ccbb]/10 pb-8">
        <div className="flex justify-between items-baseline mb-2">
          <span className="text-[#b5a642] text-xs font-bold uppercase tracking-widest">Part {part.step}</span>
          <span className="text-[#c9ccbb]/40 text-xs uppercase tracking-widest">{part.subtitle}</span>
        </div>
        
        <h1 className="text-3xl font-serif text-[#c9ccbb] mb-4">{part.title}</h1>
        <h2 className="text-xl text-[#c9ccbb] mb-4 font-light leading-snug">{part.main_question}</h2>
        <p className="text-[#c9ccbb]/60 text-sm leading-relaxed max-w-xl">{part.description}</p>

        <div className="w-full bg-[#c9ccbb]/10 h-1 rounded-full mt-8">
          <div className="bg-[#b5a642] h-1 rounded-full w-[40%]" />
        </div>
      </div>

      {/* QUESTIONS */}
      <div className="flex-grow space-y-12">
        {part.questions.map((q) => (
          <div key={q.id} className="space-y-4">
            <label className="text-lg text-[#c9ccbb] block">{q.text}</label>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  onClick={() => setResponses(prev => ({ ...prev, [q.id]: num }))}
                  className={`py-3 rounded-lg border transition-all font-serif text-xl ${
                    responses[q.id] === num
                      ? 'bg-[#b5a642] border-[#b5a642] text-[#1b270e]'
                      : 'border-[#c9ccbb]/20 text-[#c9ccbb]/40 hover:border-[#b5a642]'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-[#c9ccbb]/30 uppercase tracking-widest px-1">
              <span>Strongly Disagree</span>
              <span>Strongly Agree</span>
            </div>
          </div>
        ))}
      </div>

      {/* FOOTER ACTIONS */}
      <div className="mt-12 flex justify-between items-center">
        <button 
          onClick={handleSaveExit}
          className="flex items-center gap-2 px-6 py-4 text-[#c9ccbb]/60 hover:text-[#c9ccbb] transition-colors text-sm font-medium"
        >
          <Save size={16} /> Save & Return Later
        </button>

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
