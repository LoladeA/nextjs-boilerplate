export type TimeOfDay = 'morning' | 'afternoon' | 'evening'
export type StressLevel = 'low' | 'medium' | 'high'

// The 3 Neuro-Sensory Profiles
export type SensoryProfile = 'anchor' | 'seeker' | 'sensor'

export type SensoryAction = {
  type: 'light' | 'sound' | 'space' | 'somatic'
  label: string
  instruction: string
  duration?: string 
  toolLink?: string 
}

// Each profile gets its own rich narrative
export type RitualVariant = {
  tagline: string
  description: string
  spotifyLink?: string
  steps: SensoryAction[]
}

export type Ritual = {
  id: string
  name: string
  triggerCondition: string 
  variants: {
    anchor: RitualVariant // 🟢 RENAMED from 'standard'
    seeker: RitualVariant   
    sensor: RitualVariant   
  }
}

export const RITUALS: Record<string, Ritual> = {
  
  // --- MORNING RHYTHMS ---
  'morning-activation': {
    id: 'morning-activation',
    name: 'First Light Rhythm',
    triggerCondition: 'Morning + Low Energy',
    variants: {
      // 🟢 THE ANCHOR PROFILE (Balanced / Grounded)
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

      // 🟠 SEEKER PROFILE (ADHD / Needs Stimulation)
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

      // 🔵 SENSOR PROFILE (HSP / Needs Safety)
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

  // --- AFTERNOON FOCUS ---
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
        tagline: 'The Shielded Focus: reducing Sensory Friction.',
        description: "Your distraction is likely caused by sensory fatigue: the exhaust fumes of processing too much data. We don't add stimulation; we subtract it. By reducing the 'signal-to-noise' ratio of your room, we liberate processing power for deep thought.",
        spotifyLink: 'https://insig.ht/UVO8dS7QP0b',
        steps: [
          { 
            type: 'light', 
            label: 'Glare Reduction', 
            instruction: "Dim the room significantly. You will feel it when you reach the level you need. Ensure no light sources are visible in your peripheral vision. Lower your screen brightness to match the ambient light." 
          },
          { 
            type: 'space', 
            label: 'The Protected Back', 
            instruction: "Ensure your back is to a solid wall or a hich backed chair. You cannot focus deeply if your nervous system is subconsciously scanning the open space behind you." 
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

  // --- EVENING RESET ---
  'evening-taper': {
    id: 'evening-taper',
    name: 'The Descent',
    triggerCondition: 'Evening + Sleep Prep',
    variants: {
      
      // 🟢 ANCHOR PROFILE
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
            instruction: "Transition to instrumental audio only. Lyrics require language processing; instrumental sound allows the verbal centers of the brain to deactivate." 
          }
        ]
      },

      // 🟠 SEEKER PROFILE (ADHD / Needs Engagement to Rest)
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
            instruction: "If you cannot sleep, switch to Non-Sleep Deep Rest (Yoga Nidra). This protocol systematically shuts down the nervous system even if the mind is awake. 20 minutes of NSDR equals 3-4 hours of restorative recovery.",
            toolLink: 'https://insig.ht/TRHQ0iERP0b'
          }
        ]
      },

      // 🔵 SENSOR PROFILE (HSP / Needs Emptying)
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
  }
}
