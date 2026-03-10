'use client'

import { useState } from 'react'
import { Activity, Moon, Zap, ChevronDown, ChevronUp, ArrowRight, CheckCircle, Brain, AlertCircle } from 'lucide-react'
import Link from 'next/link'

// =============================================================================
// PRIMARY INSIGHT DICTIONARY — profile-specific (unchanged)
// =============================================================================

const insightDictionary: any = {
  circadian: {
    anchor: "Your body relies on light signals to know when to release energy (cortisol) and when to rest (melatonin).",
    sensor: "Your system is highly sensitive to blue light. Evening brightness suppresses your melatonin faster than average.",
    seeker: "Your nervous system needs high-intensity morning light to jumpstart dopamine production and wakefulness."
  },
  autonomic: {
    anchor: "This measures vigilance: how much your brain is scanning for threats such as sharp corners, open doors and unpredictable sounds.",
    sensor: "Your threat detection wires are set to high sensitivity. Unpredictable sounds or open spaces trigger low-level anxiety.",
    seeker: "Internal restlessness often projects outward. If the room feels boring or restricting, your stress axis activates."
  },
  legibility: {
    anchor: "Your brain burns energy trying to make sense of clutter, disorganised layouts, or undefined spaces.",
    sensor: "Visual chaos acts like static noise for your brain, draining your cognitive battery rapidly.",
    seeker: "You need visual hooks to stay focused. Undefined piles of clutter create distraction rather than cues."
  },
  sensory: {
    anchor: "The cumulative weight of noise, tactile irritation, and visual chaos on your baseline energy.",
    sensor: "Your sensory gating is open. You absorb more data (sound, texture, light) than others, leading to quicker overwhelm.",
    seeker: "A paradox: you crave stimulation but get distracted by chaos. You need curated intensity not just background noise."
  },
  recovery: {
    anchor: "Does your home allow you to fully power down, or are you just off duty but still running?",
    sensor: "Recovery for you requires sensory zero: the total absence of input with darkness, silence and weight.",
    seeker: "You struggle to switch off. True recovery requires somatic signals, such as heavy blankets or heat, to ease your system into relaxation."
  }
}

// =============================================================================
// INTEGRATION INSIGHT LAYER — processing pattern × domain
// =============================================================================
//
// A secondary insight that contextualises the primary text with how the user's
// integration pattern changes what the domain score means for them specifically.
//
// integrative:  sensation resolves — standard interpretation applies
// mixed:        context-dependent — note when the domain is most vulnerable
// accumulative: sensation layers — note how the domain reads differently
//
// Written to follow naturally after the primary insight without repeating it.

const integrationInsightDictionary: any = {
  circadian: {
    integrative:
      "Your body clock responds well to consistent light cues. Even modest environmental improvements will produce measurable rhythm benefits within a few weeks.",
    mixed:
      "Your circadian sensitivity increases when your overall load is high. The days when you feel too busy to protect your light protocol are often the days your system needs it most.",
    accumulative:
      "For your system, circadian disruption does not recover overnight, it compounds. Inconsistent light exposure across consecutive days depletes capacity in ways that take equally consecutive days of consistency to restore."
  },
  autonomic: {
    integrative:
      "Your autonomic system resets well between exposures. Improvements to your spatial environment will translate into a lower background vigilance level within days of implementation.",
    mixed:
      "Your autonomic baseline fluctuates with cumulative load. Even on days when you feel relatively stable, your activation threshold is lower than it seems — small environmental triggers have a greater impact than expected.",
    accumulative:
      "Your autonomic system does not return to a neutral baseline between exposures in the same way that an integrative nervous system does. What appears as moderate vigilance in your score could indicate that your system is already operating above capacity. The spatial changes recommended here work cumulatively, and their effectiveness increases over time."
  },
  legibility: {
    integrative:
      "Spatial clarity reduces the low-level cognitive processing your home currently demands. Improvements here free up working memory for the rest of your day.",
    mixed:
      "Your tolerance for spatial ambiguity narrows as your overall load increases. A clear environment matters less on a low-demand day. It matters most when demand is highest.",
    accumulative:
      "An environment that requires spatial recalibration on entry or transit never gives your nervous system a moment's respite. For your processing pattern, visual hierarchy is not just an aesthetic consideration, it determines whether an environment adds load or not."
  },
  sensory: {
    integrative:
      "Sensory inputs that you process and release have a bounded effect on your system. Reducing the baseline allows recovery to work as intended.",
    mixed:
      "Your sensory tolerance depends on how much you are already carrying. Make the quietest version of your environment the default. You can always add stimulation when you have the capacity — reducing it when you need to is far harder.",
    accumulative:
      "What may seem tolerable in isolation can build up for your nervous system. A sound level that is acceptable at 9 am may feel exhausting by 3 pm, not because the sound has changed, but because your system has been processing it continuously since the start of the day. The baseline is more important than the peaks."
  },
  recovery: {
    integrative:
      "Your recovery capacity is genuine. When the conditions are right, your system restores effectively. The priority is to protect those conditions consistently rather than creating them occasionally.",
    mixed:
      "Recovery works for your system, but its effectiveness varies with how much you are carrying going in. A near-empty tank going into a recovery window restores faster than a full one. Protect the full duration, not just the start.",
    accumulative:
      "Recovery for your nervous system is not a specific time period; it is an environmental condition. A space that continues to stimulate the senses during so-called rest is not a recovery environment. The design of your bedroom and relaxation area is more important than how long you spend in them."
  }
}

