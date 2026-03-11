'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronRight, ChevronLeft, ScanLine, GitCompare, Layers, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface RoomAuditExplainerProps {
  onClose: () => void
}

const screens = [
  {
    index: 0,
    eyebrow: 'What The Room Audit Is',
    headline: 'Your data, made\nvisible in your space.',
    body: [
      "Everything you have logged — your morning tension, your sleep interruptions, your focus levels, your BSFI scores — has been building a picture of how your home is affecting your nervous system.",
      "The Room Audit is where that picture becomes concrete. It scans one priority room across six neural domains and returns a precise, data-grounded reading of what that space is asking your nervous system to absorb.",
      "This is not the beginning of the process. It is the moment where the process becomes legible.",
    ],
    footnote: null,
  },
  {
    index: 1,
    eyebrow: 'The Two-Scan Protocol',
    headline: 'Scan one.\nFour weeks.\nScan two.',
    body: [
      "Each month, you dedicate both scans to one priority room — the space your daily logs and BSFI data most consistently flag as a friction source.",
      "Your first scan establishes the baseline: what the room is currently asking of your amygdala, your vagal system, your circadian rhythm, and three other neural domains. That score is your starting point.",
      "Over the following four weeks, your coaching modules give you the targeted interventions. Your neuroflashcards explain the science behind each change. Your daily logs track whether your body is responding. Then your second scan measures what actually shifted.",
    ],
    footnote: 'Two scans per month are allocated to one room deliberately. Splitting scans across multiple rooms fragments the baseline and makes the delta unreadable.',
  },
  {
    index: 2,
    eyebrow: 'How The Ecosystem Feeds It',
    headline: 'The logs, modules,\nand cards do the work.\nThe audit shows it.',
    body: [
      "Your daily logs are not just a tracking habit — they are the longitudinal evidence base. When your second scan returns a higher alignment score, your logs show you the specific days and conditions that produced it.",
      "Your coaching modules supply the intervention logic: what to change, in what order, and why it matters neurologically. Your neuroflashcards keep the science accessible between sessions so the changes you make are grounded, not guesswork.",
      "The Room Audit doesn't tell you what to do. The rest of the platform does that. What the audit does is hold up a mirror — and show you, in measurable terms, that the work you've been doing has changed something real.",
    ],
    footnote: null,
  },
]

