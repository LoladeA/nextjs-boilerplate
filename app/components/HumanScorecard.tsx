'use client'

import { useState } from 'react'
import { Activity, Moon, Zap, ChevronDown, ChevronUp, ArrowRight, CheckCircle, Brain } from 'lucide-react'
import Link from 'next/link'

// Nuanced text based on the user's sensory hardware
const insightDictionary: any = {
  circadian: {
    anchor: "Your body relies on light signals to know when to release energy (cortisol) and when to rest (melatonin).",
    sensor: "Your system is highly sensitive to blue light. Evening brightness suppresses your melatonin faster than average.",
    seeker: "Your nervous system needs high-intensity morning light to jumpstart dopamine production and wakefulness."
  },
  autonomic: {
    anchor: "This measures vigilance: how much your brain is scanning for threats (sharp corners, open doors).",
    sensor: "Your 'threat detection' wires are set to high sensitivity. Unpredictable sounds or open spaces trigger low-level anxiety.",
    seeker: "Internal restlessness often projects outward. If the room feels 'boring' or restricting, your stress axis activates."
  },
  legibility: {
    anchor: "Your brain burns energy trying to make sense of clutter, disorganised layouts, or undefined spaces.",
    sensor: "Visual chaos acts like static noise for your brain, draining your cognitive battery rapidly.",
    seeker: "You need 'visual hooks' to stay focused. Undefined piles of clutter create distraction rather than cues."
  },
  sensory: {
    anchor: "The cumulative weight of noise, tactile irritation, and visual chaos on your baseline energy.",
    sensor: "Your sensory gating is open. You absorb more data (sound, texture, light) than others, leading to quicker overwhelm.",
    seeker: "A paradox: you crave stimulation but get distracted by chaos. You need 'curated intensity' not just background noise."
  },
  recovery: {
    anchor: "Does your home allow you to fully power down, or are you just 'off duty' but still running?",
    sensor: "Recovery for you requires 'sensory zero'—total absence of input (darkness, silence, weight).",
    seeker: "You struggle to switch off. True recovery requires somatic signals (heavy blankets, heat) to force the system down."
  }
}