// =============================================================================
// COMPONENT
// =============================================================================

interface HumanScorecardProps {
  scores: any
  profile?: string
  integrationPattern?: 'integrative' | 'mixed' | 'accumulative'
  accumulativeALIFlag?: boolean
}

export default function HumanScorecard({
  scores,
  profile = 'anchor',
  integrationPattern = 'integrative',
  accumulativeALIFlag = false
}: HumanScorecardProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const getText = (category: string) => {
    const safeProfile = (profile || 'anchor').toLowerCase()
    return insightDictionary[category][safeProfile] || insightDictionary[category]['anchor']
  }

  const getIntegrationText = (category: string): string => {
    const domainInsights = integrationInsightDictionary[category]
    if (!domainInsights) return ''
    return domainInsights[integrationPattern] || domainInsights['integrative']
  }

  const integrationPatternLabel = {
    integrative:  'For your integrative pattern',
    mixed:        'Given your variable pattern',
    accumulative: 'Given your accumulative pattern'
  }[integrationPattern] ?? ''

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
      integrationDetails: getIntegrationText('circadian'),
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
      integrationDetails: getIntegrationText('autonomic'),
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
      integrationDetails: getIntegrationText('legibility'),
      toolName: "Clarity Scan",
      toolLink: "/room-audit"
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
      integrationDetails: getIntegrationText('sensory'),
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
      integrationDetails: getIntegrationText('recovery'),
      toolName: "Sleep Audit",
      toolLink: "/progress"
    }
  ]

  const getStatus = (score: number) => {
    const goldPalette = {
      color:   "bg-[#b5a642]",
      textCol: "text-[#b5a642]",
      border:  "border-[#b5a642]/30",
      bg:      "bg-[#b5a642]/5"
    }
    if (score < 40) return { text: "Needs Support", ...goldPalette }
    if (score < 70) return { text: "Moderate",      ...goldPalette }
    return                 { text: "Optimised",     ...goldPalette }
  }

  return (
    <div className="space-y-4">
      {metrics.map((m) => {
        const status = getStatus(m.score)
        const isOpen = expandedId === m.id

        // Show the accumulative ALI flag on the autonomic domain specifically
        const showALIFlag = m.id === 'autonomic' && accumulativeALIFlag

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
                  <div className="p-3 rounded-xl bg-[#000]/30 text-[#b5a642] h-fit">
                    {m.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-serif text-[#c9ccbb]">{m.label}</h3>
                      {/* Accumulative ALI flag badge — on the card header */}
                      {showALIFlag && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full border border-[#b5a642]/40 bg-[#b5a642]/10 text-[#b5a642] text-[9px] font-bold uppercase tracking-widest">
                          <AlertCircle size={9} /> Reads Higher
                        </span>
                      )}
                    </div>
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
                <span className={`${status.textCol} font-medium`}>{m.score}/100</span>
                <span className="text-[#c9ccbb]/80">{m.highMsg}</span>
              </div>
            </div>

            {/* EXPANDABLE CONTENT */}
            <div
              className={`
                border-t border-[#c9ccbb]/5 bg-[#000]/20 transition-all duration-500 ease-in-out
                ${isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}
              `}
            >
              <div className="p-6 text-sm text-[#c9ccbb]/80 leading-relaxed">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1 space-y-4">
                    {/* Primary profile insight */}
                    <div>
                      <h4 className="text-[#b5a642] text-xs font-bold uppercase tracking-widest mb-2">
                        Why this matters for {profile === 'anchor' ? 'you' : `a ${profile}`}
                      </h4>
                      <p className="leading-relaxed">{m.details}</p>
                    </div>

                    {/* Integration pattern insight — secondary layer */}
                    {m.integrationDetails && (
                      <div className="pt-3 border-t border-[#b5a642]/10">
                        <h4 className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest mb-2">
                          {integrationPatternLabel}
                        </h4>
                        <p className="text-[#c9ccbb]/60 text-xs leading-relaxed">
                          {m.integrationDetails}
                        </p>
                      </div>
                    )}

                    {/* Accumulative ALI flag — expanded note */}
                    {showALIFlag && (
                      <div className="pt-3 border-t border-[#b5a642]/10 flex items-start gap-2">
                        <AlertCircle size={13} className="text-[#b5a642] shrink-0 mt-0.5" />
                        <p className="text-[#c9ccbb]/50 text-xs leading-relaxed">
                          This score reads as moderate, but your accumulative processing pattern means the effective load is higher. See the note in your report overview.
                        </p>
                      </div>
                    )}
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
