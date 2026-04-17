import Link from 'next/link'
import {
  ArrowRight, Brain, Activity, Sparkles, LogIn, CheckCircle,
  Layers, MousePointerClick, BarChart3, Zap, Fingerprint,
  Shield, RefreshCw, MessageCircle
} from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#1b270e] text-[#c9ccbb] font-sans selection:bg-[#b5a642] selection:text-[#1b270e]">

      {/* ── NAVIGATION ──────────────────────────────────────────────────── */}
      <nav className="fixed w-full z-50 px-6 py-6 flex justify-between items-center bg-[#1b270e]/90 backdrop-blur-md border-b border-[#c9ccbb]/5">
        <div className="flex items-center gap-3">
          <img src="/logo.PNG" alt="Logo" className="h-8 w-auto object-contain" />
          <div className="text-2xl font-serif tracking-tight">
            The Sentient Home
          </div>
        </div>
        <div className="flex gap-4">
          <Link
            href="/login"
            className="flex items-center gap-2 px-5 py-2.5 border border-[#c9ccbb]/20 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#c9ccbb]/5 transition-all"
          >
            <LogIn size={14} /> Member Login
          </Link>
        </div>
      </nav>

      {/* ── SECTION 1: HERO — Mirror ─────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col justify-center items-center text-center px-6 pt-24 pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#b5a642]/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#b5a642]/5 rounded-full blur-3xl pointer-events-none" />

        <p className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest mb-8 animate-fade-in-up relative z-10">
          The Sentient Home · NeuroDesign™
        </p>

        <h1 className="text-5xl md:text-7xl font-serif mb-8 leading-tight max-w-5xl animate-fade-in-up delay-100 relative z-10">
          Your home is affecting<br className="hidden md:block" />
          <span className="text-[#b5a642]"> your nervous system right now.</span>
        </h1>

        <p className="text-lg md:text-xl text-[#c9ccbb]/80 mb-5 max-w-2xl animate-fade-in-up delay-200 leading-relaxed relative z-10">
          Most people can feel it. Exhausted after resting. Unable to focus in rooms that look perfectly fine. Carrying a tension that lifts the moment they leave the house.
        </p>

        <p className="text-base text-[#c9ccbb]/80 mb-12 max-w-xl animate-fade-in-up delay-300 leading-relaxed relative z-10">
          The Sentient Home measures what your environment is actually asking of your nervous system, and gives you a precise, evidence-based plan to change it.
        </p>

        <div className="flex animate-fade-in-up delay-300 relative z-10">
          <Link
            href="/assessments/step0"
            className="px-8 py-4 bg-[#b5a642] text-[#1b270e] rounded-xl font-bold text-sm uppercase tracking-widest hover:scale-105 transition-transform flex items-center gap-2"
          >
            Take the Free Assessment <ArrowRight size={16} />
          </Link>
        </div>

        <p className="text-[#c9ccbb]/80 text-[10px] uppercase tracking-widest mt-5 animate-fade-in-up delay-300 relative z-10">
          10 minutes · No design knowledge needed · No credit card required
        </p>
      </section>

      {/* ── SECTION 2: SOMATIC MIRROR — Mirror continued ────────────────── */}
      <section className="py-20 px-6 max-w-4xl mx-auto">
        <div className="glass-panel p-10 rounded-3xl border border-[#c9ccbb]/10">
          <p className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest mb-10">
           Does any of this sound familiar?
          </p>
          <h2 className="text-3xl font-serif mb-8">
            This is what environmental friction feels like
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              "You rest in your home and wake up still tired.",
              "A room can look entirely fine and feel consistently wrong. You have stopped trusting that instinct.",
              "You do your best thinking outside the house — in cafés, in transit, anywhere but where you actually live.",
              "You have tried decluttering, redecorating, reorganising. The underlying friction remains.",
              "You have started to wonder whether the problem is you.",
            ].map((item, i) => (
              <div key={i} className={`flex gap-4 ${i === 4 ? 'md:col-span-2 border-t border-[#c9ccbb]/10 pt-6 mt-2' : ''}`}>
                <CheckCircle className="text-[#b5a642] shrink-0 mt-0.5" size={16} />
                <span className={`text-sm leading-relaxed ${i === 4 ? 'text-[#c9ccbb] font-serif text-2xl italic' : 'text-[#c9ccbb]/80'}`}>
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 3: REFRAME ────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-[#000]/20 border-t border-[#c9ccbb]/5">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-serif mb-10 leading-tight text-center">
            It is not you.<br />
            <span className="text-[#b5a642]">It is the design.</span>
          </h2>

          <div className="space-y-5 text-[#c9ccbb]/80 text-base leading-relaxed">
            <p>
              Your nervous system is in constant negotiation with every environment it occupies. Lighting at the wrong intensity at the wrong time of day suppresses your capacity to focus. Acoustic exposure below the threshold of conscious attention still accumulates as autonomic load. Spatial unpredictability [rooms that do not resolve visually] keeps your threat-detection system running in the background, drawing on the same resources you need for clarity, recovery, and presence.
            </p>
            <p>
              None of this is visible without the right awareness. None of it shows up in a standard interior design consultation. And none of it is your fault.
            </p>
            <p className="glass-panel p-6 rounded-2xl border-l-4 border-[#b5a642] text-[#c9ccbb]/80 font-serif text-lg leading-relaxed">
              The Sentient Home was built to make this visible. It translates what your environment is doing to your nervous system into a structured, measurable score; and then into specific, actionable changes calibrated to how you are actually wired.
            </p>
          </div>
        </div>
      </section>

      {/* ── SECTION 4: THE MECHANISM — Five Domains ─────────────────────── */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest mb-4">The NeuroLoad Score™</p>
          <h2 className="text-3xl md:text-4xl font-serif text-[#c9ccbb] mb-3">What we actually measure</h2>
          <p className="text-[#c9ccbb]/80 text-sm max-w-lg mx-auto leading-relaxed">
            Five domains. Each one calibrated to your sensory profile; not a population average.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">

          <div className="glass-panel p-8 rounded-3xl border border-[#c9ccbb]/10 hover:border-[#b5a642]/30 transition-all">
            <Zap className="text-[#b5a642] mb-5" size={22} />
            <h3 className="text-lg font-serif text-[#c9ccbb] mb-3">Circadian Rhythm Index</h3>
            <p className="text-[#c9ccbb]/80 text-sm leading-relaxed">
              Whether your home's light environment is aligned with your body's biological clock, or working against it at the times that matter most.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-3xl border border-[#c9ccbb]/10 hover:border-[#b5a642]/30 transition-all">
            <Activity className="text-[#b5a642] mb-5" size={22} />
            <h3 className="text-lg font-serif text-[#c9ccbb] mb-3">Autonomic Load Index</h3>
            <p className="text-[#c9ccbb]/80 text-sm leading-relaxed">
              The cumulative sensory demand your space places on your nervous system across a day, including what you cannot consciously hear or see.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-3xl border border-[#c9ccbb]/10 hover:border-[#b5a642]/30 transition-all">
            <Brain className="text-[#b5a642] mb-5" size={22} />
            <h3 className="text-lg font-serif text-[#c9ccbb] mb-3">Predictive Legibility</h3>
            <p className="text-[#c9ccbb]/80 text-sm leading-relaxed">
              How much cognitive effort your space requires to navigate, and how that baseline mental load reduces your capacity throughout the day.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-3xl border border-[#c9ccbb]/10 hover:border-[#b5a642]/30 transition-all">
            <BarChart3 className="text-[#b5a642] mb-5" size={22} />
            <h3 className="text-lg font-serif text-[#c9ccbb] mb-3">Sensory Load</h3>
            <p className="text-[#c9ccbb]/80 text-sm leading-relaxed">
              The integrated impact of noise, visual complexity, texture, and contrast which are evaluated against your individual sensory processing threshold, not a universal standard.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-3xl border border-[#b5a642]/25 bg-[#b5a642]/5 hover:border-[#b5a642]/40 transition-all md:col-span-2 lg:col-span-2">
            <CheckCircle className="text-[#b5a642] mb-5" size={22} />
            <h3 className="text-lg font-serif text-[#c9ccbb] mb-3">Recovery Potential</h3>
            <p className="text-[#c9ccbb]/80 text-sm leading-relaxed">
              Whether your home is capable of functioning as a genuine restoration environment or whether it is sustaining the same activated state you are trying to recover from. This is the most heavily weighted domain in your NeuroLoad Score™.
            </p>
          </div>

        </div>

        {/* Sensory Profile callout */}
        <div className="glass-panel p-8 rounded-3xl border-l-4 border-[#b5a642] bg-[#b5a642]/5">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1">
              <p className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest mb-2">Your Sensory Profile</p>
              <h3 className="text-xl font-serif text-[#c9ccbb] mb-3">The Anchor · The Seeker · The Sensor</h3>
              <p className="text-[#c9ccbb]/80 text-sm leading-relaxed">
                Together, these five domains produce your NeuroLoad Score™ and identify your Sensory Profile. Your profile determines how every recommendation is calibrated. Two people can live in the same space and require entirely different interventions. Your Integration Pattern — Integrative, Variable, or Accumulative — determines how sensation accumulates in your body over time, and how your score is weighted accordingly.
              </p>
            </div>
            <div className="shrink-0 opacity-30">
              <Fingerprint size={56} className="text-[#b5a642]" />
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 5: HOW IT WORKS ───────────────────────────────────────── */}
      <section className="py-20 px-6 border-t border-[#c9ccbb]/5 bg-[#000]/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest mb-4">The Process</p>
            <h2 className="text-3xl font-serif text-[#c9ccbb]">How it works</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">

            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-[#b5a642]/20 flex items-center justify-center text-[#b5a642] mb-6 border border-[#b5a642]/30">
                <MousePointerClick size={26} />
              </div>
              <h3 className="text-xl font-serif text-[#c9ccbb] mb-3">Complete the Assessment</h3>
              <p className="text-[#c9ccbb]/80 text-sm leading-relaxed">
                Answer questions about how your space actually feels to live in, not how it looks. No design knowledge required. Approximately ten minutes. Builds your initial sensory profile across all five domains.
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-[#b5a642]/20 flex items-center justify-center text-[#b5a642] mb-6 border border-[#b5a642]/30">
                <Activity size={26} />
              </div>
              <h3 className="text-xl font-serif text-[#c9ccbb] mb-3">Receive Your NeuroLoad Score™</h3>
              <p className="text-[#c9ccbb]/80 text-sm leading-relaxed">
                Your score identifies precisely which domains are generating friction for your nervous system and which are supporting it. The breakdown is specific to your sensory profile, not a population average.
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-[#b5a642]/20 flex items-center justify-center text-[#b5a642] mb-6 border border-[#b5a642]/30">
                <Layers size={26} />
              </div>
              <h3 className="text-xl font-serif text-[#c9ccbb] mb-3">Implement and Track</h3>
              <p className="text-[#c9ccbb]/80 text-sm leading-relaxed">
                Each recommendation comes with a clear action, a rationale grounded in neuroscience and environmental psychology, and a daily logging system so you can see what shifts over time. Insight compounds. Agency replaces adaptation.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ── SECTION 6: WHAT THE DATA REVEALS ─────────────────────────────── */}
      <section className="py-20 px-6 max-w-4xl mx-auto">
        <div className="glass-panel p-10 rounded-3xl border border-[#c9ccbb]/10">
          <p className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest mb-6">What this reveals</p>
          <h2 className="text-3xl font-serif mb-10">What the data makes clear</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              "Why certain rooms leave you tired even after you have rested",
              "Which parts of your home are quietly draining your focus and mood",
              "How light and sound at the wrong time affect your ability to rest and think, and what specifically to change",
              "Why certain rooms look fine but feel wrong",
              "How small, specific changes compound into a home that genuinely restores you",
              "Whether your environment is the source of the friction or whether it is something else",
            ].map((item, i) => (
              <div key={i} className="flex gap-4">
                <CheckCircle className="text-[#b5a642] shrink-0 mt-0.5" size={16} />
                <span className="text-[#c9ccbb]/80 text-sm leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 7: OFFER CLARITY — Pricing ───────────────────────────── */}
      <section className="py-24 px-6 bg-[#000]/20 border-t border-[#c9ccbb]/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest mb-4">What's included</p>
            <h2 className="text-3xl md:text-4xl font-serif text-[#c9ccbb] mb-3">Choose how far you want to go</h2>
            <p className="text-[#c9ccbb]/80 text-sm">Every tier builds on the last.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">

            {/* FREE */}
            <div className="glass-panel p-8 rounded-3xl border border-[#c9ccbb]/10 flex flex-col">
              <p className="text-[#c9ccbb]/40 text-[10px] font-bold uppercase tracking-widest mb-4">Free</p>
              <div className="text-4xl font-serif text-[#c9ccbb] mb-1">€0</div>
              <p className="text-[#c9ccbb]/80 text-xs mb-6">No credit card required</p>
              <h3 className="text-lg font-serif text-[#c9ccbb] mb-5">The Assessment + Tools</h3>
              <ul className="space-y-3 mb-8 flex-1">
                {[
                  "Your NeuroLoad Score™ across all five domains with your Sensory Profile and Integration Pattern",
                  "Priority intervention areas ranked by impact",
                  "Daily BSFI scores:  morning and evening friction tracking",
                  "Mood, focus, and tension trend chart",
                  "Neurosomatic Insight cards with daily direction",
                  "In-app light and acoustic measurement tools",
                  "Insight library: short form reads",
                ].map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-[#c9ccbb]/50 leading-snug">
                    <CheckCircle size={12} className="text-[#b5a642] shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/assessments/step0"
                className="w-full py-3.5 rounded-xl text-center font-bold text-xs uppercase tracking-widest border border-[#b5a642]/40 text-[#b5a642] hover:bg-[#b5a642]/10 transition-all flex items-center justify-center gap-2"
              >
                Begin Free Assessment <ArrowRight size={12} />
              </Link>
            </div>

            {/* CORE */}
            <div className="glass-panel p-8 rounded-3xl border border-[#c9ccbb]/10 flex flex-col">
              <p className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest mb-4">Core</p>
              <div className="text-4xl font-serif text-[#c9ccbb] mb-1">
                €29<span className="text-base text-[#c9ccbb]/80 font-sans font-normal"> / month</span>
              </div>
              <p className="text-[#c9ccbb]/80 text-xs mb-6">Cancel anytime</p>
              <h3 className="text-lg font-serif text-[#c9ccbb] mb-5">Understand your environment</h3>
              <ul className="space-y-3 mb-8 flex-1">
                {[
                  "Everything in Free plus",
                  "The neuropsychology behind each daily pattern: why this is happening",
                  "14-day environmental pattern synthesis",
                  "Neuro Somatic Insight protocols",
                ].map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-[#c9ccbb]/80 leading-snug">
                    <CheckCircle size={12} className="text-[#b5a642] shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/assessments/step0"
                className="w-full py-3.5 rounded-xl text-center font-bold text-xs uppercase tracking-widest border border-[#c9ccbb]/20 text-[#c9ccbb] hover:border-[#b5a642]/40 hover:bg-[#b5a642]/5 transition-all"
              >
                Start with Core
              </Link>
            </div>

            {/* BLUEPRINT */}
            <div className="glass-panel p-8 rounded-3xl border border-[#b5a642]/40 bg-gradient-to-b from-[#b5a642]/10 to-transparent flex flex-col relative overflow-hidden shadow-xl shadow-[#b5a642]/10">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#b5a642]/60 to-transparent" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 bg-[#b5a642] text-[#1b270e] text-[9px] font-bold uppercase tracking-widest rounded-full whitespace-nowrap">
                The Total Package
              </div>
              <p className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest mb-4 mt-2">Blueprint</p>
              <div className="text-4xl font-serif text-[#c9ccbb] mb-1">
                €150<span className="text-base text-[#c9ccbb]/80 font-sans font-normal"> / month</span>
              </div>
              <p className="text-[#c9ccbb]/80 text-xs mb-6">Cancel anytime</p>
              <h3 className="text-lg font-serif text-[#c9ccbb] mb-5">Change your environment</h3>
              <ul className="space-y-3 mb-8 flex-1">
                {[
                  { text: "Everything in Core", muted: true },
                  { text: "Full Room Audit across six neural domains with one priority room assessment per month", muted: false },
                  { text: "Sensory Coaching Modules", muted: false },
                  { text: "Priority practitioner response within 48 hours", muted: false },
                ].map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs leading-snug">
                    <CheckCircle size={12} className="text-[#b5a642] shrink-0 mt-0.5" />
                    <span className={f.muted ? "text-[#c9ccbb]/80 italic" : "text-[#c9ccbb]/70"}>{f.text}</span>
                  </li>
                ))}
              </ul>
              <div className="mb-6 p-4 rounded-xl bg-[#1b270e]/60 border border-[#b5a642]/15 flex items-start gap-3">
                <MessageCircle size={14} className="text-[#b5a642] shrink-0 mt-0.5" />
                <p className="text-[#c9ccbb]/70 text-[10px] leading-relaxed">
                  <strong className="text-[#c9ccbb]/80 block mb-0.5">48-hour practitioner response</strong>
                  Submit questions directly to Lolade. When the platform reaches its limit, you have a human expert in your corner.
                </p>
              </div>
              <Link
                href="/assessments/step0"
                className="w-full py-3.5 rounded-xl text-center font-bold text-xs uppercase tracking-widest bg-[#b5a642] text-[#1b270e] hover:bg-white transition-all"
              >
                Start Blueprint Programme
              </Link>
            </div>

          </div>

          <p className="text-center text-[#c9ccbb]/85 text-xs mt-8">
            Start with the free assessment. Your score will be ready in approximately ten minutes.
          </p>
        </div>
      </section>

      {/* ── SECTION 8: TRUST ARCHITECTURE ────────────────────────────────── */}
      <section className="py-20 px-6 max-w-4xl mx-auto">
        <div className="glass-panel p-10 md:p-12 rounded-3xl border border-[#c9ccbb]/10">
          <p className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest mb-6">The methodology</p>
          <h2 className="text-2xl font-serif text-[#c9ccbb] mb-6 leading-snug">
            Built on Neuroscience and Environmental Psychology and Sensory Processing
          </h2>
          <div className="space-y-4 text-[#c9ccbb]/80 text-sm leading-relaxed mb-10">
            <p>
              The Sentient Home draws on neuroscience, environmental psychology, stress physiology, circadian biology, and inpired by the foundational research of Dr. Esther Sternberg on the relationship between physical space and nervous system health.
            </p>
            <p>
              The scoring engine evaluates your home across five measurable domains, producing a calibrated NeuroLoad Score™ based on your individual sensory profile, not a generic average. Your Integration Pattern — Integrative, Variable, or Accumulative — determines how your score is weighted and how recommendations are sequenced.
            </p>
            <p className="text-[#c9ccbb]/80 font-serif italic text-base border-l-2 border-[#b5a642]/30 pl-5">
              This is a pre-aesthetic diagnostic framework. It is not concerned with how your home looks. It is concerned with what your home is asking of your nervous system.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-[#c9ccbb]/10">
            {[
              { label: 'Five scored domains', sub: 'Per individual sensory profile' },
              { label: 'Three sensory profiles', sub: 'Anchor · Seeker · Sensor' },
              { label: 'Three integration patterns', sub: 'Integrative · Variable · Accumulative' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="text-xl font-serif text-[#c9ccbb] mb-1.5">{item.label}</div>
                <div className="text-[#c9ccbb]/80 text-[10px] uppercase tracking-widest">{item.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER CTA ────────────────────────────────────────────────────── */}
      <section className="py-32 border-t border-[#c9ccbb]/5 text-center bg-gradient-to-t from-[#000]/40 to-transparent px-6">
        <p className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest mb-6">
          Your home is affecting your nervous system right now
        </p>
        <h2 className="text-4xl md:text-5xl font-serif mb-6 max-w-2xl mx-auto leading-tight">
          Find out what it is doing.<br />
          <span className="text-[#b5a642]">Then change it.</span>
        </h2>
        <p className="text-[#c9ccbb]/80 mb-12 max-w-md mx-auto text-sm leading-relaxed">
          You don't need more willpower. You need a space designed for how you're actually wired.
        </p>
        <Link
          href="/assessments/step0"
          className="inline-flex items-center gap-2 px-10 py-5 bg-[#b5a642] text-[#1b270e] rounded-full font-bold uppercase tracking-widest hover:bg-[#d4c55e] transition-all"
        >
          Take the Free Assessment <ArrowRight size={18} />
        </Link>
        <p className="text-[#c9ccbb]/70 text-[10px] uppercase tracking-widest mt-5">
          10 minutes · No design knowledge needed · No credit card required
        </p>
      </section>

      {/* ── LEGAL FOOTER ──────────────────────────────────────────────────── */}
      <footer className="py-12 border-t border-[#c9ccbb]/5 bg-[#141d0b]">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-[#c9ccbb]/60 text-xs font-bold uppercase tracking-widest">
            © 2026 The Sentient Home. All rights reserved.
          </div>
          <div className="flex gap-8">
            <a href="https://www.lolade-ajai.com/privacypolicy" target="_blank" rel="noopener noreferrer" className="text-[#c9ccbb]/60 hover:text-[#b5a642] text-xs font-bold uppercase tracking-widest transition-colors">
              Privacy Policy
            </a>
            <a href="https://www.lolade-ajai.com/termsandconditions" target="_blank" rel="noopener noreferrer" className="text-[#c9ccbb]/60 hover:text-[#b5a642] text-xs font-bold uppercase tracking-widest transition-colors">
              Terms of Service
            </a>
            <a href="mailto:lolade.ajai@lolade-ajai.com" className="text-[#c9ccbb]/60 hover:text-[#b5a642] text-xs font-bold uppercase tracking-widest transition-colors">
              Contact Support
            </a>
          </div>
        </div>
      </footer>

    </div>
  )
}
