'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Zap, Activity, Brain, Eye, Moon } from 'lucide-react'

// --- THE ADAPTIVE WISDOM DICTIONARY ---
// 🟢 UPDATED: Now supports 'anchor' (formerly standard), 'seeker', and 'sensor'
const insightContent: any = {
  // === AUTONOMIC LOAD (Safety & Vigilance) ===
  ali: {
    // 🟢 RENAMED: 'standard' -> 'anchor'
    anchor: {
      title: "The Dorsal Seat: Your Protected Back",
      concept: "Think of it as your nervous system's 'off' switch.",
      why: "Evolutionarily, an exposed back demands constant, low-level vigilance. When you sit with your back to an open room or a door, part of your brain stays on alert, watching what it can't see behind you. This drains your energy without you realising it.",
      how: ["Position your primary chair against a solid wall or a visual barrier like a bookshelf if you live in an open plan space.", "Orient yourself to face the room so you can easily see the entrance without turning your head."],
      feeling: "When you sit here, your nervous system gets a silent signal: 'I am safe. I don't need to watch my back.' This allows you to truly exhale and rest.",
      icon: <Activity size={18} />
    },
    seeker: {
      title: "The Cockpit: Command & Control",
      concept: "Your operational anchor.",
      why: "You crave immersion, but floating in the center of a room leaves you unmoored and prone to distraction. You need a 'Cockpit': a tight, defined zone that signals to your brain: 'We are piloting the ship now.'",
      how: ["Anchor your desk firmly to a wall or a corner.", "Make sure there is a clear line of sight to the door (so you’re not startled and feel in full control of the space)."],
      feeling: "This makes you feel grounded, empowered, and locked in.",
      icon: <Activity size={18} />
    },
    sensor: {
      title: "The Sanctuary Corner: The Retreat",
      concept: "A physical pause button.",
      why: "High sensitivity means your radar is always on. You need a space where the radar hits a wall—literally. A corner offers shielding on two sides, reducing your environmental scanning load by 50%.",
      how: ["Place a high-backed chair in a low-traffic corner.", "Create a 'scent boundary' using a diffuser with your preferred scent to mark the territory."],
      feeling: "Like a deep breath. A hug from the room itself.",
      icon: <Activity size={18} />
    }
  },

  // === CIRCADIAN RHYTHM (Energy & Timing) ===
  cii: {
    anchor: {
      title: "The Morning Anchor",
      concept: "Think of this as your body's 'Start Button'.",
      why: "Light is the primary signal that tells your body what time it is. Without a clear morning signal, your biological clock drifts, leaving you tired in the day but 'wired' at night.",
      how: ["Within 30 minutes of waking, stand near an open window or step outside. The fewer barriers there are between you and those lovely photons, the better.", "Spend 2–5 minutes viewing the sky (low-angle morning sunlight) to lock in your energy cycle."],
      feeling: "A clear head in the morning and a natural, heavy wave of sleepiness when the sun goes down.",
      icon: <Zap size={18} />
    },
    seeker: {
      title: "Solar Ignition: The Dopamine Spark",
      concept: "Think of it as you jumpstarting the engine.",
      why: "Your nervous system doesn't 'drift' awake; it needs a spark. Dim mornings leave you in a state of dopamine deficit. You need high-intensity photons to manufacture the neurochemicals you need to get the day started.",
      how: ["Seek direct, bright sunlight as soon as you get out of bed. In low-light regions and in Winter, use a 10,000 lux lamp for 10-15 minutes.", "Combine light exposure with movement: drink your coffee or tea standing up."],
      feeling: "Your go-engine comes online and you feel ready to engage the day.",
      icon: <Zap size={18} />
    },
    sensor: {
      title: "The Gentle Ascent",
      concept: "Waking without the shock.",
      why: "For you, the standard 'blast of light' feels like an assault, triggering a cortisol spike that mimics anxiety. You need to titrate your morning, wake up slowly and let the morning wash over you slowly.",
      how: ["Sit near a window (indirect light) rather than outside for the first moments after waking up.", "Keep overhead lighting OFF until you feel fully awake and grounded."],
      feeling: "A slow awakening and steady alignment. No jitters, just clarity.",
      icon: <Zap size={18} />
    }
  },

  // === PREDICTIVE LEGIBILITY (Focus & Clarity) ===
  pli: {
    anchor: {
      title: "The Visual Quiet Zone",
      concept: "Think of this as a 'landing pad' for your eyes.",
      why: "Clutter and undefined spaces force your brain to micro-process thousands of tiny details constantly. It is like having too many browser tabs open in your mind.",
      how: ["Decorate with your favourite piece of art, lamp...anything you resonate deeply with. This gives you something for your eyes to land on. Keep it sacred.", "Let this be the place your eyes rest when the room feels loud."],
      feeling: "A visual exhale. A sense of space and breath in a busy room",
      icon: <Brain size={18} />
    },
    seeker: {
      title: "Visual Containment: The Museum of Now",
      concept: "Think of it as framing, not hiding.",
      why: "Standard advice says 'hide the clutter,' but for you, 'out of sight' means 'ceased to exist.' You don't need emptiness; you need curation. Frame your chaos so it becomes a collection, not a mess.",
      how: ["Use low-rimmed trays to 'corral' active projects and keep future projects out of sight but in clearly labeled bins for easy retrieval.", "Group items by category so they form a single visual unit."],
      feeling: "I see my tools, but they aren't screaming at me.",
      icon: <Brain size={18} />
    },
    sensor: {
      title: "The Zero-Data Zone",
      concept: "Think of it as silence for the eyes.",
      why: "Every object in your view is a data point your brain must process. To think deeply, you need to lower the 'bandwidth' of the room. You need a space that asks nothing of you.",
      how: ["Clear your primary viewpoint of all text/labels.", "Use opaque bins. Visual silence is your battery charger."],
      feeling: "My brain finally stopped buzzing.",
      icon: <Brain size={18} />
    }
  },

  // === SENSORY LOAD (Texture & Sound) ===
  stl: {
    anchor: {
      title: "The Soft Layer",
      concept: "Think of this as the room's mute button.",
      why: "Hard surfaces create a 'noise mirror,' reflecting energy back at you. Softness absorbs the sharp frequencies that keep your nervous system on edge.",
      how: ["Add a plush rug to anchor the room.", "Use heavy curtains to dampen the echo."],
      feeling: "Warm, held, and hushed.",
      icon: <Eye size={18} />
    },
    seeker: {
      title: "The Tactile Anchor",
      concept: "Think of it as your 'fidgeting as regulation' activity.",
      why: "Your brain craves input. If the environment is too sterile, you become restless. You need rich, complex textures that give your hands something to do so your mind can stay put.",
      how: ["Introduce complex textures (corduroy, sheepskin, raw wood).", "Keep a 'fidget object' (stone, metal) nearby and within easy reach."],
      feeling: "Physically engaged, mentally steady.",
      icon: <Eye size={18} />
    },
    sensor: {
      title: "The Acoustic Shield",
      concept: "Think of this as your buffer against the world.",
      why: "It isn't just noise; it's the unpredictability of noise. You need to smooth out the sonic edges of your environment to prevent the constant micro-startles that drain your energy.",
      how: ["Use your preferred ambient sound to mask sudden noises.", "Create a soft corner with pillows to absorb vibration."],
      feeling: "Safe inside the bubble.",
      icon: <Eye size={18} />
    }
  },

  // === RECOVERY (Rest & Sleep) ===
  rci: {
    anchor: {
      title: "The Thermal Signal",
      concept: "Think of this as your 'hibernation mode'.",
      why: "To enter deep restorative sleep, your core body temperature must drop to an ideal temperature for sleep. A room that is too warm or too cold keeps your biological engine running too fast.",
      how: ["Drop the thermostat to 18°C (65°F) one hour before bed.", "Open a window or use a fan if needed to circulate fresh air."],
      feeling: "Heavy eyelids and a deeper, unbroken sleep cycle.",
      icon: <Moon size={18} />
    },
    seeker: {
      title: "The Compression Reset",
      concept: "Think of it as easing the system down.",
      why: "Your brain doesn't have an 'off' switch; it has a dimmer that gets stuck. You need strong somatic input (weight and temperature) to physically ease the nervous system to disengage.",
      how: ["Use a heavy weighted blanket.", "Take a hot shower to trigger a rapid cooling effect afterwards."],
      feeling: "Finally heavy. Finally quiet.",
      icon: <Moon size={18} />
    },
    sensor: {
      title: "The Blackout Cocoon",
      concept: "Think of it as your sensory zero.",
      why: "Even a single standby light is a photon signal your vigilant brain will track. To truly recover, you need to exist in a void where there is no input to process.",
      how: ["Absolute darkness is non-negotiable.", "In shared bedrooms, use an eye mask and ear plugs to zone out."],
      feeling: "Disappearing into the twilight of rest.",
      icon: <Moon size={18} />
    }
  }
}

export default function PriorityList({ areas, profile = 'anchor' }: { areas: any[], profile?: string }) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const toggle = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  // 🟢 HELPER: Safe access with fallback to 'anchor'
  const getContent = (id: string) => {
    // Ensure profile matches new keys (lowercase)
    const safeProfile = (profile || 'anchor').toLowerCase() as 'anchor' | 'seeker' | 'sensor'
    
    // Get the domain content (fallback to 'ali' if ID is missing)
    const domainData = insightContent[id] || insightContent['ali']
    
    // Get the profile content (fallback to 'anchor' if profile is missing)
    return domainData[safeProfile] || domainData['anchor']
  }

  return (
    <div className="space-y-4">
      {areas.map((area) => {
        const content = getContent(area.id)
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
                           {profile === 'anchor' ? 'Core Support' : `For The ${profile}`}
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
