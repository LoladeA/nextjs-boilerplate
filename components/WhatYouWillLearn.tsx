export default function WhatYouWillLearn() {
  const learningPoints = [
    { title: "Energy Costs", desc: "Identify which sensory inputs cost you the most cognitive energy." },
    { title: "Regulation Mapping", desc: "Determine which rooms support regulation, and which erode it." },
    { title: "The 'Invisible' Why", desc: "Understand why environments feel wrong even when they look fine." },
    { title: "Response Lag", desc: "How your nervous system responds over time, not just in moments." }
  ]

  return (
    <section className="px-6 py-24 bg-[#1b270e]">
      <div className="max-w-6xl mx-auto">
        <h3 className="text-3xl font-serif text-[#c9ccbb] mb-16 text-center italic">
          What You’ll Learn Here
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {learningPoints.map((point, index) => (
            <div key={index} className="flex items-center bg-[#c9ccbb]/5 border border-[#c9ccbb]/10 p-8 rounded-2xl hover:bg-[#c9ccbb]/10 transition-all group">
              <div className="mr-8 text-[#b5a642] font-serif text-2xl opacity-50 group-hover:opacity-100 transition-opacity">
                0{index + 1}
              </div>
              <div>
                <h4 className="text-[#c9ccbb] font-bold uppercase tracking-widest text-sm mb-2">{point.title}</h4>
                <p className="text-[#c9ccbb]/60 font-light leading-relaxed">{point.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
