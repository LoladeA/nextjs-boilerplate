'use client'

export default function AuthPlaceholder() {
  return (
    <section id="auth-section" className="px-6 py-32 max-w-4xl mx-auto text-center">
      <div className="bg-[#1b270e]/40 backdrop-blur-md border border-[#c9ccbb]/10 rounded-[4rem] p-16 md:p-24 shadow-inner">
        <h3 className="text-sm uppercase tracking-[0.5em] text-[#c9ccbb]/50 mb-8">
          The Final Shift
        </h3>
        
        <h2 className="text-4xl md:text-6xl font-serif text-[#c9ccbb] mb-10 leading-tight">
          Ready to <span className="italic font-light text-[#b5a642]">Transform</span> <br/> Your Space?
        </h2>

        <p className="text-[#c9ccbb]/70 text-lg md:text-xl mb-12 max-w-xl mx-auto leading-relaxed font-light">
          Sign up to begin your assessment and turn your home into a system that 
          supports your capacity, focus, and long-term wellbeing.
        </p>

        <button 
          className="btn-luxury inline-block"
          onClick={() => console.log('Directing to Supabase Auth flow')}
        >
          Sign Up To Begin Your Assessment
        </button>
      </div>
    </section>
  )
}
