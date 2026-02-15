import Link from 'next/link'
import { ArrowRight, BookOpen, Brain, ShieldCheck } from 'lucide-react'
import Sidebar from '@/app/components/Sidebar'

export default function FoundationsModule() {
  return (
    <div className="min-h-screen bg-[#1b270e] font-sans selection:bg-[#b5a642] selection:text-[#1b270e]">
      <Sidebar />
      <main className="md:ml-64 min-h-screen p-6 md:p-12 lg:p-20">
        <div className="max-w-4xl mx-auto">
          
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

          <article className="prose prose-invert prose-stone max-w-none text-[#c9ccbb]/90 leading-relaxed mb-16">
            <p className="text-xl text-[#c9ccbb] mb-8">
              Our homes are much more than just places to shelter; they are complex extensions of our nervous systems...
            </p>

            <h2 className="text-[#b5a642] font-serif">Understanding Neuro Load Scoring</h2>
            <p>
              This metric quantifies the total sensory input in an environment that can lead to cognitive overload and stress...
            </p>

            <h2 className="text-[#b5a642] font-serif">Sensory Load: The Gateway to Environmental Impact</h2>
            <p>
              When inputs are overwhelming or discordant, they can significantly increase your neuro load...
            </p>

            <h2 className="text-[#b5a642] font-serif">Neurophysiological Impacts</h2>
            <p>
              One key indicator of stress and cognitive overload is <strong>elevated theta band activity in the anterior cingulate cortex (ACC)</strong>...
            </p>
          </article>

          <section className="p-8 rounded-3xl bg-[#b5a642]/5 border border-[#b5a642]/20 mb-16">
            <h3 className="text-[#b5a642] font-bold uppercase tracking-widest text-sm mb-4">Integration Practice</h3>
            <p className="text-[#c9ccbb] italic">Identify one area in your home with high "edge density" and monitor your response.</p>
          </section>

          <footer className="pt-8 border-t border-[#c9ccbb]/10">
            <div className="mt-16 flex justify-center">
              <Link href="/coaching/foundations/quiz" className="flex items-center gap-3 px-10 py-4 bg-[#b5a642] text-[#1b270e] font-bold rounded-full hover:bg-[#d4c55e] transition-all">
                Take Foundations Quiz <ArrowRight size={18} />
              </Link>
            </div>
          </footer>
        </div>
      </main>
    </div>
  )
}
