export type NeuroInsight = {
  id: number
  category: string
  title: string
  // TIER 1: The Hook (Visible)
  free: {
    sciencefact: string      // Updated Key
    whyitmatters: string     // Updated Key
  }
  // TIER 2: The Solution (Paid/Locked)
  paid: {
    protocol: string
    primaryadjustment: string // Updated Key
    refinement: string[]
    whyitWorks: string        // Updated Key
    integrationcue: string
  }
}

export const neuroInsights: NeuroInsight[] = [
  // --- CARD 1: EXACT MATCH TO YOUR REQUEST ---
  {
    id: 1,
    category: "Cognitive Load",
    title: "Cognitive Fog & Visual Load",
    free: {
      sciencefact: "When too many objects are visible, your brain keeps scanning and sorting them, which reduces available working memory.",
      whyitmatters: "Visual simplicity frees up mental bandwidth for focus."
    },
    paid: {
      protocol: "NeuroDesign Protocol",
      primaryadjustment: "Clear all non-essential items from your 180° field of view while seated at your desk.",
      refinement: [
        "Limit visible objects to three functional items only. Store everything else within arm’s reach but out of sight.",
        "If removal isn’t possible, group items inside a single tray or defined boundary to reduce visual scanning."
      ],
      whyitWorks: "Your brain constantly scans for meaning. Reducing visual variables decreases cognitive processing demand.",
      integrationcue: "You notice fewer micro-glances around the room and longer stretches of uninterrupted focus."
    }
  },

  // --- CARD 2: SENSORY SENSITIVITY ---
  {
    id: 2,
    category: "Sensory Sensitivity",
    title: "Heightened Sensory Sensitivity",
    free: {
      sciencefact: "When the nervous system is overloaded, it struggles to filter background input, making ordinary sounds or light flicker feel amplified.",
      whyitmatters: "If your brain cannot filter out background noise, it creates an 'energy leak' caused by constantly filtering out background hums."
    },
    paid: {
      protocol: "Acoustic Buffering Protocol",
      primaryadjustment: "Identify one persistent sensory irritant (such as a hum, flicker or glare) and eliminate or reduce its impact within 48 hours.",
      refinement: [
        "Swap cool-white LEDs for flicker-free warm bulbs.",
        "Add a soft textile layer, such as a rug, curtain or panel, to absorb high-frequency sound.",
        "If elimination isn’t possible, introduce consistent masking sound (pink noise) to reduce unpredictability."
      ],
      whyitWorks: "Reducing unpredictable sensory spikes allows the nervous system to exit defensive vigilance.",
      integrationcue: "You will feel less on edge because you have identified the cause and taken steps to mitigate it."
    }
  },

  // --- CARD 3: CIRCADIAN INTEGRITY ---
  {
    id: 3,
    category: "Circadian Integrity",
    title: "Circadian Misalignment",
    free: {
      sciencefact: "Light is the primary regulator of your internal clock. Bright light at night or insufficient morning light disrupts melatonin production and hormonal balance, which impacts energy rhythms and sleep timing.",
      whyitmatters: "Misaligned light cues keep the body alert when it should be winding down, and vice versa.
."
    },
    paid: {
      protocol: "Luminous Entrainment Protocol",
      primaryadjustment: "Establish strict Kelvin anchors: 4500K–6500K in the morning, <3000K in the evening.",
      refinement: [
        "Get 20 minutes of early morning sunlight within 1 hour of waking.",
        "Dim all overhead lights up to 3 hours before bed.",
        "Use amber-tinted sources for night waking.",
        "If natural light is limited, use a full-spectrum task lamp positioned at eye level."
      ],
      whyitWorks: "Your circadian system reads light as time. Correct light timing signals the SCN (Master Clock) to release cortisol for energy or melatonin for rest.",
      integrationcue: "You will begin feeling naturally sleepy at night instead of wired but tired."
    }
  },

  // --- CARD 4: ANXIETY REGULATION ---
  {
    id: 4,
    category: "Anxiety Regulation",
    title: "Amygdala Reactivity",
    free: {
      sciencefact: "Unpredictable sensory input and harsh visual contrasts activate the brain’s threat detection system, thereby increasing vigilance.",
      whyitmatters: "Maintaining constant vigilance can drain your capacity for emotional regulation."
    },
    paid: {
      protocol: "Refuge & Prospect Protocol",
      primaryadjustment: "Soften visual edges and use indirect lighting sources to reduce threat signalling.",
      refinement: [
        "Avoid seating with your back to the door.",
        "Use floor lamps instead of overhead downlights.",
        "Create a 'protected back' zone in your main room.",
        "If full lighting replacement isn’t possible, lower intensity by 30–40% in the evening."
        ],
      whyitWorks: "The nervous system relaxes when light transitions are gradual and predictable.",
      integrationcue: "Doorways and transition areas feel less activating and more neutral."
    }
  },

  // --- CARD 5: PREDICTABILITY ---
  {
    id: 5,
    category: "Predictability",
    title: "Predictability & Hierarchy",
    free: {
      sciencefact: "The brain conserves energy when environments are predictable. Inconsistent lighting, unclear visual pathways, unpredictable shadows or erratic noise increase cognitive effort.",
      whyitmatters: "Spatial order acts as an 'external brain,' reducing the cognitive load required to navigate your day."
    },
    paid: {
      protocol: "Spatial Order Protocol",
      primaryadjustment: "Establish clear visual pathways, consistent lighting anchors and establish one clear focal anchor in each main room (eg art, plant, architectural feature).",
      refinement: [
        "Clear all walkways of obstacles.",
        "Align lighting so the brightest point supports the primary function of the room.",
        "Group visual clutter into opaque storage.",
        "If structural changes aren’t possible, use rugs or lighting to visually define movement flow."
      ],
      whyitWorks: "Predictable environments consume less metabolic energy, allowing for deeper relaxation.",
      cue: "Movement through the your environment will feel automatic rather than effortful."
    }
  },

  // --- CARD 6: THERMOREGULATION ---
  {
    id: 6,
    category: "Thermoregulation",
    title: "Thermal & Surface Discomfort",
    free: {
      sciencefact: "The nervous system constantly monitors temperature and surface contact. Even subtle thermal discomfort increases stress signals for some.",
      whyitmatters: "When your body is busy adjusting to temperature shifts, it has fewer resources for rest and focus."
    },
    paid: {
      protocol: "Micro-Thermoregulation Protocol",
      primaryadjustment: "Provide one accessible form of thermal control within arm's reach, such as a fan, a breathable throw or layered bedding.",
      refinement: [
        "Ensure at least two temperature-adjustable layers in sleep and work zones (e.g., light blanket + weighted layer)",
        "Use breathable, natural fibers for contact points.",
        "Ensure airflow can be directed manually.",
        "If HVAC control is limited, create micro-climates using localised air movement (desk fan, heated footrest)."
      ],
      whyitWorks: "Immediate thermal agency reduces the panic response associated with physical discomfort.",
      integrationcue: "You stop constantly adjusting clothing or shifting position to regulate comfort."
    }
  },

  // --- CARD 7: FOCUS CAPACITY ---
  {
    id: 7,
    category: "Focus Capacity",
    title: "Prefrontal Tax & Focus",
    free: {
      sciencefact: "Overstimulating environments and glare reduce prefrontal efficiency, making decision-making biologically difficult.",
      whyitmatters: "Protecting your visual field from glare preserves the glucose needed for high-level thinking."
    },
    paid: {
      protocol: "Cognitive Offloading Protocol",
      primaryadjustment: "Implement a Matte-Only policy in zones with bright or direct light sources; and shield light sources.",
      refinement: [
        "Cover glossy surfaces with matte desk mats.Position task lighting to the side—not directly overhead.",
        "Position screens perpendicular to windows.",
        "If glare cannot be eliminated, reduce bulb brightness by 30% and introduce a diffusing lamp shade.",
        "Use bias lighting behind monitors."
      ],
      whyitWorks: "Reducing glare eliminates the micro-adjustments your eyes and brain must make constantly.",
      integrationcue: "You experience longer focus sessions without the familiar mental drain."
    }
  },

  // --- CARD 8: PSYCHOLOGICAL SAFETY ---
  {
    id: 8,
    category: "Psychological Safety",
    title: "Identity & Safety",
    free: {
      sciencefact: "A home that feels misaligned with your identity acts as a constant 'second skin' irritant, undermining emotional safety.",
      whyitmatters: "Environmental resonance signals to the nervous system that 'this is my territory,' enabling deep rest."
    },
    paid: {
      protocol: "Atmosphere Architecture Protocol",
      primaryadjustment: "Align visual anchors with personal identity markers.",
      refinement: [
        "Identify one visible object that reflects a past version of you and remove or replace it.",
        "Remove decor that feels 'performative' or obligatory.",
        "Introduce one authentic identity anchor (art, material, colour, scent) that reflects who you are now.",
        "f removal feels difficult, relocate outdated objects to a transitional storage zone."
      ],
      whyitWorks: "Identity alignment signals safety to the social engagement system (Vagus Nerve).",
      integrationcue: "You will feel more at home and regulated in your own home."
    }
  }
]
