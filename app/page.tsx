import Link from 'next/link'
import { ArrowRight, Brain, Activity, Sparkles, LogIn, CheckCircle, Layers, MousePointerClick, BarChart3, Lightbulb } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#1b270e] text-[#c9ccbb] font-sans selection:bg-[#b5a642] selection:text-[#1b270e]">
      
      {/* NAVIGATION */}
      <nav className="fixed w-full z-50 px-6 py-6 flex justify-between items-center bg-[#1b270e]/90 backdrop-blur-md border-b border-[#c9ccbb]/5">
        <div className="flex items-center gap-3">
          {/* LOGO */}
          <img src="/logo.PNG" alt="Logo" className="h-8 w-auto object-contain" />
          <div className="text-2xl font-serif tracking-tight">
            The Sentient Home
          </div>
        </div>
        
        <div className="flex gap-4">
          
          
          {/* "Get Started" Button Removed Here */}
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative min-h-screen flex flex-col justify-center items-center text-center px-4 pt-24 pb-12">
        
        <div className="mb-8 p-4 rounded-full bg-[#b5a642]/10 border border-[#b5a642]/20 animate-fade-in-up">
          <Brain className="w-8 h-8 text-[#b5a642]" />
        </div>

        <h1 className="text-5xl md:text-7xl font-serif mb-6 leading-tight max-w-5xl animate-fade-in-up delay-100">
          NeuroDesign™ Sensory Intelligence <br/>
          <span className="text-[#b5a642]">for Everyday Living</span>
        </h1>

        <p className="text-lg md:text-xl text-[#c9ccbb]/80 mb-10 max-w-3xl animate-fade-in-up delay-200 leading-relaxed">
          Discover how your home is influencing your nervous system in real time. Receive tailored recommendations based on your sensory profile, implement them gradually, and transform your home environment into a steady, regulating foundation for clarity, ease, and restoration.
        </p>

        <div className="flex flex-col md:flex-row gap-4 animate-fade-in-up delay-300">
          {/* UPDATED: Points to Guest Assessment (Step 0) */}
          <Link 
            href="/assessments/step0" 
            className="px-8 py-4 bg-[#b5a642] text-[#1b270e] rounded-xl font-bold text-sm uppercase tracking-widest hover:scale-105 transition-transform flex items-center gap-2"
          >
            Begin Your Assessment <ArrowRight size={16} />
          </Link>
          
          <Link 
            href="/login" 
            className="px-8 py-4 border border-[#c9ccbb]/20 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-[#c9ccbb]/5 transition-all flex items-center gap-2"
          >
            <LogIn size={16} /> Member Login
          </Link>
        </div>
      </section>

      {/* SECTION: WHAT IT IS (Glass Cards) */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <h2 className="text-3xl font-serif text-center mb-16 text-[#b5a642]">What Is The Sentient Home?</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card 1 */}
          <div className="p-8 rounded-3xl bg-[#000]/20 border border-[#c9ccbb]/10 hover:border-[#b5a642]/30 transition-all backdrop-blur-sm">
            <Brain className="text-[#b5a642] mb-4" size={32} />
            <h3 className="text-xl font-serif text-[#c9ccbb] mb-3">Neuropsychology-Informed</h3>
            <ul className="text-[#c9ccbb]/80 text-sm space-y-2">
              <li>Designed with how the brain actually processes the spaces it lives in.</li>
              <li>Grounded in neuroscience, environmental psychology, circadian biology, and stress physiology, and translated into changes you can make today.</li>
            </ul>
          </div>

          {/* Card 2 */}
          <div className="p-8 rounded-3xl bg-[#000]/20 border border-[#c9ccbb]/10 hover:border-[#b5a642]/30 transition-all backdrop-blur-sm">
            <Activity className="text-[#b5a642] mb-4" size={32} />
            <h3 className="text-xl font-serif text-[#c9ccbb] mb-3">Precision Scoring</h3>
            <ul className="text-[#c9ccbb]/80 text-sm space-y-2">
              <li>A score that measures how much your home environment is asking of your nervous system, not just how it looks.</li>
              <li>Scores predictability, sensory coherence, autonomic load, attention, and circadian alignment.</li>
            </ul>
          </div>

          {/* Card 3 */}
          <div className="p-8 rounded-3xl bg-[#000]/20 border border-[#c9ccbb]/10 hover:border-[#b5a642]/30 transition-all backdrop-blur-sm">
            <BarChart3 className="text-[#b5a642] mb-4" size={32} />
            <h3 className="text-xl font-serif text-[#c9ccbb] mb-3">The Invisible Becomes Visible</h3>
            <ul className="text-[#c9ccbb]/80 text-sm space-y-2">
              <li>Turns those invisible stress cues that are quietly draining you [lighting at the wrong time, cluttered spaces, a visually and acoustically noisy environment]into signals that are nameable, measurable and addressable</li>
              <li>Eliminates the guesswork: We find out what your space needs and recommend actions tailored to your unique spatial requirements.</li>
            </ul>
          </div>

          {/* Card 4 */}
          <div className="p-8 rounded-3xl bg-[#000]/20 border border-[#c9ccbb]/10 hover:border-[#b5a642]/30 transition-all backdrop-blur-sm">
            <Lightbulb className="text-[#b5a642] mb-4" size={32} />
            <h3 className="text-xl font-serif text-[#c9ccbb] mb-3">Actionable Insights</h3>
            <ul className="text-[#c9ccbb]/80 text-sm space-y-2">
              <li>Small, incremental changes leading to big changes in nervous system regulation.</li>
              <li>Personalised environmental adjustments that reduce cognitive load and support recovery - because the right change in the right place shifts everything around it.</li>
            </ul>
          </div>

          {/* Card 5 - Coaching */}
          <div className="p-8 rounded-3xl bg-[#b5a642]/10 border border-[#b5a642]/20 hover:border-[#b5a642]/40 transition-all backdrop-blur-sm md:col-span-2 lg:col-span-2">
            <Sparkles className="text-[#b5a642] mb-4" size={32} />
            <h3 className="text-xl font-serif text-[#c9ccbb] mb-3">Sensory Intelligence Coaching™</h3>
            <ul className="text-[#c9ccbb]/80 text-sm space-y-2">
              <li className="font-bold text-[#b5a642]">Insight compounds over time.</li>
              <li>Self-paced guided coaching so you learn to read your space, anticipate what drains you, and make changes with confidence rather than guesswork.</li>
            </ul>
          </div>

        </div>
      </section>

      {/* SECTION: HOW IT WORKS */}
      <section className="py-20 px-6 border-t border-[#c9ccbb]/10 bg-[#000]/10">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-serif text-center mb-16">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            
            <div className="flex flex-col items-center">
               <div className="w-16 h-16 rounded-full bg-[#b5a642]/20 flex items-center justify-center text-[#b5a642] mb-6 border border-[#b5a642]/30">
                 <MousePointerClick size={28} />
               </div>
               <h3 className="text-xl font-serif text-[#c9ccbb] mb-3">Complete the Assessment</h3>
               <p className="text-[#c9ccbb]/80 text-sm leading-relaxed">
                 Answer questions about your space's lighting, acoustics, layout, textures, and colours. No design knowledge needed. Just honest answers about how your space feels to live in. The assessment takes about 10 minutes.
               </p>
            </div>

            <div className="flex flex-col items-center">
               <div className="w-16 h-16 rounded-full bg-[#b5a642]/20 flex items-center justify-center text-[#b5a642] mb-6 border border-[#b5a642]/30">
                 <Activity size={28} />
               </div>
               <h3 className="text-xl font-serif text-[#c9ccbb] mb-3">Receive Personalised Insights</h3>
               <p className="text-[#c9ccbb]/80 text-sm leading-relaxed">
                 Receive a clear breakdown of where your space is supporting you and where it is quietly working against you.
               </p>
            </div>

            <div className="flex flex-col items-center">
               <div className="w-16 h-16 rounded-full bg-[#b5a642]/20 flex items-center justify-center text-[#b5a642] mb-6 border border-[#b5a642]/30">
                 <Layers size={28} />
               </div>
               <h3 className="text-xl font-serif text-[#c9ccbb] mb-3">Implement Recommendations</h3>
               <p className="text-[#c9ccbb]/80 text-sm leading-relaxed">
                 Each Recommendation is specific to you with step-by-step action plans to improve your space. Start with one. Track how you feel over time. The data accumulates into a picture of what your home is actually doing for you.
               </p>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION: WHAT YOU'LL LEARN */}
      <section className="py-20 px-6 max-w-4xl mx-auto">
        <div className="glass-panel p-10 rounded-3xl border border-[#c9ccbb]/10">
           <h2 className="text-3xl font-serif mb-8 text-center md:text-left">What You’ll Learn Here</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {[
               "Why certain rooms leave you tired even after you have rested",
               "Which parts of your home are quietly draining your focus and mood",
               "How light and sound at the wrong time affect your ability to rest and focus, and what to do about it",
               "Why certain rooms in your home look fine but feel off",
               "How small, specific changes compound into a home that genuinely restores you"
             ].map((item, i) => (
               <div key={i} className="flex gap-4">
                 <CheckCircle className="text-[#b5a642] shrink-0" size={20} />
                 <span className="text-[#c9ccbb]/80 text-sm">{item}</span>
               </div>
             ))}
           </div>
        </div>
      </section>

      {/* SECTION: HOW TO USE */}
      <section className="py-20 px-6 text-center">
        <h2 className="text-sm font-bold uppercase tracking-widest text-[#b5a642] mb-8">How to Use The Sentient Home</h2>
        
        <div className="text-lg md:text-2xl font-serif text-[#c9ccbb] leading-relaxed max-w-3xl mx-auto space-y-2 mb-12">
          <p>Begin with one honest assessment.</p>
          <p>Notice the patterns.</p>
          <p>Track how you feel, not how you should feel.</p>
          <p>Let the data accumulate without judgment.</p>
          <p>Make one change at a time and notice what shifts.</p>
        </div>
        
        <p className="text-[#c9ccbb]/80 text-sm max-w-xl mx-auto mb-8">
          Used daily, this becomes a record of your home's effect on you, and a clear map of what to change next.
        </p>

        <div className="inline-block px-8 py-4 border-l-2 border-[#b5a642] bg-[#b5a642]/5 text-[#c9ccbb] italic">
          <p className="mb-2">Over time, insight replaces guesswork.</p>
          <p className="font-bold text-[#b5a642]">Agency replaces adaptation.</p>
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="py-32 border-t border-[#c9ccbb]/10 text-center bg-gradient-to-t from-[#000]/40 to-transparent">
        <h2 className="text-4xl font-serif mb-6">Ready to Transform Your Space?</h2>
        <p className="text-[#c9ccbb]/80 mb-10 max-w-xl mx-auto">
          Join others who are creating supportive homes that encourage rest, recovery, focus and connection through evidence-based design.
        </p>
        {/* UPDATED: Points to Guest Assessment (Step 0) */}
        <Link 
          href="/assessments/step0" 
          className="inline-flex items-center gap-2 px-10 py-5 bg-[#b5a642] text-[#1b270e] rounded-full font-bold uppercase tracking-widest hover:bg-[#d4c55e] transition-all"
        >
          Begin Your Assessment <ArrowRight size={18} />
        </Link>
      </section>

      {/* LEGAL FOOTER */}
      <footer className="py-12 border-t border-[#c9ccbb]/5 bg-[#141d0b]">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-[#c9ccbb]/70 text-xs font-bold uppercase tracking-widest">
            © 2026 The Sentient Home. All rights reserved.
          </div>
          <div className="flex gap-8">
            <a href="https://www.lolade-ajai.com/privacypolicy" target="_blank" rel="noopener noreferrer" className="text-[#c9ccbb]/80 hover:text-[#b5a642] text-xs font-bold uppercase tracking-widest transition-colors">
              Privacy Policy
            </a>
            <a href="https://www.lolade-ajai.com/termsandconditions" target="_blank" rel="noopener noreferrer" className="text-[#c9ccbb]/80 hover:text-[#b5a642] text-xs font-bold uppercase tracking-widest transition-colors">
              Terms of Service
            </a>
            <a href="mailto:hello@lolade-ajai.com" className="text-[#c9ccbb]/80 hover:text-[#b5a642] text-xs font-bold uppercase tracking-widest transition-colors">
              Contact Support
            </a>
          </div>
        </div>
      </footer>

    </div>
  )
}
