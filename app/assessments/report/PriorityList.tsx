'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Zap, Activity, Brain, Eye, Moon } from 'lucide-react'

const PROFILE_LABELS: Record<string, string> = {
  anchor: 'Anchor',
  seeker: 'Seeker',
  sensor: 'Sensor'
}

// =============================================================================
// INTEGRATION NOTES — per domain × integration pattern
// =============================================================================
//
// These notes appear beneath the primary profile content as a contextual
// callout. They do not replace the existing content — they modify how the
// user should weight and apply the recommendations given their processing
// pattern.
//
// integrative:  recovery windows work — the prescription is about timing
// mixed:        consistency matters more on high-load days
// accumulative: the prescription is structural, not periodic
//
// All three patterns are written for each domain so the fallback is never needed.

const INTEGRATION_NOTES: Record<string, Record<string, string>> = {
  ali: {
    integrative:
      'Your nervous system responds well to recovery periods. Deliberately resting in the dorsal seat and safe-zone positioning will be most effective when these practices are used consistently.',
    mixed:
      'On high-demand days, your nervous system will be more alert than usual. It is precisely when you feel you need them least that the positioning and shielding below matter most.',
    accumulative:
      'For your nervous system, these spatial changes are not a comfort upgrade; they are a reduction in load. Implement them as permanent fixtures, not adjustable preferences. The benefits will build up over weeks, not sessions.'
  },
  cii: {
    integrative:
      'Your circadian rhythm responds well to consistent light cues. You will see noticeable improvements within two to three weeks if you make even modest adjustments to the light you are exposed to in the morning and evening.',
    mixed:
      'Your circadian sensitivity shifts in line with your overall load. Protect your light protocol most rigorously on the days when you feel you could skip it. Those are the days when your system needs it the most.',
    accumulative:
      'For an accumulative nervous system, circadian disruption does not recover overnight. Inconsistent light exposure builds up over time. The morning and evening protocols below are essential anchors, not optional extras.'
  },
  pli: {
    integrative:
      'Spatial clarity helps your system to navigate without encountering unnecessary friction. Even minor adjustments to the visual hierarchy can reduce the processing demands placed on you by your environment.',
    mixed:
      'Your sensitivity to spatial ambiguity increases as your overall workload increases. The clearer your environment, the more capacity you have for other things, especially on demanding days.',
    accumulative:
      'Predictive legibility is crucial for the proper functioning of your nervous system. An environment that requires constant spatial recalibration does not allow your system to stop processing for a moment. Visual hierarchy is not just about aesthetics; it is about managing neurological load.'
  },
  stl: {
    integrative:
      'If the right conditions are in place, your sensory system can recover between exposures. Follow the recommendations below to meaningfully reduce your daily baseline load and speed up recovery.',
    mixed:
      'Your sensory tolerance varies. Make the softest version of your environment the default. You can always increase stimulation when you are able to, but it is difficult to reduce it when you need to.',
    accumulative:
      'Sensory inputs that seem tolerable in isolation build up in your nervous system. What does not bother you at 9 am may be unbearable by 3 pm, not because the input has changed, but because your nervous system has been processing it continuously. Reduce the baseline, not just the peaks.'
  },
  rci: {
    integrative:
      'Your recovery capacity is genuine. When the conditions are right, your system effectively restores itself. The goal is to consistently protect those conditions so that restoration becomes reliable rather than incidental.',
    mixed:
      'Recovery is effective for your system, but its success depends heavily on the quality of the conditions. A nervous system that is almost recovered is more vulnerable than a fully rested one. Protect the full recovery period.',
    accumulative:
      'Recovery for your nervous system is not just about rest periods; it is also about environmental architecture. If sensory management is required during so-called rest, the space cannot be considered a recovery space. The recommendations below should be incorporated, not arranged around.'
  }
}

// =============================================================================
// ADAPTIVE WISDOM DICTIONARY — primary content, unchanged
// =============================================================================

