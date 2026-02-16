'use client'

import { useState } from 'react'
import { ArrowRight, BookOpen, Sun, Moon } from 'lucide-react'
import Sidebar from '@/app/components/Sidebar'

export default function Week2Module() {
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
                  <BookOpen size={14} /> Module 2: Week 2
                </div>
                <h1 className="text-4xl md:text-5xl font-serif mb-6 leading-tight">
                  Circadian Stability & Sensory Filtering
                </h1>
                <p className="text-[#c9ccbb]/60 text-xl italic">
                  Goal: Move from awareness to physiological cause → effect recognition.
                </p>
              </header>

              <article className="max-w-none text-[#c9ccbb]/90">
                <h2 className="text-[#b5a642] font-serif text-3xl mb-10 pt-10 border-t border-[#c9ccbb]/10">
                  Core Teaching Points
                </h2>

                <h3 className="text-[#c9ccbb] font-serif text-2xl mb-6">1. Light Is a Timing System</h3>
                <p className="leading-[1.8] mb-8">
                  The circadian system is regulated primarily by light exposure to the retina. Short-wavelength (blue-enriched) light suppresses melatonin and signals alertness. Dim, warm-spectrum light permits melatonin release and prepares the body for sleep.
                </p>
                <p className="leading-[1.8] mb-12 font-serif text-xl text-[#b5a642]">
                  The issue is not brightness alone. It is timing and spectrum.
                </p>
                <p className="leading-[1.8] mb-12">
                  Most residential lighting remains biologically “daytime” long after sunset.
                </p>

                

                <h3 className="text-[#c9ccbb] font-serif text-2xl mb-6 mt-16">2. Circadian Amplitude Determines Resilience</h3>
                <p className="leading-[1.8] mb-8">
                  A strong circadian rhythm has clear contrast: Bright, stable light during the day and low-intensity, warm light at night. When this contrast is weak, the rhythm flattens.
                </p>
                <p className="leading-[1.8] mb-8">
                  Flattened rhythm results in:
                </p>
                <ul className="list-disc pl-6 mb-12 space-y-4 opacity-80 leading-[1.8]">
                  <li>Midday fatigue</li>
                  <li>Evening alertness</li>
                  <li>Delayed sleep onset</li>
                  <li>Reduced stress tolerance</li>
                </ul>
                <p className="leading-[1.8] mb-12 italic">
                  Circadian amplitude is a resilience marker.
                </p>

                <h3 className="text-[#c9ccbb] font-serif text-2xl mb-6 mt-16">3. Sensory Gating Fatigue</h3>
                <p className="leading-[1.8] mb-8">
                  The thalamus filters incoming sensory input before it reaches conscious awareness. When total input remains high for extended periods (light glare, background noise, device flicker), filtering efficiency decreases.
                </p>
                <p className="leading-[1.8] mb-8">
                  Filtering fatigue leads to:
                </p>
                <ul className="list-disc pl-6 mb-12 space-y-4 opacity-80 leading-[1.8]">
                  <li>Irritability</li>
                  <li>Reduced tolerance for minor disruptions</li>
                  <li>Heightened startle response</li>
                  <li>Mental exhaustion without obvious cause</li>
                </ul>
                <p className="leading-[1.8] mb-12 font-serif text-xl text-[#b5a642]">
                  This is not personality. It is accumulated load.
                </p>

                <h3 className="text-[#c9ccbb] font-serif text-2xl mb-6 mt-16">4. Flicker & PWM Effects</h3>
                <p className="leading-[1.8] mb-8">
                  Many LED lights use pulse-width modulation (PWM). Although often imperceptible, micro-flicker can increase visual strain and headaches in sensitive individuals.
                </p>
                <p className="leading-[1.8] mb-20 font-light italic">
                  If a light source causes subtle discomfort, do not rationalise it. Replace it.
                </p>

                <section className="p-12 rounded-[2rem] bg-[#b5a642]/5 border border-[#b5a642]/20 mb-20">
                  <h3 className="text-[#b5a642] font-bold uppercase tracking-widest text-sm mb-8">Practical Exercise</h3>
                  <div className="space-y-6 text-[#c9ccbb] text-lg leading-relaxed italic">
                    <p>Create two lighting states:</p>
                    <ul className="list-disc pl-6 space-y-4">
                      <li>Day Mode: Bright, broad illumination before 2pm.</li>
                      <li>Evening Mode: Warm, low-intensity light after sunset.</li>
                    </ul>
                    <p>Remove one harsh bulb this week.</p>
                    <p>Track: Sleep latency (minutes to fall asleep), Evening restlessness, and Morning clarity (1–10).</p>
                  </div>
                </section>

                <section className="mb-20">
                  <h3 className="text-[#b5a642] font-serif text-2xl mb-6">Integration Metric</h3>
                  <p className="leading-[1.8] mb-8">
                    At the end of Week 2, compare your Week 1 NeuroLoad score with your Week 2 score, sleep latency delta, and morning clarity shift. You must see measurable movement.
                  </p>
                </section>
              </article>

              <div className="flex justify-center pb-20">
                <button 
                  onClick={() => setShowQuiz(true)}
                  className="flex items-center gap-4 px-14 py-6 bg-[#b5a642] text-[#1b270e] font-bold rounded-full hover:bg-[#d4c55e] transition-all"
                >
                  Take Week 2 Quiz <ArrowRight size={22} />
                </button>
              </div>
            </div>
          ) : (
            <Week2Quiz onBack={() => setShowQuiz(false)} />
          )}
        </div>
      </main>
    </div>
  )
}

function Week2Quiz({ onBack }: { onBack: () => void }) {
  // Logic for the Week 2 questions provided
  return (
    <div className="max-w-2xl mx-auto py-20">
      <h2 className="text-3xl font-serif mb-12">Quiz — Week 2</h2>
      <p className="mb-12 opacity-60 italic">Short. Direct. Reinforce understanding.</p>
      {/* Quiz logic follows */}
      <button onClick={onBack} className="text-[#b5a642] mt-8 underline">Back to Lesson</button>
    </div>
  )
}
