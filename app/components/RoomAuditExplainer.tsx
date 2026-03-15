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
    eyebrow: 'What the Room Audit Is',
    headline: 'Think of the room audit\nas your personal digital\ninterior designer.',
    body: [
      "Most environmental assessments measure a room against a generic standard. The Room Audit is different: it assesses your space in relation to your nervous system.",
      "It analyses your room across six neural domains, from how your visual system processes contrast and colour load to how your autonomic system responds to acoustic unpredictability and spatial exposure. It then applies your Sensory Profile to weigh up every finding according to what those conditions actually cost a nervous system like yours.",
      "The result is not just a number on a page. It is an interpretation of what this space is doing, how much it is costing you to be here and what the most important changes are.",
    ],
    footnote: null,
  },
  {
    index: 1,
    eyebrow: 'What You Get',
    headline: 'An interpretation\ncalibrated to how\nyou are wired.',
    body: [
      "The audit begins with a plain-language description of your space, written specifically for your profile. Two people with diffrerent sensory processing profiles in the same room will have very different experiences of it. The interpretation reflects this difference rather than averaging it out.",
      "Each design specification explains what needs to be changed and why this is important for your nervous system. Beneath each specification is a curated recommendation: a precise product specification matched to the desired outcome, with a direct link to source it.",
      "We visualise how this space will benefit your nervous system once the changes are in place. It is specific, grounded and written directly to you.",
    ],
    footnote: "Are you curious about the mechanism behind the findings? Open the 'Learn More' section in your results to see the full scoring logic.",
  },
  {
    index: 2,
    eyebrow: 'How It Works',
    headline: 'The audit works in synergy with\nwhat the rest of the\nplatform has been building.',
    body: [
      "Your daily logs form the basis of your longitudinal records. The patterns they capture over a rolling period of fourteen days provide the context that gives meaning to your audit findings, rather than making them seem isolated. The acoustic safety of a room is interpreted differently when your BSFI logs show consistent autonomic loading on the mornings you spend in it.",
      "Your sensory profile is the lens through which the engine weighs every domain it measures. The same wall colour, light source and acoustic conditions produce a different environmental cost for different profiles. Without your profile, the audit produces a room score. With your profile, however, the audit provides a personalised report.",
      "The system closes the loop at your second scan. Your logs will show how your nervous system has responded to the changes you have made. The second scan measures what has actually shifted in the space. The difference between the two scans is the evidence that your design strategy has had a real impact.",
    ],
    footnote: "Two scans per month are intentionally allocated to one priority room. Splitting scans across multiple rooms distorts the baseline and makes the before-and-after comparison difficult to interpret. It also allows for one intentional change at a time in one room or space.",
  },
]

