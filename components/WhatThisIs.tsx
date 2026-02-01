'use client'

export default function WhatThisIs() {
  const features = [
    {
      title: "Precision Scoring",
      desc: "Measures how safe your environment feels to your nervous system. Scores predictability, sensory coherence, autonomic load, attention, and circadian alignment."
    },
    {
      title: "Precision Diagnostics",
      desc: "Turns invisible stress cues into measurable signals. Weighted algorithms across lighting, acoustics, spatial flow, texture, and colour."
    },
    {
      title: "Actionable Insights",
      desc: "Small changes. System-level impact. Personalised environmental adjustments that reduce cognitive load and support recovery."
    },
    {
      title: "Sensory Intelligence Coaching™",
      desc: "Your environment learns with you. Self-paced guidance that layers insight onto your scores, teaching you how to read your space and make high-signal adjustments with confidence."
    }
  ]

  return (
    <section className="px-6 py-24 max-w-7xl mx-auto">
      <div className="bg-[#c9ccbb] rounded-[3rem] p-12 md:p-20 shadow-2xl">
        <div className="max-w-3xl mb-16">
          <h3 className="text-sm uppercase tracking-[0.3em] text-[#1b270e]/60 mb-6">
            The Intelligence Layer
          </h3>
          <h2 className="text-4xl md:text-5xl font-serif text-[#1b270e] leading-tight mb-8">
            Designed around how your brain <br/> 
            <span className="italic text-[#1b270e]/70 text-3xl md:text-4xl">actually processes space.</span>
          </h2>
          <p className="text-[#1b270e]/80 text-lg md:text-xl font-light leading-relaxed">
            Built from neuroscience, environmental psychology, circadian biology, 
            and stress physiology.
          </p>
        </div>

        {/* Horizontal Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
          {features.map((feature, index) => (
            <div key={index} className="border-t border-[#1b270e]/10 pt-8 group">
              <h4 className="text-[#1b270e] font-bold uppercase tracking-widest text-sm mb-4 group-hover:text-[#b5a642] transition-colors">
                {feature.title}
              </h4>
              <p className="text-[#1b270e]/70 leading-relaxed font-light">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
