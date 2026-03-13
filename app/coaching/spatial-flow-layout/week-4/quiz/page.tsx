// TEMPLATE: Copy to app/coaching/[module-slug]/week-4/quiz/page.tsx
// Replace MODULE_SLUG, WEEK_NUM, MODULE_ID, QUIZ_ID with actual values.
// Replace the questions array with actual quiz questions.

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { CheckCircle, Zap } from 'lucide-react'
import Sidebar from '@/app/components/Sidebar'

const MODULE_SLUG = 'acoustic-balance'
const MODULE_ID   = 3
const WEEK_NUM    = 1
const QUIZ_ID     = 'acoustic-balance-week-1' // must be unique across all quizzes

const questions = [
  // REPLACE with actual questions following this structure:
  {
    q: 'Question text here?',
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    correct: 0 // zero-indexed index of the correct option
  },
]

export default function WeekQuiz() {
  const [current, setCurrent] = useState(0)
  const [score, setScore]     = useState(0)
  const [complete, setComplete] = useState(false)
  const router   = useRouter()
  const supabase = createClientComponentClient()

  const handleAnswer = async (index: number) => {
    const isCorrect = index === questions[current].correct
    const newScore  = isCorrect ? score + 1 : score

    if (current < questions.length - 1) {
      setScore(newScore)
      setCurrent(current + 1)
    } else {
      setScore(newScore)
      setComplete(true)
      const { error } = await supabase.from('quiz_submissions').insert({
        module_id:       QUIZ_ID,
        score:           newScore,
        total_questions: questions.length
      })
      if (error) console.error('Quiz save error:', error)
    }
  }

  if (complete) return (
    <div className="min-h-screen bg-[#1b270e] flex items-center justify-center p-6 text-[#c9ccbb]">
      <div className="max-w-md w-full glass-panel p-12 rounded-[2rem] text-center border border-[#b5a642]/30 bg-[#b5a642]/5">
        <CheckCircle className="mx-auto mb-6 text-[#b5a642]" size={64} />
        <h2 className="text-3xl font-serif mb-4">Assessment Verified</h2>
        <p className="opacity-60 mb-8 italic text-lg">
          Score: {score}/{questions.length}.
        </p>
        <button
          onClick={() => router.push(`/coaching/${MODULE_SLUG}/week-${WEEK_NUM}/nudge`)}
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
