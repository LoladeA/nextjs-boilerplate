'use client'

import Link from 'next/link'

export default function HeroSection() {
  return (
    <section className="relative px-6 py-32 md:py-48 flex flex-col items-center justify-center overflow-hidden">
      <div className="max-w-5xl text-center z-10">
        <h1 className="text-sm uppercase tracking-[0.4em] text-[#c9ccbb] mb-6 opacity-70">
          The Sentient Home
        </h1>
        
        <h2 className="text-5xl md:text-8xl font-serif text-[#c9ccbb] leading-[1.1] mb-10">
          NeuroDesign™ <br/> 
          <span className="italic font-light opacity-90 text-[#b5a642]">Sensory Intelligence</span>
        </h2>

        <p className="text-lg md:text-2xl text-[#c9ccbb]/70 max-w-3xl mx-auto mb-14 leading-relaxed font-light">
          Find out how your home environment affects your wellbeing. 
          Get personalised recommendations to help you create spaces that 
          enhance focus, reduce stress and improve your quality of life.
        </p>

        {/* Using Link for a dedicated page transition:
          This offers Agency over Adaptation by allowing the user 
          to step into the Auth environment at their own pace. 
        */}
        <Link href="/auth">
          <button className="btn-luxury px-10 py-4 bg-[#c9ccbb] text-[#1b270e] rounded-full font-medium hover:bg-[#b5a642] transition-colors duration-300">
            Begin Assessment
          </button>
        </Link>
      </div>
      
      {/* Background depth element - providing visual regulation */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#c9ccbb]/5 rounded-full blur-3xl -z-10" />
    </section>
  )
}
