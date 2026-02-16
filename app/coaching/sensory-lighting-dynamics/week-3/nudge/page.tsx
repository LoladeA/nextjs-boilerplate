'use client'

import Link from 'next/link'
import { ArrowRight, Layout, Eye, Shield, Sparkles } from 'lucide-react'
import Sidebar from '@/app/components/Sidebar'

export default function Week3Nudge() {
  return (
    <div className="min-h-screen bg-[#1b270e] font-sans selection:bg-[#b5a642] selection:text-[#1b270e]">
      <Sidebar />
      <main className="md:ml-64 min-h-screen p-6 md:p-12 lg:p-20">
        <div className="max-w-4xl mx-auto text-[#c9ccbb]">
          
          <header className="mb-20 text-center">
            <h1 className="text-4xl md:text-5xl font-serif mb-6 leading-tight">Week 3: Personalised Nudges</h1>
            <p className="text-[#c9ccbb]/60 text-xl italic leading-relaxed">
              Redesigning for regulatory efficiency and reduced cortical processing.
            </p>
          </header>

          <div className="grid gap-12 mb-20">
            <div className="glass-panel p-10 rounded-[2rem] border border-[#b5a642]/20 bg-[#b5a642]/5 shadow-xl">
              <div className="flex items-center gap-6 mb-8">
                <div className="w-14 h-14 bg-[#b5a642] text-[#1b270e] rounded-full flex items-center justify-center">
                  <Eye size={28} />
                </div>
                <h3 className="text-2xl font-serif">Visual Load Reduction</h3>
              </div>
              <p className="text-lg leading-relaxed opacity-80 mb-6">
                <strong>High Visual Load:</strong> Focus on matte surfaces only in your workspace. Research shows that this reduces micro-saccades, easing cortical strain and allowing you to focus more sharply.
              </p>
            </div>

            <div className="glass-panel p-10 rounded-[2rem] border border-[#b5a642]/20 bg-[#b5a642]/5 shadow-xl">
              <div className="flex items-center gap-6 mb-8">
                <div className="w-14 h-14 bg-[#b5a642] text-[#1b270e] rounded-full flex items-center justify-center">
                  <Shield size={28} />
                </div>
                <h3 className="text-2xl font-serif">Vigilance Mitigation</h3>
              </div>
              <p className="text-lg leading-relaxed opacity-80 mb-6">
                <strong>High Amygdala Reactivity:</strong> Prioritise indirect lighting and wall-wash techniques in sensitive areas, as evidence links these to amygdala modulation and reduced stress reactivity.
              </p>
              <p className="text-lg leading-relaxed opacity-80">
                <strong>Low Predictive Legibility:</strong> Use hierarchical accents to clarify focal points (e.g. a sculptural centrepiece). Neuroscience confirms that this enhances predictive coding and minimises cognitive friction.
              </p>
            </div>
          </div>

          {/* Optional Upsell - Styled for Precision & Value */}
          <div className="p-12 rounded-[2rem] border border-[#b5a642]/40 bg-[#b5a642]/10 mb-20 text-center relative overflow-hidden">
            <Sparkles className="absolute top-4 right-4 text-[#b5a642]/40" size={32} />
            <h3 className="text-[#b5a642] font-serif text-2xl mb-4">Precision Spectral Evaluation</h3>
            <p className="text-[#c9ccbb]/80 text-lg leading-relaxed mb-8 italic">
              "For deeper personalisation, book a one-on-one virtual session to refine these applications to your unique layout."
            </p>
            <p className="text-sm uppercase tracking-widest font-bold text-[#b5a642]">Precision is optional but valuable.</p>
          </div>

          <div className="flex flex-col items-center border-t border-[#c9ccbb]/10 pt-20">
            <h4 className="text-[#c9ccbb] font-serif text-3xl mb-10">Final Integration?</h4>
            <Link 
              href="/coaching/sensory-lighting-dynamics/week-4" 
              className="group flex items-center gap-4 px-14 py-6 bg-[#c9ccbb] text-[#1b270e] font-bold rounded-full hover:bg-[#b5a642] transition-all shadow-2xl shadow-[#b5a642]/20"
            >
              Continue to Week 4: The Evening Reset <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