export default function RoomAuditExplainer({ onClose }: RoomAuditExplainerProps) {
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(1)

  const goTo = (idx: number) => {
    setDirection(idx > current ? 1 : -1)
    setCurrent(idx)
  }

  const next = () => { if (current < screens.length - 1) goTo(current + 1) }
  const prev = () => { if (current > 0) goTo(current - 1) }

  const isLast = current === screens.length - 1
  const screen = screens[current]

  const variants = {
    enter:  (dir: number) => ({ opacity: 0, x: dir > 0 ? 32 : -32 }),
    center: { opacity: 1, x: 0 },
    exit:   (dir: number) => ({ opacity: 0, x: dir > 0 ? -32 : 32 }),
  }

  const icons = [<ScanLine size={15} />, <Layers size={15} />, <GitCompare size={15} />]

  return (
    // ─────────────────────────────────────────────────────────────────────────
    // FIX: md:left-64 offsets the backdrop by the sidebar width on desktop.
    // On mobile (< md breakpoint) the sidebar collapses so inset-0 is correct.
    // The sidebar component itself is untouched.
    // ─────────────────────────────────────────────────────────────────────────
    <div className="fixed inset-0 md:left-64 z-[100] flex items-center justify-center bg-[#1b270e]/40 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg relative"
      >
        <div
          className="relative rounded-3xl border overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(181,166,66,0.18) 0%, rgba(181,166,66,0.06) 30%, rgba(0,0,0,0.25) 60%, rgba(181,166,66,0.10) 100%)',
            backdropFilter: 'blur(12px) saturate(1.4)',
            WebkitBackdropFilter: 'blur(12px) saturate(1.4)',
            borderColor: 'rgba(181,166,66,0.35)',
            boxShadow: 'inset 0 1px 0 rgba(181,166,66,0.30), inset 0 -1px 0 rgba(0,0,0,0.40), inset 1px 0 0 rgba(181,166,66,0.12), 0 8px 32px rgba(0,0,0,0.35), 0 0 0 1px rgba(181,166,66,0.08)',
          }}
        >
          {/* OVERLAY 1 */}
          <div className="absolute top-0 left-0 w-48 h-48 pointer-events-none" style={{ background: 'radial-gradient(ellipse at top left, rgba(181,166,66,0.22) 0%, transparent 70%)' }} />
          {/* OVERLAY 2 */}
          <div className="absolute bottom-0 right-0 w-56 h-40 pointer-events-none" style={{ background: 'radial-gradient(ellipse at bottom right, rgba(0,0,0,0.40) 0%, transparent 70%)' }} />
          {/* OVERLAY 3 */}
          <div className="absolute top-0 left-0 right-0 h-px pointer-events-none" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(181,166,66,0.60) 40%, rgba(255,255,255,0.15) 55%, rgba(181,166,66,0.30) 70%, transparent 100%)' }} />

          {/* CLOSE */}
          <button onClick={onClose} className="absolute top-5 right-5 z-20 w-7 h-7 rounded-full flex items-center justify-center text-[#c9ccbb]/30 hover:text-[#b5a642] hover:bg-[#b5a642]/10 transition-all duration-200">
            <X size={14} />
          </button>

          {/* DOTS */}
          <div className="absolute top-[22px] left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
            {screens.map((_, i) => (
              <button key={i} onClick={() => goTo(i)} style={{ borderRadius: 4, width: i === current ? 18 : 6, height: 5, background: i === current ? 'rgba(181,166,66,1)' : 'rgba(181,166,66,0.22)', border: 'none', cursor: 'pointer', padding: 0, transition: 'all 0.3s ease' }} />
            ))}
          </div>

          {/* CONTENT */}
          <div className="relative z-10 px-8 pt-14 pb-6 min-h-[400px] flex flex-col">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                className="flex-1 flex flex-col"
              >
                <div className="flex items-center gap-2 mb-5">
                  <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border inline-flex items-center gap-2" style={{ borderColor: 'rgba(181,166,66,0.40)', color: 'rgba(181,166,66,1)', background: 'rgba(181,166,66,0.10)' }}>
                    {icons[screen.index]}
                    {screen.eyebrow}
                  </span>
                </div>

                <h2 className="text-[22px] font-serif text-[#c9ccbb] leading-snug mb-5 whitespace-pre-line">
                  {screen.headline}
                </h2>

                <div className="mb-5" style={{ width: 28, height: 1, background: 'linear-gradient(90deg, rgba(181,166,66,0.60), transparent)' }} />

                <div className="space-y-3 flex-1">
                  {screen.body.map((para, i) => (
                    <p key={i} className="text-xs leading-relaxed" style={{ color: 'rgba(201,204,187,0.80)' }}>{para}</p>
                  ))}
                </div>

                {screen.footnote && (
                  <p className="mt-5 pt-4 text-[10px] leading-relaxed italic" style={{ borderTop: '1px solid rgba(181,166,66,0.12)', color: 'rgba(201,204,187,0.40)' }}>
                    {screen.footnote}
                  </p>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* FOOTER */}
          <div className="relative z-10 px-8 pb-8 pt-5" style={{ borderTop: '1px solid rgba(181,166,66,0.20)' }}>
            {isLast ? (
              <div className="flex flex-col gap-2.5">
                <Link
                  href="/upgrade"
                  onClick={onClose}
                  className="w-full py-3.5 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-200 hover:bg-white"
                  style={{ background: 'rgba(181,166,66,1)', color: '#1b270e', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15), 0 4px 20px rgba(181,166,66,0.25)', display: 'flex' }}
                >
                  Unlock The Room Audit <ArrowRight size={13} />
                </Link>
                <button onClick={onClose} className="w-full py-2.5 text-[10px] font-bold uppercase tracking-widest transition-colors hover:text-[#c9ccbb]/50" style={{ color: 'rgba(201,204,187,0.28)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  Not Yet
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <button onClick={prev} className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest transition-colors hover:text-[#b5a642]" style={{ color: current === 0 ? 'transparent' : 'rgba(201,204,187,0.40)', background: 'none', border: 'none', cursor: current === 0 ? 'default' : 'pointer', pointerEvents: current === 0 ? 'none' : 'auto' }}>
                  <ChevronLeft size={13} /> Back
                </button>
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest cursor-pointer transition-colors hover:text-[#b5a642]" onClick={next} style={{ color: 'rgba(201,204,187,0.80)' }}>
                  Continue <ChevronRight size={13} />
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
