import Link from 'next/link'
import { ArrowRight, Brain, Sparkles, Shield, Activity, LogIn } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#1b270e] text-[#c9ccbb] font-sans selection:bg-[#b5a642] selection:text-[#1b270e]">
      
      {/* NAVIGATION */}
      <nav className="fixed w-full z-50 px-6 py-6 flex justify-between items-center bg-gradient-to-b from-[#1b270e] to-transparent">
        <div className="text-2xl font-serif tracking-tight">
          Sentient<span className="text-[#b5a642]">Home</span>
        </div>
        <div className="flex gap-4">
           {/* LOGIN BUTTON (New Addition) */}
           <Link 
            href="/login" 
            className="hidden md:flex items-center gap-2 px-6 py-2 border border-[#c9ccbb]/20 rounded-full hover:bg-[#c9ccbb]/10 transition-all text-xs uppercase tracking-widest font-bold"
          >
            <LogIn size={14} /> Sign In
          </Link>
          <Link 
            href="/signup" 
            className="px-6 py-2 bg-[#b5a642] text-[#1b270e] rounded-full hover:bg-[#d4c55e] transition-all text-xs uppercase tracking-widest font-bold"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative min-h-screen flex flex-col justify-center items-center text-center px-4 pt-20">
        
        <div className="mb-8 p-4 rounded-full bg-[#b5a642]/10 border border-[#b5a642]/20 animate-fade-in-up">
          <Brain className="w-8 h-8 text-[#b5a642]" />
        </div>

        <h1 className="text-5xl md:text-7xl font-serif mb-6 leading-tight max-w-4xl animate-fade-in-up delay-100">
          Your home is talking to your <br/>
          <span className="text-[#b5a642]">nervous system.</span>
        </h1>

        <p className="text-lg md:text-xl text-[#c9ccbb]/60 mb-10 max-w-2xl animate-fade-in-up delay-200">
          Decode the hidden sensory friction in your environment. 
          Move from coping to thriving with the NeuroDesign Intelligence™ platform.
        </p>

        <div className="flex flex-col md:flex-row gap-4 animate-fade-in-up delay-300">
          <Link 
            href="/assessments/intro" 
            className="px-8 py-4 bg-[#b5a642] text-[#1b270e] rounded-xl font-bold text-sm uppercase tracking-widest hover:scale-105 transition-transform flex items-center gap-2"
          >
            Take Assessment <ArrowRight size={16} />
          </Link>
          
          {/* SECONDARY SIGN IN (For Returning Users) */}
          <Link 
            href="/login" 
            className="px-8 py-4 border border-[#c9ccbb]/20 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-[#c9ccbb]/5 transition-all flex items-center gap-2"
          >
            <LogIn size={16} /> Member Login
          </Link>
        </div>

      </section>

      {/* FOOTER CTA SECTION */}
      <section className="py-32 border-t border-[#c9ccbb]/10 text-center">
        <h2 className="text-4xl font-serif mb-8">Ready to regulate?</h2>
        <Link 
          href="/assessments/intro"  // <-- FIXED: Now points correctly to the assessment
          className="inline-flex items-center gap-2 px-10 py-5 bg-[#c9ccbb] text-[#1b270e] rounded-full font-bold uppercase tracking-widest hover:bg-white transition-all"
        >
          Begin Assessment <ArrowRight size={18} />
        </Link>
      </section>

    </div>
  )
}
