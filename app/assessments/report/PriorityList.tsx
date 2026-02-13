'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Zap, Activity, Brain, Eye, Moon } from 'lucide-react'

// --- THE WARM WISDOM DICTIONARY ---
const insightContent: any = {
  ali: { // Autonomic Load
    title: "The Dorsal Seat (The Protected Spot)",
    concept: "Think of this as your 'recharging station'.",
    why: "When you sit with your back to an open room or a door, part of your brain stays on alert, watching what it can't see behind you. This drains your energy without you realising it.",
    how: [
      "Put the solid back of a chair against a solid wall.",
      "Face the room so you can easily see the entrance without turning your head."
    ],
    feeling: "When you sit here, your nervous system gets a silent signal: 'I am safe. I don't need to watch my back.' This allows you to truly exhale and rest.",
    icon: <Activity size={18} />
  },
  cii: { // Circadian Rhythm
    title: "The Morning Anchor",
    concept: "Think of this as your body's 'Start Button'.",
    why: "Light is the primary signal that tells your body what time it is. Without a clear morning signal, your biological clock drifts, leaving you tired in the day but 'wired' at night.",
    how: [
      "Within 30 minutes of waking, stand near an open window or step outside. The fewer barriers there are between you and those lovely photons, the better.",
      "Spend 2–5 minutes viewing the sky (low-angle morning sunlight) to lock in your energy cycle."
    ],
    feeling: "A clear head in the morning and a natural, heavy wave of sleepiness when the sun goes down.",
    icon: <Zap size={18} />
  },
  pli: { // Predictive Legibility
    title: "The Visual Quiet Zone",
    concept: "Think of this as a 'landing pad' for your eyes.",
    why: "Clutter and undefined spaces force your brain to micro-process thousands of tiny details constantly. It is like having too many browser tabs open in your mind.",
    how: [
      "Choose just one surface (a coffee table, a nightstand, a feature wall).",
      "Decorate with your favourite piece of art, lamp...anything you resonate deeply with. Keep it sacred.",
      "Let this be the place your eyes rest when the room feels loud."
    ],
    feeling: "A visual exhale. A sense of space and breath in a busy room.",
    icon: <Brain size={18} />
  },
  stl: { // Sensory Load
    title: "The Soft Layer",
    concept: "Think of this as a 'mute button' for your room.",
    why: "Hard surfaces (glass, concrete, stone) reflect sound, creating a 'noise mirror' that keeps your nervous system on high alert for sudden changes.",
    how: [
      "Add one sound absorber to your main room.",
      "Use a heavy throw blanket, a plush rug, or thick curtains. Remember to use non toxic materials.",
      "Soft materials catch the sharp frequencies that trigger stress."
    ],
    feeling: "The room feels warmer, quieter, and more like a hug than a cave.",
    icon: <Eye size={18} />
  },
  rci: { // Recovery Support
    title: "The Thermal Signal",
    concept: "Think of this as your 'hibernation mode'.",
    why: "To enter deep restorative sleep, your core body temperature must drop. A room that is too warm or too cold keeps your biological engine running too fast.",
    how: [
      "Drop your bedroom temperature to around 18°C (65°F) one hour before bed.",
      "Open a window or use a fan if needed to circulate fresh air."
    ],
    feeling: "Heavy eyelids and a deeper, unbroken sleep cycle.",
    icon: <Moon size={18} />
  }
}

export default function PriorityList({ areas }: { areas: any[] }) {
  // Track which card is open (by ID)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const toggle = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <div className="space-y-4">
      {areas.map((area) => {
        const content = insightContent[area.id] || insightContent['ali']
        const isOpen = expandedId === area.id

        return (
          <div 
            key={area.id}
            onClick={() => toggle(area.id)}
            className={`
              group rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden
              ${isOpen 
                ? 'bg-[#1b270e] border-[#b5a642]/40 shadow-lg shadow-[#b5a642]/10' 
                : 'bg-[#1b270e] border-[#b5a642]/20 hover:border-[#b5a642]/40'
              }
            `}
          >
            {/* HEADER (Always Visible) */}
            <div className="p-6 md:p-8 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center transition-colors
                  ${isOpen ? 'bg-[#b5a642] text-[#1b270e]' : 'bg-[#b5a642]/10 text-[#b5a642]'}
                `}>
                  {content.icon}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className={`font-serif text-lg ${isOpen ? 'text-[#b5a642]' : 'text-[#c9ccbb]'}`}>
                      {content.title}
                    </h3>
                    {!isOpen && (
                       <span className="hidden md:inline-flex px-2 py-0.5 rounded bg-[#b5a642]/10 text-[#b5a642] text-[10px] font-bold uppercase tracking-widest">
                         Needs Support
                       </span>
                    )}
                  </div>
                  {!isOpen && (
                    <p className="text-[#c9ccbb]/80 text-sm line-clamp-1">
                      {content.concept}
                    </p>
                  )}
                </div>
              </div>

              <ChevronDown 
                className={`text-[#c9ccbb]/80 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#b5a642]' : ''}`} 
              />
            </div>

            {/* EXPANDABLE BODY (The Warm Wisdom) */}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 md:px-8 pb-8 pt-0">
                    <div className="h-px w-full bg-[#b5a642]/10 mb-6" />
                    
                    <div className="grid md:grid-cols-2 gap-8">
                      {/* LEFT: Context */}
                      <div className="space-y-6">
                        <div>
                          <p className="text-[#b5a642] text-xs font-bold uppercase tracking-widest mb-2">Think of this as</p>
                          <p className="text-[#c9ccbb] text-lg font-serif italic">"{content.concept}"</p>
                        </div>
                        <div>
                          <p className="text-[#b5a642] text-xs font-bold uppercase tracking-widest mb-2">Why you need it</p>
                          <p className="text-[#c9ccbb]/80 text-sm leading-relaxed">{content.why}</p>
                        </div>
                      </div>

                      {/* RIGHT: Action & Feeling */}
                      <div className="space-y-6">
                        <div className="bg-[#b5a642]/5 rounded-xl p-5 border border-[#b5a642]/10">
                          <p className="text-[#b5a642] text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                             How to create it
                          </p>
                          <ul className="space-y-2">
                            {content.how.map((step: string, i: number) => (
                              <li key={i} className="flex gap-3 text-sm text-[#c9ccbb]/80 leading-relaxed">
                                <span className="text-[#b5a642]/50">•</span> {step}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <p className="text-[#b5a642] text-xs font-bold uppercase tracking-widest mb-2">The Feeling</p>
                          <p className="text-[#c9ccbb]/80 text-sm leading-relaxed">{content.feeling}</p>
                        </div>
                      </div>
                    </div>

                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
