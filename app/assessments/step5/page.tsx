'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { CheckCircle, Save } from 'lucide-react'
import { assessmentProtocol } from '../../data/assessment-protocol'
import { saveGuestAnswer } from '../../utils/guest-storage'

export default function AssessmentStep5() {
  const part = assessmentProtocol.part5
  const supabase = createClientComponentClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [responses, setResponses] = useState<Record<string, number>>({})

  // 🟢 SMART FINISH LOGIC (Replaces generic saveProgress)
  const handleFinish = async () => {
    setLoading(true)

    // 1. ALWAYS SAVE LOCALLY FIRST (Ensures data safety + Guest support)
    Object.entries(responses).forEach(([key, value]) => {
      saveGuestAnswer(key, value)
    })

    // 2. CHECK AUTH STATUS
    const { data: { session } } = await supabase.auth.getSession()

    if (session) {
      // --- LOGGED IN USER PATH ---
      // Save directly to database
      const updates = Object.entries(responses).map(([key, value]) => ({
        user_id: session.user.id,
        assessment_step: 5,
        question_key: key,
        answer: { response: value }
      }))

      if (updates.length > 0) {
        await supabase.from('user_responses').upsert(updates)
      }

      // REDIRECT TO DASHBOARD (Baseline Updated)
      router.push('/dashboard')
    } else {
      // --- GUEST PATH ---
      // REDIRECT TO PREVIEW (Teaser Page)
      router.push('/assessments/results-preview') 
    }
  }

  // 🟢 SAVE & EXIT LOGIC (Updates Dashboard if possible)
  const handleSaveExit = async () => {
    // Basic save for later
    Object.entries(responses).forEach(([key, value]) => {
        saveGuestAnswer(key, value)
    })
    
    // Attempt database save if possible, but don't block navigation on it
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
        const updates = Object.entries(responses).map(([key, value]) => ({
            user_id: session.user.id,
            assessment_step: 5,
            question_key: key,
            answer: { response: value }
        }))
        await supabase.from('user_responses').upsert(updates)
    }

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen p-6 md:p-12 flex flex-col max-w-2xl mx-auto">
      {/* HEADER */}
      <div className="mb-10 border-b border-[#c9ccbb]/10 pb-8">
        <div className="flex justify-between items-baseline mb-2">
          <span className="text-[#b5a642] text-xs font-bold uppercase tracking-widest">Part {part.step}</span>
          <span className="text-[#c9ccbb]/70 text-xs uppercase tracking-widest">{part.subtitle}</span>
        </div>
        
        <h1 className="text-3xl font-serif text-[#c9ccbb] mb-4">{part.title}</h1>
        <h2 className="text-xl text-[#c9ccbb] mb-4 font-light leading-snug">{part.main_question}</h2>
        <p className="text-[#c9ccbb]/80 text-sm leading-relaxed max-w-xl">{part.description}</p>

        <div className="w-full bg-[#c9ccbb]/10 h-1 rounded-full mt-8">
          <div className="bg-[#b5a642] h-1 rounded-full w-[100%]" />
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
          onClick={handleFinish}
          disabled={loading}
          className="flex items-center gap-2 px-8 py-4 bg-[#b5a642] text-[#1b270e] font-bold rounded-xl hover:bg-[#d4c55e] transition-all disabled:opacity-50"
        >
          {loading ? 'Processing...' : <>View Analysis <CheckCircle size={20} /></>}
        </button>
      </div>
    </div>
  )
}
