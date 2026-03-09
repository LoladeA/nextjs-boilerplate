// =============================================================================
// PROTOCOLS — The Sentient Home
// =============================================================================
//
// CHANGE LOG:
//   Added 3 missing high-stress ritual entries referenced by sensory_logic.ts:
//     'morning-calm'    — Morning + High Load
//     'afternoon-reset' — Afternoon + High Load
//     'evening-shelter' — Evening + High Load
//
//   All three were called by determineProtocol() but absent from the RITUALS
//   record. Every user with NeuroLoad > 65 received undefined → runtime crash.
//   The existing 3 low/medium-stress rituals are unchanged.
// =============================================================================

export type TimeOfDay  = 'morning' | 'afternoon' | 'evening'
export type StressLevel = 'low' | 'medium' | 'high'
export type SensoryProfile = 'anchor' | 'seeker' | 'sensor'

export type SensoryAction = {
  type:        'light' | 'sound' | 'space' | 'somatic'
  label:       string
  instruction: string
  duration?:   string
  toolLink?:   string
  spotifyLink?: string
}

export type RitualVariant = {
  tagline:      string
  description:  string
  spotifyLink?: string
  toolLink?:    string
  steps:        SensoryAction[]
}

export type Ritual = {
  id:               string
  name:             string
  triggerCondition: string
  variants: {
    anchor: RitualVariant   // 🟢 Balanced / Grounded — renamed from 'standard'
    seeker: RitualVariant   // 🟠 ADHD / Hypo-aroused
    sensor: RitualVariant   // 🔵 HSP / Hyper-aroused
  }
}

