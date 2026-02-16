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
                  This module explains how light and sensory inputs affect your body's internal clock and daily energy levels. You will learn practical ways to adjust your surroundings to achieve a better balance, using evidence-based insights to make positive changes to how you feel. These steps are straightforward and can be incorporated into everyday routines to support steady progress towards improved well-being. The goal is to move from awareness to recognising the physiological cause and effect. Users should recognise the relationship between light timing and nervous system state.
.
                </p>
              </header>

              <article className="max-w-none text-[#c9ccbb]/90">
                <h2 className="text-[#b5a642] font-serif text-3xl mb-10 pt-10 border-t border-[#c9ccbb]/10">
                  Core Teaching Points
                </h2>

                <h3 className="text-[#c9ccbb] font-serif text-2xl mb-6">1. Light Is a Timing System</h3>
                <p className="leading-[1.8] mb-8">
                  The circadian system is primarily regulated by exposure to light through the retina. Short-wavelength (blue-enriched) light suppresses melatonin production and signals alertness. In contrast, dim, warm-spectrum light permits melatonin release and prepares the body for sleep.
                </p>
                <p className="leading-[1.8] mb-12 font-serif text-xl text-[#b5a642]">
                  It is not just brightness that matters. It is timing and spectrum. Most residential lighting remains biologically daytime long after sunset.
                </p>
                <p className="leading-[1.8] mb-12">
                  Studies show that exposure to room light before bedtime delays the onset of melatonin, reducing its duration by around 90 minutes compared to exposure to dim light. Blue-enriched light in the evening delays melatonin secretion, whereas warmer lights help to maintain natural rhythms. Even low levels of artificial light at night (5–10 lux) can disrupt circadian responses, resulting in poorer sleep quality. Therefore, adjusting home lighting to warmer, dimmer tones in the evening can support better hormone timing and rest.
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
                  Circadian amplitude is a marker of resilience. Research has found that stronger circadian rhythms are associated with greater resilience to stress, while low-amplitude rhythms are linked to poorer coping mechanisms and increased fatigue. Although chronic stress can disrupt sleep and circadian rhythms, interventions such as maintaining consistent light exposure patterns can mitigate these effects and hasten recovery. Increasing the contrast in daily light exposure helps to maintain rhythm strength, thereby supporting overall stress tolerance and energy stability.
                </p>

                <h3 className="text-[#c9ccbb] font-serif text-2xl mb-6 mt-16">3. Sensory Gating Fatigue</h3>
                <p className="leading-[1.8] mb-8">
                  The thalamus filters incoming sensory input before it reaches conscious awareness. When the level of input remains high for extended periods (e.g. light glare, background noise or device flicker), the efficiency of this filtering decreases.
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
                  The thalamus acts as a gatekeeper, controlling the flow of sensory information to the cortex. Overload reduces its efficiency, contributing to fatigue and irritability. During periods of high sensory input, the reticular thalamic nucleus inhibits signals; however, prolonged exposure can lead to adaptation and strain. Reducing constant stimuli such as glare or noise enables more effective filtering and alleviates mental exhaustion.
                </p>

                <h3 className="text-[#c9ccbb] font-serif text-2xl mb-6 mt-16">4. Flicker & PWM Effects</h3>
                <p className="leading-[1.8] mb-8">
                  Many LED lights use pulse-width modulation (PWM). Although often imperceptible, micro-flicker can cause visual strain and headaches in sensitive individuals. If a light source causes you any discomfort, do not dismiss it. Replace it.
                </p>
                <p className="leading-[1.8] mb-20 font-light italic">
                  Even if it is not visibly noticeable, LED flicker from PWM can lead to eye strain, fatigue, headaches and migraines. The temporal modulation of lights affects visual pathways, increasing discomfort at certain frequencies. Opting for flicker-free alternatives reduces these effects and improves comfort during daily activities.
                </p>

                <section className="p-12 rounded-[2rem] bg-[#b5a642]/5 border border-[#b5a642]/20 mb-20">
                  <h3 className="text-[#b5a642] font-bold uppercase tracking-widest text-sm mb-8">Practical Exercise</h3>
                  <div className="space-y-6 text-[#c9ccbb] text-lg leading-relaxed italic">
                    <p>Create two lighting states:</p>
                    <ul className="list-disc pl-6 space-y-4">
                      <li>Daytime Mode: Bright, broad illumination before 2pm.</li>
                      <li>Evening Mode: Warm, low-intensity light after sunset.</li>
                    </ul>
                    <p>Remove one harsh bulb this week.</p>
                    <p>Track sleep latency (minutes to fall asleep), evening restlessness, and morning clarity (on a scale of 1–10).</p>
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
