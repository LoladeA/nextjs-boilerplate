export default function HowItWorks() {
  const steps = [
    { num: "01", title: "Assess", text: "Map your home’s lighting, acoustics, and spatial flow through a regulated sensory lens." },
    { num: "02", title: "Analyse", text: "Receive high-fidelity insights grounded in NeuroDesign™ principles." },
    { num: "03", title: "Implement", text: "Follow step-by-step action plans and track your progress and wellbeing metrics over time." }
  ]

  return (
    <section className="px-6 py-24 bg-[#c9ccbb]/5 border-y border-[#c9ccbb]/10">
      <div className="max-w-6xl mx-auto">
        <h3 className="text-3xl font-serif text-[#c9ccbb] mb-20 text-center italic">
          The Methodology of Restoration
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {steps.map((step) => (
            <div key={step.num} className="group p-8 border-l border-[#c9ccbb]/20 hover:border-[#c9ccbb] transition-colors duration-700">
              <span className="block text-5xl font-serif text-[#c9ccbb]/10 mb-6 group-hover:text-[#c9ccbb]/40 transition-colors">
                {step.num}
              </span>
              <h4 className="text-xl font-semibold text-[#c9ccbb] mb-4 uppercase tracking-tighter">
                {step.title}
              </h4>
              <p className="text-[#c9ccbb]/60 leading-relaxed font-light">
                {step.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
