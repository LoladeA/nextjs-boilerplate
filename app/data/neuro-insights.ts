export type NeuroInsight = {
  id: number
  category: string
  title: string
  // TIER 1: The Hook (Visible)
  free: {
    sciencefact: string
    whyitmatters: string
  }
  // TIER 2: The Solution (Paid/Locked)
  paid: {
    protocol: string
    primaryadjustment: string
    refinement: string[]
    whyitWorks: string
    integrationcue: string
  }
}

export const neuroInsights: NeuroInsight[] = [
  // --- CARD 1: COGNITIVE LOAD ---
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
      whyitmatters: "Misaligned light cues keep the body alert when it should be winding down, and vice versa."
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
      primaryadjustment: "Establish clear visual pathways, consistent lighting anchors and establish one clear focal anchor in each main room (e.g., art, plant, architectural feature).",
      refinement: [
        "Clear all walkways of obstacles.",
        "Align lighting so the brightest point supports the primary function of the room.",
        "Group visual clutter into opaque storage.",
        "If structural changes aren’t possible, use rugs or lighting to visually define movement flow."
      ],
      whyitWorks: "Predictable environments consume less metabolic energy, allowing for deeper relaxation.",
      integrationcue: "Movement through your environment will feel automatic rather than effortful."
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
        "Ensure at least two temperature-adjustable layers in sleep and work zones (e.g., light blanket + weighted layer).",
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
        "Cover glossy surfaces with matte desk mats. Position task lighting to the side—not directly overhead.",
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
        "If removal feels difficult, relocate outdated objects to a transitional storage zone."
      ],
      whyitWorks: "Identity alignment signals safety to the social engagement system (Vagus Nerve).",
      integrationcue: "You will feel more at home and regulated in your own home."
    }
  }

  // --- CARD 9: ENTRYWAY DYNAMICS ---
  {
    id: 9,
    category: "Entryway Dynamics",
    title: "The Drop Zone Anxiety",
    free: {
      sciencefact: "Entering a visually chaotic home environment can trigger a subtle stress response before you consciously register it.",
      whyitmatters: "First impressions shape whether your nervous system shifts into rest or stays on alert."
    },
    paid: {
      protocol: "NeuroDesign Protocol",
      primaryadjustment: "Create a fixed landing pad at the entry point for keys, bags, and daily carry items.",
      refinement: [
        "Keep this zone visually simple and physically contained (tray, hook, shallow drawer).",
        "If space is limited: Use a single wall hook and small bowl; consistency matters more than size."
      ],
      whyitWorks: "Closing the entry loop signals to your nervous system that transition is complete.",
      integrationcue: "You feel a subtle exhale after placing items down instead of scanning for where to put them."
    }
  },

  // --- CARD 10: SPATIAL FLOW ---
  {
    id: 10,
    category: "Spatial Flow",
    title: "Decision Fatigue (Bottlenecks)",
    free: {
      sciencefact: "Navigating around obstacles requires small, repeated adjustments that add to cognitive load over time.",
      whyitmatters: "The more automatic your movement, the less background energy your brain expends."
    },
    paid: {
      protocol: "NeuroDesign Protocol",
      primaryadjustment: "Ensure main walkways are at least 90cm wide to allow automatic movement.",
      refinement: [
        "Remove one obstacle from each frequently used path this week.",
        "If restructuring isn’t possible: Reposition one piece of furniture to eliminate daily side-stepping."
      ],
      whyitWorks: "Automatic movement reduces cognitive load and lowers background vigilance.",
      integrationcue: "You move through your home environment without adjusting your body mid-step."
    }
  },

  // --- CARD 11: COGNITIVE LOAD ---
  {
    id: 11,
    category: "Cognitive Load",
    title: "Open Loops (Unfinished Tasks)",
    free: {
      sciencefact: "Visible unfinished tasks tend to stay active in the mind, keeping attention partially tethered to them (Zeigarnik Effect).",
      whyitmatters: "Reducing visual reminders helps the brain stand down during rest."
    },
    paid: {
      protocol: "NeuroDesign Protocol",
      primaryadjustment: "Store active projects in opaque containers at the end of each day.",
      refinement: [
        "Designate one “active project zone” to prevent visual spillover.",
        "If storage is limited: Use a single fabric bin or closed folder."
      ],
      whyitWorks: "Reduced visual exposure reduces mental rehearsal.",
      integrationcue: "You stop mentally revisiting tasks while resting."
    }
  },

  // --- CARD 12: VISUAL PROCESSING ---
  {
    id: 12,
    category: "Visual Processing",
    title: "High-Frequency Patterns",
    free: {
      sciencefact: "High-contrast, busy patterns demand more visual processing than solid or softly textured surfaces.",
      whyitmatters: "Lower visual intensity allows the eyes and attention system to settle more easily."
    },
    paid: {
      protocol: "NeuroDesign Protocol",
      primaryadjustment: "Remove busy, high-contrast patterns from rest or focus zones.",
      refinement: [
        "Replace with solid tones and tactile textures.",
        "If replacement isn’t possible: Relocate patterned items away from your direct line of sight."
      ],
      whyitWorks: "Lower visual contrast reduces metabolic demand on attention systems.",
      integrationcue: "Your eyes feel less “busy” and settle more quickly."
    }
  },

  // --- CARD 13: ORGANIZATIONAL FLOW ---
  {
    id: 13,
    category: "Organizational Flow",
    title: "The Command Centre",
    free: {
      sciencefact: "Scattered administrative items create repeated low-level reminders of incomplete responsibilities.",
      whyitmatters: "Containment reduces mental fragmentation and increases perceived control."
    },
    paid: {
      protocol: "NeuroDesign Protocol",
      primaryadjustment: "Centralise all life admin (mail, chargers, documents) into one defined location.",
      refinement: [
        "Separate this zone physically from rest areas.",
        "If space is tight: Use a single drawer with dividers."
      ],
      whyitWorks: "Containment reduces background cognitive noise.",
      integrationcue: "You know exactly where unfinished admin lives — and nowhere else."
    }
  },

  // --- CARD 14: SPATIAL GEOMETRY ---
  {
    id: 14,
    category: "Spatial Geometry",
    title: "Vertical Fatigue",
    free: {
      sciencefact: "Sustained downward gaze can influence posture and breathing patterns associated with lower energy states.",
      whyitmatters: "Eye level and visual orientation subtly affect mood and alertness."
    },
    paid: {
      protocol: "NeuroDesign Protocol",
      primaryadjustment: "Introduce one vertical visual anchor at eye level (art, shelf, plant).",
      refinement: [
        "Raise screens to eye height to reduce downward tilt.",
        "If adjustments are limited: Add one taller object to draw gaze upward naturally."
      ],
      whyitWorks: "Eye position influences posture, breath, and alertness.",
      integrationcue: "Your chest feels more open and breathing less compressed."
    }
  },

  // --- CARD 15: RESTORATIVE SPACE ---
  {
    id: 15,
    category: "Restorative Space",
    title: "Digital Hygiene",
    free: {
      sciencefact: "Even inactive devices can occupy mental space because they signal potential interruption.",
      whyitmatters: "Physical distance from devices reduces anticipatory vigilance."
    },
    paid: {
      protocol: "NeuroDesign Protocol",
      primaryadjustment: "Designate a fixed “phone home” outside the bedroom.",
      refinement: [
        "Charge devices overnight away from sleep zones.",
        "If removal feels difficult: Begin with one hour phone-free before bed."
      ],
      whyitWorks: "Reducing device proximity lowers anticipatory vigilance.",
      integrationcue: "You fall asleep with fewer intrusive thoughts about notifications."
    }
  },

  // --- CARD 16: SOCIAL VIGILANCE ---
  {
    id: 16,
    category: "Social Vigilance",
    title: "Mirror Anxiety",
    free: {
      sciencefact: "Frequent mirror exposure increases self-monitoring and evaluative thinking.",
      whyitmatters: "Reducing passive self-observation lowers background social vigilance."
    },
    paid: {
      protocol: "NeuroDesign Protocol",
      primaryadjustment: "Reposition mirrors so they are not visible from desks or beds.",
      refinement: [
        "Limit mirrors in recovery zones.",
        "If removal isn’t possible: Angle mirrors away from direct line of sight."
      ],
      whyitWorks: "Reduced self-surveillance decreases background evaluation stress.",
      integrationcue: "You feel less subtly observed while working or resting."
    }
  },

  // --- CARD 17: CREATIVE FLOW ---
  {
    id: 17,
    category: "Creative Flow",
    title: "The Project Table",
    free: {
      sciencefact: "When creative work must be fully packed away each time, the brain perceives a higher restart cost.",
      whyitmatters: "Lowering the barrier to re-entry increases creative follow-through."
    },
    paid: {
      protocol: "NeuroDesign Protocol",
      primaryadjustment: "Dedicate one surface where creative projects can remain set up.",
      refinement: [
        "Keep this zone visually bounded but not erased.",
        "If space is limited: Use a tray that can be moved intact without dismantling the project."
      ],
      whyitWorks: "Containment enables creativity without triggering disorder stress.",
      integrationcue: "You begin creative tasks more easily and return to them faster."
    }
  },

  // --- CARD 18: KITCHEN TRIANGLE ---
  {
    id: 18,
    category: "Workflow Friction",
    title: "The Kitchen Triangle",
    free: {
      sciencefact: "When core tasks require inefficient movement patterns, the brain must actively plan each step instead of relying on automatic motor memory. This turns cooking from a flow state into a cognitive task.",
      whyitmatters: "our body is designed to move on autopilot during familiar tasks. When it can’t, your brain stays switched on. That low-grade activation turns a regulating ritual into something that quietly exhausts you."
  },
    paid: {
      protocol: "NeuroDesign Protocol",
      primaryadjustment: "Establish an unobstructed Work Triangle: a clear, unobstructed path between sink, stove, and fridge. Ensure the path between major appliances is clear of islands or bin placements.",
      refinement: [
        "Ensure no bins, stools, or islands interrupt the triangle."
        "Keep frequently used utensils within one arm’s reach of each primary appliance."
      ],
      whyitWorks: "When movement becomes automatic, cognitive load drops and rhythm returns.",
      integrationcue: "Cooking feels smoother. You stop bumping into objects or second-guessing your steps."
    }
  },

  // --- CARD 19: PROSPECT & REFUGE ---
  {
    id: 19,
    category: "Spatial Psychology",
    title: "The 'Command Position'",
    free: {
      sciencefact: "Evolutionarily, humans feel safest when they have a view of the entry point without being directly in line with it. This satisfies the 'Prospect and Refuge' instinct.",
      whyitmatters: "If you cannot see who might enter, your nervous system stays half-alert. If you sit directly in the path of entry, you feel exposed. Both reduce ease."
    },
    paid: {
      protocol: "NeuroDesign Protocol",
      primaryadjustment: "Position primary seating (bed, desk, sofa) so you can see the door without turning, but are not directly in the doorway's path.",
      refinement: [
        "Avoid sitting directly in line with the doorway. Create slight diagonal positioning if possible."
      ],
      whyitWorks: "Visibility without exposure satisfies your brain’s safety-mapping instinct.",
      integrationcue: "You stop scanning the room for movement and settle faster into rest or focus."
    }
  },

  // --- CARD 20: FLOW DYNAMICS ---
  {
    id: 20,
    category: "Flow Dynamics",
    title: "Door Swing Conflict",
    free: {
      sciencefact: "Doors that open into high-traffic paths or block cabinetry create 'Micro-Frictions'—tiny moments of hesitation that accumulate into frustration.",
      whyitmatters: "Every time you dance around objects, your body registers obstruction. Small friction, repeated daily, becomes irritation."
    },
    paid: {
      protocol: "NeuroDesign Protocol",
      primaryadjustment: "Rehang doors to swing against a wall (opening the view).",
      refinement: [
        "In narrow corridors, consider sliding or pocket alternatives. Ensure full clearance when doors are open."
      ],
      whyitWorks: "Eliminating physical barriers creates a sense of spatial fluidity.",
      integrationcue: "Transitions between rooms feel fluid instead of awkward."
    }
  },

  // --- CARD 21: SPATIAL ENTROPY ---
  {
    id: 21,
    category: "Spatial Entropy",
    title: "The 'Dead Corner' Stagnation",
    free: {
      sciencefact: "Undefined spaces accumulate entropy (clutter). The brain reads these stagnant areas as 'unresolved,' keeping a background tab open.",
      whyitmatters: "An unresolved corner keeps a subtle mental tab open. Even when you ignore it, your brain does not."
    },
    paid: {
      protocol: "NeuroDesign Protocol",
      primaryadjustment: "Assign a specific function (a plant, a floor lamp) or leave it intentionally, flawlessly empty. Do not use it for random storage.",
      refinement: [
        "Assign every corner a clear role or leave it intentionally empty."
      ],
      whyitWorks: "Defining space closes the cognitive loop of 'what goes here?'",
      integrationcue: "The room feels complete rather than unfinished."
    }
  },

  // --- CARD 22: PROPRIOCEPTION ---
  {
    id: 22,
    category: "Proprioception",
    title: "Hallway Compression",
    free: {
      sciencefact: "Narrow corridors invade 'Peripersonal Space,' triggering a subconscious defensive posture (hunched shoulders) as you traverse them.",
      whyitmatters: "Your nervous system interprets compression as mild threat. You feel the need to speed up or hold your breath when walking through a cramped hallway."
    },
    paid: {
      protocol: "NeuroDesign Protocol",
      primaryadjustment: "Maintain a minimum 1-metre clearance.",
      refinement: [
        "Remove console tables or hooks if the width falls below this threshold."
      ],
      whyitWorks: "Adequate clearance signals physical safety to the brain stem, restores natural arm swing and relaxed posture.",
      integrationcue: "You walk through the hall with relaxed shoulders."
    }
  },

  // --- CARD 23: SPATIAL VOLUME ---
  {
    id: 23,
    category: "Spatial Volume",
    title: "Vertical Oppression (low ceilings)",
    free: {
      sciencefact: "Low vertical boundaries correlate with confined, analytical thinking, whereas height promotes abstraction and relational thinking.",
      whyitmatters: "Rooms with unnaturally low ceilings (under 2.5m) feel claustrophobic and reduce perceived psychological freedom"
    },
    paid: {
      protocol: "NeuroDesign Protocol",
      primaryadjustment: "Install curtain tracks directly at the ceiling line (not the window frame) to visually elongate the wall height.",
      refinement: [
        "Use vertical lines, tall mirrors, or upward-facing lighting to visually extend height.",
        "Lighter ceilings create a sense of height, Perimeter lighting and lit shadow gaps also create a sense of expansion."
      ],
      whyitWorks: "Drawing the eye upward creates a perception of volume and breath.",
      integrationcue: "You intuitively take deeper breaths in the room. The room feels less compressive."
    }
  },

  // --- CARD 24: BIOPHILIA ---
  {
    id: 24,
    category: "Biophilia",
    title: "Fractal Fluency",
    free: {
      sciencefact: "The human eye is designed to process natural, self-repeating patterns (fractals). Looking at wood grain or stone reduces physiological stress by up to 60%.",
      whyitmatters: "Homes that feel flat or plastic lack the visual complexity the brain finds familiar."
    },
    paid: {
      protocol: "NeuroDesign Protocol",
      primaryadjustment: "Introduce high-fidelity natural textures (unpainted wood, marble, wool) into your immediate sightline.",
      refinement: [
        "Avoid repetitive, synthetic, geometric wallpapers."
      ],
      whyitWorks: "Fractal patterns engage the visual cortex effortlessly (Alpha state).",
      integrationcue: "Your gaze lingers on surfaces without fatigue."
    }
  },

  // --- CARD 25: VISUAL BALANCE ---
  {
    id: 25,
    category: "Visual Balance",
    title: "Bilateral Symmetry",
    free: {
      sciencefact: "The brain processes symmetrical images faster than asymmetrical ones. This 'Processing Fluency' is interpreted as calmness and safety.",
      whyitmatters: "Visual imbalance increases subtle cognitive effort. Symmetry feels stabilising."
    },
    paid: {
      protocol: "NeuroDesign Protocol",
      primaryadjustment: "Frame a focal point (e.g., a bed or fireplace) with matching pairs (lamps, side tables) to signal stability.",
      refinement: [
        "Use balanced lighting or furniture alignment to create visual stability around beds, sofas, or fireplaces."
      ],
      whyitWorks: "Symmetry reduces the computational load of processing the room.",
      integrationcue: "The room feels stable and grounded."
    }
  },

  // --- CARD 26: TRANSITION ZONES ---
  {
    id: 26,
    category: "Transition Zones",
    title: "The Threshold Pause",
    free: {
      sciencefact: "Crossing a threshold (moving from one zone to another) requires a Context Switch.",
      whyitmatters: "Without a transition zone, mood states bleed into other areas of your home without your brain getting a chance to recalibrate."
    },
    paid: {
      protocol: "NeuroDesign Protocol",
      primaryadjustment: "Create a 'Pause Point' (a bench or shelf) immediately inside the door to visually and emotionally transition between zones.'",
      refinement: [
        "Introduce light levels that can signal your transition from a high activity zone to low activity, and vice versa."
      ],
      whyitWorks: "Physical separation allows for psychological gear-shifting.",
      integrationcue: "You will feel a distinct and intentional shift in mood states when transitioning between zones."
    }
  },

  // --- CARD 27: ERGONOMICS ---
  {
    id: 27,
    category: "Ergonomics",
    title: "Ergonomic Reach Zones",
    free: {
      sciencefact: "Repeated bending and overreaching causes repetitive strain injury and increases baseline stress levels.",
      whyitmatters: "If retrieving daily items feels effortful, your brain categorises those tasks as costly"
    },
    paid: {
      protocol: "NeuroDesign Protocol",
      primaryadjustment: "Store daily-use items in the 'Golden Zone' (between waist and shoulder height). Relegate monthly items to high/low shelves.",
      refinement: [
        "Use a step ladder for items that are relegated to infrequentt use."
      ],
      whyitWorks: "Reducing physical friction preserves energy for meaningful tasks.",
      integrationcue: "You complete routine actions without hesitation or resistance."
    }
  }
