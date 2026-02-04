export type NeuroInsight = {
  id: number
  title: string
  category: string
  science_fact: string
  // TIER 1: The Hook (Free)
  somatic_prompt: string 
  cliffhanger: string
  // TIER 2: The Solution (Paid)
  design_spec?: string
  tool_integration?: string
}

export const neuroInsights: NeuroInsight[] = [
  // --- TIER 1: THE SOMATIC PING (Cards 1-8) ---
  {
    id: 1,
    category: "Cognitive Load",
    title: "Cognitive Fog & Visual Load",
    science_fact: "Disorganised environments and harsh, high-intensity lighting increase cognitive load, which actively impairs working memory and the ability to focus.",
    somatic_prompt: "Do you find yourself losing your train of thought or forgetting simple tasks the moment you enter a cluttered room with 'flat' overhead lighting?",
    cliffhanger: "You have identified a Cognitive Load trigger. The Executive Function Layout Protocol is available in the Sensory Coaching Modules.",
    design_spec: "Implement 'Closed Storage' for non-active projects. Reduce overhead intensity by 40%.",
    tool_integration: "Log your 'Focus Duration' before and after decluttering."
  },
  {
    id: 2,
    category: "Sensory Sensitivity",
    title: "Heightened Sensory Sensitivity",
    science_fact: "A dysregulated nervous system struggles with 'sensory gating,' making it difficult for the brain to filter out irrelevant background noise or blue-rich light flicker.",
    somatic_prompt: "Does the 'hum' of the fridge or the flicker of a cool-white LED feel physically painful rather than just annoying?",
    cliffhanger: "This is a Sensory Gating mismatch. Access the Acoustic Buffering Protocol in the Sensory Coaching Modules.",
    design_spec: "Eliminate PWM-dimmed LEDs. Add pink noise masking.",
    tool_integration: "Use the Noise Meter to identify frequencies above 500Hz."
  },
  {
    id: 3,
    category: "Circadian Integrity",
    title: "Circadian Misalignment",
    science_fact: "Light is the primary cue for your internal body clock. Misaligned lighting—too bright at night or too dim during the day—disrupts melatonin production and hormonal balance.",
    somatic_prompt: "Do you experience 'afternoon slumps' or find it difficult to feel truly awake until several hours after sunrise?",
    cliffhanger: "Your Circadian Rhythm is out of sync. Unlock the Luminous Entrainment Protocol in the Sensory Coaching Modules.",
    design_spec: "Morning: 4500K–6500K. Evening: <3000K dim light.",
    tool_integration: "Perform a Daily Light Cycle Audit."
  },
  {
    id: 4,
    category: "Anxiety Regulation",
    title: "Amygdala Reactivity",
    science_fact: "Harsh light geometry and unpredictable sensory input trigger the Amygdala—the brain's threat detection centre—leading to sudden surges in anxiety or irritability.",
    somatic_prompt: "Does a sudden loud noise or a cluttered, brightly-lit doorway make you feel instantly 'on edge' or tensed for no clear reason?",
    cliffhanger: "You are experiencing Amygdala-mediated anxiety. The Refuge & Prospect Protocol is available in the Sensory Coaching Modules.",
    design_spec: "Soften visual edges. Use indirect lighting sources.",
    tool_integration: "Identify peak decibel spikes in 'Refuge' zones."
  },
  {
    id: 5,
    category: "Predictability",
    title: "Lowered Tolerance",
    science_fact: "The brain prioritises sensory predictability to conserve energy; unpredictable shadows or erratic noise force the nervous system into constant vigilance.",
    somatic_prompt: "Do you find yourself unable to relax until every random sound or visual distraction is accounted for?",
    cliffhanger: "This is a Predictability Gap. Access the Spatial Order Protocol in the Sensory Coaching Modules.",
    design_spec: "Establish clear visual pathways and consistent lighting anchors.",
    tool_integration: "Use the Flow Mapper to remove navigational bottlenecks."
  },
  {
    id: 6,
    category: "Thermoregulation",
    title: "Thermal & Surface Discomfort",
    science_fact: "Fluctuations in internal temperature regulation mean that surface materials and infrared heat from direct sunlight are critical for maintaining a state of ease.",
    somatic_prompt: "Do you find yourself constantly adjusting layers or feeling 'trapped' by the temperature of a room when the sun hits the windows?",
    cliffhanger: "This is a Thermal Effusivity mismatch. The Micro-Thermoregulation Protocol is available in the Sensory Coaching Modules.",
    design_spec: "Provide individual thermal control (fans, throws).",
    tool_integration: "Track Sleep Quality against room temperature."
  },
  {
    id: 7,
    category: "Focus Capacity",
    title: "Prefrontal Tax & Focus",
    science_fact: "Overstimulating environments and 'Biological Glare' reduce prefrontal efficiency, making decision-making and sustained focus biologically difficult.",
    somatic_prompt: "Do you feel mentally drained after spending only a few minutes attempting to work in your current brightly-lit space?",
    cliffhanger: "Your Prefrontal Cortex is being overtaxed. Unlock the Cognitive Offloading Protocol in the Sensory Coaching Modules.",
    design_spec: "Implement 'Matte-Only' policy. Shield light sources.",
    tool_integration: "Set Focus Timer and log 'Cognitive Clarity' score."
  },
  {
    id: 8,
    category: "Psychological Safety",
    title: "Identity & Safety",
    science_fact: "A home that feels misaligned with your identity or has 'cold,' clinical lighting acts as a constant 'second skin' irritant, undermining emotional safety.",
    somatic_prompt: "Do you feel like a guest in your own home, or that your space reflects a version of you that no longer exists?",
    cliffhanger: "This is an Identity Mismatch. The Atmosphere Architecture Protocol is available in the Sensory Coaching Modules.",
    design_spec: "Align visual anchors with personal identity markers.",
    tool_integration: "Rate 'Sense of Security' in Somatic Journal."
  },

  // --- TIER 2: THE DAILY INTERVENTION (Cards 9-28) ---
  {
    id: 9,
    category: "Amygdala Mitigation",
    title: "Amygdala Mitigation",
    science_fact: "The Amygdala reacts to harsh visual contrasts and unpredictable noise by spiking cortisol.",
    design_spec: "Reduce unpredictability by softening visual edges and using 'indirect' lighting sources. Aim for acoustic damping on 25% of hard surfaces.",
    tool_integration: "Use the Acoustic Tracker to identify peak decibel spikes in your 'Refuge' zones.",
    somatic_prompt: "Do harsh shadows or echoing rooms make you feel unsafe?",
    cliffhanger: "Unlock the full Acoustic Specification."
  },
  {
    id: 10,
    category: "Glare Control",
    title: "Prefrontal Support",
    science_fact: "Cluttered or visually competing stimuli—including specular glare from screens—demand excessive executive resources.",
    design_spec: "Implement a 'Matte-Only' policy for workstations. Ensure light sources are shielded to prevent direct glare on device screens.",
    tool_integration: "Set the Focus Timer and log your 'Cognitive Clarity' score post-adjustment.",
    somatic_prompt: "Do you squint or feel headache-prone at your desk?",
    cliffhanger: "Unlock the Glare Control Protocol."
  },
  {
    id: 11,
    category: "Vagal Tone",
    title: "Vagal Tone & Nature",
    science_fact: "Features that promote parasympathetic activation, such as nature views and tactile calm, improve heart rate variability (HRV).",
    design_spec: "Incorporate natural materials and biophilic light (dappled shadows). Ensure primary seating faces a 'Prospect' view.",
    tool_integration: "Sync your Wearable Data to track HRV shifts after 10 minutes in your biophilic zone.",
    somatic_prompt: "Does your space feel dead or disconnected from nature?",
    cliffhanger: "Unlock the Biophilic Restoration Protocol."
  },
  {
    id: 12,
    category: "Circadian Systems",
    title: "Circadian Systems (SCN)",
    science_fact: "The spectral quality and timing of light strongly influence melatonin production. Blue-enriched light in the morning enhances alertness.",
    design_spec: "Morning (07:00–10:00): 4500K–6500K cool light. Evening (Post-Sunset): Warm, dim light (<3000K).",
    tool_integration: "Perform a Daily Light Cycle Audit. Rate your morning vs evening light quality.",
    somatic_prompt: "Is your sleep cycle chaotic?",
    cliffhanger: "Unlock the precise Kelvin specifications."
  },
  {
    id: 13,
    category: "Neuroendocrine Balance",
    title: "Neuroendocrine Balance",
    science_fact: "Chronic environmental stressors, including 'Biological Darkness' during the day, elevate cortisol levels and systemic inflammation.",
    design_spec: "Ensure a 'Morning Light Boost' of ≥ 250 lux before 10 AM to reset the cortisol awakening response.",
    tool_integration: "Log your Daily Stress Level to correlate environmental light access with mood.",
    somatic_prompt: "Do you feel low energy immediately upon waking?",
    cliffhanger: "Unlock the Cortisol Reset Protocol."
  },
  {
    id: 14,
    category: "Attention Restoration",
    title: "Attention & Biophilia",
    science_fact: "Nature's restorative effect on directed attention can produce a 20% improvement in memory and cognitive performance.",
    design_spec: "Place indoor plants and natural textures within your immediate 180-degree field of view at your desk.",
    tool_integration: "Record your Task Completion Rate before and after introducing biophilic elements.",
    somatic_prompt: "Do you struggle to maintain focus for more than 20 minutes?",
    cliffhanger: "Unlock the Biophilic Attention Protocol."
  },
  {
    id: 15,
    category: "Visual Hierarchy",
    title: "Predictability & Hierarchy",
    science_fact: "Establishing a clear visual and movement hierarchy enables the brain to predict what happens next, reducing stress.",
    design_spec: "Design environments with clear visual pathways and consistent lighting 'anchors' to define focal points.",
    tool_integration: "Use the Flow Mapper to identify and remove one navigational 'Bottleneck' today.",
    somatic_prompt: "Does your room feel chaotic or confusing?",
    cliffhanger: "Unlock the Visual Hierarchy Protocol."
  },
  {
    id: 16,
    category: "Visual Comfort",
    title: "Soft Contrast",
    science_fact: "The brain expends less energy processing subtle visual information. Avoiding high-contrast patterns prevents cognitive overload.",
    design_spec: "Use low-chroma, desaturated tones for walls in resting zones. Avoid high-frequency geometric patterns.",
    tool_integration: "Use the Colour Reflection Tool to rate your current room's 'Visual Noise' level.",
    somatic_prompt: "Do busy patterns or bright walls make you feel tired?",
    cliffhanger: "Unlock the Low-Chroma Protocol."
  },
  {
    id: 17,
    category: "Biophilic Cues",
    title: "Biophilic Cues & Recovery",
    science_fact: "Exposure to natural light and biophilic textures improves subjective calm and restores directed attention capacity.",
    design_spec: "Maximise natural light penetration through reflective surfaces. Ensure furniture is oriented toward outdoor views.",
    tool_integration: "Log 'Minutes of Nature Exposure' in the Biophilic Tracker.",
    somatic_prompt: "Does your home feel too dark or enclosed?",
    cliffhanger: "Unlock the Natural Light Optimization Protocol."
  },
  {
    id: 18,
    category: "Light Geometry",
    title: "Layered Light Geometry",
    science_fact: "Harsh artificial lighting (cool-white LEDs, overhead fluorescents) causes visual strain and low-grade stress responses.",
    design_spec: "Replace single overhead sources with 'Layered Lighting.' Use warm ambient lamps plus task-specific lighting for focus.",
    tool_integration: "Perform a Lighting Layer Audit to identify 'Biological Glare' in your evening zones.",
    somatic_prompt: "Does your overhead light make you feel exposed?",
    cliffhanger: "Unlock the Layering Blueprint."
  },
  {
    id: 19,
    category: "Acoustic Zoning",
    title: "Acoustic Zoning & Privacy",
    science_fact: "Creating quiet zones for focus and using gentle soundscapes reduces auditory stress and amygdala activation.",
    design_spec: "Utilise acoustic panels and soft furnishings to mask unpredictable neighborhood noise.",
    tool_integration: "Play the In-App Pink Noise Library to mask external traffic during focus blocks.",
    somatic_prompt: "Are you easily distracted by external noises?",
    cliffhanger: "Unlock the Acoustic Zoning Protocol."
  },
  {
    id: 20,
    category: "Thermoregulation",
    title: "Micro-Thermoregulation",
    science_fact: "Accessible thermal controls enable individuals to manage vasomotor symptoms and prevent sleep disruption.",
    design_spec: "Provide individual thermal control (fans, weighted throws) and ensure adequate air movement in sleep zones.",
    tool_integration: "Track your Sleep Quality against room temperature using the Thermal Tracker.",
    somatic_prompt: "Do you wake up too hot or too cold?",
    cliffhanger: "Unlock the Thermal Control Protocol."
  },
  {
    id: 21,
    category: "Proprioception",
    title: "Proprioceptive Anchors",
    science_fact: "Weighted elements and textured rugs provide the nervous system with predictable, calming somatic signals.",
    design_spec: "Incorporate high-pile rugs and ergonomic seating to promote 'Rooting' and parasympathetic activation.",
    tool_integration: "Use the Somatic Journal to log your 'Sense of Security' after using a weighted anchor.",
    somatic_prompt: "Do you feel ungrounded or restless when sitting?",
    cliffhanger: "Unlock the Proprioceptive Anchoring Protocol."
  },
  {
    id: 22,
    category: "Restoration",
    title: "Visual Hierarchy for Rest",
    science_fact: "A three-level visual hierarchy—anchor, midground, background—reduces visual competition and cognitive effort.",
    design_spec: "Designate a single focal anchor (e.g. art) and use low-contrast tones for the background in bedrooms.",
    tool_integration: "Upload a photo to the Visual Noise Filter to identify competing focal points.",
    somatic_prompt: "Is your bedroom visually cluttered?",
    cliffhanger: "Unlock the Rest Hierarchy Protocol."
  },
  {
    id: 23,
    category: "Acoustic Masking",
    title: "Masking Auditory Stressors",
    science_fact: "Adding elements like fabric panels or white noise fountains can mask unpredictable noise and reduce startle responses.",
    design_spec: "Place sound-absorbing materials on walls shared with high-traffic areas or noisy neighbours.",
    tool_integration: "Use the Acoustic Tracker to measure the 'Decibel Drop' after adding soft materials.",
    somatic_prompt: "Do sudden noises startle you?",
    cliffhanger: "Unlock the Auditory Masking Protocol."
  },
  {
    id: 24,
    category: "Nature Boost",
    title: "The 10-Minute Nature Boost",
    science_fact: "Briefly looking at a plant or framed nature image recharges directed attention and lowers blood pressure.",
    design_spec: "Add a small plant or nature image to your workspace. Ensure it is visible without turning your head.",
    tool_integration: "Set the 10-Minute Nature Timer and log your focus levels immediately after.",
    somatic_prompt: "Do you feel mental fatigue by midday?",
    cliffhanger: "Unlock the Nature Boost Protocol."
  },
  {
    id: 25,
    category: "Sleep Hygiene",
    title: "Evening Light Taper",
    science_fact: "Amber-hued evening light signals the brain to begin melatonin synthesis and suppresses unnecessary cortisol.",
    design_spec: "Transition to 'Sunset Mode'—2000K-2700K warm-spectrum bulbs—3 hours before desired sleep.",
    tool_integration: "Use the Light Tracker to verify your 'Evening Spectral Power' is in the warm range.",
    somatic_prompt: "Do you feel 'wired but tired' at night?",
    cliffhanger: "Unlock the Evening Taper Protocol."
  },
  {
    id: 26,
    category: "Workspace Anchors",
    title: "Decluttering Anchors",
    science_fact: "Removing visual distractions from your immediate line of sight reduces the workload on your prefrontal cortex.",
    design_spec: "Implement 'Closed Storage' for all non-active projects to maintain a clean 'Visual Field' during work.",
    tool_integration: "Complete the Daily Workspace Reset checklist in the app.",
    somatic_prompt: "Is your desk cluttered with unfinished tasks?",
    cliffhanger: "Unlock the Visual Field Protocol."
  },
  {
    id: 27,
    category: "Cortisol Control",
    title: "Cortisol Control Pack",
    science_fact: "The HPA axis is more sensitive to short wavelengths at night. Immediate thermal/light control reduces sleep fragmentation.",
    design_spec: "Keep a 'Thermal Pack' (fan/throw) and a low-wattage amber lamp within arm's reach of the bed.",
    tool_integration: "Log Night Waking events in the Sleep Tracker to see if immediate control reduces them.",
    somatic_prompt: "Do you panic when you wake up at night?",
    cliffhanger: "Unlock the Cortisol Control Protocol."
  },
  {
    id: 28,
    category: "Colour Psychology",
    title: "Colour Trim & HRV",
    science_fact: "Colour chroma affects heart rate variability (HRV) and stress levels. Soft, desaturated tones improve stress resilience.",
    design_spec: "Apply a soft, desaturated colour to a single 'Focus Wall' to test its impact on subjective calm.",
    tool_integration: "Rate your Room Agitation Score daily for 7 days after the colour shift.",
    somatic_prompt: "Do the colours in your room feel aggressive?",
    cliffhanger: "Unlock the Colour Resilience Protocol."
  }
]
