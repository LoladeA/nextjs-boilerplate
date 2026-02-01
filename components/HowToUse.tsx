export default function HowToUse() {
  return (
    <section className="px-6 py-24 max-w-4xl mx-auto text-center">
      <div className="mb-16">
        <h3 className="text-4xl font-serif text-[#c9ccbb] mb-6">
          How to Use The Sentient Home
        </h3>
        <p className="text-[#c9ccbb]/60 text-lg italic">
          Like a sleep or nutrition tracker, but for your environment.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
        {[
          { label: "Start Small", detail: "Focus on one sensory input at a time." },
          { label: "Notice Patterns", detail: "Identify triggers before they cause burnout." },
          { label: "Track Truth", detail: "Track how you feel, not how you 'should' feel." },
          { label: "Accumulate Data", detail: "Let insights build without judgment." }
        ].map((item, i) => (
          <div key={i} className="border-b border-[#c9ccbb]/10 pb-6">
            <span className="text-[#b5a642] block mb-2 text-xs uppercase tracking-widest">Guideline {i + 1}</span>
            <h4 className="text-xl text-[#c9ccbb] mb-2">{item.label}</h4>
            <p className="text-[#c9ccbb]/50 font-light text-sm">{item.detail}</p>
          </div>
        ))}
      </div>

      <div className="mt-20 p-10 bg-[#c9ccbb] rounded-3xl">
        <p className="text-[#1b270e] text-2xl font-serif leading-relaxed italic">
          "Over time, insight replaces guesswork. <br/> 
          Agency replaces adaptation."
        </p>
      </div>
    </section>
  )
}
