'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Activity, Zap, RefreshCw, X, BookOpen, Sparkles, Brain, Home } from 'lucide-react'

interface Props {
  isOpen:   boolean
  onClose:  () => void
}

export default function HowItWorksModal({ isOpen, onClose }: Props) {

  const overlayVariants = {
    hidden:  { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } }
  }

  const modalVariants = {
    hidden:  { opacity: 0, scale: 0.95, y: 10 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
    exit:    { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.4, ease: 'easeIn' } }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

          {/* Backdrop */}
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={overlayVariants}
            onClick={onClose}
            className="absolute inset-0 bg-[#1b270e]/90 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={modalVariants}
            className="relative w-full max-w-4xl bg-[#1b270e] border border-[#b5a642]/30 rounded-3xl shadow-2xl shadow-[#b5a642]/10 overflow-hidden"
          >
            {/* Background glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#b5a642]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <div className="p-8 md:p-12 relative z-10 max-h-[90vh] overflow-y-auto">

              {/* ============================================================
                  HEADER
              ============================================================ */}
              <div className="flex justify-between items-start mb-10">
                <div className="max-w-xl">
                  <p className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest mb-3">
                    How It Works
                  </p>
                  <h2 className="text-[#c9ccbb] font-serif text-3xl mb-4">
                    Your home is in a constant conversation with your nervous system.
                  </h2>
                  <p className="text-[#c9ccbb]/70 text-sm leading-relaxed">
                    Most people experience that conversation as a feeling they cannot name: low energy in a space that looks fine, difficulty focusing in a room they designed to work in, a persistent sense of friction with no obvious cause. The Sentient Home gives that feeling a precise explanation and a structured path forward.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-[#c9ccbb]/5 text-[#c9ccbb]/40 hover:text-[#b5a642] transition-colors shrink-0 ml-6"
                >
                  <X size={24} />
                </button>
              </div>

              {/* ============================================================
                  SECTION 1: THE FOUR PHASES
              ============================================================ */}
              <div className="mb-10">
                <p className="text-[#c9ccbb]/40 text-[10px] font-bold uppercase tracking-widest mb-6">
                  The complete system
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* PHASE 1: CALIBRATE */}
                  <div className="p-6 rounded-2xl border border-[#c9ccbb]/10 bg-[#c9ccbb]/5 hover:border-[#b5a642]/30 transition-colors">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-[#b5a642]/10 text-[#b5a642] flex items-center justify-center shrink-0">
                        <Brain size={18} />
                      </div>
                      <div>
                        <p className="text-[#b5a642] text-[9px] font-bold uppercase tracking-widest">Phase 1</p>
                        <h3 className="text-[#c9ccbb] font-bold text-sm">Know Your System</h3>
                      </div>
                    </div>
                    <p className="text-[#c9ccbb]/70 text-xs leading-relaxed">
                      The NeuroLens Assessment takes about ten minutes and produces your Sensory Profile: a precise description of how your nervous system processes environmental input, how much load it can carry before it starts to strain, and whether it clears that load between exposures or carries it forward into the next day. This is your nervous system fingerprint. Everything else the platform does is calibrated to it.
                    </p>
                  </div>

                  {/* PHASE 2: TRACK */}
                  <div className="p-6 rounded-2xl border border-[#c9ccbb]/10 bg-[#c9ccbb]/5 hover:border-[#b5a642]/30 transition-colors">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-[#b5a642]/10 text-[#b5a642] flex items-center justify-center shrink-0">
                        <Activity size={18} />
                      </div>
                      <div>
                        <p className="text-[#b5a642] text-[9px] font-bold uppercase tracking-widest">Phase 2</p>
                        <h3 className="text-[#c9ccbb] font-bold text-sm">Track Your Rhythm</h3>
                      </div>
                    </div>
                    <p className="text-[#c9ccbb]/70 text-xs leading-relaxed">
                      A brief morning and evening log captures how your nervous system is moving through the day. These entries take under two minutes each and build a 14-day picture of your autonomic rhythm, your sensory load, and your recovery quality across time. A single snapshot tells you where you are. Fourteen days of data tells you what your environment is actually doing to you.
                    </p>
                  </div>

                  {/* PHASE 3: UNDERSTAND */}
                  <div className="p-6 rounded-2xl border border-[#c9ccbb]/10 bg-[#c9ccbb]/5 hover:border-[#b5a642]/30 transition-colors">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-[#b5a642]/10 text-[#b5a642] flex items-center justify-center shrink-0">
                        <BookOpen size={18} />
                      </div>
                      <div>
                        <p className="text-[#b5a642] text-[9px] font-bold uppercase tracking-widest">Phase 3</p>
                        <h3 className="text-[#c9ccbb] font-bold text-sm">Understand the Pattern</h3>
                      </div>
                    </div>
                    <p className="text-[#c9ccbb]/70 text-xs leading-relaxed">
                      Your daily logs feed the synthesis engine, which translates your 14-day rhythm into a plain-language interpretation of what is happening and why. The Neuroflashcards give you daily environmental intelligence calibrated to your profile and your current state. The Insights Library provides the research context behind every recommendation so you are not just following instructions; you are building a lasting understanding of how your environment shapes your capacity.
                    </p>
                  </div>

                  {/* PHASE 4: TRANSFORM */}
                  <div className="p-6 rounded-2xl border border-[#c9ccbb]/10 bg-[#c9ccbb]/5 hover:border-[#b5a642]/30 transition-colors">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-[#b5a642]/10 text-[#b5a642] flex items-center justify-center shrink-0">
                        <Home size={18} />
                      </div>
                      <div>
                        <p className="text-[#b5a642] text-[9px] font-bold uppercase tracking-widest">Phase 4</p>
                        <h3 className="text-[#c9ccbb] font-bold text-sm">Change Your Environment</h3>
                      </div>
                    </div>
                    <p className="text-[#c9ccbb]/70 text-xs leading-relaxed">
                      The Room Audit connects your profile to your physical space. It reads your room across six neural domains and tells you what the space is costing your specific nervous system to occupy, what is generating that cost, and what to change first. The Coaching Curriculum gives you the structured methodology to act on those findings across a six to seven month arc, moving from immediate adjustments to deep environmental redesign.
                    </p>
                  </div>

                </div>
              </div>

              {/* ============================================================
                  SECTION 2: WHY IT WORKS
              ============================================================ */}
              <div className="mb-10 p-6 rounded-2xl bg-[#000]/20 border border-[#b5a642]/15">
                <p className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest mb-3">
                  Why the system works
                </p>
                <p className="text-[#c9ccbb]/80 text-sm leading-relaxed mb-4">
                  Every layer of the platform feeds every other layer. Your assessment profile calibrates your daily logs. Your daily logs produce the 14-day synthesis. The synthesis informs your Neuroflashcard recommendations. Your room audit is weighted by your profile so the findings reflect what the space costs you specifically, not what it costs a generic occupant. Your coaching curriculum is built around the same principles the audit is measuring.
                </p>
                <p className="text-[#c9ccbb]/60 text-sm leading-relaxed">
                  The platform rewards consistent use with genuine depth. A user who logs daily for two weeks gets a synthesis that a user who logs once cannot access. A user who completes the room audit after six weeks of daily logging has a richer environmental picture than one who audits on day one. Nothing is standalone. Everything compounds.
                </p>
              </div>

              {/* ============================================================
                  SECTION 3: TIER COMPARISON
              ============================================================ */}
              <div className="mb-8">
                <p className="text-[#c9ccbb]/40 text-[10px] font-bold uppercase tracking-widest mb-6">
                  What each tier enables
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                  {/* FREE */}
                  <div className="p-5 rounded-2xl border border-[#c9ccbb]/10 bg-[#141d0b] flex flex-col">
                    <div className="mb-4">
                      <p className="text-[#c9ccbb]/40 text-[9px] font-bold uppercase tracking-widest mb-1">Free</p>
                      <h4 className="text-[#c9ccbb] font-serif text-lg">Know yourself</h4>
                    </div>
                    <div className="space-y-2.5 flex-1">
                      {[
                        'Your Sensory Profile and NeuroLoad Score',
                        'Sensory profile dashboard with baseline update assessments',
                        'Daily logs to track your nervous system rhythm',
                        'Morning, afternoon and evening protocols calibrated to your profile',
                        'Neuroflashcards: what is happening and why',
                        'Priority actions for your current state',
                        'Insights Library short reads'
                      ].map((item, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <div className="w-1 h-1 rounded-full bg-[#b5a642]/50 mt-1.5 shrink-0" />
                          <p className="text-[#c9ccbb]/60 text-[11px] leading-relaxed">{item}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-[#c9ccbb]/8">
                      <p className="text-[#c9ccbb]/40 text-[10px] leading-relaxed italic">
                        You have a framework. You know what your nervous system is and how it processes its environment.
                      </p>
                    </div>
                  </div>

                  {/* CORE */}
                  <div className="p-5 rounded-2xl border border-[#b5a642]/20 bg-[#141d0b] flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#b5a642]/5 rounded-full blur-2xl pointer-events-none" />
                    <div className="mb-4 relative z-10">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-[#b5a642] text-[9px] font-bold uppercase tracking-widest">Core</p>
                        <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-[#b5a642]/10 text-[#b5a642] border border-[#b5a642]/20">
                          29 euros/mo
                        </span>
                      </div>
                      <h4 className="text-[#c9ccbb] font-serif text-lg">Understand yourself</h4>
                    </div>
                    <div className="space-y-2.5 flex-1 relative z-10">
                      <p className="text-[#c9ccbb]/40 text-[9px] uppercase tracking-widest font-bold mb-1">Everything in Free, plus:</p>
                      {[
                        'Neuroflashcards: the how behind every recommendation',
                        '14-day nervous system synthesis in plain language',
                        'Neuropsychology context layer on your daily logs'
                      ].map((item, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <div className="w-1 h-1 rounded-full bg-[#b5a642] mt-1.5 shrink-0" />
                          <p className="text-[#c9ccbb]/70 text-[11px] leading-relaxed">{item}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-[#b5a642]/10 relative z-10">
                      <p className="text-[#c9ccbb]/50 text-[10px] leading-relaxed italic">
                        The platform becomes a learning system. You understand what your data means and how to act on it with precision.
                      </p>
                    </div>
                  </div>

                  {/* BLUEPRINT */}
                  <div className="p-5 rounded-2xl border border-[#b5a642]/30 bg-[#141d0b] flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-[#b5a642]/8 rounded-full blur-2xl pointer-events-none" />
                    <div className="mb-4 relative z-10">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-[#b5a642] text-[9px] font-bold uppercase tracking-widest">Blueprint</p>
                        <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-[#b5a642]/15 text-[#b5a642] border border-[#b5a642]/30">
                          150 euros/mo
                        </span>
                      </div>
                      <h4 className="text-[#c9ccbb] font-serif text-lg">Change your environment</h4>
                    </div>
                    <div className="space-y-2.5 flex-1 relative z-10">
                      <p className="text-[#c9ccbb]/40 text-[9px] uppercase tracking-widest font-bold mb-1">Everything in Core, plus:</p>
                      {[
                        'Room Audit: a precise environmental diagnosis calibrated to your profile',
                        '2 room scans per month with a curated product recommendation library',
                        'Six to seven month coaching curriculum: self-paced modules and quizzes',
                        'The complete NeuroDesign Blueprint methodology across seven principles',
                        'Structured progression from quick adjustments to full environmental redesign'
                      ].map((item, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <div className="w-1 h-1 rounded-full bg-[#b5a642] mt-1.5 shrink-0" />
                          <p className="text-[#c9ccbb]/80 text-[11px] leading-relaxed">{item}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-[#b5a642]/15 relative z-10">
                      <p className="text-[#c9ccbb]/60 text-[10px] leading-relaxed italic">
                        Internal understanding becomes external change. Your home is redesigned around how you are actually wired.
                      </p>
                    </div>
                  </div>

                </div>
              </div>

              {/* ============================================================
                  CLOSING STATEMENT
              ============================================================ */}
              <div className="mb-8 text-center px-4">
                <p className="text-[#c9ccbb]/50 text-sm leading-relaxed">
                  Most people blame themselves for how their home feels. This platform offers a different explanation: your environment has been asking more of your nervous system than it can sustainably give. The Sentient Home gives you the tools to change that, precisely and permanently.
                </p>
              </div>

              {/* CTA */}
              <div className="text-center">
                <button
                  onClick={onClose}
                  className="px-10 py-3 bg-[#b5a642] text-[#1b270e] font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-[#c4b550] transition-colors shadow-lg shadow-[#b5a642]/20"
                >
                  Begin Calibration
                </button>
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
