'use client'

import { useState } from 'react'
import { Activity, Moon, Zap, Eye, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function HumanScorecard({ scores }: { scores: any }) {
  // Track which item is expanded (null = none)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const metrics = [
    {
      id: 'circadian',
      label: 'Body Clock Alignment',
      icon: <Moon size={20} />,
      score: scores.circadian || 30, 
      max: 100,
      question: "Does your home support your sleep/wake cycle?",
      lowMsg: "Lighting Misalignment.",
      highMsg: "In Sync.",
      details: "Your body relies on light signals to know when to release energy (cortisol) and when to rest (melatonin). A low score means your home's lighting is likely too dim in the morning or too bright at night.",
      toolName: "Light Meter",
      toolLink: "/tools/light-meter"
    },
    {
      id: 'autonomic',
      label: 'Nervous System Safety',
      icon: <Activity size={20} />,
      score: scores.autonomic || 45,
      max: 100,
      question: "Can your body truly drop its guard here?",
      lowMsg: "High Alert.",
      highMsg: "Calming.",
      details: "This measures vigilance: how much your brain is scanning for threats. Issues like seating with your back to a door, sharp corners, or lack of privacy keep your amygdala activated.",
      toolName: "Safety Audit",
      toolLink: "/room-audit"
    },
    {
      id: 'legibility',
      label: 'Mental Clarity',
      icon: <Eye size={20} />,
      score: scores.legibility || 60,
      max: 100,
      question: "How hard does your brain work to process the room?",
      lowMsg: "Noisy & Distracting.",
      highMsg: "Effortless & intuitive.",
      details: "Your brain burns energy trying to make sense of clutter, disorganised layouts, or undefined spaces. A high legibility score means your home is easy to understand, saving your energy for focus.",
      toolName: "Read Insights",
      toolLink: "/insights"
    },
    {
      id: 'sensory',
      label: 'Sensory Friction',
      icon: <Zap size={20} />,
      score: scores.sensory || 80,
      max: 100,
      question: "Is the environment over-stimulating?",
      lowMsg: "High friction.",
      highMsg: "Calm & restorative.",
      details: "The cumulative weight of noise (humming fridges, traffic), tactile irritation (scratchy fabrics), and visual chaos. High sensory load forces your nervous system to work overtime to filter it out.",
      toolName: "Noise Meter",
      toolLink: "/tools/noise-meter"
    }
  ]

  const getStatus = (score: number) => {
      if (score < 40) return { text: "Needs Support", color: "bg-[#b5a642]", textCol: "text-[#b5a642]", border: "border-[#b5a642]/30", bg: "bg-[#b5a642]/5" }
      if (score < 70) return { text: "Moderate", color: "bg-[#b5a642]", textCol: "text-[#b5a642]", border: "border-[#b5a642]/30", bg: "bg-[#b5a642]/5" }
      return { text: "Optimised", color: "bg-emerald-400", textCol: "text-emerald-400", border: "border-emerald-400/30", bg: "bg-emerald-400/5" }
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
                    <span className="text-[#c9ccbb]/80">Dysregulated</span>
                    <span className={`${status.textCol} font-medium`}>
                        {m.score < 50 ? m.lowMsg : m.highMsg}
                    </span>
                    <span className="text-[#c9ccbb]/80">Resonant</span>
                </div>
            </div>

            {/* EXPANDABLE CONTENT (THE ACCORDION) */}
            <div 
                className={`
                    border-t border-[#c9ccbb]/5 bg-[#000]/20 transition-all duration-500 ease-in-out
                    ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}
                `}
            >
                <div className="p-6 text-sm text-[#c9ccbb]/80 leading-relaxed">
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1">
                            <h4 className="text-[#b5a642] text-xs font-bold uppercase tracking-widest mb-2">Why this matters</h4>
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
