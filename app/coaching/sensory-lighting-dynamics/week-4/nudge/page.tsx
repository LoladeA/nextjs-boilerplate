'use client'

import Link from 'next/link'
import { ArrowRight, Moon, ShieldCheck, Sparkles } from 'lucide-react'
import Sidebar from '@/app/components/Sidebar'

export default function Week4Nudge() {
  return (
    <div className="min-h-screen bg-[#1b270e] font-sans selection:bg-[#b5a642] selection:text-[#1b270e]">
      <Sidebar />
      <main className="md:ml-64 min-h-screen p-6 md:p-12 lg:p-20 text-[#c9ccbb]">
        <div className="max-w-4xl mx-auto">
          <header className="mb-20 text-center">
            <h1 className="text-4xl md:text-5xl font-serif mb-6 leading-tight">Final Integration: The Mastery Protocol</h1>
            <p className="text-[#c9ccbb]/60 text-xl italic leading-relaxed">Locking in the environmental downshift.</p>
          </header>

          <div className="glass-panel p-12 rounded-[2rem] border border-[#b5a642]/20 bg-[#b5a642]/5 mb-20">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-14 h-14 bg-[#b5a642] text-[#1b270e] rounded-full flex items-center justify-center"><Moon size={28} /></div>
              <h3 className="text-2xl font-serif">Deep Night Protocol</h3>
            </div>
            <p className="text-lg leading-[1.8] opacity-80 mb-8">
              Complete darkness is essential for sleep depth. Establish a fixed Evening Downshift time. Remove all blue-rich light 3 hours before sleep and remove one unpredictable sound source from your environment.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 italic opacity-70">
              <div className="flex gap-4"><ShieldCheck size={20} className="text-[#b5a642] shrink-0" /> No direct LED indicators.</div>
              <div className="flex gap-4"><ShieldCheck size={20} className="text-[#b5a642] shrink-0" /> No streetlight intrusion.</div>
            </div>
          </div>

          <div className="flex flex-col items-center border-t border-[#c9ccbb]/10 pt-20">
            <h4 className="text-[#c9ccbb] font-serif text-3xl mb-10">Sensory Dynamics Complete.</h4>
            <Link href="/coaching" className="group flex items-center gap-4 px-14 py-6 bg-[#b5a642] text-[#1b270e] font-bold rounded-full hover:bg-[#d4c55e] transition-all">Return to Dashboard <ArrowRight size={24} /></Link>
          </div>
        </div>
      </main>
    </div>
  )
}
