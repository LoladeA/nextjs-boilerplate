'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { CheckCircle, Zap, ArrowRight } from 'lucide-react'
import Sidebar from '@/app/components/Sidebar'

const questions = [
  {
    q: "Why does layered lighting reduce vigilance compared to overhead-only lighting?",
    options: [
      "It increases brightness evenly",
      "It eliminates shadows entirely",
      "It distributes visual load and reduces glare contrast",
      "It consumes less electricity"
    ],
    correct: 2
  },
  {
    q: "What is the cognitive impact of high-frequency visual patterns?",
    options: [
      "They increase creativity",
      "They reduce attentional load",
      "They increase micro-saccadic eye movements and processing demand",
      "They improve spatial memory"
    ],
    correct: 2
  },
  {
    q: "How does glare affect autonomic tone?",
    options: [
      "It lowers cortisol production",
      "It increases pupil stability",
      "It increases visual fatigue and sympathetic activation",
      "It improves melatonin release"
    ],
    correct: 2
  },
  {
    q: "What makes an environment predictable?",
    options: [
      "High decorative complexity",
      "Multiple focal points",
      "Clear hierarchy and defined circulation paths",
      "Minimal furniture"
    ],
    correct: 2
  }
]

export default function Week3Quiz() {
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
      
      await supabase.from('quiz_submissions').insert({ 
        module_slug: 'sensory-lighting-dynamics-week-3',
        score: newScore, 
        total: questions.length 
      })
    }
  }

  if (complete) return (
    <div className="min-h-screen bg-[#1b270e] flex items-center justify-center p-6 text-[#c9ccbb]">
      <div className="max-w-md w-full glass-panel p-12 rounded-[2rem] text-center border border-[#b5a642]/30 bg-[#b5a642]/5 shadow-2xl">
        <CheckCircle className="mx-auto mb-6 text-[#b5a642]" size={64} />
        <h2 className="text-3xl font-serif mb-4">Architecture Verified</h2>
        <p className="opacity-60 mb-8 italic text-lg leading-relaxed">
          Score: {score}/{questions.length}. You are engineering for regulatory efficiency.
        </p>
        <button 
          onClick={() => router.push('/coaching/sensory-lighting-dynamics/week-3/nudge')} 
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