const insightContent: any = {
  ali: {
    anchor: {
      title: "The Dorsal Seat: Your Protected Back",
      concept: "Your nervous system's off switch.",
      why: "From an evolutionary perspective, having your back exposed demands constant, low-level vigilance. When you sit with your back to an open room or door, part of your brain remains alert, monitoring what you cannot see behind you. This uses up energy without you realising.",
      how: [
        "Position your primary chair against a solid wall or a visual barrier like a bookshelf if you live in an open plan space.",
        "Orient yourself to face the room so you can easily see the entrance without needing to turn your head."
      ],
      feeling: "When you sit here, your nervous system gets a silent signal: 'I am safe. I don't need to watch my back.' This allows you to truly exhale and rest.",
      icon: <Activity size={18} />
    },
    seeker: {
      title: "The Cockpit: Command & Control",
      concept: "Your operational anchor.",
      why: "You crave immersion, but floating in the centre of a room leaves you feeling disorientated and susceptible to distractions. What you need is a cockpit: a tight, defined space that tells your brain, 'We are in control now'.'",
      how: [
        "Anchor your desk firmly to a wall or a corner.",
        "Ensure that you have full visibility of the door so that you are not taken by surprise and feel in command of the environment."
      ],
      feeling: "This makes you feel grounded, empowered, and locked in.",
      icon: <Activity size={18} />
    },
    sensor: {
      title: "The Sanctuary Corner: The Retreat",
      concept: "A physical pause button.",
      why: "High sensitivity means your radar is always switched on. You need a space where the radar literally hits a wall. A corner provides shielding on two sides, which reduces your environmental scanning workload by 50%.",
      how: [
        "Place a high-backed chair in a low-traffic corner.",
        "Create a scent boundary using a diffuser with your preferred scent to mark the territory."
      ],
      feeling: "Like a deep breath. A hug from the room itself.",
      icon: <Activity size={18} />
    }
  },

  cii: {
    anchor: {
      title: "The Morning Anchor",
      concept: "Your body's start button.",
      why: "Light is the primary signal that tells your body what time of day it is. Without a clear signal in the morning, your body clock becomes disorganised, leaving you feeling tired during the day but wide awake at night.",
      how: [
        "Within 30 minutes of waking, stand near an open window or step outside.",
        "Spend 2–5 minutes viewing the sky (low-angle morning sunlight) to lock in your energy cycle."
      ],
      feeling: "A clear head in the morning and a natural, and a delicious wave of sleepiness when the sun goes down.",
      icon: <Zap size={18} />
    },
    seeker: {
      title: "Solar Ignition: The Dopamine Spark",
      concept: "Jumpstarting the engine.",
      why: "Your nervous system doesn't just drift into wakefulness, it needs a spark. Dim mornings leave you with a dopamine deficit. You need intense light to produce the neurochemicals you need to start your day.",
      how: [
        "Seek direct, bright sunlight as soon as you get out of bed. In low-light regions and in winter, use a 10,000 lux lamp for 10–15 minutes.",
        "Combine light exposure with movement: drink your coffee or tea standing up."
      ],
      feeling: "Your go-engine comes online and you feel ready to engage the day.",
      icon: <Zap size={18} />
    },
    sensor: {
      title: "The Gentle Ascent",
      concept: "Waking without the shock.",
      why: "For you, the standard blast of light feels like an assault, triggering a cortisol spike that mimics anxiety. You need to wake up slowly and let the morning wash over you, so be sure to titrate your morning routine.",
      how: [
        "Sit near a window (indirect light) rather than outside for the first moments after waking.",
        "Keep overhead lighting OFF until you feel fully awake and grounded."
      ],
      feeling: "A slow awakening and steady alignment. No jitters, just clarity.",
      icon: <Zap size={18} />
    }
  },

  pli: {
    anchor: {
      title: "The Visual Quiet Zone",
      concept: "A landing pad for your eyes.",
      why: "Clutter and undefined spaces force your brain to process thousands of tiny details constantly. It's as if you have too many browser tabs open in your mind.",
      how: [
        "Decorate your space with one piece that resonates deeply with you, such as a piece of art, a lamp or an object. This will give your eyes somewhere to rest. Keep it sacred.",
        "Let this be the place your eyes rest when the room feels loud."
      ],
      feeling: "A visual exhale. A sense of space and breath in a busy room.",
      icon: <Brain size={18} />
    },
    seeker: {
      title: "Visual Containment: The Museum of Now",
      concept: "Framing, not hiding.",
      why: "The standard advice is to hide the clutter, but for you, out of sight means out of mind. You don't need emptiness; you need curation. Frame your chaos so that it becomes a collection rather than a mess.",
      how: [
        "Use low-rimmed trays to corral active projects. Keep future projects in clearly labelled bins.",
        "Group items by category so they form a single visual unit, not competing signals."
      ],
      feeling: "I see my tools, but they aren't screaming at me.",
      icon: <Brain size={18} />
    },
    sensor: {
      title: "The Zero-Data Zone",
      concept: "Silence for the eyes.",
      why: "Every object in your field of vision is a piece of information that your brain must process. In order to think deeply, you need to reduce the bandwidth of your surroundings by creating a space that does not demand anything from you.",
      how: [
        "Clear your primary viewpoint of all text and labels.",
        "Use opaque bins. Visual silence is your battery charger."
      ],
      feeling: "My brain finally stopped buzzing.",
      icon: <Brain size={18} />
    }
  },

  stl: {
    anchor: {
      title: "The Soft Layer",
      concept: "The room's mute button.",
      why: "Hard surfaces create a noise mirror, reflecting sound waves back at you. Softness, on the other hand, absorbs the sharp frequencies that keep your nervous system on edge.",
      how: [
        "Add a plush rug to anchor the room.",
        "Use heavy curtains to dampen the echo."
      ],
      feeling: "Warm, held, and hushed.",
      icon: <Eye size={18} />
    },
    seeker: {
      title: "The Tactile Anchor",
      concept: "Your 'fidgeting as regulation' activity.",
      why: "Your brain craves stimulation. If your surroundings are too sterile, you will become restless. You need rich, complex textures to keep your hands busy and your mind settled.",
      how: [
        "Introduce complex textures such as corduroy, sheepskin, raw wood.",
        "Keep a tactile object (stone, metal) nearby and within easy reach."
      ],
      feeling: "Physically engaged, mentally steady.",
      icon: <Eye size={18} />
    },
    sensor: {
      title: "The Acoustic Shield",
      concept: "Your buffer against the world.",
      why: "It's not just the noise itself, but the unpredictability of it. You need to soften the sonic edges of your environment to prevent constant micro-startles that drain your energy.",
      how: [
        "Use your preferred ambient sound to mask sudden noises.",
        "Create a soft corner with cushions and soft furnishings to absorb vibration."
      ],
      feeling: "Safe inside the bubble.",
      icon: <Eye size={18} />
    }
  },

  rci: {
    anchor: {
      title: "The Thermal Signal",
      concept: "Your 'hibernation mode'.",
      why: "To enter deep restorative sleep, your core body temperature must drop. A room that is too warm or too cold keeps your biological engine running too fast.",
      how: [
        "Drop the thermostat to 18°C (65°F) one hour before bed.",
        "Open a window or use a fan if needed to circulate fresh air."
      ],
      feeling: "Heavy eyelids and a deeper, unbroken sleep cycle.",
      icon: <Moon size={18} />
    },
    seeker: {
      title: "The Compression Reset",
      concept: "Easing the system down.",
      why: "Your brain doesn't have an off switch, it has a dimmer that gets stuck. You need strong somatic input (weight and temperature) to physically ease the nervous system to disengage.",
      how: [
        "Use a heavy weighted blanket.",
        "Take a hot shower to trigger a rapid cooling effect afterwards."
      ],
      feeling: "Finally heavy. Finally quiet.",
      icon: <Moon size={18} />
    },
    sensor: {
      title: "The Blackout Cocoon",
      concept: "Your sensory zero.",
      why: "Even a single standby light is a photon signal your vigilant brain will track. To truly recover, you need to exist in a void where there is no input to process.",
      how: [
        "Absolute darkness is non-negotiable.",
        "In shared bedrooms, use an eye mask and earplugs to create your zone."
      ],
      feeling: "Disappearing into the twilight of rest.",
      icon: <Moon size={18} />
    }
  }
}

