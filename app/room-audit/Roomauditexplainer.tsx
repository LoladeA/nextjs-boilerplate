'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronRight, ChevronLeft, ScanLine, GitCompare, Sparkles, ArrowRight, Camera, Layers } from 'lucide-react'
import Link from 'next/link'

interface RoomAuditExplainerProps {
  onClose: () => void
}

const screens = [
  {
    index: 0,
    eyebrow: 'How The Room Audit Works',
    headline: 'You already feel\nwhich room isn\'t working.',
    body: `You don't need to think hard about which room to start with. There is usually one space in a home that costs more than it gives — a room you leave feeling worse than when you entered, or avoid without being able to fully explain why.\n\nThat is your starting point.\n\nThe Room Audit doesn't ask you to redesign it. It asks you to understand it — and then make one set of targeted, evidence-based changes to the sensory conditions that are generating friction.`,
    icon: <ScanLine size={16} />,
    footnote: null,
  },
  {
    index: 1,
    eyebrow: 'The Process',
    headline: 'Before. Two weeks.\nAfter.',
    body: `You begin with a before snapshot: your BSFI readings for the period, your environmental measurements for that room, and a brief record of how you actually feel inside it — your cognitive clarity, emotional ease, and physical comfort.\n\nOver two weeks, guided by the NeuroDesign Blueprint™, you make specific, targeted changes. Not aesthetic ones. Functional ones — the light temperature, the acoustic boundary, the thermal comfort, the spatial clarity of what you see first when you enter.\n\nAt the end of the two weeks, you take an after snapshot. The platform cross-references it with your logged experience and shows you exactly what shifted — and what produced the shift.`,
    icon: <Layers size={16} />,
    footnote: 'Two weeks is not arbitrary. It is the minimum time required for your nervous system to genuinely recalibrate to a changed environment rather than simply register that something is different.',
  },
  {
    index: 2,
    eyebrow: 'What You Walk Away With',
    headline: 'A room that supports you.\nAnd the knowledge to do it again.',
    body: `Most people change their homes based on how things look. They add, remove, repaint, rearrange, without ever knowing whether the change addressed the thing that was actually draining them.\n\nThe Room Audit closes that loop. Every change you make is tied to a measurable environmental variable. Every shift in how you feel is cross-referenced with the data you logged. You don't have to guess whether it worked. You can see it.\n\nOne room becomes a proof of concept. The second room becomes easier. By the third, you are not decorating. You are building a home designed around how you are actually wired.`,
    icon: <GitCompare size={16} />,
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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#000]/80 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg relative"
      >
        <div
          className="rounded-3xl border border-[#b5a642]/25 relative overflow-hidden"
          style={{
            background: 'linear-gradient(140deg, rgba(27,39,14,0.98) 0%, rgba(16,24,8,0.99) 100%)',
            boxShadow: '0 0 0 1px rgba(181,166,66,0.07) inset, 0 32px 64px rgba(0,0,0,0.65), 0 0 80px rgba(181,166,66,0.04)',
            backdropFilter: 'blur(20px) saturate(1.4)',
          }}
        >
          {/* AMBIENT GLOW */}
          <div className="absolute -top-20 -right-20 w-56 h-56 bg-[#b5a642]/6 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-[#b5a642]/4 rounded-full blur-3xl pointer-events-none" />

          {/* CLOSE */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 z-20 text-[#c9ccbb]/25 hover:text-[#b5a642] transition-colors p-2 rounded-full hover:bg-[#b5a642]/10"
          >
            <X size={15} />
          </button>

          {/* PROGRESS DOTS */}
          <div className="absolute top-5 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
            {screens.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === current
                    ? 'w-5 h-1.5 bg-[#b5a642]'
                    : 'w-1.5 h-1.5 bg-[#b5a642]/20 hover:bg-[#b5a642]/40'
                }`}
              />
            ))}
          </div>

          {/* CONTENT */}
          <div className="px-8 pt-14 pb-6 min-h-[400px] flex flex-col">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
                className="flex-1 flex flex-col"
              >
                {/* EYEBROW */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-full bg-[#b5a642]/12 flex items-center justify-center text-[#b5a642]">
                    {screen.icon}
                  </div>
                  <span className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest">
                    {screen.eyebrow}
                  </span>
                </div>

                {/* HEADLINE */}
                <h2 className="text-[22px] font-serif text-[#c9ccbb] leading-snug mb-4 whitespace-pre-line">
                  {screen.headline}
                </h2>

                {/* RULE */}
                <div className="w-8 h-px bg-[#b5a642]/35 mb-4" />

                {/* BODY */}
                <div className="space-y-3 flex-1">
                  {screen.body.split('\n\n').map((para, i) => (
                    <p key={i} className="text-[#c9ccbb]/60 text-[13px] leading-relaxed">
                      {para}
                    </p>
                  ))}
                </div>

                {/* FOOTNOTE */}
                {screen.footnote && (
                  <p className="mt-5 pt-4 border-t border-[#b5a642]/10 text-[#c9ccbb]/35 text-[10px] leading-relaxed italic">
                    {screen.footnote}
                  </p>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* NAV / CTA */}
          <div className="px-8 pb-8">
            <div className="w-full h-px bg-[#b5a642]/10 mb-5" />

            {isLast ? (
              <div className="space-y-2.5">
                <Link href="/upgrade" onClick={onClose}>
                  <button className="w-full py-3.5 bg-[#b5a642] text-[#1b270e] text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-white transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-[#b5a642]/15">
                    Unlock The Room Audit
                    <ArrowRight size={13} />
                  </button>
                </Link>
                <button
                  onClick={onClose}
                  className="w-full py-2.5 text-[#c9ccbb]/30 text-[10px] font-bold uppercase tracking-widest hover:text-[#c9ccbb]/50 transition-colors"
                >
                  Not Yet
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <button
                  onClick={prev}
                  className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest transition-colors ${
                    current === 0
                      ? 'opacity-0 pointer-events-none'
                      : 'text-[#c9ccbb]/35 hover:text-[#b5a642]'
                  }`}
                >
                  <ChevronLeft size={13} /> Back
                </button>
                <button
                  onClick={next}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl border border-[#b5a642]/25 text-[#b5a642] text-[10px] font-bold uppercase tracking-widest hover:bg-[#b5a642]/8 transition-all"
                >
                  Continue <ChevronRight size={13} />
                </button>
              </div>
            )}
          </div>

        </div>
      </motion.div>
    </div>
  )
}
