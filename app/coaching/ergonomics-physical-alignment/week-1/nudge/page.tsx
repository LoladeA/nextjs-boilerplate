// TEMPLATE: Copy to app/coaching/[module-slug]/week-N/nudge/page.tsx
// Replace MODULE_SLUG, WEEK_NUM, QUIZ_ID, NEXT_WEEK_SLUG with actual values.
// Replace the action plan content below the CONTENT comment.

'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import Sidebar from '@/app/components/Sidebar'

const MODULE_SLUG    = 'acoustic-balance'
const WEEK_NUM       = 1
const QUIZ_ID        = 'acoustic-balance-week-1'
const WEEK_TITLE     = 'Week 1: Integration Strategy'
const WEEK_SUBTITLE  = 'Subtitle describing the action focus.'
const NEXT_WEEK_HREF = '/coaching/acoustic-balance/week-2'
const NEXT_WEEK_LABEL = 'Continue to Week 2'

export default function WeekNudge() {
  const [score, setScore] = useState<number | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchScore = async () => {
      const { data } = await supabase
        .from('quiz_submissions')
        .select('score')
        .eq('module_id', QUIZ_ID)
        .order('completed_at', { ascending: false })
        .limit(1)
        .single()
      if (data) setScore(data.score)
    }
    fetchScore()
  }, [supabase])

  return (
    <div className="min-h-screen bg-[#1b270e] font-sans selection:bg-[#b5a642] selection:text-[#1b270e]">
      <Sidebar />
      <main className="md:ml-64 min-h-screen p-6 md:p-12 lg:p-20">
        <div className="max-w-4xl mx-auto text-[#c9ccbb]">

          <header className="mb-20">
            <h1 className="text-4xl md:text-5xl font-serif mb-6 leading-tight">{WEEK_TITLE}</h1>
            <p className="text-[#c9ccbb]/60 text-xl italic">{WEEK_SUBTITLE}</p>
          </header>

          <div className="grid gap-12 mb-20">
            {/* ================================================================
                CONTENT: Replace the placeholder below with actual action cards.
                Follow the pattern from sensory-lighting-dynamics/week-1/nudge:
                  - glass-panel cards with icon + title + explanation + action box
                  - CheckCircle list items for specific steps
                ================================================================ */}
            <div className="glass-panel p-10 rounded-[2rem] border border-[#b5a642]/20 bg-[#b5a642]/5">
              <p className="text-[#c9ccbb]/40 text-sm italic text-center py-8">
                Action plan content for Week {WEEK_NUM} to be added here.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center border-t border-[#c9ccbb]/10 pt-20">
            <h4 className="text-[#c9ccbb] font-serif text-3xl mb-10">Ready to deepen the shift?</h4>
            <Link
              href={NEXT_WEEK_HREF}
              className="group flex items-center gap-4 px-14 py-6 bg-[#c9ccbb] text-[#1b270e] font-bold rounded-full hover:bg-[#b5a642] transition-all shadow-2xl shadow-[#b5a642]/20"
            >
              {NEXT_WEEK_LABEL} <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>

        </div>
      </main>
    </div>
  )
}