export default function RoomAuditExplainer({ onClose }: RoomAuditExplainerProps) {
  const [current, setCurrent]     = useState(0)
  const [direction, setDirection] = useState(1)

  const goTo = (idx: number) => {
    setDirection(idx > current ? 1 : -1)
    setCurrent(idx)
  }

  const next = () => { if (current < screens.length - 1) goTo(current + 1) }
  const prev = () => { if (current > 0) goTo(current - 1) }

  const isLast  = current === screens.length - 1
  const screen  = screens[current]

  const variants = {
    enter:  (dir: number) => ({ opacity: 0, x: dir > 0 ? 32 : -32 }),
    center: { opacity: 1, x: 0 },
    exit:   (dir: number) => ({ opacity: 0, x: dir > 0 ? -32 : 32 }),
  }

  const icons = [
    <ScanLine size={15} />,
    <Layers size={15} />,
    <GitCompare size={15} />
  ]

  return (
    // Backdrop offset accounts for sidebar width on desktop
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
            background:          'linear-gradient(135deg, rgba(181,166,66,0.18) 0%, rgba(181,166,66,0.06) 30%, rgba(0,0,0,0.25) 60%, rgba(181,166,66,0.10) 100%)',
            backdropFilter:      'blur(12px) saturate(1.4)',
            WebkitBackdropFilter:'blur(12px) saturate(1.4)',
            borderColor:         'rgba(181,166,66,0.35)',
            boxShadow:           'inset 0 1px 0 rgba(181,166,66,0.30), inset 0 -1px 0 rgba(0,0,0,0.40), inset 1px 0 0 rgba(181,166,66,0.12), 0 8px 32px rgba(0,0,0,0.35), 0 0 0 1px rgba(181,166,66,0.08)',
          }}
        >
          {/* Glows */}
          <div className="absolute top-0 left-0 w-48 h-48 pointer-events-none" style={{ background: 'radial-gradient(ellipse at top left, rgba(181,166,66,0.22) 0%, transparent 70%)' }} />
          <div className="absolute bottom-0 right-0 w-56 h-40 pointer-events-none" style={{ background: 'radial-gradient(ellipse at bottom right, rgba(0,0,0,0.40) 0%, transparent 70%)' }} />
          <div className="absolute top-0 left-0 right-0 h-px pointer-events-none" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(181,166,66,0.60) 40%, rgba(255,255,255,0.15) 55%, rgba(181,166,66,0.30) 70%, transparent 100%)' }} />

          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 z-20 w-7 h-7 rounded-full flex items-center justify-center text-[#c9ccbb]/30 hover:text-[#b5a642] hover:bg-[#b5a642]/10 transition-all duration-200"
          >
            <X size={14} />
          </button>

          {/* Progress dots */}
          <div className="absolute top-[22px] left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
            {screens.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                style={{
                  borderRadius: 4,
                  width:        i === current ? 18 : 6,
                  height:       5,
                  background:   i === current ? 'rgba(181,166,66,1)' : 'rgba(181,166,66,0.22)',
                  border:       'none',
                  cursor:       'pointer',
                  padding:      0,
                  transition:   'all 0.3s ease'
                }}
              />
            ))}
          </div>

          {/* Screen content */}
          <div className="relative z-10 px-8 pt-14 pb-6 min-h-[440px] flex flex-col">
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
                {/* Eyebrow badge */}
                <div className="flex items-center gap-2 mb-5">
                  <span
                    className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border inline-flex items-center gap-2"
                    style={{
                      borderColor: 'rgba(181,166,66,0.40)',
                      color:       'rgba(181,166,66,1)',
                      background:  'rgba(181,166,66,0.10)'
                    }}
                  >
                    {icons[screen.index]}
                    {screen.eyebrow}
                  </span>
                </div>

                {/* Headline */}
                <h2 className="text-[22px] font-serif text-[#c9ccbb] leading-snug mb-5 whitespace-pre-line">
                  {screen.headline}
                </h2>

                {/* Divider */}
                <div className="mb-5" style={{ width: 28, height: 1, background: 'linear-gradient(90deg, rgba(181,166,66,0.60), transparent)' }} />

                {/* Body paragraphs */}
                <div className="space-y-3 flex-1">
                  {screen.body.map((para, i) => (
                    <p
                      key={i}
                      className="text-xs leading-relaxed"
                      style={{ color: 'rgba(201,204,187,0.80)' }}
                    >
                      {para}
                    </p>
                  ))}
                </div>

                {/* Footnote */}
                {screen.footnote && (
                  <p
                    className="mt-5 pt-4 text-[10px] leading-relaxed italic"
                    style={{
                      borderTop: '1px solid rgba(181,166,66,0.12)',
                      color:     screen.index === 1
                        ? 'rgba(181,166,66,0.55)'   // gold tint for the nerd note on screen 2
                        : 'rgba(201,204,187,0.40)'  // muted for the protocol note on screen 3
                    }}
                  >
                    {screen.footnote}
                  </p>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer navigation */}
          <div
            className="relative z-10 px-8 pb-8 pt-5"
            style={{ borderTop: '1px solid rgba(181,166,66,0.20)' }}
          >
            {isLast ? (
              <div className="flex flex-col gap-2.5">
                <Link
                  href="/upgrade"
                  onClick={onClose}
                  className="w-full py-3.5 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-200 hover:bg-white"
                  style={{
                    background: 'rgba(181,166,66,1)',
                    color:      '#1b270e',
                    boxShadow:  'inset 0 1px 0 rgba(255,255,255,0.15), 0 4px 20px rgba(181,166,66,0.25)',
                    display:    'flex'
                  }}
                >
                  Unlock The Room Audit <ArrowRight size={13} />
                </Link>
                <button
                  onClick={onClose}
                  className="w-full py-2.5 text-[10px] font-bold uppercase tracking-widest transition-colors hover:text-[#c9ccbb]/50"
                  style={{ color: 'rgba(201,204,187,0.28)', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Not Yet
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <button
                  onClick={prev}
                  className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest transition-colors hover:text-[#b5a642]"
                  style={{
                    color:         current === 0 ? 'transparent' : 'rgba(201,204,187,0.40)',
                    background:    'none',
                    border:        'none',
                    cursor:        current === 0 ? 'default' : 'pointer',
                    pointerEvents: current === 0 ? 'none' : 'auto'
                  }}
                >
                  <ChevronLeft size={13} /> Back
                </button>
                <div
                  className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest cursor-pointer transition-colors hover:text-[#b5a642]"
                  onClick={next}
                  style={{ color: 'rgba(201,204,187,0.80)' }}
                >
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