// =============================================================================
// COMPONENT
// =============================================================================

interface PriorityListProps {
  areas: any[]
  profile?: string
  integrationPattern?: 'integrative' | 'mixed' | 'accumulative'
}

export default function PriorityList({
  areas,
  profile = 'anchor',
  integrationPattern = 'integrative'
}: PriorityListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const toggle = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const getContent = (id: string) => {
    const safeProfile = (profile || 'anchor').toLowerCase() as 'anchor' | 'seeker' | 'sensor'
    const domainData  = insightContent[id] || insightContent['ali']
    return domainData[safeProfile] || domainData['anchor']
  }

  const getIntegrationNote = (id: string): string => {
    const domainNotes = INTEGRATION_NOTES[id] || INTEGRATION_NOTES['ali']
    return domainNotes[integrationPattern] || domainNotes['integrative']
  }

  // Integration pattern label for the callout header
  const integrationLabel = {
    integrative:  'For your integrative processing pattern',
    mixed:        'Given your variable processing pattern',
    accumulative: 'Given your accumulative processing pattern'
  }[integrationPattern] ?? 'Processing pattern note'

  return (
    <div className="space-y-4">
      {areas.map((area) => {
        const content         = getContent(area.id)
        const integrationNote = getIntegrationNote(area.id)
        const isOpen          = expandedId === area.id

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
            {/* HEADER */}
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
                        {profile === 'anchor' ? 'Core Support' : `For The ${PROFILE_LABELS[profile] || profile}`}
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

            {/* EXPANDABLE BODY */}
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
                          <p className="text-[#b5a642] text-xs font-bold uppercase tracking-widest mb-3">
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

                    {/* INTEGRATION NOTE — appears beneath primary content */}
                    <div className="mt-6 pt-5 border-t border-[#b5a642]/10">
                      <p className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest mb-2">
                        {integrationLabel}
                      </p>
                      <p className="text-[#c9ccbb]/60 text-xs leading-relaxed">
                        {integrationNote}
                      </p>
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
