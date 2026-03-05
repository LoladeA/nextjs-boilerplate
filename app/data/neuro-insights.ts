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
      whyitmatters: "If your brain cannot filter out background noise, it creates an energy leak caused by constantly filtering out background hums."
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
      sciencefact: "Light is the primary regulator of your internal clock. Bright light at night or insufficient morning light disrupts melatonin production and hormonal balance.",
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
      whyitmatters: "Spatial order acts as an external brain, reducing the cognitive load required to navigate your day."
    },
    paid: {
      protocol: "Spatial Order Protocol",
      primaryadjustment: "Establish clear visual pathways, consistent lighting anchors and establish one clear focal anchor in each main room.",
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
        "If HVAC control is limited, create micro-climates using localised air movement."
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
      sciencefact: "A home that feels misaligned with your identity acts as a constant second skin irritant, undermining emotional safety.",
      whyitmatters: "Environmental resonance signals to the nervous system that this is my territory, enabling deep rest."
    },
    paid: {
      protocol: "Atmosphere Architecture Protocol",
      primaryadjustment: "Align visual anchors with personal identity markers.",
      refinement: [
        "Identify one visible object that reflects a past version of you and remove or replace it.",
        "Remove decor that feels performative or obligatory.",
        "Introduce one authentic identity anchor (art, material, colour, scent) that reflects who you are now.",
        "If removal feels difficult, relocate outdated objects to a transitional storage zone."
      ],
      whyitWorks: "Identity alignment signals safety to the social engagement system (Vagus Nerve).",
      integrationcue: "You will feel more at home and regulated in your own home."
    }
  },

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
        "Designate one active project zone to prevent visual spillover.",
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
      integrationcue: "Your eyes feel less busy and settle more quickly."
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
      integrationcue: "You know exactly where unfinished admin lives, and nowhere else."
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
      sciencefact: "Illogical spatial sequencing forces the brain to constantly engage in motor planning, rather than relying on muscle memory. This turns cooking from a flow state into a cognitive task.",
      whyitmatters: "When the sink, stove, and refrigerator are poorly sequenced, the brain cannot rely on automatic movement patterns. Instead, it must constantly re-plan each step using executive control. This increases cognitive load, slows task flow, and turns a routine activity like cooking into a mentally draining task."
    },
    paid: {
      protocol: "NeuroDesign Protocol",
      primaryadjustment: "Establish an unobstructed work triangle. Ensure the path between major appliances is clear of islands or bin placements.",
      refinement: [
        "Place tools and surfaces in the order you naturally cook: fridge → prep area → stove → sink. When the space mirrors the task sequence, your brain relies on automatic movement instead of constant planning."
      ],
      whyitWorks: "This reduces micro-decisions during task execution.",
      integrationcue: "Movement becomes automatic and rhythmic."
    }
  },

  // --- CARD 19: PROSPECT & REFUGE ---
  {
    id: 19,
    category: "Spatial Psychology",
    title: "The 'Command Position'",
    free: {
      sciencefact: "Evolutionarily, humans feel safest when they have a view of the entry point without being directly in line with it. This satisfies the prospect and refuge instinct.",
      whyitmatters: "When the brain cannot see the point of entry, it increases background vigilance. This keeps the amygdala subtly active, prompting unconscious scanning and preventing full relaxation."
    },
    paid: {
      protocol: "NeuroDesign Protocol",
      primaryadjustment: "Position primary seating (bed, desk, sofa) so you can see the door without turning, but are not directly in the doorway's path.",
      refinement: [
        "Angle your seating so the door remains within your peripheral vision while your body stays protected by a wall or solid surface behind you. This restores prospect (visibility) and refuge (protection) simultaneously."
      ],
      whyitWorks: "Visual control of the entry lowers background amygdala activation.",
      integrationcue: "You feel physically settled without needing to scan the room."
    }
  },

  // --- CARD 20: FLOW DYNAMICS ---
  {
    id: 20,
    category: "Flow Dynamics",
    title: "Door Swing Conflict",
    free: {
      sciencefact: "Doors that open into high-traffic paths or block cabinetry create 'Micro-Frictions'—tiny moments of hesitation that accumulate into frustration.",
      whyitmatters: "Repeated micro-hesitations during movement increase motor planning demand. These interruptions accumulate as low-level irritation and spatial fatigue throughout the day."
    },
    paid: {
      protocol: "NeuroDesign Protocol",
      primaryadjustment: "Rehang doors to swing against a wall (opening the view) or install sliding pocket doors in tight corridors.",
      refinement: [
        "Keep door arcs completely clear and ensure that no object or cabinet sits within the swing radius. When doors open cleanly against a wall, movement becomes continuous rather than interrupted."
      ],
      whyitWorks: "Eliminating physical barriers creates a sense of spatial fluidity.",
      integrationcue: "Navigation feels effortless and unobstructed."
    }
  },

  // --- CARD 21: SPATIAL ENTROPY ---
  {
    id: 21,
    category: "Spatial Entropy",
    title: "The 'Dead Corner' Stagnation",
    free: {
      sciencefact: "Undefined spaces accumulate entropy (clutter). The brain reads these stagnant areas as unresolved, keeping a background tab open.",
      whyitmatters: "Undefined spaces create open cognitive loops. Your brain continues monitoring them as unfinished, increasing background mental load and visual entropy."
    },
    paid: {
      protocol: "NeuroDesign Protocol",
      primaryadjustment: "Assign a specific function (a plant, a floor lamp) or leave it intentionally, flawlessly empty. Do not use it for storage.",
      refinement: [
        "Give every corner a clear identity. Either anchor it with a single intentional element (plant, lamp, sculpture) or leave it deliberately empty and visually resolved."
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
      sciencefact: "Narrow corridors invade peripersonal space, triggering a subconscious defensive posture (hunched shoulders) as you traverse them.",
      whyitmatters: "When walkways intrude into peripersonal space (the protective zone around the body), the brain activates subtle defensive responses—shoulder tension, shallow breathing, and faster walking."
    },
    paid: {
      protocol: "NeuroDesign Protocol",
      primaryadjustment: "Maintain a minimum 1-metre clearance. Remove console tables or hooks if the width falls below this threshold.",
      refinement: [
        "Maintain a clear walking corridor with nothing protruding into shoulder width. Even small intrusions like coat hooks or narrow tables can trigger defensive movement patterns."
      ],
      whyitWorks: "Adequate clearance signals physical safety to the brain stem.",
      integrationcue: "You walk through the hall with relaxed shoulders."
    }
  },

  // --- CARD 23: SPATIAL VOLUME ---
  {
    id: 23,
    category: "Spatial Volume",
    title: "Vertical Oppression",
    free: {
      sciencefact: "Low vertical boundaries correlate with confined, analytical thinking, whereas height promotes abstraction and relational thinking.",
      whyitmatters: "Low ceilings and compressed vertical sightlines can restrict expansive breathing and abstract thinking, while taller visual fields encourage cognitive openness and mental flexibility."
    },
    paid: {
      protocol: "NeuroDesign Protocol",
      primaryadjustment: "Install curtain tracks directly at the ceiling line (not the window frame) to visually elongate the wall height.",
      refinement: [
        "Draw the eye upward using vertical lines, ceiling-mounted curtains, or tall elements. This increases perceived spatial volume without structural renovation."
      ],
      whyitWorks: "Drawing the eye upward creates a perception of volume and breath.",
      integrationcue: "You intuitively take deeper breaths in the room."
    }
  },

  // --- CARD 24: BIOPHILIA ---
  {
    id: 24,
    category: "Biophilia",
    title: "Fractal Fluency",
    free: {
      sciencefact: "The human eye is designed to process natural, self-repeating patterns (fractals). Looking at wood grain or stone reduces physiological stress by up to 60%.",
      whyitmatters: "The visual cortex processes mid-range fractal patterns (common in nature) with minimal effort. Exposure to these patterns has been shown to reduce physiological stress responses and stabilise eye movement patterns."
    },
    paid: {
      protocol: "NeuroDesign Protocol",
      primaryadjustment: "Introduce high-fidelity natural textures (unpainted wood, marble, wool) into your immediate sightline.",
      refinement: [
        "Avoid repetitive geometric wallpapers.",
        "Introduce authentic natural materials within your primary sightline such as wood grain, stone, linen, wool. These provide the visual complexity the brain evolved to process efficiently."
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
      sciencefact: "The brain processes symmetrical images faster than asymmetrical ones. This processing fluency is interpreted as calmness and safety.",
      whyitmatters: "Symmetrical arrangements reduce the computational effort required for visual processing. The brain interprets high processing fluency as stability and safety."
    },
    paid: {
      protocol: "NeuroDesign Protocol",
      primaryadjustment: "Frame a focal point (e.g., a bed or fireplace) with matching pairs (lamps, side tables) to signal stability.",
      refinement: [
        "Anchor key areas with balanced visual pairs such as lamps, chairs, artwork, or side tables around a central focal point. This signals structural order to the visual system."
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
      sciencefact: "Crossing a threshold requires a 'Context Switch.' Without a physical zone to decompress, external stress is carried into the sanctuary.",
      whyitmatters: "Crossing environments requires a context switch in the brain. Without a physical transition zone, external stress signals are carried directly into the home, preventing psychological decompression."
    },
    paid: {
      protocol: "NeuroDesign Protocol",
      primaryadjustment: "Create a 'Pause Point' (a bench or shelf) immediately inside the door to physically separate 'Outside' from 'Inside.'",
      refinement: [
        "Create a small entry ritual space—a place to pause, set down belongings, or change shoes. This physical pause helps the brain mark the shift from external demand → internal recovery."
      ],
      whyitWorks: "Physical separation allows for psychological gear-shifting.",
      integrationcue: "You feel a distinct shift in energy upon entering."
    }
  },

  // --- CARD 27: ERGONOMICS ---
  {
    id: 27,
    category: "Ergonomics",
    title: "Ergonomic Reach Zones",
    free: {
      sciencefact: "Frequent bending or over-reaching increases physical cortisol. Convenience is biological energy conservation.",
      whyitmatters: "Frequent bending, stretching, or searching activates unnecessary motor planning and physical effort, increasing the metabolic cost of routine tasks. Over time this creates task avoidance and cognitive friction."
    },
    paid: {
      protocol: "NeuroDesign Protocol",
      primaryadjustment: "Store daily-use items in the Golden Zone (between waist and shoulder height).",
      refinement: [
        "Reserve high and low storage only for infrequently used items."
      ],
      whyitWorks: "Reducing physical friction lowers the activation energy for tasks.",
      integrationcue: "Daily routines feel frictionless and light."
    }
  },

  // --- CARD 28: LIGHTING & CIRCADIAN ---
  {
    id: 28,
    category: "Hormonal Regulation",
    title: "Overhead Lighting & Cortisol",
    free: {
      sciencefact: "Overhead lighting mimics the angle of the sun at noon, signaling peak alertness to the brain and suppressing the body's natural wind-down mechanisms.",
      whyitmatters: "High-angle lighting can trigger a subtle threat response, keeping your nervous system in survival mode during hours meant for recovery."
    },
    paid: {
      protocol: "The Horizon Shift",
      primaryadjustment: "After sunset, switch exclusively to floor and table lamps positioned below eye level.",
      refinement: [
        "Eliminate all Big Light (ceiling fixtures) in the 2 hours before bed.",
        "Use warm-toned, low-wattage bulbs (2200K-2700K) to mimic the spectral quality and angle of a campfire."
      ],
      whyitWorks: "Lower-angle light stimulates the lower retina, which has a weaker connection to the SCN's alertness centers, allowing melatonin to rise naturally.",
      integrationcue: "You experience a smoother transition into Rest & Digest mode and a lower evening agitation."
    }
  },

  // --- CARD 29: SLEEP ARCHITECTURE ---
  {
    id: 29,
    category: "Sleep Architecture",
    title: "Spectrum Toxicity",
    free: {
      sciencefact: "Short-wavelength blue light (460-480nm) suppresses melatonin production twice as effectively as warm-spectrum light, delaying REM sleep onset.",
      whyitmatters: "Exposure to cool white LEDs at night shortens your body's internal representation of night, leading to fragmented sleep."
    },
    paid: {
      protocol: "The Amber Shield",
      primaryadjustment: "Ensure all bedroom and bathroom bulbs are rated 2700K (Warm White) or lower.",
      refinement: [
        "Ideally, use 2000K (Amber) or red-spectrum bulbs for bedside reading and night-time bathroom visits.",
        "Install blue-light filtering software or physical filters on all essential evening devices."
      ],
      whyitWorks: "Melatonin is highly sensitive to blue light; by shifting to the red/amber end of the spectrum, you allow the hormone of darkness to reach its peak concentration.",
      integrationcue: "You will notice falling asleep faster and a significant increase in deep sleep duration."
    }
  },

  // --- CARD 30: DAYTIME PERFORMANCE ---
  {
    id: 30,
    category: "Daytime Performance",
    title: "The Biological Darkness Gap",
    free: {
      sciencefact: "Most interiors are biologically dark (<300 lux) during the day, which fails to stimulate the brain's alertness centers, leading to chronic lethargy.",
      whyitmatters: "The human brain evolved to operate under 10,000+ lux. Working in low-light caves erodes focus and mood."
    },
    paid: {
      protocol: "Luminous Saturation",
      primaryadjustment: "Position your primary work surface perpendicular to a window to maximise daylight intake.",
      refinement: [
        "Aim for >500 lux on your work surface during the day (measure with a light meter app).",
        "If natural light is insufficient, supplement with high-CRI (90+) full-spectrum LED panels."
      ],
      whyitWorks: "High-intensity daytime light strengthens the circadian signal, improving both daytime vigilance and nighttime sleep quality.",
      integrationcue: "You experience sustained cognitive energy throughout the afternoon and a reduced need for caffeine boosts."
    }
  },

  // --- CARD 31: VISUAL STRESS ---
  {
    id: 31,
    category: "Visual Stress",
    title: "Glare & Headaches",
    free: {
      sciencefact: "High-contrast glare—a bright light source against a dark background—forces the pupil to constantly constrict and dilate, causing rapid eye muscle fatigue.",
      whyitmatters: "This visual tug-of-war is a primary cause of afternoon headaches and reduced reading stamina."
    },
    paid: {
      protocol: "The Diffusion Layer",
      primaryadjustment: "Use shades, diffusers, or frosted glass on all light sources to eliminate naked bulbs from your line of sight.",
      refinement: [
        "Ensure the background wall behind a screen or lamp is also softly illuminated (Bias Lighting) to reduce contrast ratios.",
        "Never allow a bare filament or direct sun-spot to hit reflective surfaces."
      ],
      whyitWorks: "Softening the light source reduces the luminance contrast, allowing the eye to maintain a stable aperture and reducing neural processing load.",
      integrationcue: " You notice a significant drop in eye strain and a significant reduction or disappearance of tension headaches."
    }
  },

  // --- CARD 32: SENSORY OVERLOAD ---
  {
    id: 32,
    category: "Sensory Overload",
    title: "The Flicker Effect",
    free: {
      sciencefact: "Many LED bulbs flicker at high frequencies (100Hz+) that are invisible to the eye but processed by the brain, triggering sensory overwhelm and migraines.",
      whyitmatters: "This stroboscopic effect keeps the nervous system in a state of low-level micro-startle, eroding your focus and calm. You will feel inexplicably nauseous, spacy, or irritable under certain artificial lights."
    },
    paid: {
      protocol: "The Flicker Audit",
      primaryadjustment: "Replace all cheap LED bulbs with flicker-free or high-quality DC-driven LED sources.",
      refinement: [
        "The Phone Test: View your lights through your phone's slo-mo camera mode; if you see moving bands or strobing, the bulb is low-quality.",
        "Prioritise flicker-free drivers for any dimmable lighting systems."
      ],
      whyitWorks: "Removing the high-frequency pulse reduces the sampling load on the visual cortex, allowing the nervous system to settle into a deeper state of focus.",
      integrationcue: "You notice a quieting of your sensory environment and a reduction in unexplained fatigue at the end of the day."
    }
  },

  // --- CARD 33: TRANSITION DESIGN ---
  {
    id: 33,
    category: "Transition Design",
    title: "Evening Tapering",
    free: {
      sciencefact: "Abruptly switching from Bright to Dark prevents the brain from transitioning. The nervous system requires a dusk simulation to down-regulate.",
      whyitmatters: "Going to bed with a wired brain leads to sleep-onset insomnia and racing thoughts. This is often triggered when you stay in bright, daytime light until the moment you get into bed."
    },
    paid: {
      protocol: "The 60-Minute Taper",
      primaryadjustment: "Dim your lighting intensity by 50% exactly one hour before your target sleep time.",
      refinement: [
        "Automate this shift using smart bulbs to remove the decision fatigue of remembering to dim down.",
        "Combine the dimming with a shift to warmer colour temperatures (1800K-2200K)."
      ],
      whyitWorks: "A gradual reduction in light mimics the natural setting of the sun, cueing the brain to transition from Alpha to Theta waves.",
      integrationcue: "You find yourself naturally yawning and feeling ready for bed before your head hits the pillow."
    }
  },

  // --- CARD 34: VISUAL NOISE ---
  {
    id: 34,
    category: "Visual Noise",
    title: "Reflective Surfaces",
    free: {
      sciencefact: "High-gloss floors or screens reflect overhead light directly into the eye, effectively doubling the visual stress load on the visual cortex.",
      whyitmatters: "This specular glare creates visual noise that competes with your primary task for the brain's attention. This shows up as a shine or glint on your table or floor that makes it hard to focus on the objects resting on it."
    },
    paid: {
      protocol: "Matte Optimisation",
      primaryadjustment: "Use matte or low-sheen finishes for all primary work and focus surfaces.",
      refinement: [
        "Cover glossy surfaces with a felt pad or leather blotter to absorb light.",
        "Angle screens to ensure windows or lamps aren't reflected in the glass (Bias Lighting can help here too)."
      ],
      whyitWorks: "Matte surfaces diffuse light, preventing high-intensity hot spots from hitting the retina and reducing the brain's sorting effort.",
      integrationcue: "You notice a calmer visual field and an increased ability to maintain deep focus on reading or writing tasks."
    }
  },

  // --- CARD 35: SLEEP PROTECTION ---
  {
    id: 35,
    category: "Sleep Protection",
    title: "Bedroom Blackout",
    free: {
      sciencefact: "Even trace amounts of light (street lamps, standby LEDs) can penetrate the eyelid and disrupt the transition into deep, restorative sleep cycles.",
      whyitmatters: "light pollution in the bedroom prevents the brain from reaching the lowest levels of metabolic activity needed for detoxification. If you can you see your hand clearly in front of your face when the lights are out at night, your sleep onset will be affected."
    },
    paid: {
      protocol: "Zero-Lux Sanctuary",
      primaryadjustment: "Install blackout linings on curtains or use a high-quality silk eye mask to achieve near 0 lux.",
      refinement: [
        "Use blackout tape to cover standby LEDs on TVs, monitors, and chargers.",
        "Ensure the bedroom door is sealed against hallway light leaks."
      ],
      whyitWorks: "Total darkness is the biological requirement for peak melatonin production and brain waste clearance (glymphatic system).",
      integrationcue: "You wake up feeling actually refreshed and see an increase in your restoration score."
    }
  },

  // --- CARD 36: PERFORMANCE LAUNCH ---
  {
    id: 36,
    category: "Performance Launch",
    title: "Morning Activation",
    free: {
      sciencefact: "The Cortisol Awakening Response (CAR) is triggered by light intensity hitting the retina, not just the act of waking up.",
      whyitmatters: "Without a strong light signal, sleep inertia (that heavy grogginess) can persist for hours, eroding your morning productivity. This persists if you keep the curtains closed or stay in a dim room for the first hour of your day."
    },
    paid: {
      protocol: "The Luminous Launch",
      primaryadjustment: "Open all curtains and blinds immediately upon waking to flood the room with natural light.",
      refinement: [
        "In winter or low-light climates, use a 10,000 lux SAD lamp for 20 minutes while having breakfast.",
        "Step outside for 2 minutes to get direct, unfiltered sky-light."
      ],
      whyitWorks: "High-intensity light (>1,000 lux) provides the hard reset for the circadian clock, firing the starting gun for your metabolic day.",
      integrationcue: "You notice morning grogginess disappearing within 15 minutes of waking and a sharper start to your first work block."
    }
  },

  // --- CARD 37: AUDITORY STRESS ---
  {
    id: 37,
    category: "Auditory Stress",
    title: "The Startle Response",
    free: {
      sciencefact: "Unpredictable or sharp noises trigger the amygdala—the brain's threat-detection center—faster than any other sensory input.",
      whyitmatters: "Constant micro-startles from traffic, sirens, or neighbors keep your nervous system in a state of low-level alertness, preventing deep focus and restoration. You may find yourself losing your train of thought every time a car passes or a door slams."
    },
    paid: {
      protocol: "The Acoustic Buffer",
      primaryadjustment: "Use a high-fidelity white or pink noise machine near windows or doors to mask unpredictable outdoor sounds.",
      refinement: [
        "Set the volume to just below the level of the intruding noise; the goal is masking, not competing.",
        "Prioritise pink noise for focus; the brain finds it less fatiguing than pure white noise."
      ],
      whyitWorks: "Consistent background sound raises the auditory floor, making sudden peaks in noise less prominent.",
      integrationcue: "You notice a steadier mental state during deep work and a significant reduction in mid-task interruptions."
    }
  },

  // --- CARD 38: COGNITIVE LOAD ---
  {
    id: 38,
    category: "Cognitive Load",
    title: "The Echo Tax",
    free: {
      sciencefact: "In rooms with high reverberation (echo), the brain has to work significantly harder to de-noise speech, leading to rapid listening fatigue.",
      whyitmatters: "Hard, reflective surfaces (glass, concrete, tile) bounce sound waves, creating a sonic smear that erodes your cognitive bandwidth. You will find it exhausting to have conversations in your home, and feel a sense of relief when you step into a carpeted room."
    },
    paid: {
      protocol: "The Soft Surface Ratio",
      primaryadjustment: "Ensure at least 25% of the room's hard surfaces are covered with sound-absorbent materials (rugs, heavy curtains, acoustic panels).",
      refinement: [
        "Position absorbent materials at ear level where sound waves are most likely to bounce.",
        "Use open bookshelves or textured art to diffuse sound waves and break up echoes."
      ],
      whyitWorks: "Reducing the reverberation time (RT60) allows the brain to process sound signals clearly and immediately, freeing up working memory for higher-level thinking.",
      integrationcue: "You notice you can stay in meetings longer without feeling drained and that your home feels quieter even when the volume is the same."
    }
  },

  // --- CARD 39: BACKGROUND STRESS ---
  {
    id: 39,
    category: "Background Stress",
    title: "Intermittent Hums",
    free: {
      sciencefact: "Low-frequency hums from appliances create a background stress load that the brain processes subconsciously, even if you don't hear it.",
      whyitmatters: "This constant auditory friction contributes to unexplained irritability and a lack of deep relaxation. You will feel a sudden, profound sense of peace when the fridge or air conditioner finally clicks off."
    },
    paid: {
      protocol: "Vibration Isolation",
      primaryadjustment: "Isolate noisy appliances behind closed doors or use vibration-dampening pads under them.",
      refinement: [
        "Move servers or loud computer towers to a different room or inside a ventilated cabinet.",
        "Identify phantom hums (like old chargers or LED drivers) and replace them with silent alternatives."
      ],
      whyitWorks: "Removing low-frequency drones lowers your silence baseline, allowing your nervous system to fully rest.",
      integrationcue: "You experience a deeper sense of settling when you enter your home and a higher  silence baseline score in your journal."
    }
  },

  // --- CARD 40: PSYCHOLOGICAL SAFETY ---
  {
    id: 40,
    category: "Psychological Safety",
    title: "Social Privacy",
    free: {
      sciencefact: "Being able to hear muffled conversations, even if unintelligible, prevents the brain from entering deep focus.",
      whyitmatters: "The human brain is evolutionarily tuned to prioritise human speech; if you can hear it, you can't fully ignore it. You may find yourself subconsciously listening in to conversations in the next room while you're trying to work or read."
    },
    paid: {
      protocol: "The Speech Privacy Gap",
      primaryadjustment: "Use acoustic seals on doors and internal windows to block speech frequencies between rooms.",
      refinement: [
        "Add a sweep to the bottom of your doors to close the largest gap for sound travel.",
        "Use a white noise machine outside your door to provide an auditory screen."
      ],
      whyitWorks: "Establishing auditory boundaries provides the psychological safety needed for deep work, ensuring your brain isn't constantly scanning for social information.",
      integrationcue: "You notice an immediate increase in deep work blocks and a feeling of true privacy within your own home."
    }
  },

  // --- CARD 41: RECOVERY DESIGN ---
  {
    id: 41,
    category: "Recovery Design",
    title: "The Quiet Room",
    free: {
      sciencefact: "For the nervous system to truly reset, it requires periods of exposure to sound levels below 30dB (the level of a quiet library).",
      whyitmatters: "Most modern homes hover at 45–55 dB, which is high enough to keep the brain in a state of low-level vigilance."
    },
    paid: {
      protocol: "The Silence Sanctuary",
      primaryadjustment: "Designate one room (ideally the bedroom) as a zero-noise zone where all electronics and mechanical noise are eliminated.",
      refinement: [
        "Use heavy, multi-layered acoustic curtains to block street noise.",
        "Spend at least 20 minutes a day in this silence sanctuary to allow your nervous system to down-regulate."
      ],
      whyitWorks: "True silence allows the brain's Default Mode Network (DMN) to activate, which is essential for creativity, self reflection and emotional processing.",
      integrationcue: "You notice a reduction in sensory overwhelm and a clearer sense of internal direction and calm."
    }
  },
  {
    id: 42,
    category: "Hormonal Regulation",
    title: "Overhead Lighting and Evening Cortisol",
    free: {
      sciencefact: "Overhead lighting mimics the angle of the sun at noon, signalling peak alertness to the brain and suppressing the body's natural wind-down mechanisms.",
      whyitmatters: "High-angle lighting can trigger a subtle threat response, keeping your nervous system in survival mode at a time when it should be recovering."
    },
    paid: {
      protocol: "The Horizon Shift",
      primaryadjustment: "After sunset, switch exclusively to floor and table lamps positioned below eye level.",
      refinement: [
        "Eliminate all big light (ceiling fixtures) in the two hours before bedtime.",
        "Use warm-toned, low-wattage bulbs (2,200–2,700 K) to mimic the spectral quality and angle of a campfire."
      ],
      whyitWorks: "Lower-angle light stimulates the lower retina, which has a weaker connection to the SCN's alertness centres, allowing melatonin to rise naturally.",
      integrationcue: "You will experience a smoother transition into rest and digest mode, with lower evening agitation."
    }
  },
  {
    id: 43,
    category: "Sleep Architecture",
    title: "Blue Light & Melatonin Suppression",
    free: {
      sciencefact: "Short-wavelength blue light (460–480 nm) suppresses melatonin production twice as effectively as warm-spectrum light, delaying the onset of REM sleep.",
      whyitmatters: "Exposure to cool white LEDs at night tricks your body into thinking that it is daytime, leading to fragmented sleep."
    },
    paid: {
      protocol: "The Amber Shield",
      primaryadjustment: "Ensure that all the bulbs in your bedroom and bathroom are rated at 2700K (Warm White) or lower.",
      refinement: [
        "Ideally, use 2,000 K (amber) or red-spectrum bulbs for bedside reading and night-time bathroom visits.",
        "Install blue-light filtering software or physical filters on all essential evening devices."
      ],
      whyitWorks: "Melatonin is highly sensitive to blue light. By shifting to the red/amber end of the spectrum, you enable your body to produce the maximum amount of this hormone.",
      integrationcue: "You notice that you are falling asleep faster and that your deep sleep duration has increased significantly on your tracker."
    }
  },
  {
    id: 44,
    category: "Daytime Performance",
    title: "Indoor Darkness & Cognitive Lethargy",
    free: {
      sciencefact: "Most interiors are biologically dark (<300 lux) during the day, which fails to stimulate the brain's alertness centers, leading to chronic lethargy.",
      whyitmatters: "The human brain evolved to operate under 10,000–100,000 lux; working in low-light caves erodes focus and mood."
    },
    paid: {
      protocol: "Luminous Saturation",
      primaryadjustment: "Position your primary work surface perpendicular to a window to maximise daylight intake.",
      refinement: [
        "Aim for >500 lux on your work surface during the day (measure with a light meter app).",
        "If natural light is insufficient, supplement with high-CRI (90+) full-spectrum LED panels to simulate daylight."
      ],
      whyitWorks: "High-intensity daytime light strengthens the circadian signal, improving both daytime vigilance and nighttime sleep quality.",
      integrationcue: "You experience sustained cognitive energy throughout the afternoon and a reduced need for caffeine boosts."
    }
  },
  {
    id: 45,
    category: "Visual Stress",
    title: "High-Contrast Glare & Eye Fatigue",
    free: {
      sciencefact: "High-contrast glare—a bright light source against a dark background—forces the pupil to constantly constrict and dilate, causing rapid eye muscle fatigue.",
      whyitmatters: "This visual tug-of-war is a primary cause of afternoon headaches and reduced reading stamina."
    },
    paid: {
      protocol: "The Diffusion Layer",
      primaryadjustment: "Use shades, diffusers, or frosted glass on all light sources to eliminate naked bulbs from your line of sight.",
      refinement: [
        "Ensure the background wall behind a screen or lamp is also softly illuminated (Bias Lighting) to reduce contrast ratios.",
        "Never allow a bare filament or direct sun-spot to hit your work surface or eyes."
      ],
      whyitWorks: "Softening the light source reduces the luminance contrast, allowing the eye to maintain a stable aperture and reducing neural processing load.",
      integrationcue: "You notice a significant drop in eye strain and a significant reduction or disappearance of tension headaches."
    }
  },
  {
    id: 46,
    category: "Sensory Overload",
    title: "Invisible Flicker & Neurological Irritation",
    free: {
      sciencefact: "Many LED bulbs flicker at high frequencies (100Hz+) that are invisible to the eye but processed by the brain, triggering sensory overwhelm and migraines.",
      whyitmatters: "This stroboscopic effect keeps the nervous system in a state of low-level micro-startle, eroding your focus and calm. You will feel inexplicably nauseous, spacy, or irritable under certain artificial lights."
    },
    paid: {
      protocol: "The Flicker Audit",
      primaryadjustment: "Replace all cheap LED bulbs with flicker free or high-quality DC-driven LED sources.",
      refinement: [
        "The Phone Test: View your lights through your phone's slo-mo camera mode; if you see moving bands or strobing, the bulb is low-quality.",
        "Prioritise flicker free drivers for any dimmable lighting systems."
      ],
      whyitWorks: "Removing the high-frequency pulse reduces the sampling load on the visual cortex, allowing the nervous system to settle into a deeper state of focus.",
      integrationcue: "You notice a quieting of your sensory environment and a reduction in unexplained fatigue at the end of the day."
    }
  },
  {
    id: 47,
    category: "Transition Design",
    title: "The Dusk Simulation & Neural Settling",
    free: {
      sciencefact: "Abruptly switching from Bright to Dark prevents the brain from transitioning. The nervous system requires a dusk simulation to down-regulate.",
      whyitmatters: "Going to bed with a wired brain leads to sleep-onset insomnia and racing thoughts. This is often triggered when you stay in bright, daytime light until the moment you get into bed."
    },
    paid: {
      protocol: "The 60-Minute Taper",
      primaryadjustment: "Dim your lighting intensity by 50% exactly one hour before your target sleep time.",
      refinement: [
        "Automate this shift using smart bulbs (e.g., Hue, Lifx) to remove the decision fatigue of remembering to dim down.",
        "Combine the dimming with a shift to warmer color temperatures (1800K-2200K)."
      ],
      whyitWorks: "A gradual reduction in light mimics the natural setting of the sun, providing the evolutionary cue for the brain to transition from Alpha (active) to Theta (relaxed) waves.",
      integrationcue: "You find yourself naturally yawning and feeling ready for bed before your head hits the pillow."
    }
  },
  {
    id: 48,
    category: "Visual Noise",
    title: "Specular Glare & Visual Cortex Load",
    free: {
      sciencefact: "High-gloss floors, tables, or screens reflect overhead light directly into the eye, effectively doubling the visual stress load on the visual cortex.",
      whyitmatters: "This specular glare creates visual noise that competes with your primary task for the brain's attention. This shows up as a shine or glint on your table or floor that makes it hard to focus on the objects resting on it."
    },
    paid: {
      protocol: "Matte Optimisation",
      primaryadjustment: "Use matte or low-sheen finishes for all primary work and focus surfaces.",
      refinement: [
        "Cover glossy desks with a felt pad or leather blotter to absorb light.",
        "Angle screens to ensure windows or lamps aren't reflected in the glass (Bias Lighting can help here too)."
      ],
      whyitWorks: "Matte surfaces diffuse light in all directions, preventing high-intensity hot spots from hitting the retina and reducing the brain's sorting effort.",
      integrationcue: "You notice a calmer visual field and an increased ability to maintain deep focus on reading or writing tasks."
    }
  },
  {
    id: 49,
    category: "Sleep Protection",
    title: "Light Pollution & Sleep Architecture",
    free: {
      sciencefact: "Even trace amounts of light (street lamps, standby LEDs) can penetrate the eyelid and disrupt the transition into deep, restorative sleep cycles [14].",
      whyitmatters: "Light pollution in the bedroom prevents the brain from reaching the lowest levels of metabolic activity needed for detoxification. If you can see your hand clearly in front of your face when the lights are out at night, your sleep onset will be affected."
    },
    paid: {
      protocol: "Zero-Lux Sanctuary",
      primaryadjustment: "Install blackout linings on curtains or use a high-quality silk eye mask to achieve near 0 lux.",
      refinement: [
        "Use blackout tape to cover standby LEDs on TVs, monitors, and chargers.",
        "Ensure the bedroom door is sealed against hallway light leaks."
      ],
      whyitWorks: "Total darkness is the biological requirement for peak melatonin production and the protection of the glymphatic system (the brain's waste clearance).",
      integrationcue: "You wake up feeling actually refreshed and see an increase in your restoration score on sleep trackers."
    }
  },
  {
    id: 50,
    category: "Performance Launch",
    title: "Light Intensity & The Cortisol Launch",
    free: {
      sciencefact: "The Cortisol Awakening Response (CAR) is triggered by light intensity hitting the retina, not just the act of waking up.",
      whyitmatters: "Without a strong light signal, sleep inertia (that heavy grogginess) can persist for hours, eroding your morning productivity. This persists if you keep the curtains closed or stay in a dim room for the first hour of your day."
    },
    paid: {
      protocol: "The Luminous Launch",
      primaryadjustment: "Open all curtains and blinds immediately upon waking to flood the room with natural light.",
      refinement: [
        "In winter or low-light climates, use a 10,000 lux SAD lamp for 20 minutes while having breakfast.",
        "Step outside for 2 minutes to get direct, unfiltered sky-light."
      ],
      whyitWorks: "High-intensity light (>1,000 lux) provides the hard reset for the circadian clock, suppressing any remaining melatonin and firing the starting gun for your metabolic day.",
      integrationcue: "You notice morning grogginess disappearing within 15 minutes of waking and a sharper start to your first work block."
    }
  },
  {
    id: 51,
    category: "Auditory Stress",
    title: "Unpredictable Noise & Amygdala Hijack",
    free: {
      sciencefact: "Unpredictable or sharp noises trigger the amygdala—the brain's threat-detection center—faster than any other sensory input.",
      whyitmatters: "Constant micro-startles from traffic, sirens, or neighbors keep your nervous system in a state of low-level alertness, preventing deep focus and restoration. You may find yourself losing your train of thought every time a car passes or a door slams."
    },
    paid: {
      protocol: "The Acoustic Buffer",
      primaryadjustment: "Use a high-fidelity white or pink noise machine near windows or doors to mask unpredictable outdoor sounds.",
      refinement: [
        "Set the volume to just below the level of the intruding noise; the goal is masking, not competing.",
        "Prioritise pink noise for focus, as it has more energy at lower frequencies, which the brain finds less fatiguing than pure white noise."
      ],
      whyitWorks: "Consistent background sound raises the auditory floor, making sudden peaks in noise less prominent and preventing the amygdala from firing a startle response.",
      integrationcue: "You notice a steadier mental state during deep work and a significant reduction in mid-task interruptions."
    }
  },
  {
    id: 52,
    category: "Cognitive Load",
    title: "Reverberation & Listening Fatigue",
    free: {
      sciencefact: "In rooms with high reverberation (echo), the brain has to work significantly harder to de-noise speech and sounds, leading to rapid listening fatigue.",
      whyitmatters: "Hard, reflective surfaces (glass, concrete, tile) bounce sound waves, creating a sonic smear that erodes your cognitive bandwidth. You will find it exhausting to have conversations in your home, and feel a sense of relief when you step into a carpeted room."
    },
    paid: {
      protocol: "The Soft Surface Ratio",
      primaryadjustment: "Ensure at least 25% of the room's hard surfaces are covered with sound-absorbent materials (rugs, heavy curtains, acoustic panels).",
      refinement: [
        "Position absorbent materials at ear level where sound waves are most likely to bounce.",
        "Use open bookshelves or textured art to diffuse sound waves, breaking up echoes without making the room feel dead."
      ],
      whyitWorks: "Reducing the reverberation time (RT60) allows the brain to process sound signals clearly and immediately, freeing up working memory for higher-level thinking.",
      integrationcue: "You notice you can stay in meetings longer without feeling drained and that your home feels quieter even when the volume is the same."
    }
  },
  {
    id: 53,
    category: "Background Stress",
    title: "Low-Frequency Hums & The Chronic Load",
    free: {
      sciencefact: "Low-frequency hums from appliances (fridges, servers, HVAC) create a background stress load that the brain processes subconsciously, even if you don't hear it.",
      whyitmatters: "This constant auditory friction contributes to unexplained irritability and a lack of deep relaxation. You will feel a sudden, profound sense of peace when the fridge or air conditioner finally clicks off."
    },
    paid: {
      protocol: "The Vibration Isolation",
      primaryadjustment: "Isolate noisy appliances behind closed doors or use vibration-dampening pads under them.",
      refinement: [
        "Move servers or loud computer towers to a different room or inside a ventilated cabinet.",
        "Identify phantom hums (like old chargers or LED drivers) and replace them with silent alternatives."
      ],
      whyitWorks: "Removing low-frequency drones lowers your silence baseline, allowing your nervous system to fully enter the Rest & Digest state without being kept tethered by background noise.",
      integrationcue: "You experience a deeper sense of settling when you enter your home and a higher silence baseline score in your journal."
    }
  },
  {
    id: 54,
    category: "Psychological Safety",
    title: "Auditory Bleed & The Focus Barrier",
    free: {
      sciencefact: "Being able to hear muffled conversations from another room, even if you can't understand the words, prevents the brain from entering deep focus.",
      whyitmatters: "The human brain is evolutionarily tuned to prioritise human speech; if you can hear it, you can't fully ignore it. You may find yourself subconsciously listening in to conversations in the next room while you're trying to work or read."
    },
    paid: {
      protocol: "The Speech Privacy Gap",
      primaryadjustment: "Use acoustic seals on doors and internal windows to block speech frequencies between rooms.",
      refinement: [
        "Add a sweep to the bottom of your office door to close the largest gap for sound travel.",
        "Use a white noise machine outside your door to provide an auditory screen for those inside the room."
      ],
      whyitWorks: "Establishing auditory boundaries provides the psychological safety needed for deep work, ensuring your brain isn't constantly scanning for social information.",
      integrationcue: "You notice an immediate increase in your deep work blocks and a feeling of true privacy within your own home."
    }
  },
  {
    id: 55,
    category: "Recovery Design",
    title: "The 30dB Threshold for Restoration",
    free: {
      sciencefact: "For the nervous system to truly reset, it requires periods of exposure to sound levels below 30 decibels (the level of a quiet library).",
      whyitmatters: "Most modern homes hover at 45–55 dB, which is high enough to keep the brain in a state of low-level vigilance."
    },
    paid: {
      protocol: "The Silence Sanctuary",
      primaryadjustment: "Designate one room (ideally the bedroom) as a zero-noise zone where all electronics and mechanical noise are eliminated.",
      refinement: [
        "Use heavy, multi-layered blackout/acoustic curtains to block external street noise.",
        "Spend at least 20 minutes a day in this silence sanctuary to allow your nervous system to down-regulate."
      ],
      whyitWorks: "Exposure to true silence allows the brain's Default Mode Network (DMN) to activate, which is essential for creativity, self-reflection, and emotional processing.",
      integrationcue: "You notice a reduction in sensory overwhelm and a clearer sense of internal direction and calm."
    }
  },
  {
    id: 56,
    category: "Thermal Regulation",
    title: "The Core Temperature Drop & Sleep Onset",
    free: {
      sciencefact: "To initiate sleep, your body's core temperature must drop by approximately 1°C. This drop is a biological prerequisite for the transition into deep NREM sleep.",
      whyitmatters: "A warm room (above 20°C) prevents this heat shedding, trapping you in a state of metabolic alertness and delaying sleep onset."
    },
    paid: {
      protocol: "The 18°C Thermal Anchor",
      primaryadjustment: "Maintain your bedroom at a stable 16-18°C (60-65°F) throughout the night.",
      refinement: [
        "Use breathable, natural fiber layers (linen or cotton) rather than a single heavy duvet to allow for micro-adjustments.",
        "The Vasodilation Hack: A warm bath or shower 60 minutes before bed triggers blood flow to the hands and feet, which then radiates heat away from the core, accelerating the 1°C drop."
      ],
      whyitWorks: "Cooling the core signals the brain to suppress the wake-promoting systems and activate the sleep-inducing neurons in the preoptic area of the hypothalamus.",
      integrationcue: "You notice a significant reduction in sleep-onset latency and fewer mid-night awakenings due to overheating."
    }
  },
  {
    id: 57,
    category: "Autonomic Regulation",
    title: "Shivering & Sympathetic Overdrive",
    free: {
      sciencefact: "Being physically cold activates the sympathetic nervous system (fight-or-flight) as the body prioritizes heat generation over emotional regulation.",
      whyitmatters: "You cannot enter a state of deep relaxation or Rest & Digest if your body is diverting energy to thermogenesis. You may experience this by hunching your shoulders, sitting on your hands, or feeling a tightness in your chest when sitting in a cool room in the evening."
    },
    paid: {
      protocol: "Localised Parasympathetic Warmth",
      primaryadjustment: "Use spot heating (hot water bottles, electric throws, or infrared pads) to warm the person, not the room.",
      refinement: [
        "Apply heat specifically to the feet and lower abdomen; these areas are high-density zones for thermoreceptors that signal safety to the brain.",
        "Keep living area temperatures at 20-22°C to prevent the hunching response during sedentary tasks."
      ],
      whyitWorks: "Warming the extremities induces vasodilation, which lowers blood pressure and signals to the amygdala that the environment is no longer a threat to homeostasis.",
      integrationcue: "You notice an immediate softening of your posture and a faster transition into a relaxed mental state after work."
    }
  },
  {
    id: 58,
    category: "Tactile Comfort",
    title: "Synthetic Micro-climates & Restlessness",
    free: {
      sciencefact: "Synthetic fabrics like polyester trap heat and moisture against the skin, creating a humid micro-climate that disrupts the body's natural cooling process.",
      whyitmatters: "This trapped humidity causes subtle, subconscious restlessness and micro-aggressions as your skin receptors signal discomfort to the brain. You may wake up feeling sweaty but cold, or find that your clothes feel clingy and static-charged by the end of the day."
    },
    paid: {
      protocol: "The Natural Fiber Shield",
      primaryadjustment: "Eliminate all synthetic fabrics (polyester, nylon, acrylic) from direct skin contact, especially in the bedroom.",
      refinement: [
        "Switch to 100% Cotton, Linen, or Tencel for sheets and pajamas. These fibers allow for wicking and airflow.",
        "Audit your sofa upholstery; if it’s synthetic, use a natural fiber throw (wool or heavy cotton) as a tactile barrier."
      ],
      whyitWorks: "Natural fibers facilitate the evaporation of sweat, supporting the body's thermoregulatory system and preventing the humidity spike that triggers arousal during sleep.",
      integrationcue: "You notice your skin feels calmer and you wake up feeling dry and thermally balanced."
    }
  },
  {
    id: 59,
    category: "Somatic Regulation",
    title: "Deep Pressure Stimulation (DPS) & The Safe Container",
    free: {
      sciencefact: "Deep Pressure Stimulation (DPS) increases the production of serotonin and dopamine while significantly reducing cortisol levels in the blood.",
      whyitmatters: "Weight provides a proprioceptive anchor, signaling to the brain that the body is secure and allowing the nervous system to stand down from vigilance. You feel an immediate sense of calm when wearing a heavy winter coat or sleeping under a heavy pile of blankets."
    },
    paid: {
      protocol: "The 10% Gravity Anchor",
      primaryadjustment: "Incorporate a weighted blanket (approximately 10% of your body weight) into your evening regulation routine.",
      refinement: [
        "Use the weighted blanket for 20-minute resets on the sofa or in your Crisis Corner when feeling overwhelmed.",
        "Ensure the weight is distributed evenly across the torso and legs to maximize the stimulation of mechanoreceptors."
      ],
      whyitWorks: "DPS shifts the autonomic nervous system from sympathetic (alert) to parasympathetic (rest), mimicking the neuro-chemical effect of a firm hug or swaddle.",
      integrationcue: "You notice a grounding sensation and a faster reduction in heart rate during periods of high stress."
    }
  },
  {
    id: 60,
    category: "Sensory Processing",
    title: "Texture Aversion & Neurological Irritation",
    free: {
      sciencefact: "For many neurotypes, certain textures (unfinished wood, micro-fiber, velvet) register as pain or threat signals in the somatosensory cortex.",
      whyitmatters: "Living with tactile friction keeps your brain in a state of constant, low-level irritation, eroding your emotional margin. You instinctively pull your hand away from certain upholstery, or avoid sitting in a specific chair because the fabric feels uncomfortable."
    },
    paid: {
      protocol: "The High-Glide Audit",
      primaryadjustment: "Perform a Touch Audit of your entire home. Remove or cover any surface that triggers a withdrawal response.",
      refinement: [
        "Replace irritating textures with High-Glide surfaces like silk, smooth cotton, or polished wood.",
        "Use Tactile Buffers—soft, predictable textures—on high-touch points like door handles or armrests."
      ],
      whyitWorks: "Reducing tactile noise lowers the processing load on the brain, preventing sensory overload and allowing for deeper focus and relaxation.",
      integrationcue: "You notice a reduction in unexplained irritability and a greater sense of belonging within your own space."
    }
  },
  {
    id: 61,
    category: "Behavioral Architecture",
    title: "The Visual Cue & The Salience Network",
    free: {
      sciencefact: "Your brain's Salience Network prioritizes processing objects that are visually prominent. If a tool for a habit is hidden, it effectively does not exist to your predictive brain.",
      whyitmatters: "Out of sight, out of mind is a biological reality. Relying on memory for habits is a high-load strategy that often leads to failure. You constantly forget to take your vitamins or journal, simply because the items are tucked away in a drawer or cupboard."
    },
    paid: {
      protocol: "The Path-of-Travel Placement",
      primaryadjustment: "Place the physical tool for your desired habit directly in your Path of Travel for that time of day.",
      refinement: [
        "Place your vitamins on top of the coffee machine; place your journal on your pillow during the morning reset.",
        "The Negative Cue: Conversely, hide low-value triggers (like the TV remote) inside an opaque box to reduce their visual salience."
      ],
      whyitWorks: "Visual prominence reduces the activation energy required to start a task, allowing the brain to trigger the behavior automatically without using executive function.",
      integrationcue: "You notice yourself executing new habits without having to remember them, leading to a higher success rate and lower mental fatigue."
    }
  },
  {
    id: 62,
    category: "Cognitive Boundaries",
    title: "Context-Dependent Memory & Neural Switching",
    free: {
      sciencefact: "Context-Dependent Memory means your brain associates specific sensory environments with specific mental states. If your work and rest environments overlap, the brain cannot fully switch off.",
      whyitmatters: "Working from your sofa without a wrap ritual leads to cognitive bleeding, where work stress permeates your recovery hours."
    },
    paid: {
      protocol: "The Sensory Anchor Shift",
      primaryadjustment: "Use unique sensory anchors (scent, light, or texture) that exist only during work hours and are physically removed at 5:00 PM.",
      refinement: [
        "Use a specific work scent (e.g., Rosemary) or a work blanket that you only touch during deep focus blocks.",
        "At the end of the day, physically stow your laptop and change the lighting spectrum from cool-white to warm-amber."
      ],
      whyitWorks: "These distinct sensory cues provide the hard boundaries your brain needs to partition different mental contexts, facilitating a cleaner transition into Rest & Digest mode.",
      integrationcue: "You notice a sharper click into relaxation in the evening and a total absence of work-related thoughts once the wrap is complete."
    }
  },
  {
    id: 63,
    category: "Impulse Control",
    title: "The Friction Hypothesis & Activation Energy",
    free: {
      sciencefact: "Increasing the physical effort required to execute a behaviour by just 20 seconds drastically reduces its frequency. This is known as the Friction Hypothesis.",
      whyitmatters: "Your brain is evolutionarily designed to take the path of least resistance. If a bad habit is easy, you will do it. You will find yourself mindlessly scrolling on your phone simply because it was physically within reach on the table."
    },
    paid: {
      protocol: "The Strategic Friction Barrier",
      primaryadjustment: "Store high-dopamine, low-value triggers (screens, snacks, remotes) in a different room or inside an opaque, latched container.",
      refinement: [
        "Place your phone in a drawer in the hallway during dinner; keep the TV remote in a drawer rather than on the coffee table.",
        "The Positive Friction: Simultaneously, remove friction for good habits (e.g., keep your gym shoes by the door)."
      ],
      whyitWorks: "The 20-second delay provides a cognitive gap that allows your prefrontal cortex (the rational brain) to catch up with your impulsive midbrain, giving you back your agency.",
      integrationcue: "You notice a significant increase in your impulse control and a reduction in mindless, high-dopamine behaviours."
    }
  },
  {
    id: 64,
    category: "Cognitive Load",
    title: "Entryway Transition & The Open Loop",
    free: {
      sciencefact: "Entering your home with keys, mail, or bags in hand creates an open loop: an unfinished task that keeps the brain in a state of high-alert task-switching.",
      whyitmatters: "If you carry the clutter of the world into your living space, you never truly cross the threshold into recovery. Notice if you carry mail or keys further into the house, leaving a trail of to-do items behind you that you then have to clean up later."
    },
    paid: {
      protocol: "The 1-Metre Threshold",
      primaryadjustment: "Install a dedicated drop zone (a console, bowl, or hook) within 1 metre of your front door.",
      refinement: [
        "The Empty Hand Rule: Nothing passes this threshold until your hands are empty and your external items are stowed.",
        "Process mail immediately at the door: Trash, File, or Action. Never let it hit the kitchen table."
      ],
      whyitWorks: "Physically closing the loop at the entrance signals to the brain that the external world is over and the internal sanctuary has begun, reducing background cognitive load.",
      integrationcue: "You notice a profound sense of relief the moment you step through the door and a cleaner, more focused home environment."
    }
  },
  {
    id: 65,
    category: "Mood Regulation",
    title: "Postural Feedback & The Serotonin Connection",
    free: {
      sciencefact: "Environments that force a constant downward gaze (phones, low tables, floor-level storage) encourage a collapsed posture, which is neurologically linked to lower serotonin and higher cortisol.",
      whyitmatters: "Your brain receives constant feedback from your body; if you look down, your brain assumes you are in a state of defeat or withdrawal. Your home may feel heavy, as if everything interesting or important is located on or near the floor."
    },
    paid: {
      protocol: "The Horizon Lift",
      primaryadjustment: "Place artwork, shelving, or visual interest points high on the walls (at or above eye level) to force the chin up.",
      refinement: [
        "Use vertical storage to draw the eye upward; ensure your monitor is at eye level to prevent tech-neck.",
        "Install up-lighting to draw attention to the ceiling, creating a sense of volume and expansiveness."
      ],
      whyitWorks: "An upright, open posture increases lung capacity and signals safety and confidence to the brain, naturally elevating mood and serotonin production.",
      integrationcue: "You notice your chest feels more open and you experience a natural lift in your daily mood and energy levels."
    }
  },
  {
    id: 66,
    category: "Psychological Safety",
    title: "Primary Territory & The Cortisol of Crowding",
    free: {
      sciencefact: "Humans possess an innate biological need for primary territory: a space that is exclusively theirs and under their total control. A lack of this space increases aggression and baseline cortisol.",
      whyitmatters: "In shared homes, the feeling that nowhere is yours leads to a state of constant, low-level vigilance and a loss of personal agency. You will feel crowded and irritable, or as if you're constantly on display because no part of your house is truly yours."
    },
    paid: {
      protocol: "The Sovereign Zone",
      primaryadjustment: "Assign at least one physical area (a shelf, a desk, or even a single drawer) as exclusively yours.",
      refinement: [
        "The Non-Negotiable Boundary: Establish a clear rule: no one else touches, moves, or tidies this zone. It is your sovereign zone.",
        "In small spaces, use visual markers (a specific color or material) to delineate this territory from the shared environment."
      ],
      whyitWorks: "Having a primary territory provides a psychological anchor that reduces the stress of social density, allowing the nervous system to fully relax and de-escalate.",
      integrationcue: "You notice a significant reduction in unexplained irritability with housemates."
    }
  },
  {
    id: 67,
    category: "Auditory Privacy",
    title: "The Air-Gap Leak & Social Vigilance",
    free: {
      sciencefact: "Sound waves travel through air gaps with incredible efficiency. A closed door with even a 1cm gap at the bottom can lose up to 50% of its acoustic blocking potential.",
      whyitmatters: "If you can hear muffled conversations through a door, your brain assumes they can hear you, preventing true vulnerability and relaxation. A closed door in your home may feel like a fake barrier because you can still hear the TV or talking in the next room."
    },
    paid: {
      protocol: "The Acoustic Seal",
      primaryadjustment: "Install heavy-duty acoustic seals or draft excluders on all bedroom and office doors to eliminate air gaps.",
      refinement: [
        "Use a solid-core door if possible; if not, add a layer of dense material (like a decorative acoustic panel) to the back of a hollow door.",
        "Combine the seal with a white noise machine placed outside the door to create an auditory screen."
      ],
      whyitWorks: "Eliminating the auditory bleed provides the high-fidelity privacy needed for the brain to stand down from social monitoring mode.",
      integrationcue: "You notice you feel truly alone for the first time when the door is closed, leading to deeper focus and faster recovery."
    }
  },
  {
    id: 68,
    category: "Behavioural Regulation",
    title: "Evaluation Apprehension & The Fishbowl Effect",
    free: {
      sciencefact: "Being in the direct line of sight of others, even loved ones, triggers Evaluation Apprehension, a state where the brain subconsciously performs for an audience.",
      whyitmatters: "This Fishbowl Effect prevents you from entering the Default Mode Network (DMN) states required for deep reflection and creative thought. You will feel the need to look busy or sit a certain way simply because family members can see you from the kitchen or hallway."
    },
    paid: {
      protocol: "The Sight-Line Shield",
      primaryadjustment: "Use physical barriers (screens, bookshelves, or tall plants) to break the direct line of sight between high-traffic areas and focus zones.",
      refinement: [
        "Position your chair so your back is to a wall and you have a view of the room's entrance (The Prospect-Refuge principle).",
        "Use translucent screens that allow light through but obscure detailed movement, reducing the perceived audience load."
      ],
      whyitWorks: "Breaking the visual connection reduces the social monitoring load on the prefrontal cortex, allowing you to reclaim your internal agency and focus.",
      integrationcue: "You notice a quieting of your internal critic and an increased ability to lose yourself in a task or a moment of rest."
    }
  },
  {
    id: 69,
    category: "Self-Perception",
    title: "Self-Objectification & The Scrutiny Spike",
    free: {
      sciencefact: "Frequent, accidental glimpses of yourself in mirrors or reflective surfaces can trigger self objectification, increasing body-related anxiety and cortisol.",
      whyitmatters: "In a home filled with mirrors, you are constantly checking your appearance, which pulls you out of the present moment and into a state of self-scrutiny. You may find yourself checking your face or hair every time you pass a mirror, even when you're just going to the kitchen."
    },
    paid: {
      protocol: "The Intentional Reflection",
      primaryadjustment: "Remove all mirrors from high-traffic path of travel zones (hallways, living rooms) where you might catch accidental glimpses.",
      refinement: [
        "Keep mirrors only in functional zones (bathrooms, dressing areas) where you go with the intention of grooming.",
        "If you have a large mirror you can't move, consider a shroud or a decorative screen to cover it when not in use."
      ],
      whyitWorks: "Reducing accidental self-viewing lowers the frequency of self-evaluative thoughts, allowing the brain to remain focused on internal states and external tasks.",
      integrationcue: "You notice a reduction in self scrutiny stress and a more stable, grounded sense of self throughout the day."
    }
  },
  {
    id: 70,
    category: "Social Cohesion",
    title: "Joint Attention & The Synchrony Effect",
    free: {
      sciencefact: "Engaging in joint attention, where two people focus on the same non-digital object, synchronises brainwaves and reduces social friction.",
      whyitmatters: "Modern homes often have competing focus points (multiple screens), which prevents the Synchrony Effect and leads to a feeling of disconnection. You may feel disconnected from your partner or family even when you're in the same room, because everyone is on a different device."
    },
    paid: {
      protocol: "The Analog Anchor",
      primaryadjustment: "Create one analog anchor in a shared space such as a puzzle, a book, or a view, that is the primary focus of the seating arrangement.",
      refinement: [
        "Position seating to face each other or the analog anchor, rather than the TV.",
        "Establish a digital free hour where the shared space is used only for joint, non-screen activities."
      ],
      whyitWorks: "Shared focus on a tangible object facilitates Neural Entrainment, a state where individuals' physiological rhythms (heart rate, breathing) begin to align, fostering deep connection.",
      integrationcue: "You notice family interactions feel smoother and a greater sense of social connection in your daily check-ins."
    }
  },
  {
    id: 71,
    category: "Acoustic Balance",
    title: "Shared Wall Awareness",
    free: {
      sciencefact: "Knowing your neighbours can hear you creates Evaluation Apprehension, preventing full relaxation in your own home.",
      whyitmatters: "You may find yourself whispering in your own living room to avoid being heard by neighbours. This chronic lack of acoustic privacy keeps your autonomic nervous system on guard, preventing a true parasympathetic state."
    },
    paid: {
      protocol: "The Privacy Barrier",
      primaryadjustment: "Place heavy furniture like bookshelves or wardrobes full of dense items against the shared party wall to act as mass.",
      refinement: [
        "Rate your Privacy Perception before and after the intervention to measure the somatic shift."
      ],
      whyitWorks: "Adding physical mass to a shared wall dampens acoustic transmission, signaling to the survival brain that you are no longer being monitored.",
      integrationcue: "You will notice you no longer subconsciously moderate your voice volume or physical movements within your own living space."
    }
  },
  {
    id: 72,
    category: "Acoustic Balance",
    title: "Water Sound Psychology",
    free: {
      sciencefact: "The sound of running water reduces cortisol levels, but the sound of draining or dripping pipes triggers anxiety related to waste and loss aversion.",
      whyitmatters: "A dripping tap or a noisy drain can make it impossible for you to concentrate. The brain interprets these specific acoustic signatures as unresolved maintenance threats, creating continuous cognitive friction."
    },
    paid: {
      protocol: "Acoustic Leak Mitigation",
      primaryadjustment: "Fix all leaks immediately and insulate waste pipes if they run through living areas to silence the draining sounds.",
      refinement: [
        "Log Maintenance Frictions in your tracking tool to isolate which specific plumbing sounds cause the highest spikes in irritation."
      ],
      whyitWorks: "Eliminating the sound of dripping or draining removes the subconscious cue of resource loss, allowing the auditory cortex to return to a baseline state of safety.",
      integrationcue: "Your environment will feel immediately more stable, and the low-level urgency to fix something will dissipate."
    }
  },
  {
    id: 73,
    category: "Acoustic Balance",
    title: "The BPM Sync",
    free: {
      sciencefact: "The heart rate tends to synchronise with the rhythm of the auditory environment through entrainment, meaning chaotic rhythms lead to arrhythmic heart rates.",
      whyitmatters: "Fast-paced music may make you feel anxious when you are trying to cook or clean calmly. Your cardiovascular system is being forced to match an elevated tempo that contradicts your desired physical state."
    },
    paid: {
      protocol: "Auditory Entrainment",
      primaryadjustment: "Match the BPM of your background music to your desired state, using 60 BPM for rest and 120 BPM for active tasks.",
      refinement: [
        "Use a targeted Focus Playlist to consciously engineer your heart rate rather than leaving it to algorithmic chance."
      ],
      whyitWorks: "Deliberate auditory pacing leverages the somatic entrainment response, using sound to physically down-regulate or up-regulate the cardiovascular system with precision.",
      integrationcue: "You will experience a sense of flow during tasks, with your physical movements feeling naturally supported by the acoustic environment."
    }
  },
  {
    id: 74,
    category: "Acoustic Balance",
    title: "Mechanical Ventilation",
    free: {
      sciencefact: "Constant mechanical whirring at the wrong frequency can trigger Low-Frequency Fatigue.",
      whyitmatters: "You may feel a sudden sense of relief when you leave your house simply because the background noise stops. This indicates that your home is placing a continuous, invisible acoustic load on your nervous system."
    },
    paid: {
      protocol: "Mechanical Silence Audit",
      primaryadjustment: "Ensure all vents are clean to reduce whistling and schedule maintenance to check fan balance.",
      refinement: [
        "Measure the Ambient Noise Floor to identify hidden low-frequency hums that your brain is filtering but your body is enduring."
      ],
      whyitWorks: "Removing low-frequency mechanical noise eliminates a persistent environmental stressor, freeing up the cognitive bandwidth previously used to filter the hum.",
      integrationcue: "The air in your home will feel lighter, and the subtle tension at the base of your skull will begin to release."
    }
  },
  {
    id: 75,
    category: "Acoustic Balance",
    title: "The Quiet Hour Ritual",
    free: {
      sciencefact: "The brain needs a period of Auditory Rest before sleep to process the day's intake.",
      whyitmatters: "Keeping your home loud with television, talking, or music right up until the moment you get into bed prevents the auditory cortex from powering down, leading to delayed sleep onset."
    },
    paid: {
      protocol: "The Zero Audio Transition",
      primaryadjustment: "Institute a Zero Audio hour 60 minutes before sleep where no artificial inputs are allowed, leaving only ambient house sounds.",
      refinement: [
        "Set a Quiet Hour reminder to build the habit of auditory down-regulation before physical exhaustion hits."
      ],
      whyitWorks: "A definitive cessation of auditory input signals to the circadian system that the stimulation phase of the day is over, initiating the neurochemical cascade required for deep sleep.",
      integrationcue: "You will find yourself falling asleep faster and experiencing less racing thoughts the moment your head hits the pillow."
    }
  },
  {
    id: 76,
    category: "Tactile and Thermal",
    title: "Thermal Sleep Triggers",
    free: {
      sciencefact: "To initiate sleep, the body core temperature must drop by approximately 1°C. A warm room prevents this drop, delaying sleep onset.",
      whyitmatters: "You may find yourself tossing and turning, constantly flipping the pillow to the cool side. Your biological system is actively fighting the environmental temperature, creating somatic resistance instead of surrender."
    },
    paid: {
      protocol: "The Ambient Thermal Drop",
      primaryadjustment: "Keep the bedroom between 16 and 18°C and use breathable layers rather than one heavy duvet to allow for micro-adjustments.",
      refinement: [
        "Track your Sleep Onset speed to correlate the room temperature with how fast your nervous system powers down."
      ],
      whyitWorks: "Lowering ambient temperature facilitates the mandatory biological thermal drop required for sleep, shifting the body from thermoregulation into deep cellular repair.",
      integrationcue: "You will stop fighting your bedding and experience a faster, heavier transition into the first sleep cycle."
    }
  },
  {
    id: 77,
    category: "Tactile and Thermal",
    title: "The Cold Vigilance",
    free: {
      sciencefact: "Being physically cold activates the sympathetic nervous system to generate heat. You cannot achieve true relaxation if you are shivering.",
      whyitmatters: "You might catch yourself hunching your shoulders or sitting on your hands when watching television in the evening. This physical contraction is a survival response that actively blocks parasympathetic recovery."
    },
    paid: {
      protocol: "Targeted Somatic Warming",
      primaryadjustment: "Use Spot Heating like a hot water bottle or electric throw to warm the person directly, rather than attempting to heat the entire room.",
      refinement: [
        "Apply the heat source directly to the torso or feet for immediate parasympathetic release."
      ],
      whyitWorks: "Direct conductive heat immediately signals safety to the autonomic nervous system, shutting down the sympathetic thermal-defense cascade and allowing muscles to unbrace.",
      integrationcue: "You will feel your shoulders naturally drop away from your ears and your breathing deepen within minutes of application."
    }
  },
  {
    id: 78,
    category: "Tactile and Thermal",
    title: "Synthetic Static",
    free: {
      sciencefact: "Synthetic fabrics trap heat and moisture, creating a humid micro-climate against the skin that causes subtle neurological restlessness.",
      whyitmatters: "Waking up sweaty but cold, or feeling like your clothes are clingy and static-charged, is a sign that your sensory boundaries are being irritated. This micro-friction interrupts deep rest."
    },
    paid: {
      protocol: "The Breathable Boundary",
      primaryadjustment: "Eliminate polyester from direct skin contact in sheets and pyjamas, switching entirely to 100% Cotton, Linen, or Tencel.",
      refinement: [
        "Check all bedding labels, as many premium brands blend synthetics for wrinkle resistance at the cost of biological comfort."
      ],
      whyitWorks: "Natural fibers allow for efficient moisture evaporation and thermal regulation, preventing the sensory alarms triggered by trapped humidity and static discharge.",
      integrationcue: "You will wake up feeling thermally neutral and physically untethered from your bedding."
    }
  },
  {
    id: 79,
    category: "Tactile and Thermal",
    title: "Proprioceptive Weighting",
    free: {
      sciencefact: "Deep Pressure Stimulation increases dopamine and serotonin while simultaneously reducing cortisol. Weight feels like a physical container for a dysregulated system.",
      whyitmatters: "If you feel calmer when wearing a heavy coat or sleeping under a dense pile of blankets, your nervous system is actively seeking proprioceptive grounding to offset environmental anxiety."
    },
    paid: {
      protocol: "Strategic Mass Application",
      primaryadjustment: "Incorporate a weighted blanket that is approximately 10% of your body weight into your designated rest zone or Crisis Corner.",
      refinement: [
        "Ensure the weight is evenly distributed and the fabric is breathable to prevent thermal overload while applying pressure."
      ],
      whyitWorks: "Deep pressure mimics the somatic sensation of being held, which stimulates the vagus nerve and shifts the nervous system from a state of vigilance into one of contained safety.",
      integrationcue: "You will feel an immediate physical anchoring, as if the scattered energy in your body is being pressed back into your core."
    }
  },
  {
    id: 80,
    category: "Tactile and Thermal",
    title: "Tactile Defensiveness",
    free: {
      sciencefact: "For sensitive neurotypes, certain textures like unfinished wood, velvet, or coarse wool register as actual pain signals in the brain.",
      whyitmatters: "You may instinctively pull your hand away from certain upholstery or surfaces in your home. This tactile rejection is not a preference; it is your nervous system actively defending itself against abrasive inputs."
    },
    paid: {
      protocol: "The Frictionless Surface Audit",
      primaryadjustment: "Perform a Touch Audit to remove or cover any texture that triggers a withdrawal response, replacing them with High-Glide textures like silk or smooth cotton.",
      refinement: [
        "Rate your Seating Comfort objectively, identifying zones where you hesitate to rest your bare arms or legs."
      ],
      whyitWorks: "Replacing abrasive textures with high-glide surfaces removes the subconscious threat of micro-abrasions, allowing the tactile processing centers of the brain to power down.",
      integrationcue: "You will navigate your furniture fluidly, without the subconscious bracing or avoidance behaviors previously required."
    },
  {
    id: 81,
    category: "Tactile and Thermal",
    title: "Thermal Shock",
    free: {
      sciencefact: "Stepping onto a cold floor shocks the system, instantly spiking alertness. This is jarring during night-time bathroom trips.",
      whyitmatters: "You may walk on tiptoes in your bathroom or kitchen to avoid touching the floor. This physical bracing creates an immediate sympathetic nervous system spike, jarring you out of a restorative state during night-time wakings."
    },
    paid: {
      protocol: "The Barefoot Path",
      primaryadjustment: "Place runners or rugs in high-traffic barefoot zones, specifically targeting the bed-to-bathroom path.",
      refinement: [
        "Log Morning Comfort to track how thermal grounding impacts your baseline stress levels upon waking."
      ],
      whyitWorks: "Providing a thermally neutral surface prevents the sudden physiological shock of heat loss through the soles of the feet, keeping the autonomic nervous system in a regulated state.",
      integrationcue: "You will navigate your home seamlessly during the night without the subconscious tension of anticipating a cold shock."
    }
  },
  {
    id: 82,
    category: "Tactile and Thermal",
    title: "Rug Zoning",
    free: {
      sciencefact: "A rug creates a Tactile Island. Stepping from hard floor to soft rug signals the brain to shift from Movement to Rest.",
      whyitmatters: "If your furniture feels like it is floating in a sea of hard floor, the room will inherently feel cold and unanchored to your nervous system. This lack of clear spatial boundaries prevents your brain from fully transitioning into a rest state."
    },
    paid: {
      protocol: "The Tactile Island",
      primaryadjustment: "Ensure your rug is large enough that all furniture legs sit firmly on it, creating a single, cohesive tactile zone.",
      refinement: [
        "Apply the Visual Noise Filter to observe how anchoring the furniture instantly reduces the chaotic, floating energy of the space."
      ],
      whyitWorks: "Defining a clear, soft boundary underneath resting areas provides a subconscious somatic cue that movement has ceased, signaling the brain to down-regulate.",
      integrationcue: "The space will instantly feel deliberate and grounded, pulling you into a state of physical settling the moment you step onto the textile."
    }
  },
  {
    id: 83,
    category: "Tactile and Thermal",
    title: "The Sink Factor",
    free: {
      sciencefact: "Soft sofas that you sink into can cause physical anxiety because they restrict movement and make standing up difficult.",
      whyitmatters: "Grunting or struggling to get out of your sofa, or avoiding it entirely for short breaks, indicates somatic entrapment. Deep, overly soft seating restricts your physical agency, causing subconscious panic in the mammalian brain."
    },
    paid: {
      protocol: "Somatic Support Baseline",
      primaryadjustment: "Choose seating with firm structural support and a seat height that allows your knees to rest comfortably at exactly 90 degrees.",
      refinement: [
        "Rate your Posture Support over a 7-day period to measure the decrease in physical fatigue after long periods of sitting."
      ],
      whyitWorks: "Firm, biomechanically aligned seating removes the physical effort required to hold the body upright or escape the structure, reassuring the nervous system that mobility is always available.",
      integrationcue: "Sitting down will feel like being actively supported rather than swallowed, and standing up will require zero preparatory bracing."
    }
  },
  {
    id: 84,
    category: "Tactile and Thermal",
    title: "Humidity and Stickiness",
    free: {
      sciencefact: "High humidity reduces the evaporation of sweat, leading to a sensation of air heaviness and claustrophobia.",
      whyitmatters: "When the air in your home feels thick or difficult to breathe deeply, you are experiencing the biological stress of impaired thermoregulation. The inability of sweat to evaporate efficiently triggers a low-grade claustrophobic response."
    },
    paid: {
      protocol: "The Crisp Air Baseline",
      primaryadjustment: "Deploy a dehumidifier to strictly maintain ambient humidity between 40 and 50 percent across all primary living spaces.",
      refinement: [
        "Continuously Track Humidity Levels to ensure the environment remains in the optimal biological window, regardless of external weather."
      ],
      whyitWorks: "Maintaining optimal humidity restores the skin's ability to efficiently offload heat, removing the persistent sensation of environmental heaviness and oppression.",
      integrationcue: "The air will feel immediately lighter in the lungs, and your skin will remain cool and dry even during mild physical activity within the home."
    }
  },
  {
    id: 85,
    category: "Tactile and Thermal",
    title: "Air Movement",
    free: {
      sciencefact: "Still, stagnant air allows CO2 and VOCs to pool around the user. Air movement stimulates skin receptors, keeping alertness fresh.",
      whyitmatters: "Feeling inexplicably sleepy and lethargic after sitting in the same spot for an hour is a symptom of localized atmospheric stagnation. Pooling CO2 and the lack of tactile stimulation on the skin signal the brain to power down prematurely."
    },
    paid: {
      protocol: "Invisible Circulation",
      primaryadjustment: "Position a low-velocity fan to create gentle, continuous air movement throughout the room, focusing on circulation rather than a direct draft.",
      refinement: [
        "Log Focus Stamina to correlate the introduction of air movement with your ability to sustain cognitive tasks without chemical stimulants."
      ],
      whyitWorks: "Gentle air currents constantly refresh the oxygen boundary layer around your face while providing subtle tactile stimulation that keeps the neurological arousal system engaged.",
      integrationcue: "You will maintain a steady, clear-headed focus for extended periods without experiencing the typical mid-afternoon environmental crash."
    }
  },
  {
    id: 86,
    category: "Habits Routines and WFH",
    title: "Habit Salience",
    free: {
      sciencefact: "The brains Salience Network prioritises processing objects that are visually prominent. Hidden tools lead to failure.",
      whyitmatters: "Constantly forgetting to take vitamins or journal simply because the items are hidden in a drawer is not a lack of discipline; it is an architectural failure. The brain requires high-visibility cues to trigger low-motivation behaviors."
    },
    paid: {
      protocol: "The Unavoidable Trigger",
      primaryadjustment: "Place the physical tool for your desired habit directly in your primary path of travel, ensuring it is visually unmissable.",
      refinement: [
        "Use the Habit Stacking tracker to link this newly visible tool to an existing, non-negotiable daily action."
      ],
      whyitWorks: "Placing a cue in your direct visual field leverages the brains automatic salience network, eliminating the cognitive load required to remember or initiate the task.",
      integrationcue: "Desired behaviors will begin happening automatically, triggered by the environment itself rather than requiring internal willpower."
    }
  },
  {
    id: 87,
    category: "Habits Routines and WFH",
    title: "The Work Wrap",
    free: {
      sciencefact: "Context-Dependent Memory means the brain struggles to switch off Work Mode if the sensory environment remains identical to Rest Mode.",
      whyitmatters: "Feeling anxious sitting on your sofa in the evening because it is the exact same location you took a stressful call earlier is a result of contextual blending. Your nervous system cannot differentiate between the space of labor and the space of recovery."
    },
    paid: {
      protocol: "Sensory Demarcation",
      primaryadjustment: "Introduce a specific sensory variable, such as a dedicated work blanket or a rosemary scent, strictly during labor hours, and physically remove it the moment the workday concludes.",
      refinement: [
        "Log your Evening Detachment to track how quickly your heart rate normalizes once the work-specific sensory cues are removed."
      ],
      whyitWorks: "By deliberately altering the sensory data of a room, you provide the brain with a definitive off switch, breaking the contextual memory loop and allowing the nervous system to transition to rest.",
      integrationcue: "The space will feel fundamentally different in the evening, granting you permission to mentally clock out without lingering residual stress."
    }
  },
  {
    id: 88,
    category: "Habits Routines and WFH",
    title: "The Activation Barrier",
    free: {
      sciencefact: "Increasing the physical effort required to execute a bad habit by just 20 seconds drastically reduces its frequency through the Friction Hypothesis.",
      whyitmatters: "Finding yourself mindlessly scrolling on your phone simply because it was physically within reach highlights how the environment exploits your baseline dopamine-seeking loops. Proximity dictates behavior more than intent."
    },
    paid: {
      protocol: "The Friction Hypothesis",
      primaryadjustment: "Store high-dopamine triggers like screens or specific foods inside opaque, latched containers or in entirely different rooms to artificially inflate the activation energy required.",
      refinement: [
        "Rate your Impulse Control periodically to witness how physical friction dramatically reduces the frequency of compulsive behaviors."
      ],
      whyitWorks: "Introducing even a 20-second delay forces the brain to shift from automatic, limbic-driven impulsivity to conscious, prefrontal evaluation, breaking the mindless loop.",
      integrationcue: "You will experience a quiet reclamation of your time and attention, as the physical effort required simply is not worth the momentary dopamine hit."
    }
  },
  {
    id: 89,
    category: "Habits Routines and WFH",
    title: "The Drop Zone",
    free: {
      sciencefact: "Entering a home with keys or mail in hand creates an Open Loop, keeping the brain in a task-switching state rather than a recovery state.",
      whyitmatters: "Carrying clutter further into the house and leaving a trail of micro-tasks behind you creates open neurological loops. This ensures you remain in a heightened state of vigilance long after you have crossed the threshold."
    },
    paid: {
      protocol: "The Empty Hand Threshold",
      primaryadjustment: "Install a designated console or bowl within one metre of the front door, enforcing a strict rule that nothing passes this boundary until your hands are entirely empty.",
      refinement: [
        "Log Entry Mood in the Daily Check-in to observe the psychological relief of establishing a hard boundary against external chaos."
      ],
      whyitWorks: "Creating a dedicated offloading zone at the point of entry immediately closes open cognitive loops, signaling to the nervous system that the transition from external threat to internal safety is complete.",
      integrationcue: "The deeper interior of your home will remain pristine and unregulated by outside artifacts, allowing you to enter a state of immediate decompression."
    }
  },
  {
    id: 90,
    category: "Habits Routines and WFH",
    title: "Vertical Scanning",
    free: {
      sciencefact: "Environments that force a downward gaze encourage a kyphotic posture, which is linked to lower serotonin levels and depressive states.",
      whyitmatters: "If your home feels heavy, with all visual anchors located below eye level, you are being physically forced into a chronic downward gaze. This structural kyphosis compresses the chest and biochemically mirrors a state of submission or defeat."
    },
    paid: {
      protocol: "The Upward Gaze Vector",
      primaryadjustment: "Relocate striking artwork or architectural shelving high on the walls to naturally draw the eye upward and expand the chest cavity.",
      refinement: [
        "Trigger a structural joinery design consultation to permanently integrate high-level visual anchors into the architecture of the space."
      ],
      whyitWorks: "Forcing the chin up and opening the posture signals confidence and alertness to the brain, directly stimulating serotonin production and countering the somatic loop of lethargy.",
      integrationcue: "You will naturally walk taller through your space, experiencing a subtle but persistent lift in baseline energy and mood."
    }
  }
]
