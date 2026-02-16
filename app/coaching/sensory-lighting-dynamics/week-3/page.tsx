'use client'

import { useState } from 'react'
import { ArrowRight, BookOpen, Layout, Eye, Shield } from 'lucide-react'
import Sidebar from '@/app/components/Sidebar'

export default function Week3Module() {
  const [showQuiz, setShowQuiz] = useState(false)

  return (
    <div className="min-h-screen bg-[#1b270e] font-sans selection:bg-[#b5a642] selection:text-[#1b270e]">
      <Sidebar />
      <main className="md:ml-64 min-h-screen p-6 md:p-12 lg:p-20">
        <div className="max-w-4xl mx-auto text-[#c9ccbb]">
          
          {!showQuiz ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <header className="mb-20 border-l-4 border-[#b5a642] pl-8">
                <div className="flex items-center gap-2 text-[#b5a642] text-xs font-bold uppercase tracking-widest mb-6">
                  <BookOpen size={14} /> Module 2: Week 3
                </div>
                <h1 className="text-4xl md:text-5xl font-serif mb-6 leading-tight">
                  Designing for Regulation (Not Aesthetics)
                </h1>
                <p className="text-[#c9ccbb]/60 text-xl italic">
                  Goal: Translate knowledge into environmental restructuring.
                </p>
              </header>

              <article className="max-w-none text-[#c9ccbb]/90">
                <h2 className="text-[#b5a642] font-serif text-3xl mb-10 pt-10 border-t border-[#c9ccbb]/10">
                  Core Teaching Points
                </h2>

                <h3 className="text-[#c9ccbb] font-serif text-2xl mb-6">1. Layered Light Geometry</h3>
                <p className="leading-[1.8] mb-8">
                  Single-source overhead lighting creates uniform vigilance. Layered lighting distributes load:
                </p>
                <ul className="list-disc pl-6 mb-12 space-y-4 opacity-80 leading-[1.8]">
                  <li><strong>Ambient:</strong> overall orientation</li>
                  <li><strong>Task:</strong> focused function</li>
                  <li><strong>Accent:</strong> visual depth</li>
                </ul>
                <p className="leading-[1.8] mb-12 font-serif text-xl text-[#b5a642]">
                  This reduces glare contrast and decreases scanning effort.
                </p>

                <h3 className="text-[#c9ccbb] font-serif text-2xl mb-6 mt-16">2. Soft Contrast vs High-Frequency Pattern</h3>
                <p className="leading-[1.8] mb-8">
                  High-frequency visual patterns increase micro-saccadic eye movements. More micro-movements = more cortical processing.
                </p>
                <p className="leading-[1.8] mb-12 italic">
                  Rest zones should reduce contrast volatility. Texture is acceptable. High-contrast repetition is not.
                </p>

                <h3 className="text-[#c9ccbb] font-serif text-2xl mb-6 mt-16">3. Glare Is a Stressor</h3>
                <p className="leading-[1.8] mb-8">
                  Glare forces constant pupil constriction and adjustment. Even subtle glare increases visual fatigue and sympathetic activation.
                </p>
                <p className="leading-[1.8] mb-12 font-serif text-xl text-[#b5a642]">
                  Matte finishes reduce reflective stress.
                </p>

                <h3 className="text-[#c9ccbb] font-serif text-2xl mb-6 mt-16">4. Visual Hierarchy Reduces Cognitive Friction</h3>
                <p className="leading-[1.8] mb-8">
                  When a room has one focal point, a clear circulation path, and a defined function, the brain predicts movement automatically.
                </p>
                <p className="leading-[1.8] mb-12 italic">
                  Prediction reduces vigilance. Spatial configuration is not aesthetic preference; it is neurological workload.
                </p>

                <section className="p-12 rounded-[2rem] bg-[#b5a642]/5 border border-[#b5a642]/20 mb-20">
                  <h3 className="text-[#b5a642] font-bold uppercase tracking-widest text-sm mb-8">Practical Exercise</h3>
                  <div className="space-y-6 text-[#c9ccbb] text-lg leading-relaxed italic">
                    <p>This week:</p>
                    <ul className="list-disc pl-6 space-y-4">
                      <li>Replace one overhead-dependent zone with layered light.</li>
                      <li>Introduce one indirect light source.</li>
                      <li>Remove one high-contrast pattern from a rest area.</li>
                      <li>Convert one reflective surface to matte (if possible).</li>
                    </ul>
                  </div>
                </section>

                <section className="mb-20">
                  <h3 className="text-[#b5a642] font-serif text-2xl mb-6">Integration Metric</h3>
                  <p className="leading-[1.8] mb-8">
                    Track your focus duration (minutes before distraction), eye strain episodes, and evening irritability. Compare your Week 2 → Week 3 NeuroLoad scores.
                  </p>
                </section>
              </article>

              <div className="flex justify-center pb-20">
                <button 
                  onClick={() => setShowQuiz(true)}
                  className="flex items-center gap-4 px-14 py-6 bg-[#b5a642] text-[#1b270e] font-bold rounded-full hover:bg-[#d4c55e] transition-all"
                >
                  Take Week 3 Quiz <ArrowRight size={22} />
                </button>
              </div>
            </div>
          ) : (
            <Week3Quiz onBack={() => setShowQuiz(false)} />
          )}
        </div>
      </main>
    </div>
  )
}

function Week3Quiz({ onBack }: { onBack: () => void }) {
  // Logic for the Week 3 questions provided below
  return null; 
}
