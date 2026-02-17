'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { CheckCircle, Zap, ArrowRight } from 'lucide-react'
import Sidebar from '@/app/components/Sidebar'

const questions = [
  {
    q: "Which of the following is a key factor contributing to a high sensory load in an environment?",
    options: [
      "Low visual clutter density.",
      "Harmonised multisensory integration.",
      "High edge density in architectural layouts.",
      "Access to natural daylight."
    ],
    correct: 2
  },
  {
    q: "Elevated theta band activity in the anterior cingulate cortex (ACC) is a neurophysiological indicator of what?",
    options: [
      "Deep relaxation and calm.",
      "Cognitive overload and stress.",
      "Enhanced focus and mental clarity.",
      "Optimal melatonin production."
    ],
    correct: 1
  },
  {
    q: "How does chronic exposure to high sensory load impact hormonal health?",
    options: [
      "It leads to decreased levels of cortisol.",
      "It promotes increased melatonin production.",
      "It can result in sustained increases in cortisol levels.",
      "It has no significant impact on hormonal balance."
    ],
    correct: 2
  },
  {
    q: "What is the primary role of natural daylight in lighting optimisation?",
    options: [
      "To provide a consistent, unchanging light source.",
      "To disrupt circadian rhythms.",
      "To provide crucial cues for maintaining healthy circadian rhythms.",
      "To solely enhance aesthetic appeal."
    ],
    correct: 2
  },
  {
    q: "Which type of light is most effective in suppressing melatonin and promoting alertness during the day?",
    options: [
      "Warmer colour temperatures (lower Kelvin).",
      "Blue-enriched light (higher colour temperature).",
      "Dim, indirect lighting.",
      "Red-spectrum light."
    ],
    correct: 1
  },
  {
    q: "What is a direct benefit of aligning indoor lighting with natural circadian patterns?",
    options: [
      "Increased neuro load.",
      "Disrupted sleep quality.",
      "Enhanced sleep quality, mood stability, and cognitive function.",
      "Reduced serotonin levels."
    ],
    correct: 2
  },
  {
    q: "How does discordant multisensory integration affect the brain?",
    options: [
      "It enhances the brain's ability to integrate information effectively.",
      "It leads to heightened stress and a sense of unease.",
      "It promotes a state of deep relaxation.",
      "It has no impact on cognitive or emotional well-being."
    ],
    correct: 1
  }
]

export default function Week1Quiz() {
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
      
      // 🟢 DATABASE FIX: Updated module_id to match Week 1
      const { error } = await supabase.from('quiz_submissions').insert({ 
        module_id: 'sensory-lighting-dynamics-week-1', // CHANGED THIS LINE
        score: newScore, 
        total_questions: questions.length 
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
        <p className="opacity-60 mb-8 italic text-lg">
          Score: {score}/{questions.length}. You are building the capacity to recognize environmental vigilance.
        </p>
        <button 
          onClick={() => router.push('/coaching/sensory-lighting-dynamics/week-1/nudge')} 
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
          
          <h2 className="text-3xl font-serif mb-12 leading-snug">{questions[current].q}</h2>
          
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
