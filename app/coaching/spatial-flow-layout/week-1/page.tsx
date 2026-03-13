// TEMPLATE: Copy this file to:
//   app/coaching/[module-slug]/week-1/page.tsx
// Replace MODULE_ID, WEEK_NUM, WEEK_TITLE, MODULE_SLUG with actual values.
// Replace the CONTENT section with actual lesson material.

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, BookOpen, ChevronLeft } from 'lucide-react'
import Sidebar from '@/app/components/Sidebar'

const MODULE_ID   = 3            // e.g. 3
const WEEK_NUM    = 1            // e.g. 1
const MODULE_SLUG = 'acoustic-balance'  // e.g. 'acoustic-balance'
const WEEK_TITLE  = 'Sound as Neural Architecture'

export default function WeekPage() {
  const [showQuiz, setShowQuiz] = useState(false)

  return (
    <div className="min-h-screen bg-[#1b270e] font-sans selection:bg-[#b5a642] selection:text-[#1b270e]">
      <Sidebar />
      <main className="md:ml-64 min-h-screen p-6 md:p-12 lg:p-20">
        <div className="max-w-4xl mx-auto text-[#c9ccbb]">

          {!showQuiz ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">

              <Link
                href={`/coaching/${MODULE_SLUG}`}
                className="inline-flex items-center gap-2 text-[#c9ccbb]/50 hover:text-[#b5a642] text-[10px] font-bold uppercase tracking-widest transition-colors mb-10"
              >
                <ChevronLeft size={14} /> Module {MODULE_ID}
              </Link>

              <header className="mb-20 border-l-4 border-[#b5a642] pl-8">
                <div className="flex items-center gap-2 text-[#b5a642] text-xs font-bold uppercase tracking-widest mb-6">
                  <BookOpen size={14} /> Module {MODULE_ID}: Week {WEEK_NUM}
                </div>
                <h1 className="text-4xl md:text-5xl font-serif mb-6 leading-tight">
                  {WEEK_TITLE}
                </h1>
              </header>

              <article className="max-w-none text-[#c9ccbb]/90">
                {/* ============================================================
                    CONTENT: Replace everything below this comment with
                    the actual lesson content for this week.
                    Follow the same pattern as sensory-lighting-dynamics/week-1:
                      - <p> blocks with leading-[1.8] mb-12
                      - <h2> section headers in text-[#b5a642] font-serif text-3xl
                      - <h3> subsections in text-[#c9ccbb] font-serif text-2xl
                      - Pull quotes in bg-[#b5a642]/5 p-12 rounded-[2rem] italic
                    ============================================================ */}
                <div className="py-20 flex flex-col items-center justify-center text-center gap-4 border border-dashed border-[#b5a642]/20 rounded-2xl">
                  <BookOpen size={32} className="text-[#b5a642]/40" />
                  <p className="text-[#c9ccbb]/40 text-xs uppercase tracking-widest font-bold">Lesson Content Pending</p>
                  <p className="text-[#c9ccbb]/30 text-sm max-w-xs leading-relaxed">
                    Week {WEEK_NUM}: {WEEK_TITLE}
                  </p>
                </div>
              </article>

              <div className="flex justify-center pb-20 mt-16">
                <button
                  onClick={() => setShowQuiz(true)}
                  className="flex items-center gap-4 px-14 py-6 bg-[#b5a642] text-[#1b270e] font-bold rounded-full hover:bg-[#d4c55e] transition-all shadow-xl shadow-[#b5a642]/10"
                >
                  Take Week {WEEK_NUM} Quiz <ArrowRight size={22} />
                </button>
              </div>

            </div>
          ) : (
            <div className="max-w-2xl mx-auto py-20">
              <h2 className="text-3xl font-serif mb-4">Week {WEEK_NUM} Quiz</h2>
              <p className="text-[#c9ccbb]/50 italic mb-12">Quiz questions to be added.</p>
              <button
                onClick={() => setShowQuiz(false)}
                className="text-[#b5a642] underline text-sm"
              >
                Back to Lesson
              </button>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}
