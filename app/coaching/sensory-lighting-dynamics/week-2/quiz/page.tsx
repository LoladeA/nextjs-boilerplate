'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { CheckCircle, Zap, ArrowRight } from 'lucide-react'
import Sidebar from '@/app/components/Sidebar'

const questions = [
  {
    q: "What suppresses melatonin most effectively?",
    options: [
      "Overall brightness alone",
      "Warm-spectrum light at any intensity",
      "Short-wavelength (blue-enriched) light exposure",
      "Indirect lighting placement"
    ],
    correct: 2
  },
  {
    q: "Why is circadian amplitude important for resilience?",
    options: [
      "It increases total daily energy output",
      "It strengthens the contrast between alert and recovery phases",
      "It reduces the need for artificial lighting",
      "It eliminates the need for sleep tracking"
    ],
    correct: 1
  },
  {
    q: "What is sensory gating?",
    options: [
      "The brain’s ability to amplify important sounds",
      "The filtering of incoming sensory input before conscious awareness",
      "The emotional response to unexpected stimuli",
      "The visual system’s adaptation to darkness"
    ],
    correct: 1
  },
  {
    q: "Why can some LED lights increase strain even if flicker is not visible?",
    options: [
      "They emit too much heat",
      "They reduce oxygen levels in the room",
      "Pulse-width modulation can create micro-flicker that increases processing demand",
      "They produce excessive infrared radiation"
    ],
    correct: 2
  }
]

export default function Week2Quiz() {
  const [current, setCurrent] = useState(0)
  const [score, setScore] = useState(0)
  const [complete, setComplete] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleAnswer = async (index: number) => {
    const isCorrect = index === questions[current].correct
    const newScore = isCorrect ? score + 1 : score
    
    if (current < questions.length - 1) {
      setScore(newScore)
      setCurrent(current + 1)
    } else {
      setScore(newScore)
      setComplete(true)
      
      // 🟢 DATABASE FIX: Matches your actual Supabase columns
      const { error } = await supabase.from('quiz_submissions').insert({ 
        module_id: 'sensory-lighting-dynamics-week-2',      // changed from 'module_slug'
        score: newScore, 
        total_questions: questions.length // changed from 'total'
      })

      if (error) {
        console.error('Error saving quiz:', error)
      }
    }
  }
  
  if (complete) return (
    <div className="min-h-screen bg-[#1b270e] flex items-center justify-center p-6 text-[#c9ccbb]">
      <div className="max-w-md w-full glass-panel p-12 rounded-[2rem] text-center border border-[#b5a642]/30 bg-[#b5a642]/5">
        <CheckCircle className="mx-auto mb-6 text-[#b5a642]" size={64} />
        <h2 className="text-3xl font-serif mb-4">Assessment Verified</h2>
        <p className="opacity-60 mb-8 italic text-lg leading-relaxed">
          Score: {score}/{questions.length}. You are establishing physiological contrast.
        </p>
        <button 
          onClick={() => router.push('/coaching/sensory-lighting-dynamics/week-2/nudge')} 
          className="w-full py-4 bg-[#b5a642] text-[#1b270e] font-bold rounded-full hover:bg-[#d4c55e] transition-all"
        >
          Proceed to Action Plan
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#1b270e] font-sans">
      <Sidebar />
      <main className="md:ml-64 min-h-screen p-6 md:p-12 lg:p-20">
        <div className="max-w-2xl mx-auto mt-20 text-[#c9ccbb]">
          <div className="flex items-center gap-2 text-[#b5a642] text-xs font-bold uppercase tracking-widest mb-6">
            <Zap size={14} /> Question {current + 1} of {questions.length}
          </div>
          
          <h2 className="text-3xl font-serif mb-12 leading-snug tracking-tight">{questions[current].q}</h2>
          
          <div className="grid gap-6">
            {questions[current].options.map((opt, i) => (
              <button 
                key={i} 
                onClick={() => handleAnswer(i)} 
                className="w-full text-left p-6 rounded-2xl border border-[#c9ccbb]/10 bg-[#c9ccbb]/5 hover:border-[#b5a642] hover:bg-[#b5a642]/10 transition-all text-lg leading-relaxed"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