export const RITUALS: Record<string, Ritual> = {

  // ===========================================================================
  // MORNING — LOW / MEDIUM STRESS (existing, unchanged)
  // ===========================================================================
  'morning-activation': {
    id: 'morning-activation',
    name: 'First Light Rhythm',
    triggerCondition: 'Morning + Low Energy',
    variants: {
      anchor: {
        tagline: 'Master Your Morning: Activate Your Neuro-Hormonal Advantage.',
        description: "Your internal clock, the Suprachiasmatic Nucleus (SCN), is the CEO of your day. To unlock peak cognitive clarity, we must strategically signal the Cortisol Awakening Response (CAR). This is not just 'waking up'; it is designing your physiological launch sequence for resilience.",
        spotifyLink: 'https://open.spotify.com/playlist/37i9dQZF1DX71VcjjnyaBQ?si=ed214b46173540d7',
        steps: [
          {
            type: 'light',
            label: 'Sky View: The First Signal',
            instruction: "Within 10 minutes of waking, early morning, low angle sunlight. Step outside, open a window fully or go for a walk. You are calibrating your internal compass for the day's journey.",
            duration: '15 min'
          },
          {
            type: 'somatic',
            label: 'Cold Signal: The Ignition',
            instruction: "A brief splash of cold water triggers a micro-dose of noradrenaline. It enhances alertness without the dysregulation of a startle response."
          },
          {
            type: 'space',
            label: 'Open Boundaries',
            instruction: "Open all curtains and blinds. Maximising 'Visual Expansion' signals to your nervous system that the environment is adapting to you, not confining you."
          }
        ]
      },
      seeker: {
        tagline: 'Dopamine Ignition: Engaging the Executive Brain.',
        description: "Your nervous system does not 'drift' into wakefulness; it needs a spark. Without sufficient intensity, the ADHD brain remains in a state of low-arousal fog. We stack high-lux light with vestibular input (movement) to jumpstart the frontal cortex, turning 'intention' into 'action' without the friction of boredom.",
        spotifyLink: 'https://open.spotify.com/playlist/2TwygCUmV9hogNFqZZ4to2?si=0e20cd0bc7684d86',
        steps: [
          {
            type: 'light',
            label: 'High-Lux Launch',
            instruction: "Direct sunlight is non-negotiable. If unavailable, use a 10,000 Lux SAD lamp at close range as soon as you get out of bed. Your brain needs this photon density to synthesise the dopamine required for focus.",
            duration: '15 min'
          },
          {
            type: 'somatic',
            label: 'Vestibular Wake-Up',
            instruction: "Do not sit. Drink your water or tea while standing, pacing, or stretching. Your brain requires vestibular input (movement through space) to feel fully 'online'."
          },
          {
            type: 'sound',
            label: 'Sonic Drive',
            instruction: "Play complex, fast-tempo music (140+ BPM). Silence allows the mind to wander; structured, high-energy sound anchors you to the present moment."
          }
        ]
      },
      sensor: {
        tagline: 'The Gentle Ascent: Waking Without Overwhelm.',
        description: "For the highly sensitive system, the standard 'alarm and blast' morning routine is assaultive, triggering an immediate cortisol spike that feels like anxiety. Your protocol prioritises a 'Soft Start': waking up and titrating sensory input slowly to allow your nervous system to come online without tripping the threat-detection wires.",
        spotifyLink: 'https://open.spotify.com/playlist/37i9dQZF1DZ06evO1A8iR2?si=fefd25a5476e4952',
        steps: [
          {
            type: 'light',
            label: 'Indirect Illumination',
            instruction: "Do not blast open the curtains immediately. Sit near a window, but out of direct glare. Let the light hit your eyes indirectly first, allowing your pupils to adjust without strain.",
            duration: '20 min'
          },
          {
            type: 'somatic',
            label: 'Thermal Comfort',
            instruction: "Drink warm water. Keep a robe or blanket on. Thermal shock (cold) drains your battery rapidly. Safety signals come from warmth and containment."
          },
          {
            type: 'space',
            label: 'The Low-Demand Zone',
            instruction: "Stay in your 'quiet corner' for the first 15 minutes to take in the morning or meditate. Avoid the high-traffic kitchen hub until you feel physiologically grounded."
          }
        ]
      }
    }
  },

  // ===========================================================================
  // MORNING — HIGH STRESS (new)
  // ===========================================================================
  'morning-calm': {
    id: 'morning-calm',
    name: 'The Steady Ground',
    triggerCondition: 'Morning + High Load',
    variants: {
      anchor: {
        tagline: 'Regulation Before Performance.',
        description: "When your system is already taxed before the day has started, activation is the wrong first move. The priority is to discharge residual stress load and re-establish a regulated baseline before asking anything of your nervous system. Stability first. Performance follows.",
        toolLink: 'https://insig.ht/8UcaqAHTm1b',
        steps: [
          {
            type: 'somatic',
            label: 'Physiological Sigh',
            instruction: "Two sharp inhales through the nose, followed by one long, slow exhale through the mouth. Repeat 5 times. This mechanically resets CO2 balance and activates the parasympathetic brake within 90 seconds.",
            duration: '3 min'
          },
          {
            type: 'light',
            label: 'Soft Natural Light',
            instruction: "Sit near a window without direct glare. Indirect morning light provides the circadian signal without the stimulation spike. Stay still — this is passive intake, not an activation cue.",
            duration: '10 min'
          },
          {
            type: 'space',
            label: 'The Still Point',
            instruction: "Before checking any device or entering any social space, spend five minutes in the quietest room available. Give your nervous system a zero-demand window to find its own footing."
          }
        ]
      },
      seeker: {
        tagline: 'Burn It Off First.',
        description: "For your system, anxiety and restlessness are often the same signal. When the morning arrives with high load, the most direct regulatory tool available to you is physical discharge. Move the stress through the body before attempting any cognitive task.",
        toolLink: 'https://insig.ht/D7GHJJRTm1b',
        steps: [
          {
            type: 'somatic',
            label: 'Discharge Protocol',
            instruction: "10–15 minutes of vigorous physical movement such as jumping jacks, a brisk walk, stretching with weight. Your nervous system needs to metabolise the stress hormones before it can regulate. This is not optional.",
            duration: '15 min'
          },
          {
            type: 'sound',
            label: 'Rhythmic Anchor',
            instruction: "Play steady, rhythmic music — structured and pulse-driven, not chaotic. Rhythm entrains the nervous system. It provides predictability without understimulation."
          },
          {
            type: 'space',
            label: 'Command Point',
            instruction: "After movement, position yourself at your primary workspace with your back to a wall, facing the room. Control of your visual field reduces background vigilance and allows your executive brain to re-engage."
          }
        ]
      },
      sensor: {
        tagline: 'Zero Demands. Full Containment.',
        description: "A high-load morning for the Sensor means the sensory bucket arrived full before the day began, often from poor sleep, overnight noise, or emotional residue. Do not attempt to push through. The only productive move is complete decompression before any environmental exposure.",
        toolLink: 'https://insig.ht/eu6G6KYTm1b',
        steps: [
          {
            type: 'space',
            label: 'The Containment Hold',
            instruction: "Remain in bed or in your quietest space. Heavy blanket on. No screens, no conversation. Give your nervous system a minimum of 10 minutes of zero-input recovery before attempting to enter the day.",
            duration: '10 min'
          },
          {
            type: 'somatic',
            label: 'Thermal Reset',
            instruction: "Warm hands around a hot drink. Heat activates the vagus nerve through the oral-thermal pathway, gently shifting the autonomic state toward ventral vagal regulation."
          },
          {
            type: 'light',
            label: 'Controlled Exposure',
            instruction: "Introduce light incrementally. One lamp on low first. A cracked window before a fully open blind. Your eyes are still in threat-detection mode — do not overwhelm them with a sudden brightness shift."
          }
        ]
      }
    }
  },

  // ===========================================================================
  // AFTERNOON — LOW / MEDIUM STRESS (existing, unchanged)
  // ===========================================================================
  'afternoon-focus': {
    id: 'afternoon-focus',
    name: 'The Second Wind',
    triggerCondition: 'Afternoon + Focus Block',
    variants: {
      anchor: {
        tagline: 'Capture Your Second Peak: The Ultradian Reset.',
        description: "Your brain operates in 90-minute ultradian cycles. To trigger a second peak of focus in the afternoon, we must heighten alertness slightly without spiking anxiety. We use sound frequencies and breathwork to mechanically sharpen the prefrontal cortex.",
        spotifyLink: 'https://insig.ht/TcOSceRQP0b',
        steps: [
          {
            type: 'sound',
            label: '40Hz Gamma Protocol',
            instruction: "Use headphones to listen to 40Hz Gamma waves. This frequency is associated with high-level cognitive synthesis, acting as 'audio caffeine' without the jitters."
          },
          {
            type: 'somatic',
            label: 'The Physiological Sigh',
            instruction: "Perform 5 rounds of the double-inhale, long-exhale pattern. This mechanically pops open the alveoli, offloading CO2 and sharpening alertness instantly."
          },
          {
            type: 'space',
            label: 'The ISO-Stand',
            instruction: "Switch to a standing position. Novel proprioceptive input wakes up the Reticular Activating System (RAS), preventing static lethargy."
          }
        ]
      },
      seeker: {
        tagline: 'The Spotlight Protocol: Forcing the Flow State.',
        description: "You don't lack focus; you lack stimulation. When the task is boring, your brain scans the room for dopamine. We artificially narrow your world using 'The Vignette Effect,' creating a high-contrast environment that forces your attention into the work.",
        spotifyLink: 'https://insig.ht/skmY1CZQP0b',
        steps: [
          {
            type: 'light',
            label: 'The Vignette Effect',
            instruction: "Turn OFF overhead lights. Turn ON a bright task lamp directly on your workspace. This high-contrast 'pool of light' creates a theatrical spotlight, anchoring your gaze."
          },
          {
            type: 'sound',
            label: 'Brown Noise Wall',
            instruction: "Play Brown Noise (rougher and deeper than white noise). It occupies the 'distraction' part of your auditory cortex so the rest of your brain can work."
          },
          {
            type: 'somatic',
            label: 'Active Sitting',
            instruction: "Sit on one leg, use a wobble stool, or chew gum. Give your body a 'fidget job' so your mind is free to stay engaged."
          }
        ]
      },
      sensor: {
        tagline: 'The Shielded Focus: Reducing Sensory Friction.',
        description: "Your distraction is likely caused by sensory fatigue: the exhaust fumes of processing too much data. We don't add stimulation; we subtract it. By reducing the 'signal-to-noise' ratio of your room, we liberate processing power for deep thought.",
        spotifyLink: 'https://insig.ht/UVO8dS7QP0b',
        steps: [
          {
            type: 'light',
            label: 'Glare Reduction',
            instruction: "Dim the room significantly. Ensure no light sources are visible in your peripheral vision. Lower your screen brightness to match the ambient light."
          },
          {
            type: 'space',
            label: 'The Protected Back',
            instruction: "Ensure your back is to a solid wall or a high-backed chair. You cannot focus deeply if your nervous system is subconsciously scanning the open space behind you."
          },
          {
            type: 'somatic',
            label: 'Deep Pressure',
            instruction: "Place a heavy pillow, blanket or weighted lap pad on your thighs. This proprioceptive input grounds you and reduces the feeling of 'sensory flutter'."
          }
        ]
      }
    }
  },

  // ===========================================================================
  // AFTERNOON — HIGH STRESS (new)
  // ===========================================================================
  'afternoon-reset': {
    id: 'afternoon-reset',
    name: 'The Restoration Window',
    triggerCondition: 'Afternoon + High Load',
    variants: {
      anchor: {
        tagline: 'Non-Sleep Deep Rest: The Strategic Recovery.',
        description: "When afternoon load is high, continuing to push cognitive output accelerates depletion without proportional return. The most efficient use of a 20-minute window is Non-Sleep Deep Rest (NSDR) — a protocol that restores dopamine, improves retention, and resets executive function capacity.",
        steps: [
          {
            type: 'somatic',
            label: 'NSDR Protocol',
            instruction: "Lie flat or recline fully. Use a Yoga Nidra or body scan audio. You do not need to fall asleep — the goal is deliberate nervous system downregulation. 20 minutes of NSDR produces equivalent restoration to several hours of light sleep.",
            duration: '20 min',
            toolLink: 'https://insig.ht/TRHQ0iERP0b'
          },
          {
            type: 'light',
            label: 'Light Reduction',
            instruction: "Dim the room or close blinds. High lux in a depleted state increases cortisol without the energy available to use it productively."
          },
          {
            type: 'space',
            label: 'The Closed Door',
            instruction: "Signal to others — and to your own nervous system — that this is protected time. Close the door. Set a timer. Do not compromise the window once it has started."
          }
        ]
      },
      seeker: {
        tagline: 'Pattern Interrupt: The Hard Reset.',
        description: "For the Seeker, afternoon overload is often disguised as boredom or restlessness — the brain has exhausted its available dopamine and is cycling through distraction in search of more. The reset is not stillness; it is a deliberate pattern interrupt that breaks the depletion loop.",
        steps: [
          {
            type: 'somatic',
            label: 'Movement Flush',
            instruction: "Leave your workspace completely. 10 minutes of vigorous movement — a fast walk, stairs, stretching. This physically metabolises stress hormones and triggers a dopamine reset rather than waiting passively.",
            duration: '10 min'
          },
          {
            type: 'space',
            label: 'Environment Change',
            instruction: "Return to a different space from where you were working. Your brain associates the original space with the depleted state. A new visual environment signals novelty to the RAS, providing a meaningful regulatory lift."
          },
          {
            type: 'sound',
            label: 'Binaural Theta Reset',
            instruction: "After movement, 10 minutes of Theta binaural beats (4–8Hz) with eyes closed. This pulls the brain from Beta (active/stressed) toward Theta (rest/consolidation) without requiring sleep.",
            duration: '18 min',
            toolLink: 'https://insig.ht/7mS0eZaUm1b'
          }
        ]
      },
      sensor: {
        tagline: 'Sensory Retreat: Emptying the Afternoon Bucket.',
        description: "By high-stress afternoon, the Sensor's processing capacity is at or near threshold. Any additional input, no matter how benign, is now experienced as friction. The only effective intervention is complete sensory withdrawal. This is not laziness; it is physiological necessity.",
        toolLink: 'https://insig.ht/SGjhihjUm1b',
          steps: [
          {
            type: 'space',
            label: 'The Retreat Room',
            instruction: "Move to the quietest available space. Lie down or sit fully supported. No phone, no background sound, no open doors. If sharing the space, use noise-cancelling headphones even in silence.",
            duration: '15 min'
          },
          {
            type: 'light',
            label: 'Near-Darkness',
            instruction: "Dim to the lowest tolerable level or use an eye mask. Visual input is one of the highest-bandwidth sensory channels. Taking it offline gives your cortex the most significant processing relief available."
          },
          {
            type: 'somatic',
            label: 'Weight and Warmth',
            instruction: "A heavy blanket, cushion, or coat over your legs and torso. Proprioceptive pressure tells the nervous system it is physically contained and not in danger. This is a direct input to the autonomic regulation pathway, not a comfort preference."
          }
        ]
      }
    }
  },

  // ===========================================================================
  // EVENING — LOW / MEDIUM STRESS (existing, unchanged)
  // ===========================================================================
  'evening-taper': {
    id: 'evening-taper',
    name: 'The Descent',
    triggerCondition: 'Evening + Sleep Prep',
    variants: {
      anchor: {
        tagline: 'Engineer Your Restoration: The Biological Sunset.',
        description: "As the day concludes, your nervous system craves a deliberate transition. We are moving beyond 'hoping' for sleep to designing your recovery. By mimicking the setting sun, we signal to the pineal gland that vigilance is no longer required.",
        spotifyLink: 'https://open.spotify.com/playlist/37i9dQZF1DWXSyfX6gqDNp?si=4e071e2e23394ff5',
        steps: [
          {
            type: 'light',
            label: 'Kelvin Drop',
            instruction: "Switch to warm-spectrum (<2700K) lamps. Ensure all light sources are below eye level to mimic the angle of the setting sun."
          },
          {
            type: 'space',
            label: 'Visual Closure',
            instruction: "Close blinds and doors. This creates a containment vessel, signaling safety to the amygdala and preparing the body for vulnerability."
          },
          {
            type: 'sound',
            label: 'Acoustic Softening',
            instruction: "Transition to instrumental audio only. Lyrics require language processing; instrumental sound allows the verbal centres of the brain to deactivate."
          }
        ]
      },
      seeker: {
        tagline: 'The Dopamine Detox: Landing the Plane.',
        description: "Your brain fights sleep because it feels 'boring' compared to the high-dopamine stimulation of the day. We need to transition you from High-Dopamine (screens) to Low-Dopamine (rest) using complex, engaging tools like Tibetan Gongs or Body Scans that keep the ADHD brain occupied while the body shuts down.",
        spotifyLink: 'https://insig.ht/j0QXp1mRP0b',
        steps: [
          {
            type: 'somatic',
            label: 'Vipassana Body Scan',
            instruction: "The ADHD brain struggles to 'let go'. Do not try to empty your mind. Instead, do a Vipassana body scan. Move your attention from toes to head. This gives your 'monkey mind' a specific job to do, preventing it from spiraling into tomorrow's to-do list.",
            toolLink: 'https://insig.ht/47MXPahRP0b'
          },
          {
            type: 'sound',
            label: 'Tibetan Gong Bath',
            instruction: "Play complex soundscapes like Tibetan Gongs. Unlike white noise (which is static), gongs have complex harmonics that satisfy the ADHD brain's need for novelty while dragging brainwaves down into Theta (dream) states.",
            toolLink: 'https://insig.ht/Uk4k9dwRP0b'
          },
          {
            type: 'somatic',
            label: 'NSDR / Yoga Nidra',
            instruction: "If you cannot sleep, switch to Non-Sleep Deep Rest (Yoga Nidra). This protocol systematically shuts down the nervous system even if the mind is awake. 20 minutes of NSDR equals 3–4 hours of restorative recovery.",
            toolLink: 'https://insig.ht/TRHQ0iERP0b'
          }
        ]
      },
      sensor: {
        tagline: 'Sensory Decompression: Emptying the Bucket.',
        description: "The modern world is loud and bright. By evening, your sensory bucket is full. This protocol is not just about sleep; it is about 'emptying the bucket' so you don't carry today's overstimulation into tomorrow.",
        spotifyLink: 'https://app.declutterthemind.com/?meditation=1677352314447x311753051750268900',
        steps: [
          {
            type: 'space',
            label: 'The Compression Cocoon',
            instruction: "Get into bed early. Use heavy blankets. Create a small, enclosed space. You need physical containment to feel safe enough to let your guard down."
          },
          {
            type: 'light',
            label: 'Zero Lux Protocol',
            instruction: "A blackout mask is essential. Even the standby light on a TV is a photon signal that your vigilant nervous system will track."
          },
          {
            type: 'sound',
            label: 'Noise Masking',
            instruction: "Silence can be 'loud' if you hear every house creak. Use this nature sound to smooth out the auditory edges of the room.",
            toolLink: 'https://insig.ht/oiIEJeSRP0b'
          }
        ]
      }
    }
  },

  // ===========================================================================
  // EVENING — HIGH STRESS (new)
  // ===========================================================================
  'evening-shelter': {
    id: 'evening-shelter',
    name: 'The Shelter Protocol',
    triggerCondition: 'Evening + High Load',
    variants: {
      anchor: {
        tagline: 'Safety First. Sleep Follows.',
        description: "When the day has been genuinely dysregulating, attempting a standard wind-down routine is counterproductive. The nervous system is still in threat-assessment mode and will resist the transition. The first priority is to re-establish a physiological sense of safety. Once the threat signal subsides, sleep comes naturally.",
        steps: [
          {
            type: 'somatic',
            label: 'Thermal Descent',
            instruction: "Take a warm shower or bath 60–90 minutes before bed. The subsequent body temperature drop mimics the natural cooling signal that precedes deep sleep, creating a reliable biological bridge to rest.",
            duration: '15 min'
          },
          {
            type: 'space',
            label: 'Full Environmental Closure',
            instruction: "Close every door and blind. Remove visible clutter from immediate sight lines. Your amygdala continues scanning even as you try to rest. Reducing visual data points lowers the threat-detection burden."
          },
          {
            type: 'somatic',
            label: 'Somatic Grounding',
            instruction: "Lie down. Place one hand on your chest, one on your abdomen. Take 10 slow, deliberate breaths feeling the rise and fall. This body-contact grounding activates interoceptive awareness and anchors attention away from ruminative thought.",
            spotifyLink: 'https://insig.ht/cT2RQ9xUm1b'
          }
        ]
      },
      seeker: {
        tagline: 'Discharge and Descend.',
        description: "A high-load evening for the Seeker is characterised by a racing, looping mind that cannot find the off switch. The system is still in high-dopamine mode. The fastest path to rest is physical exhaustion followed by a controlled descent using somatic tools the ADHD brain will actually engage with.",
        steps: [
          {
            type: 'somatic',
            label: 'Physical Release',
            instruction: "If possible, 10–15 minutes of vigorous physical exertion before wind-down begins. This is not exercise for fitness — it is stress hormone metabolisation. The goal is to arrive at your bedroom with an emptied sympathetic tank.",
            duration: '15 min'
          },
          {
            type: 'somatic',
            label: 'Progressive Muscle Release',
            instruction: "Lying down, systematically tense and release each muscle group from feet to face. Hold each tension for 5 seconds, release for 10. This is one of the most reliable tools for bringing a hyper-aroused nervous system into a parasympathetic state.",
            duration: '10 min'
          },
          {
            type: 'sound',
            label: 'Delta Entrainment',
            instruction: "Play binaural beats in the Delta range (0.5–4Hz). Unlike Theta, Delta is specifically associated with deep non-REM sleep. The ADHD brain will track the frequency rather than spiral, allowing it to be pulled down rather than fighting the descent.", 
            spotifyLink: 'https://insig.ht/SbedT0EUm1b'
          }
        ]
      },
      sensor: {
        tagline: 'The Total Sanctuary.',
        description: "A high-load evening for the Sensor means the bucket overflowed before bedtime arrived. Standard protocol is insufficient. You require a complete sensory sanctuary — an environment so stripped of input that your nervous system has nothing left to process, and the only available direction is inward and down.",
        steps: [
          {
            type: 'light',
            label: 'Absolute Darkness',
            instruction: "Every light source eliminated. Blackout blind or mask. Any screen indicator covered with tape. This is non-negotiable — even a single LED is a photon signal your vigilant system will track through the night."
          },
          {
            type: 'sound',
            label: 'Acoustic Sealing',
            instruction: "Layer your acoustic shield: foam or silicone earplugs first, then noise-cancelling headphones if needed. Play pink noise or nature sound at very low volume if complete silence increases hypervigilance.",
            toolLink: 'https://insig.ht/oiIEJeSRP0b'
          },
          {
            type: 'somatic',
            label: 'Full Compression',
            instruction: "Maximum weighted blanket coverage. Body fully supported. Position a body pillow to reduce the sensation of open space on vulnerable sides. The nervous system reads physical enclosure as biological safety."
          }
        ]
      }
    }
  }

}
