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
                  Goal: Apply what you have learnt so far to home alignment. Start redesigning for regulatory efficiency by focusing on visual elements that modulate neural vigilance and stress responses.
                </p>
              </header>

              <article className="max-w-none text-[#c9ccbb]/90">
                <h2 className="text-[#b5a642] font-serif text-3xl mb-10 pt-10 border-t border-[#c9ccbb]/10">
                  Core Teaching Points
                </h2>

                <h3 className="text-[#c9ccbb] font-serif text-2xl mb-6">1. Layered Light Geometry</h3>
                <p className="leading-[1.8] mb-8">
                  Single-source overhead lighting creates harsh shadows and uneven illumination, inducing uniform vigilance and elevating cortical arousal and scanning demands. Studies in the field of neuroarchitecture show that this can increase theta band activity in the anterior cingulate cortex, which is associated with heightened stress and reduced focus. Layered lighting distributes the load:
                </p>
                <ul className="list-disc pl-6 mb-12 space-y-4 opacity-80 leading-[1.8]">
                  <li><strong>Ambient:</strong> for overall orientation</li>
                  <li><strong>Task:</strong> for focused function</li>
                  <li><strong>Accent:</strong> for visual depth. This distributes cognitive load evenly, minimising glare contrast and decreasing micro-saccadic eye movements</li>
                </ul>
                <p className="leading-[1.8] mb-12 font-serif text-xl text-[#b5a642]">
                  Integrate tunable LED systems (e.g. 2700–6500 K) into bespoke fixtures to mimic natural daylight and evening gradients. This has been proven to regulate melatonin and enhance mood without causing fatigue. In controlled environments, this approach has been shown to reduce sympathetic activation by up to 20–30%.
                </p>

                <h3 className="text-[#c9ccbb] font-serif text-2xl mb-6 mt-16">2. Soft Contrast vs High-Frequency Pattern</h3>
                <p className="leading-[1.8] mb-8">
                 High-frequency visual patterns, such as repetitive stripes or intricate wallpapers with no breaks, amplify micro-saccadic eye movements. These are rapid, involuntary shifts that demand excessive cortical processing. Research in environmental psychology links this phenomenon to increased theta rhythms and cognitive overload, which can lead to elevated stress hormones such as cortisol during prolonged exposure.
                </p>
                <p className="leading-[1.8] mb-12 italic">
                  In rest zones, prioritise soft contrasts, such as subtle gradients in neutral palettes or organic textures like hand-woven silks. Texture is neurologically beneficial as it engages tactile-visual integration without causing overload. However, avoid high-contrast repetition (e.g. geometric rugs), as this disrupts predictive coding in the occipital lobe.
                </p>

                <h3 className="text-[#c9ccbb] font-serif text-2xl mb-6 mt-16">3. Glare Is a Stressor</h3>
                <p className="leading-[1.8] mb-8">
                  Even subtle glare triggers constant pupil constriction and adjustment, activating the sympathetic nervous system and accelerating visual fatigue by increasing heart rate variability and cortisol release. Studies in neuroscience show that glare-induced strain correlates with hyperactivity in the anterior cingulate cortex, mimicking psychosocial stress responses and impairing cognitive performance over time.
                </p>
                <p className="leading-[1.8] mb-12 font-serif text-xl text-[#b5a642]">
                  Choose matte finishes for surfaces such as marble countertops or artisanal woods to diffuse reflections and reduce reflective stress by 15–25%, as demonstrated in controlled lighting experiments. This preserves visual acuity and promotes autonomic balance.
                </p>

                <h3 className="text-[#c9ccbb] font-serif text-2xl mb-6 mt-16">4. Visual Hierarchy Reduces Cognitive Friction</h3>
                <p className="leading-[1.8] mb-8">
                  When a room has one focal point, a clear circulation path, and a defined function, the brain predicts movement automatically.
                </p>
                <p className="leading-[1.8] mb-12 italic">
                  Predictable spaces reduce vigilance. Research in environmental psychology indicates that structured hierarchies enable the brain to predict movement automatically, lowering theta activity and sympathetic load while enhancing emotional well-being through reduced perceptual ambiguity.
                </p>

                <section className="p-12 rounded-[2rem] bg-[#b5a642]/5 border border-[#b5a642]/20 mb-20">
                  <h3 className="text-[#b5a642] font-bold uppercase tracking-widest text-sm mb-8">Practical Exercise</h3>
                  <div className="space-y-6 text-[#c9ccbb] text-lg leading-relaxed italic">
                    <p>This week: put these principles into practice to initiate regulatory redesign. Track changes via your dashboard's neuro load score for personalised feedback</p>
                    <ul className="list-disc pl-6 space-y-4">
                      <li>Replace one zone dependent on overhead lighting (e.g. a formal dining area) with layered lighting. Install adjustable task sconces to serve a functional purpose and accent spots to create depth. Monitor for reduced scanning fatigue.</li>
                      <li>Introduce one indirect light sources uch as wall washers to soften contrasts and encourage a parasympathetic response.</li>
                      <li>Remove one high-contrast pattern from a relaxation area (for example, replace bold geometric cushions with subtle linen ones in a lounge).</li>
                      <li>Convert one reflective surface to matte, if possible (for example, apply anti-glare film to glass tabletops or refinish glossy cabinets), and observe the improvements in pupil stability and overall calm.</li>
                    </ul>
                  </div>
                </section>

                <section className="mb-20">
                  <h3 className="text-[#b5a642] font-serif text-2xl mb-6">Integration Metric</h3>
                  <p className="leading-[1.8] mb-8">
                    Track your focus duration (minutes before distraction), eye strain episodes, and evening irritability. Compare your NeuroLoad scores.
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
