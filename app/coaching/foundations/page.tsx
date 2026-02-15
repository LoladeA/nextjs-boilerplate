import Link from 'next/link'
import { ArrowRight, BookOpen, Brain, ShieldCheck } from 'lucide-react'
import Sidebar from '@/app/components/Sidebar'

export default function FoundationsModule() {
  return (
    <div className="min-h-screen bg-[#1b270e] font-sans selection:bg-[#b5a642] selection:text-[#1b270e]">
      <Sidebar />
      <main className="md:ml-64 min-h-screen p-6 md:p-12 lg:p-20">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <header className="mb-16 border-l-4 border-[#b5a642] pl-8">
            <div className="flex items-center gap-2 text-[#b5a642] text-xs font-bold uppercase tracking-widest mb-4">
              <BookOpen size={14} /> Introductory Module
            </div>
            <h1 className="text-4xl md:text-5xl font-serif text-[#c9ccbb] mb-4">
              Foundations of Neuropsychology in Interior Design
            </h1>
            <p className="italic text-[#c9ccbb]/60 text-lg">
              The Home as a Second Skin for the Nervous System
            </p>
          </header>

          {/* Main Content */}
          <article className="prose prose-invert prose-stone max-w-none text-[#c9ccbb]/90 leading-relaxed mb-16">
            <p className="text-xl text-[#c9ccbb] mb-8">
              Our homes are much more than just places to shelter; they are complex extensions of our nervous systems that have a profound influence on our brain function, behaviour, emotions, cognition and overall well-being.
            </p>

            <p>
              This module introduces the revolutionary concept of neuro-informed interior design, which prioritises the physiological and psychological impact of our built environments over fleeting aesthetics or trends. By understanding how spaces interact with our nervous systems and hormonal health, we can intentionally design environments that promote regulation, clarity and long-term human potential.
            </p>

            <p>
              Grounded in rigorous neuroscience, environmental psychology and interior design research, this methodology moves beyond generic solutions to offer personalised insights for high-performing individuals and families.
            </p>

            <h2 className="text-[#b5a642] font-serif">Understanding Neuro Load Scoring</h2>
            <p>
              A key part of our approach is the concept of a <strong>'neuro load score'</strong>. This metric quantifies the total sensory input in an environment that can lead to cognitive overload and stress. Imagine your brain is a sophisticated processor. When it is bombarded with excessive or disorganised information from its surroundings, its processing capacity diminishes, leading to fatigue and dysregulation.
            </p>

            <h2 className="text-[#b5a642] font-serif">Sensory Load: The Gateway to Environmental Impact</h2>
            <p>
              As a foundational metric, sensory load refers to the cumulative effect of various sensory inputs—visual clutter, ambient noise, subtle odours, and tactile sensations—on your cognitive and emotional state. When these inputs are overwhelming or discordant, they can significantly increase your neuro load.
            </p>
            
            <p>
              Research suggests that environments with high visual clutter and poor multisensory integration can lead to increased stress. For example, studies have shown that <strong>greater edge density</strong> in architectural layouts, characterised by numerous sharp angles and complex visual fields, can contribute to a heightened sense of unease and cognitive strain.
            </p>

            

            <h2 className="text-[#b5a642] font-serif">Neurophysiological Impacts of High Sensory Load</h2>
            <p>
              From a neurophysiological perspective, a high sensory load has measurable effects on the brain and body. One key indicator of stress and cognitive overload is <strong>elevated theta band activity in the anterior cingulate cortex (ACC)</strong>, a brain region crucial for emotion regulation and cognitive control.
            </p>
            
            <p>
              This increased activity means that your brain is working harder to process and filter environmental information, which can lead to diminished focus and mental fatigue. Furthermore, chronic exposure to a high sensory load can trigger a cascade of hormonal responses, notably increased levels of <strong>cortisol</strong>, the primary stress hormone.
            </p>

            <h2 className="text-[#b5a642] font-serif">Nervous System Impacts and Hormonal Health Benefits</h2>
            <p>
              When a space is designed with neuropsychological principles in mind, it can support the nervous system's natural regulatory processes. This involves creating environments that minimise the fight-or-flight response and promote the <strong>parasympathetic 'rest and digest' state</strong>.
            </p>

            <p>
              The direct benefits of a neuro-informed living space include reduced cortisol levels, improved melatonin production for better sleep, and enhanced serotonin pathways for mood regulation. This holistic approach ensures that your home actively contributes to your long-term well-being rather than undermining it.
            </p>
          </article>

          {/* Integration Practice */}
          <section className="p-8 rounded-3xl bg-[#b5a642]/5 border border-[#b5a642]/20 mb-16">
            <div className="flex items-center gap-3 text-[#b5a642] mb-4">
              <ShieldCheck size={20} />
              <h3 className="font-bold uppercase tracking-widest text-sm">Integration Practice</h3>
            </div>
            <p className="text-[#c9ccbb] mb-0 italic">
              Identify one area in your home with high "edge density" (sharp angles/cluttered visual fields). Notice your respiratory rate when spending 5 minutes in that space versus a more curvilinear or open zone.
            </p>
          </section>

          {/* References */}
          <footer className="pt-8 border-t border-[#c9ccbb]/10">
            <h4 className="text-[#c9ccbb] font-serif text-lg mb-4">References</h4>
            <div className="text-xs text-[#c9ccbb]/50 space-y-3">
              <p>[1] Valentine, C. (2025). Architecturally Mediated Allostasis and Neurosustainability. <em>MDPI Brain Sciences</em>, 15(2), 201.</p>
              <p>[2] Tawil, N., & Kühn, S. (2024). The built environment and the brain. In <em>Environmental Neuroscience</em>. Springer.</p>
              <p>[3] Albayrak-Kutlay, Y., & Bengisu, M. (2025). Exploring VR and neuroscience methodologies in interior design. <em>Human Behavior and Emerging Technologies</em>.</p>
            </div>

            <div className="mt-16 flex justify-center">
              <Link href="/coaching/foundations/quiz" className="group flex items-center gap-3 px-10 py-4 bg-[#b5a642] text-[#1b270e] font-bold rounded-full hover:bg-[#d4c55e] transition-all shadow-xl shadow-[#b5a642]/10">
                Take Foundations Quiz <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </footer>
        </div>
      </main>
    </div>
  )
}
