export type SensoryAction = {
  type: 'light' | 'sound' | 'space' | 'somatic'
  label: string
  instruction: string
  duration?: string 
  toolLink?: string 
}

export type Protocol = {
  id: string
  name: string
  tagline: string
  description: string
  triggerCondition: string 
  steps: SensoryAction[]
}

export const PROTOCOLS: Record<string, Protocol> = {
  // --- MORNING RECIPES ---
  'morning-activation': {
    id: 'morning-activation',
    name: 'Photon Anchor',
    tagline: 'Master Your Morning: Activate Your Neuro-Hormonal Advantage.',
    description: "Your internal clock, the Suprachiasmatic Nucleus (SCN), is the CEO of your day. To unlock peak cognitive clarity and sustained energy, we must strategically signal the Cortisol Awakening Response (CAR): a natural neuro-hormonal surge that prepares your system for the demands ahead. You are designing your physiological launch sequence for optimal performance and resilience.",
    triggerCondition: 'Morning + Low Energy / Suboptimal Focus',
    steps: [
      { 
        type: 'light', 
        label: 'Sky View: The First Signal', 
        instruction: "Within 10 minutes of waking, seek 10-15 minutes of direct, early morning sunlight. Step outside, onto a balcony, or open a window fully. This deliberate action sets your circadian rhythm, priming your brain for focus and metabolic activity. Think of it as calibrating your internal compass for the day's journey.", 
        duration: '10-15 min' 
      },
      { 
        type: 'space', 
        label: 'Open Boundaries: Expand Your Cognitive Horizon', 
        instruction: "Open all curtains and blinds, and if possible, windows. This action maximises 'Visual Expansion', which reduces perceived confinement and cognitive load. By physically opening your space, you're signaling to your nervous system that the environment is adapting to you, fostering a sense of agency and clarity. You are creating an expansive mental and physical landscape for your day." 
      },
      { 
        type: 'somatic', 
        label: 'Cold Signal: The Noradrenaline Ignition', 
        instruction: "A brief splash of cold water to the face, or a quick cold rinse, serves as a potent, non-stressful trigger for noradrenaline release. This enhances alertness, sharpens focus, and improves mood without the dysregulation of a startle response. It's a micro-dose of physiological activation, signaling readiness and elevating your baseline state for immediate engagement." 
      }
    ]
  },
  'morning-calm': {
    id: 'morning-calm',
    name: 'Optical Expansion',
    tagline: 'Strategic Calm.',
    description: "When morning stress or anxiety takes hold, your amygdala—the brain's alarm system—can become overactive, narrowing your focus and creating a sense of threat. 'Optical Expansion' is your de-escalation protocol, leveraging the neuroscience of panoramic vision to signal safety to your nervous system. By consciously broadening your visual field and curating your sensory environment, you reclaim agency, down-regulate the amygdala, and transition from reactive anxiety to proactive calm.",
    triggerCondition: 'Morning + High Stress / Amygdala Over-activation',
    steps: [
      { 
        type: 'space', 
        label: 'Horizon Gaze: The Panoramic Reset', 
        instruction: "**Reclaim Your Perspective:** For 2 minutes, find the furthest point you can see—whether through a window or across a room. Soften your gaze, allowing your peripheral vision to expand. This deliberate act of 'Optical Expansion' signals safety to your brain, directly inhibiting the amygdala and shifting your nervous system from a threat-response to a state of calm. It's a powerful, immediate reframe that asserts your agency over your environment, rather than adapting to its perceived pressures.", 
        duration: '2 min' 
      },
      { 
        type: 'light', 
        label: 'Ambient Illumination: Soften the Sensory Load', 
        instruction: "**Curate Your Visual Field:** Avoid harsh, direct overhead lighting. Instead, opt for diffuse, indirect, or side-lighting. Bright, direct light can be perceived as an alerting signal, inadvertently contributing to cognitive overload and a heightened sense of urgency. By softening your illumination, you reduce unnecessary sensory input, fostering an environment that supports regulation over overstimulation, and allowing your nervous system to find its natural rhythm." 
      },
      { 
        type: 'sound', 
        label: 'Sonic Sanctuary: Reclaim Your Auditory Landscape', 
        instruction: "**Silence the Noise, Amplify Clarity:** Keep artificial audio—news, podcasts, aggressive music—off. Allow natural ambient sounds to permeate your space. The absence of jarring or information-dense auditory input reduces cognitive load and allows your nervous system to process information more efficiently. This isn't about emptiness; it's about creating a 'sonic sanctuary' that supports deep regulation, preventing the subtle erosion of your mental and emotional resources." 
      }
    ]
  },

  // --- EVENING RECIPES ---
  'evening-taper': {
    id: 'evening-taper',
    name: 'Sunset Taper',
    tagline: 'Engineer Your Evening for Deep Restoration.',
    description: "As the day concludes, your nervous system craves a deliberate transition, not a chaotic crash. You are actively engineering your internal environment for sleep onset, depth, and quality. We're moving beyond hoping for rest to designing your recovery, ensuring your body and mind are primed for optimal restoration and resilience.",
    triggerCondition: 'Evening + Normal / Proactive Sleep Preparation',
    steps: [
      { 
        type: 'light', 
        label: 'Kelvin Drop: The Melatonin Signal', 
        instruction: "90-120 minutes before your target sleep time, switch off all overhead lights and use warm-spectrum (<2700K) lighting. Dim them significantly (<50 lux). Avoid direct, blue-rich light from screens. Your environment is now actively facilitating your physiological transition to sleep.", 
        toolLink: '/tools/light-meter'
      },
      { 
        type: 'sound', 
        label: 'Acoustic Softening: The Sonic Sanctuary', 
        instruction: "Transition from information-dense or lyrical music to instrumental, ambient, or lo-fi soundscapes. The goal is to reduce cognitive load and prevent auditory startle responses that can spike cortisol. This creates an environment where your nervous system can down-regulate without interruption, allowing your brain to shift from active processing to restorative states." 
      },
      { 
        type: 'space', 
        label: 'Visual Closure: The Cocoon for Restoration', 
        instruction: "Close curtains, blinds, and if possible, bedroom doors. This action reduces external stimuli and creates a sense of enclosure and safety. It signals to your amygdala that the environment is secure, allowing your nervous system to release its vigilance and prepare for the vulnerability of sleep." 
      }
    ]
  },
  'evening-shelter': {
    id: 'evening-shelter',
    name: 'Shelter Protocol',
    tagline: 'Emergency Reset: Reclaim Calm from Overwhelm.',
    description: "When the day's demands leave your nervous system 'wired and stressed' and your amygdala is stuck in overdrive, the natural descent into restorative sleep feels impossible. You are leveraging environmental and somatic signals to de-escalate acute stress, reclaim your internal agency, and initiate profound recovery when you need it most.",
    triggerCondition: 'Evening + High Stress / Amygdala Over-activation',
    steps: [
      { 
        type: 'light', 
        label: 'Blackout Mode: Absolute Darkness Protocol', 
        instruction: "Turn off ALL artificial lights. Use only true blackout curtains. If any light is necessary, use candlelight in heat-safe containers or a dedicated amber-only nightlight. You are creating absolute darkness to maximise melatonin release and signal to your brain that it is time to cease vigilance and initiate deep physiological repair. Every photon is a signal; in this mode, the signal is 'safe to rest'.", 
      },
      { 
        type: 'sound', 
        label: 'Brown Noise: The Auditory Anchor', 
        instruction: "Play Brown Noise at a consistent, low volume. Unlike silence, which can make internal sounds (like heartbeats) more prominent and trigger anxiety, Brown Noise provides a deep, continuous, and non-threatening auditory anchor. It effectively masks sudden, jarring sounds that could trigger a startle response, allowing your amygdala to stand down and your nervous system to find a state of sustained calm.", 
        toolLink: '/tools/noise-meter'
      },
      { 
        type: 'somatic', 
        label: 'Deep Pressure: The Vagal Nerve Embrace', 
        instruction: "Apply deep, consistent pressure using a weighted blanket or a heavy throw across your legs and torso for at least 20 minutes. This is a direct somatic input that stimulates the vagal nerve, activating the parasympathetic nervous system, reducing heart rate, lowering cortisol, and promoting the release of oxytocin.", 
        duration: '20 min' 
      },
      { 
        type: 'space', 
        label: 'The Dorsal Corner: Primal Safety Zone', 
        instruction: "Position yourself in a corner of the room, ideally with your back to a solid wall and facing the entrance. This leverages a primal, evolutionary safety mechanism that eliminates the possibility of a perceived threat from behind, reducing the brain’s need for constant vigilance. This allows your nervous system to fully disengage from its defensive posture and enter a state of deep calm." 
      }
    ]
  }
}
