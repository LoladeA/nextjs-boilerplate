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
                  Goal: Drawing from studies on how environmental cues influence brain activity and hormonal health, develop practical and adaptable strategies for everyday homes that consolidate rhythm and lock behavioural change.
                </p>
              </header>

              <article className="max-w-none text-[#c9ccbb]/90">
                <h2 className="text-[#b5a642] font-serif text-3xl mb-10 pt-10 border-t border-[#c9ccbb]/10">
                  Core Teaching Points
                </h2>

                <h3 className="text-[#c9ccbb] font-serif text-2xl mb-6">1. Circadian Amplitude Requires Contrast</h3>
                <p className="leading-[1.8] mb-12">
                  Strong rhythms require bright mornings, dim evenings, and true darkness during sleep. Without contrast, the timing of hormone release weakens, leading to disrupted sleep and energy levels. Research shows that exposure to artificial light at night, even at low levels (2–5 lux), can suppress melatonin, a key hormone for sleep, and alter cortisol rhythms, reducing overall circadian strength. Conversely, mimicking natural day-night cycles by using brighter lights during the day and dimmer lights in the evening helps to maintain melatonin peaks and supports stable hormone release, thereby improving sleep onset and quality.
                </p>

                <h3 className="text-[#c9ccbb] font-serif text-2xl mb-6 mt-16">2. The Evening Downshift</h3>
                <p className="leading-[1.8] mb-8">
                  The nervous system does not change state instantly. An intentional environmental change that signals safety helps to shift from alertness to rest. Downshift components include light temperature shifts (to warmer tones), reduced visual density (e.g. dimming screens and using a red light filter), reduced auditory variability (e.g. quieter spaces) and a predictable sequence (your evening pre-sleep routine).
                </p>
                <p className="leading-[1.8] mb-12 font-serif text-xl text-[#b5a642]">
                  Repetition trains your brain to relax more easily. Studies indicate that gradually transitioning in the evening reduces sympathetic arousal (the fight-or-flight response) and cortisol levels, which often remain elevated due to daily stress, making sleep more difficult to achieve. Consistent routines build predictive regulation in the brainstem, reducing mental tension and promoting parasympathetic activity to encourage relaxation. Over time, this repetition strengthens neural pathways, making the shift feel automatic and alleviating bedtime anxiety and racing thoughts.
                </p>

                <h3 className="text-[#c9ccbb] font-serif text-2xl mb-6 mt-16">3. Deep Night Setting</h3>
                <p className="leading-[1.8] mb-8">
                  Even minimal light exposure during sleep can reduce melatonin secretion and impact sleep depth. Bedrooms should be kept as dark as possible with: no direct LED indicators, no streetlight intrusion, and no device glow.
                </p>
                <p className="leading-[1.8] mb-12 italic">
                  Complete darkness increases sleep depth by enabling the body to release melatonin fully and experience better restorative stages. Lab studies show that room light (less than 200 lux) before bedtime can suppress melatonin production by up to 99%, shortening its duration by about 90 minutes. Even dim light (5–10 lux) during sleep can disrupt circadian responses. This results in poorer sleep architecture, including reduced slow-wave sleep, which is essential for recovery. Practical solutions such as blackout curtains, eye masks, or covering device lights can help to create true darkness, thereby enhancing melatonin production and improving overall sleep quality.
                </p>

                <h3 className="text-[#c9ccbb] font-serif text-2xl mb-6 mt-16">4. Environmental Predictability Before Sleep</h3>
                <p className="leading-[1.8] mb-20">
                  Unpredictable sensory input before bedtime can prolong the time it takes to fall asleep. Consistency reduces cortical monitoring, enabling the brain to relax more quickly. Research links sensory sensitivities and irregular environments to longer sleep onset times and disruptions, as the brain remains vigilant. Predictable cues, such as a steady routine or consistent background sounds, lower arousal. Studies have shown that consistent habits can reduce bedtime resistance and improve latency.
                </p>

                <section className="p-12 rounded-[2rem] bg-[#b5a642]/5 border border-[#b5a642]/20 mb-20 shadow-inner">
                  <h3 className="text-[#b5a642] font-bold uppercase tracking-widest text-sm mb-8">Practical Exercise</h3>
                  <div className="space-y-8 text-[#c9ccbb] text-lg leading-relaxed italic">
                    <ul className="list-disc pl-6 space-y-4">
                      <li>Establish a fixed evening wind-down time (e.g. 8 pm) involving warmer lighting and quiet activities.</li>
                      <li>Remove all blue-rich light sources (e.g. screens) three hours before sleep to support melatonin production.</li>
                      <li>Test the darkness of your bedroom with a 5-minute check: Cover any glowing sources and ensure no light leaks through.</li>
                      <li>Eliminate any unpredictable sound sources, such as muting notifications or using white noise to create a consistent environment.</li>
                    </ul>
                  </div>
                </section>

                <section className="mb-20">
                  <h3 className="text-[#b5a642] font-serif text-2xl mb-6">Tracking</h3>
                  <ul className="grid grid-cols-2 gap-8 text-lg opacity-80 leading-relaxed">
                    <li>• Monitor your sleep onset time (how long it takes to fall asleep)</li>
                    <li>• Track your night waking frequency</li>
                    <li>• Grade your morning clarity rating (on a scale of 1–10)</li>
                    <li>• Evaluate your tendency to feel irritable in the evenings (on a scale of 1–10)</li>
                  </ul>
                </section>

                <div className="p-12 rounded-[2rem] border border-[#b5a642]/20 bg-[#b5a642]/5 mb-20">
                  <h3 className="text-[#b5a642] font-serif text-2xl mb-6">Integration Reflection</h3>
                  <p className="text-xl leading-relaxed mb-8">“How has your nervous system changed over the past 30 days? Reflect on the following areas to identify any changes”</p>
                  <p className="leading-[1.8] mb-12 opacity-80">
                    Identify sleep improvement, duration of focus throughout the day, shifts in emotional reactivity (less irritability), and Stability of energy levels throughout the day.
                  </p>
                  <p className="text-2xl font-serif text-[#b5a642] italic">
                    This anchors identity: You are no longer passively accepting your environment. You are engineering it to improve your well-being.
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
