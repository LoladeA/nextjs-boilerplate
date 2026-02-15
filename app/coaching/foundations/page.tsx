import Link from 'next/link'
import { ArrowRight, BookOpen, Brain, ShieldCheck } from 'lucide-react'
import Sidebar from '@/app/components/Sidebar'

export default function FoundationsModule() {
  return (
    <div className="min-h-screen bg-[#1b270e] font-sans selection:bg-[#b5a642] selection:text-[#1b270e]">
      <Sidebar />
      <main className="md:ml-64 min-h-screen p-6 md:p-12 lg:p-20">
        <div className="max-w-4xl mx-auto">
          
          {/* HEADER SECTION - Increased bottom margin for air */}
          <header className="mb-20 border-l-4 border-[#b5a642] pl-8">
            <div className="flex items-center gap-2 text-[#b5a642] text-xs font-bold uppercase tracking-widest mb-6">
              <BookOpen size={14} /> Introductory Module
            </div>
            <h1 className="text-4xl md:text-5xl font-serif text-[#c9ccbb] mb-6 leading-tight">
              Foundations of Neuropsychology in Interior Design
            </h1>
            <p className="italic text-[#c9ccbb]/60 text-xl tracking-tight">
              The Home as a Second Skin for the Nervous System
            </p>
          </header>

          {/* MAIN CONTENT - prose-lg for better readability and spacing */}
          <article className="prose prose-lg prose-invert prose-stone max-w-none text-[#c9ccbb]/90 leading-relaxed">
            
            <section className="mb-12">
              <p className="text-xl text-[#c9ccbb] leading-relaxed mb-8">
                Our homes are much more than just places to shelter; they are complex extensions of our nervous systems that have a profound influence on our brain function, behaviour, emotions, cognition and overall well-being.
              </p>
              
              <p className="mb-8">
                This module introduces the revolutionary concept of neuro-informed interior design, which prioritises the physiological and psychological impact of our built environments over fleeting aesthetics or trends. By understanding how spaces interact with our nervous systems and hormonal health, we can intentionally design environments that promote regulation, clarity and long-term human potential.
              </p>

              <p className="mb-12">
                Grounded in rigorous neuroscience, environmental psychology and interior design research, this methodology moves beyond generic solutions to offer personalised insights for high-performing individuals and families. Drawing from systematic reviews, empirical studies, and bibliometric analyses, we will explore key metrics that decode the subtle yet powerful interactions between your home and your nervous system.
              </p>
            </section>

            {/* Understanding Neuro Load Scoring */}
            <h2 className="text-[#b5a642] font-serif text-3xl mt-16 mb-8 border-t border-[#c9ccbb]/10 pt-12">
              Understanding Neuro Load Scoring
            </h2>
            <p className="mb-8">
              A key part of our approach is the concept of a 'neuro load score'. This metric quantifies the total sensory input in an environment that can lead to cognitive overload and stress.
            </p>
            <p className="mb-12">
              Imagine your brain is a sophisticated processor. When it is bombarded with excessive or disorganised information from its surroundings, its processing capacity diminishes, leading to fatigue and dysregulation. Our neuro load score provides a tangible measure of this environmental burden, enabling targeted interventions.
            </p>

            {/* Sensory Load Section */}
            <h2 className="text-[#b5a642] font-serif text-3xl mt-16 mb-8 border-t border-[#c9ccbb]/10 pt-12">
              Sensory Load: The Gateway to Environmental Impact
            </h2>
            <p className="mb-8">
              As a foundational metric, sensory load refers to the cumulative effect of various sensory inputs, such as visual clutter, ambient noise, subtle odours and tactile sensations, on your cognitive and emotional state. When these inputs are overwhelming or discordant, they can significantly increase your neuro load.
            </p>
            <p className="mb-12">
              Research suggests that environments with high visual clutter and poor multisensory integration (where visual, auditory and tactile stimuli are not well coordinated) can lead to increased stress. For example, studies have shown that greater edge density in architectural layouts, characterised by numerous sharp angles and complex visual fields, can contribute to a heightened sense of unease and cognitive strain.
            </p>

            {/* Neurophysiological Impacts Section */}
            <h2 className="text-[#b5a642] font-serif text-3xl mt-16 mb-8 border-t border-[#c9ccbb]/10 pt-12">
              Neurophysiological Impacts of High Sensory Load
            </h2>
            <p className="mb-8">
              From a neurophysiological perspective, a high sensory load has measurable effects on the brain and body. One key indicator of stress and cognitive overload is elevated theta band activity in the anterior cingulate cortex (ACC), a brain region crucial for emotion regulation and cognitive control.
            </p>
            
                        
            <p className="mb-8">
              This increased activity means that your brain is working harder to process and filter environmental information, which can lead to diminished focus and mental fatigue.
            </p>
            <p className="mb-8">
              Furthermore, chronic exposure to a high sensory load can trigger a cascade of hormonal responses. This is associated with increased levels of cortisol, the primary stress hormone. Over time, this can have a negative impact on mood, sleep and overall health.
            </p>
            <p className="mb-16">
              Conversely, environments designed to minimise unnecessary sensory input can promote calmness and enhance the brain's ability to focus and restore itself.
            </p>
          </article>

          {/* Nervous System Impacts - Specific Spacing and Background */}
          <section className="p-12 rounded-[2rem] bg-[#b5a642]/5 border border-[#b5a642]/20 mb-20 shadow-inner">
            <h3 className="text-[#b5a642] font-bold uppercase tracking-widest text-sm mb-8">
              Nervous System Impacts and Hormonal Health Benefits
            </h3>
            <div className="space-y-6">
              <p className="text-[#c9ccbb] text-lg leading-relaxed italic">
                Our nervous system is constantly adapting to our surroundings. When a space is designed with neuropsychological principles in mind, it can support the nervous system's natural regulatory processes.
              </p>
              <p className="text-[#c9ccbb] text-lg leading-relaxed italic">
                This involves creating environments that minimise the fight-or-flight response and promote the parasympathetic 'rest and digest' state. By optimising sensory load and other elements, we can mitigate chronic stress and support a healthier hormonal balance.
              </p>
              <p className="text-[#c9ccbb] text-lg leading-relaxed italic">
                The direct benefits of a neuro-informed living space include reduced cortisol levels, improved melatonin production for better sleep and enhanced serotonin pathways for mood regulation. This holistic approach ensures that your home actively contributes to your long-term well-being rather than undermining it.
              </p>
            </div>
          </section>

          {/* Footer / Quiz Transition */}
          <footer className="pt-12 border-t border-[#c9ccbb]/10">
            <div className="flex justify-center">
              <Link href="/coaching/foundations/quiz" className="flex items-center gap-3 px-12 py-5 bg-[#b5a642] text-[#1b270e] font-bold rounded-full hover:bg-[#d4c55e] transition-all shadow-xl shadow-[#b5a642]/20">
                Take Foundations Quiz <ArrowRight size={20} />
              </Link>
            </div>
          </footer>
        </div>
      </main>
    </div>
  )
}
