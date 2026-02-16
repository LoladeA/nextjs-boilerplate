'use client'

import { useState } from 'react'
import { ArrowRight, BookOpen, Moon, ShieldAlert, Star } from 'lucide-react'
import Sidebar from '@/app/components/Sidebar'

export default function Week4Module() {
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
                  <BookOpen size={14} /> Module 2: Week 4
                </div>
                <h1 className="text-4xl md:text-5xl font-serif mb-6 leading-tight">
                  The Evening Reset & Deep Night Setting
                </h1>
                <p className="text-[#c9ccbb]/60 text-xl italic leading-relaxed">
                  Goal: Consolidate rhythm and lock behavioural change.
                </p>
              </header>

              <article className="max-w-none text-[#c9ccbb]/90">
                <h2 className="text-[#b5a642] font-serif text-3xl mb-10 pt-10 border-t border-[#c9ccbb]/10">
                  Core Teaching Points
                </h2>

                <h3 className="text-[#c9ccbb] font-serif text-2xl mb-6">1. Circadian Amplitude Requires Contrast</h3>
                <p className="leading-[1.8] mb-12">
                  Strong rhythms require bright mornings, dim evenings, and true darkness during sleep. Without contrast, hormonal timing weakens.
                </p>

                <h3 className="text-[#c9ccbb] font-serif text-2xl mb-6 mt-16">2. The Evening Downshift</h3>
                <p className="leading-[1.8] mb-8">
                  The nervous system does not switch states instantly. An intentional environmental transition signals safety. Downshift components include light temperature shift, reduced visual density, reduced auditory variability, and a predictable sequence.
                </p>
                <p className="leading-[1.8] mb-12 font-serif text-xl text-[#b5a642]">
                  Repetition creates neurological efficiency.
                </p>

                <h3 className="text-[#c9ccbb] font-serif text-2xl mb-6 mt-16">3. Deep Night Setting</h3>
                <p className="leading-[1.8] mb-8">
                  Even minimal light exposure during sleep reduces melatonin secretion. Bedrooms should achieve: no direct LED indicators, no streetlight intrusion, and no device glow.
                </p>
                <p className="leading-[1.8] mb-12 italic">
                  Complete darkness increases sleep depth.
                </p>

                <h3 className="text-[#c9ccbb] font-serif text-2xl mb-6 mt-16">4. Environmental Predictability Before Sleep</h3>
                <p className="leading-[1.8] mb-20">
                  Unpredictable sensory input before bed prolongs sleep latency. Consistency reduces cortical monitoring.
                </p>

                <section className="p-12 rounded-[2rem] bg-[#b5a642]/5 border border-[#b5a642]/20 mb-20 shadow-inner">
                  <h3 className="text-[#b5a642] font-bold uppercase tracking-widest text-sm mb-8">Practical Exercise</h3>
                  <div className="space-y-8 text-[#c9ccbb] text-lg leading-relaxed italic">
                    <ul className="list-disc pl-6 space-y-4">
                      <li>Establish fixed Evening Downshift time.</li>
                      <li>Remove all blue-rich light 3 hours before sleep.</li>
                      <li>Test bedroom darkness integrity (5-minute darkness check).</li>
                      <li>Remove one unpredictable sound source.</li>
                    </ul>
                  </div>
                </section>

                <section className="mb-20">
                  <h3 className="text-[#b5a642] font-serif text-2xl mb-6">Tracking</h3>
                  <ul className="grid grid-cols-2 gap-8 text-lg opacity-80 leading-relaxed">
                    <li>• Sleep onset time</li>
                    <li>• Night waking frequency</li>
                    <li>• Morning clarity rating</li>
                    <li>• Evening irritability</li>
                  </ul>
                </section>

                <div className="p-12 rounded-[2rem] border border-[#b5a642]/20 bg-[#b5a642]/5 mb-20">
                  <h3 className="text-[#b5a642] font-serif text-2xl mb-6">Integration Reflection</h3>
                  <p className="text-xl leading-relaxed mb-8">“What changed in your nervous system over the past 30 days?”</p>
                  <p className="leading-[1.8] mb-12 opacity-80">
                    Identify sleep improvement, focus duration, emotional reactivity shifts, and energy stability.
                  </p>
                  <p className="text-2xl font-serif text-[#b5a642] italic">
                    You are no longer tolerating your environment. You are engineering it.
                  </p>
                </div>
              </article>

              <div className="flex justify-center pb-20">
                <button 
                  onClick={() => setShowQuiz(true)}
                  className="flex items-center gap-4 px-14 py-6 bg-[#b5a642] text-[#1b270e] font-bold rounded-full hover:bg-[#d4c55e] transition-all"
                >
                  Take Week 4 Quiz <ArrowRight size={22} />
                </button>
              </div>
            </div>
          ) : (
            <Week4Quiz onBack={() => setShowQuiz(false)} />
          )}
        </div>
      </main>
    </div>
  )
}

function Week4Quiz({ onBack }: { onBack: () => void }) {
  // To be implemented in the next block with your exact Qs
  return null;
}
