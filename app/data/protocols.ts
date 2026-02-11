export type SensoryAction = {
  type: 'light' | 'sound' | 'space' | 'somatic'
  label: string
  instruction: string
  duration?: string // e.g., "10 min"
  toolLink?: string // Link to an internal tool (e.g., /tools/noise-meter)
}

export type Protocol = {
  id: string
  name: string
  tagline: string
  description: string
  triggerCondition: string // Just for our reference
  steps: SensoryAction[]
}

export const PROTOCOLS: Record<string, Protocol> = {
  // --- MORNING RECIPES ---
  'morning-activation': {
    id: 'morning-activation',
    name: 'Photon Anchor',
    tagline: 'Signal the day has begun.',
    description: 'Your cortisol is low. We need to signal the SCN (Master Clock) to wake up.',
    triggerCondition: 'Morning + Low Energy',
    steps: [
      { type: 'light', label: 'Sky View', instruction: 'Get 10 minutes of early morning sunlight. Go outside, sit on the balcony or open a window.', duration: '10 min' },
      { type: 'space', label: 'Open Boundaries', instruction: 'Open all curtains and windows to maximise Visual Expansion.' },
      { type: 'somatic', label: 'Cold Signal', instruction: 'Brief cold water splash to face to trigger noradrenaline.' }
    ]
  },
  'morning-calm': {
    id: 'morning-calm',
    name: 'Optical Expansion',
    tagline: 'Reduce morning anxiety.',
    description: 'High stress in the morning means the amygdala is over-active. We need to broaden the visual field.',
    triggerCondition: 'Morning + High Stress',
    steps: [
      { type: 'space', label: 'Horizon Gaze', instruction: 'Find the furthest point you can see. Soften your gaze.', duration: '2 min' },
      { type: 'light', label: 'Indirect Light', instruction: 'Avoid direct overhead beams. Use diffuse, side-lighting.' },
      { type: 'sound', label: 'Silence', instruction: 'Keep artificial audio off. Allow natural ambient sounds.' }
    ]
  },

  // --- EVENING RECIPES ---
  'evening-taper': {
    id: 'evening-taper',
    name: 'Sunset Taper',
    tagline: 'Protect your melatonin.',
    description: 'Standard evening protocol to prepare the nervous system for sleep.',
    triggerCondition: 'Evening + Normal',
    steps: [
      { type: 'light', label: 'Kelvin Drop', instruction: 'Switch all lights to warm (<3000K) and turn off overheads.', toolLink: '/tools/light-meter' },
      { type: 'sound', label: 'Acoustic Softening', instruction: 'Switch from lyrical music to instrumental or lo-fi.' },
      { type: 'space', label: 'Visual Closure', instruction: 'Close curtains to create a sense of enclosure and safety.' }
    ]
  },
  'evening-shelter': {
    id: 'evening-shelter',
    name: 'Shelter Protocol',
    tagline: 'Emergency nervous system reset.',
    description: 'You are wired and stressed. We need to manually ease the body into Rest & Digest mode.',
    triggerCondition: 'Evening + High Stress',
    steps: [
      { type: 'light', label: 'Blackout Mode', instruction: 'Turn off ALL lights. Use only candlelight in heat sfe containers or amber nightlight.' },
      { type: 'sound', label: 'Brown Noise', instruction: 'Play Brown Noise to mask startle triggers.', toolLink: '/tools/noise-meter' },
      { type: 'somatic', label: 'Deep Pressure', instruction: 'Use a weighted blanket or heavy throw on legs.', duration: '20 min' },
      { type: 'space', label: 'The Dorsal Corner', instruction: 'Sit in a corner where no one can walk behind you.' }
      ]
  }
}