export default function HumanScorecard({ scores, profile = 'anchor' }: { scores: any, profile?: string }) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  // Helper to safely get text
  const getText = (category: string) => {
    const safeProfile = (profile || 'anchor').toLowerCase()
    return insightDictionary[category][safeProfile] || insightDictionary[category]['anchor']
  }

  const metrics = [
    {
      id: 'circadian',
      label: 'Body Clock Alignment',
      icon: <Moon size={20} />,
      score: scores.circadian || 0, 
      max: 100,
      question: "Does your home support your sleep/wake cycle?",
      lowMsg: "Misaligned",
      highMsg: "In Sync",
      details: getText('circadian'),
      toolName: "Light Meter",
      toolLink: "/tools/light-meter"
    },
    {
      id: 'autonomic',
      label: 'Nervous System Safety',
      icon: <Activity size={20} />,
      score: scores.autonomic || 0,
      max: 100,
      question: "Can your body truly drop its guard here?",
      lowMsg: "High Alert",
      highMsg: "Calm",
      details: getText('autonomic'),
      toolName: "Safety Audit",
      toolLink: "/room-audit"
    },
    {
      id: 'legibility',
      label: 'Cognitive Flow', 
      icon: <Brain size={20} />,
      score: scores.legibility || 0,
      max: 100,
      question: "How hard does your brain work to navigate?",
      lowMsg: "High Friction",
      highMsg: "Intuitive",
      details: getText('legibility'),
      toolName: "Clarity Scan",
      toolLink: "/insights"
    },
    {
      id: 'sensory',
      label: 'Sensory Load',
      icon: <Zap size={20} />,
      score: scores.sensory || 0,
      max: 100,
      question: "Is the environment over-stimulating?",
      lowMsg: "Overload",
      highMsg: "Restorative",
      details: getText('sensory'),
      toolName: "Noise Meter",
      toolLink: "/progress"
    },
    {
      id: 'recovery',
      label: 'Recovery Potential',
      icon: <CheckCircle size={20} />,
      score: scores.recovery || 0,
      max: 100,
      question: "Does your home recharge your battery?",
      lowMsg: "Draining",
      highMsg: "Recharging",
      details: getText('recovery'),
      toolName: "Sleep Audit",
      toolLink: "/progress"
    }
  ]

  // All states use the Gold (#b5a642) palette
  const getStatus = (score: number) => {
      const goldPalette = { 
        color: "bg-[#b5a642]", 
        textCol: "text-[#b5a642]", 
        border: "border-[#b5a642]/30", 
        bg: "bg-[#b5a642]/5" 
      }

      if (score < 40) return { text: "Needs Support", ...goldPalette }
      if (score < 70) return { text: "Moderate", ...goldPalette }
      return { text: "Optimised", ...goldPalette }
  }

  return (
    <div className="space-y-4">
      {metrics.map((m) => {
        const status = getStatus(m.score)
        const isOpen = expandedId === m.id
        
        return (
          <div 
            key={m.id} 
            className={`
                glass-panel rounded-2xl border transition-all duration-300 overflow-hidden
                ${isOpen ? `bg-[#1b270e]/60 ${status.border}` : 'border-[#c9ccbb]/10 bg-[#1b270e]/40'}
            `}
          >
            
            {/* CLICKABLE HEADER */}
            <div 
                onClick={() => toggleExpand(m.id)}
                className="p-6 cursor-pointer flex flex-col gap-4"
            >
                <div className="flex justify-between items-start">
                    <div className="flex gap-4">
                        <div className={`p-3 rounded-xl bg-[#000]/30 text-[#b5a642] h-fit`}>
                            {m.icon}
                        </div>
                        <div>
                            <h3 className="text-lg font-serif text-[#c9ccbb] mb-1">{m.label}</h3>
                            <p className="text-xs text-[#c9ccbb]/50 uppercase tracking-widest">{m.question}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                         <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#000]/30 ${status.textCol} border border-current opacity-80`}>
                            {status.text}
                         </div>
                         <div className="text-[#c9ccbb]/30 hover:text-[#b5a642] transition-colors">
                            {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                         </div>
                    </div>
                </div>

                {/* The Bar */}
                <div className="relative h-2 w-full bg-[#000]/50 rounded-full overflow-hidden">
                    <div 
                        className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ${status.color}`} 
                        style={{ width: `${m.score}%` }} 
                    />
                </div>

                {/* Interpretation */}
                <div className="flex justify-between text-xs">
                    <span className="text-[#c9ccbb]/80">{m.lowMsg}</span>
                    <span className={`${status.textCol} font-medium`}>
                        {m.score}/100
                    </span>
                    <span className="text-[#c9ccbb]/80">{m.highMsg}</span>
                </div>
            </div>

            {/* EXPANDABLE CONTENT */}
            <div 
                className={`
                    border-t border-[#c9ccbb]/5 bg-[#000]/20 transition-all duration-500 ease-in-out
                    ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}
                `}
            >
                <div className="p-6 text-sm text-[#c9ccbb]/80 leading-relaxed">
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1">
                            <h4 className="text-[#b5a642] text-xs font-bold uppercase tracking-widest mb-2">Why this matters for {profile === 'anchor' ? 'you' : `a ${profile}`}</h4>
                            <p>{m.details}</p>
                        </div>
                        <div className="w-full md:w-48 shrink-0">
                            <h4 className="text-[#b5a642] text-xs font-bold uppercase tracking-widest mb-2">Recommended Tool</h4>
                            <Link href={m.toolLink} className="block group">
                                <div className="p-4 rounded-xl bg-[#c9ccbb]/5 border border-[#c9ccbb]/10 hover:border-[#b5a642] hover:bg-[#b5a642]/10 transition-all">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[#c9ccbb] font-serif group-hover:text-[#f0e6b5]">{m.toolName}</span>
                                        <ArrowRight size={14} className="text-[#c9ccbb]/40 group-hover:text-[#b5a642]" />
                                    </div>
                                    <div className="text-[10px] text-[#c9ccbb]/40 uppercase tracking-widest">Open Tool</div>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

          </div>
        )
      })}
    </div>
  )
}
