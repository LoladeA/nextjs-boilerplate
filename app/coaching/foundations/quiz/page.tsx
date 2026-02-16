'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { CheckCircle, Zap } from 'lucide-react'

const questions = [
  {
    q: "Which of the following best describes the core concept of a neuro-informed interior design approach?",
    options: [
      "Prioritising aesthetic trends and personal ego.",
      "Focusing solely on visual appeal.",
      "Emphasising physiological and psychological impacts on the nervous system and hormonal health.",
      "Maximising property value."
    ],
    correct: 2
  },
  {
    q: "What does the term 'neuro load score' primarily quantify?",
    options: [
      "The aesthetic appeal of a space.",
      "The aggregate sensory inputs contributing to cognitive overload and stress.",
      "Financial investment in neuro-architectural elements.",
      "The number of neuroscientists consulted."
    ],
    correct: 1
  },
  {
    q: "According to the lesson, what is a key neurophysiological impact of a high sensory load?",
    options: [
      "Decreased theta band activity in the ACC.",
      "Elevated levels of cortisol, the primary stress hormone.",
      "Enhanced focus and mental clarity.",
      "Improved melatonin production."
    ],
    correct: 1
  },
  {
    q: "Which environmental factor contributes to a heightened sense of unease due to high sensory load?",
    options: [
      "Soft, curvilinear forms.",
      "Low visual clutter density.",
      "Greater edge density in architectural layouts.",
      "Harmonised multisensory integration."
    ],
    correct: 2
  },
  {
    q: "How does a neuro-informed living space contribute to hormonal health benefits?",
    options: [
      "By increasing levels of cortisol.",
      "By disrupting melatonin production.",
      "By supporting healthier hormonal balance through mitigating chronic stress.",
      "By solely focusing on aesthetic pleasure."
    ],
    correct: 2
  }
]

export default function FoundationsQuiz() {
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
        module_id: 'foundations',      // changed from 'module_slug'
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
        <h2 className="text-3xl font-serif mb-4 text-[#c9ccbb]">Foundation Verified</h2>
        <p className="opacity-60 mb-8 italic text-lg">Your shift toward restoration has begun. Score: {score}/{questions.length}</p>
        <button 
          onClick={() => router.push('/coaching/foundations/nudge')} 
          className="w-full py-4 bg-[#b5a642] text-[#1b270e] font-bold rounded-full hover:bg-[#d4c55e] transition-all"
        >
          View Your Action Plan
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#1b270e] p-6 md:p-12 text-[#c9ccbb]">
      <div className="max-w-2xl mx-auto mt-20">
        <div className="flex items-center gap-2 text-[#b5a642] text-xs font-bold uppercase tracking-widest mb-4">
          <Zap size={14} /> Question {current + 1} of {questions.length}
        </div>
        <h2 className="text-3xl font-serif mb-12 leading-snug">{questions[current].q}</h2>
        <div className="grid gap-4">
          {questions[current].options.map((opt, i) => (
            <button 
              key={i} 
              onClick={() => handleAnswer(i)} 
              className="w-full text-left p-6 rounded-2xl border border-[#c9ccbb]/10 bg-[#c9ccbb]/5 hover:border-[#b5a642] hover:bg-[#b5a642]/10 transition-all text-lg"
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
