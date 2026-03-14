// =============================================================================
// PRESCRIPTION RATIONALE MAP — The Sentient Home
// app/lib/prescription-rationale-map.ts
// =============================================================================
//
// Controlled rationale sentences per prescription_type × sensory profile.
// These are generated from this map — not by GPT-4o.
// This is Lolade's voice and intellectual framework expressed as a
// structured, updatable data layer.
//
// STRUCTURE PER ENTRY:
//   primary:   plain-language sentence for the primary UI layer
//              — no jargon, no domain names, no science terminology
//   accordion: one sentence of deeper reasoning for users who want it
//              — this is where the neuroscience language lives
//
// PROFILE KEYS:
//   sensor_integrative | sensor_mixed | sensor_accumulative
//   seeker_integrative | seeker_mixed | seeker_accumulative
//   anchor_integrative | anchor_mixed | anchor_accumulative
//
// =============================================================================

export type ProfileKey =
  | 'sensor_integrative' | 'sensor_mixed' | 'sensor_accumulative'
  | 'seeker_integrative' | 'seeker_mixed' | 'seeker_accumulative'
  | 'anchor_integrative' | 'anchor_mixed' | 'anchor_accumulative'

export type RationaleEntry = {
  primary:   string   // plain language — leads in UI
  accordion: string   // deeper reasoning — optional read
}

export type RationaleMap = Record<string, Record<ProfileKey, RationaleEntry>>

export const PRESCRIPTION_RATIONALE: RationaleMap = {

  // ---------------------------------------------------------------------------
  acoustic_buffering_rug: {
    sensor_integrative: {
      primary:   'A rug here absorbs the kind of sudden, sharp sounds that your nervous system reacts to most, giving it less to stay on guard about.',
      accordion: 'Impact reverberation at the floor boundary is a primary sympathetic activator for high-sensitivity systems. A wool rug at the primary zone reduces this category of sound unpredictability continuously across the occupancy window.'
    },
    sensor_mixed: {
      primary:   'A rug here reduces the unpredictable sounds that cost your nervous system the most. On the harder days especially, this kind of buffering makes a real difference.',
      accordion: 'For a mixed integration pattern, acoustic unpredictability compounds load on the days the system is already carrying more. A floor-level soft surface reduces this variable passively, regardless of the day\'s starting state.'
    },
    sensor_accumulative: {
      primary:   'A rug here quietly removes one of the things your nervous system has to keep reacting to; and for a system that carries rather than clears, that matters more than it might seem.',
      accordion: 'An accumulative system arrives at each session with prior-day acoustic residue already present. A wool rug at the primary zone reduces ongoing impact sound events that would otherwise compound an already elevated baseline.'
    },
    seeker_integrative: {
      primary:   'A rug here softens the sharp, intrusive sounds without making the room feel flat or still. The distinction matters for a system that needs some environmental life around it.',
      accordion: 'Acoustic buffering for a seeker profile addresses unpredictable sound spikes specifically, not the ambient sound field. A rug reduces reverberation without creating the acoustic deadness that can compound under-stimulation.'
    },
    seeker_mixed: {
      primary:   'A rug here takes the edge off unpredictable sounds on the days when your system is carrying more — without changing the feel of the space on the days when it is not.',
      accordion: 'For a seeker with a mixed integration pattern, acoustic softening is most valuable on higher-load days where intrusive sounds compound rather than stimulate. A floor-level soft surface provides this passively.'
    },
    seeker_accumulative: {
      primary:   'A rug here reduces the background noise load that has been building — giving your system one less thing to process while still keeping the space feeling lived-in.',
      accordion: 'A seeker accumulative system carries stimulation backlog that acoustic unpredictability compounds. A wool rug reduces impact sound at the floor boundary — the category of sound most likely to add to a loaded system rather than engage it.'
    },
    anchor_integrative: {
      primary:   'A rug here reduces the echo and sharpness that builds up in hard-surface rooms — a quiet improvement you may not notice until it is there.',
      accordion: 'Hard surface dominance increases reverberation time across the occupancy window. A wool rug introduces a soft-surface layer that reduces this gradually accumulating acoustic load for a system that processes and releases well.'
    },
    anchor_mixed: {
      primary:   'A rug here reduces the subtle acoustic friction that hard floors create over time — most noticeable on the days when your capacity is lower than usual.',
      accordion: 'For an anchor with a mixed integration pattern, acoustic load is most significant on the days the system shifts toward accumulation. A floor-level soft surface reduces this variable consistently, regardless of daily state.'
    },
    anchor_accumulative: {
      primary:   'A rug here quietly reduces one layer of background demand that your system carries without always registering it.',
      accordion: 'An anchor accumulative system tolerates individual acoustic events well but carries the composite load over time. A rug at the primary zone reduces the ongoing reverberation that contributes to this cumulative picture without requiring any active management.'
    }
  },

  // ---------------------------------------------------------------------------
  acoustic_buffering_curtains: {
    sensor_integrative: {
      primary:   'Floor-length curtains here reduce both outside noise and light changes coming through the window — two things your nervous system responds to at once.',
      accordion: 'Sound transmission and light unpredictability from external sources are co-occurring activators for a sensor profile. Lined curtains at window openings address both simultaneously through a single structural intervention.'
    },
    sensor_mixed: {
      primary:   'Curtains here give you control over what comes in from outside — both sound and light — which matters most on the days your system is already dealing with more.',
      accordion: 'External acoustic and light variability is most costly for a mixed integration system on the days it shifts toward accumulation. Lined curtains provide a controllable boundary that reduces both inputs when needed.'
    },
    sensor_accumulative: {
      primary:   'Curtains here reduce the stream of outside sounds and light changes that your system has to keep responding to — one less source of interruption across the whole day.',
      accordion: 'For a sensor accumulative system, external inputs that trigger repeated orienting responses compound the load that does not clear between sessions. Lined curtains at window openings reduce this category of activation continuously.'
    },
    seeker_integrative: {
      primary:   'Curtains here give you the choice to open or close the outside — keeping the connection to the outside world when you want it, and shutting it out when you do not.',
      accordion: 'Controllability of acoustic and light input is as important as the buffering itself for a seeker profile. Lined curtains provide the boundary when needed without permanently reducing the environmental connection the system benefits from.'
    },
    seeker_mixed: {
      primary:   'Curtains here let you manage what comes in from outside depending on how your day is going — more control, less reacting to things you did not choose.',
      accordion: 'Variable integration pattern means acoustic and light buffering needs vary day to day. Operable lined curtains provide the flexibility to match the intervention to the current system state rather than applying a fixed reduction.'
    },
    seeker_accumulative: {
      primary:   'Curtains here reduce the outside interruptions that have been adding to the load you are already carrying — without closing the space off entirely.',
      accordion: 'A seeker accumulative system carries stimulation backlog that external acoustic and light events compound. Lined curtains reduce the ongoing input stream while preserving the environmental connection the system requires for engagement.'
    },
    anchor_integrative: {
      primary:   'Curtains here reduce outside noise and light variation — a steady, low-effort improvement to the environment over time.',
      accordion: 'External acoustic and light variability produces gradual load accumulation even in a resilient system. Lined curtains at window openings reduce this variable consistently and passively.'
    },
    anchor_mixed: {
      primary:   'Curtains here reduce what comes in from outside — most useful on the days your system is carrying more than it appears to be.',
      accordion: 'For an anchor with a mixed integration pattern, external input buffering is most valuable on the days the system shifts toward accumulation without signalling it. Lined curtains provide this passively.'
    },
    anchor_accumulative: {
      primary:   'Curtains here reduce one of the background input streams your system is managing without always knowing it.',
      accordion: 'An anchor accumulative system carries load without distress signals. External acoustic and light variability contributes to this picture continuously. Lined curtains reduce this stream without requiring any active management.'
    }
  },

  // ---------------------------------------------------------------------------
  biophilic_anchor_plant: {
    sensor_integrative: {
      primary:   'A plant at eye level here gives your nervous system something genuinely restful to look at — something that does not ask anything of it.',
      accordion: 'Biophilic cues at primary visual field activate the Attention Restoration pathway, providing a non-demanding visual element that reduces the continuous categorisation cost of object-dense or synthetic environments.'
    },
    sensor_mixed: {
      primary:   'A plant at eye level here gives your eyes somewhere to rest that does not cost anything — on the harder days especially, that kind of effortless resting point matters.',
      accordion: 'For a mixed integration pattern, restorative visual elements are most valuable on the days the system is carrying more load. A biophilic anchor in the primary visual field provides this consistently regardless of daily state.'
    },
    sensor_accumulative: {
      primary:   'A plant at eye level here is one of the few things in a room that your nervous system genuinely rests on across the whole day — quietly, without you having to do anything.',
      accordion: 'For an accumulative system, passive restorative inputs that operate continuously are more valuable than active recovery strategies. A biophilic anchor in the primary visual field provides consistent Attention Restoration pathway activation across the full occupancy window.'
    },
    seeker_integrative: {
      primary:   'A plant at eye level here adds real visual interest without the mental effort that comes with object-dense arrangements — nature engages without loading.',
      accordion: 'Biophilic elements provide the environmental complexity a seeker system benefits from while activating the parasympathetic pathway rather than the sympathetic one. The engagement is restorative rather than demanding.'
    },
    seeker_mixed: {
      primary:   'A plant at eye level here adds something worth looking at — engaging on the good days, genuinely restful on the harder ones.',
      accordion: 'For a seeker with a mixed integration pattern, biophilic elements serve both states — providing environmental interest when the system is under-stimulated and restorative input when it is overloaded.'
    },
    seeker_accumulative: {
      primary:   'A plant at eye level here gives your system something to engage with that does not add to the load you are already carrying — real interest without real cost.',
      accordion: 'A seeker accumulative system needs stimulation input that does not compound the existing backlog. Biophilic cues activate the engagement pathway through the parasympathetic rather than the sympathetic branch — providing interest without arousal.'
    },
    anchor_integrative: {
      primary:   'A plant at eye level here adds a quality to the space that consistently supports rest and recovery — more than its size suggests.',
      accordion: 'Biophilic exposure produces measurable parasympathetic activation through the Attention Restoration pathway. Research indicates approximately 20% improvements in directed attention following nature exposure in controlled conditions.'
    },
    anchor_mixed: {
      primary:   'A plant at eye level here adds a restorative element that works quietly in the background — most noticeable on the days your system needs it most.',
      accordion: 'For an anchor with a mixed integration pattern, passive restorative inputs have most value on the days the system shifts toward accumulation. A biophilic anchor operates continuously without requiring the system to signal need first.'
    },
    anchor_accumulative: {
      primary:   'A plant at eye level here adds something that works on your behalf across the whole day — without you needing to notice it.',
      accordion: 'An anchor accumulative system carries load without advertising it. Biophilic elements provide continuous passive parasympathetic activation that works against this accumulation without requiring any active engagement from the occupant.'
    }
  },

  // ---------------------------------------------------------------------------
  tactile_grounding_weighted_throw: {
    sensor_integrative: {
      primary:   'A weighted throw at the main seat here gives your body something solid to settle into — the kind of physical signal that helps your whole system relax without you having to try.',
      accordion: 'Proprioceptive input at the body\'s primary contact surface activates the dorsal vagal pathway directly, reducing postural vigilance and supporting parasympathetic dominance without requiring conscious regulation effort.'
    },
    sensor_mixed: {
      primary:   'A weighted throw at the main seat here gives your body a reliable settling point — something that works on the harder days as well as the easier ones.',
      accordion: 'For a mixed integration pattern, proprioceptive grounding is most valuable on the days the system is carrying more load. A weighted throw provides this input consistently, regardless of whether the day\'s starting state is regulated or loaded.'
    },
    sensor_accumulative: {
      primary:   'A weighted throw at the main seat here gives your body a consistent physical anchor — something that works against the load that does not clear on its own.',
      accordion: 'For a sensor accumulative system, sustained proprioceptive input at the primary seating surface provides a continuous containment signal that reduces the sympathetic activation that compounds across each session in the space.'
    },
    anchor_integrative: {
      primary:   'A weighted throw at the main seat here is the most direct physical tool for supporting genuine rest in this space — broad contact, consistent weight, immediate effect.',
      accordion: 'Proprioceptive input across a large body surface area activates the dorsal vagal pathway efficiently. For an anchor integrative system, this produces a reliable shift toward parasympathetic dominance within the first minutes of contact.'
    },
    anchor_mixed: {
      primary:   'A weighted throw at the main seat here provides a physical grounding that supports genuine rest — especially useful on the days your system is carrying more than it shows.',
      accordion: 'For an anchor with a mixed integration pattern, proprioceptive grounding supports the shift toward parasympathetic dominance that the system may not initiate independently on higher-load days.'
    },
    anchor_accumulative: {
      primary:   'A weighted throw at the main seat here provides a steady physical signal that works against what your body is carrying — quietly, across the whole time you spend here.',
      accordion: 'An anchor accumulative system carries load without distress signals. Consistent proprioceptive input at the primary seating surface provides a continuous parasympathetic activation that works against this accumulated load passively.'
    }
  },

  // ---------------------------------------------------------------------------
  lighting_warm_spectrum: {
    sensor_integrative: {
      primary:   'Warmer bulbs here shift the light in this space toward the conditions that help your nervous system wind down — making rest feel more available when you need it.',
      accordion: 'Warm-spectrum light below 2700K reduces melanopsin pathway activation, supporting melatonin onset and the shift toward parasympathetic dominance that a sensor system requires for genuine recovery.'
    },
    sensor_mixed: {
      primary:   'Warmer bulbs here give your nervous system a clearer signal that it is safe to slow down — which matters most on the evenings when it has been holding on all day.',
      accordion: 'For a mixed integration pattern, spectral warmth in the evening window is most valuable on the days the system has been carrying higher load. The melatonin signal works regardless of the day\'s starting state when the spectral conditions support it.'
    },
    sensor_accumulative: {
      primary:   'Warmer bulbs here are one of the few things that reliably tell your system it can begin to let go — and for a system that carries rather than clears, that signal needs to be as clear as possible.',
      accordion: 'For a sensor accumulative system, warm-spectrum lighting in the evening window is a condition, not a preference — the spectral shift is one of the few environmental inputs that initiates the shutdown cascade regardless of the cognitive load being carried.'
    },
    seeker_integrative: {
      primary:   'Warmer bulbs here give your body the signal it needs to wind down — without making the space feel dim or flat before you are ready for it.',
      accordion: 'Spectral warmth and light intensity are independent variables. Warm-spectrum LEDs below 2700K shift the circadian signal without requiring a reduction in lumen output — the space can remain visually active while the spectral environment supports the biological transition to rest.'
    },
    seeker_mixed: {
      primary:   'Warmer bulbs here support the shift toward rest when your system is ready for it — without making the space feel closed down before that point.',
      accordion: 'For a seeker with a mixed integration pattern, spectral warmth provides the circadian signal needed for sleep onset while preserving the environmental quality that supports engagement during the hours before it.'
    },
    seeker_accumulative: {
      primary:   'Warmer bulbs here help your body find its way toward rest even when your mind is still going — the light does part of the work your system cannot always do on its own.',
      accordion: 'A seeker accumulative system carries stimulation backlog that can delay sleep onset even when the body is physically depleted. Warm-spectrum lighting below 2700K provides the biological shutdown signal through a pathway that operates independently of cognitive state.'
    },
    anchor_integrative: {
      primary:   'Warmer bulbs here support the natural rhythm your body already follows — giving it the conditions it needs to do what it does well.',
      accordion: 'Warm-spectrum light below 2700K supports melatonin onset through the melanopsin pathway. For an anchor integrative system, this works with an already functional circadian rhythm rather than compensating for a disrupted one.'
    },
    anchor_mixed: {
      primary:   'Warmer bulbs here support consistent rest quality — most noticeable on the evenings when your system is carrying more than it has shown during the day.',
      accordion: 'For an anchor with a mixed integration pattern, spectral warmth in the evening window provides the circadian signal on the nights the system needs it most — which are not always the nights it signals that need clearly.'
    },
    anchor_accumulative: {
      primary:   'Warmer bulbs here give your system a clear, consistent signal to begin winding down — helping it release what has been building without you having to manage it actively.',
      accordion: 'An anchor accumulative system carries load without distress signals. Warm-spectrum lighting in the evening window initiates the biological shutdown cascade through a pathway that operates independently of whether the system is signalling readiness to rest.'
    }
  },

  // ---------------------------------------------------------------------------
  visual_hierarchy_declutter: {
    sensor_integrative: {
      primary:   'Clearing the main surface your eyes return to in this room removes a lot of invisible work your brain is doing every time you are here.',
      accordion: 'Object density in the primary visual field requires continuous passive categorisation, suppression, and return. For a sensor system, this cost is ongoing and compounds across each occupancy session — reduction produces immediate and sustained relief.'
    },
    sensor_mixed: {
      primary:   'Clearing the main surface your eyes return to most removes effort your brain is spending without you realising — on the harder days especially, that effort is the last thing you have spare.',
      accordion: 'For a mixed integration pattern, visual density is most costly on the days the system is already carrying load. Reducing the primary visual field addresses this variable for all days, not just the difficult ones.'
    },
    sensor_accumulative: {
      primary:   'Clearing the main surface your eyes land on most removes something your brain is carrying all day without you being aware of it — and for a system that does not clear between sessions, that matters.',
      accordion: 'For a sensor accumulative system, each object in the habitual visual field adds to the processing load that does not resolve between occupancy windows. Reduction is load management, not aesthetics.'
    },
    seeker_integrative: {
      primary:   'Clearing the main surface your eyes return to most is not about emptying the room — it is about removing the low-quality visual noise that gets in the way of the things worth actually looking at.',
      accordion: 'For a seeker profile, visual decluttering addresses low-quality stimulation that competes with higher-quality environmental engagement. The goal is not reduction but curation — removing what costs without removing what engages.'
    },
    seeker_mixed: {
      primary:   'Clearing the surface your eyes return to most removes the visual noise — leaving the things that are actually worth your attention.',
      accordion: 'For a seeker with a mixed integration pattern, visual curation on the primary surface reduces the competing stimuli that drain executive resources without providing the engagement the system benefits from.'
    },
    seeker_accumulative: {
      primary:   'Clearing the main surface your eyes land on most removes one layer of background demand from a system that is already managing more than it looks like.',
      accordion: 'A seeker accumulative system carries stimulation backlog that low-quality visual density compounds. Reducing object density on the primary surface removes this category of input without reducing the environmental engagement the system requires.'
    },
    anchor_integrative: {
      primary:   'Clearing the main surface your eyes return to in this room removes a quiet overhead that builds up over time without announcing itself.',
      accordion: 'Visual density in the primary field generates sustained passive prefrontal demand that accumulates across occupancy without acute distress. Reduction produces a gradual but consistent improvement in available cognitive capacity.'
    },
    anchor_mixed: {
      primary:   'Clearing the main surface your eyes return to most removes a layer of background demand that is most costly on the days your system is less resilient than usual.',
      accordion: 'For an anchor with a mixed integration pattern, visual density is most significant on the days the system shifts toward accumulation. Reducing the primary visual field addresses this variable regardless of the daily state.'
    },
    anchor_accumulative: {
      primary:   'Clearing the main surface your eyes return to most removes something your system is managing quietly — without it ever having told you.',
      accordion: 'An anchor accumulative system processes visual density without signalling the cost. Object reduction on the primary surface removes a sustained prefrontal demand that contributes to the composite load carried without distress signals.'
    }
  },

  // ---------------------------------------------------------------------------
  lighting_below_eye_level: {
    sensor_integrative: {
      primary:   'Moving the main light source below eye level here removes the kind of overhead brightness that keeps your nervous system more alert than it needs to be.',
      accordion: 'Overhead flat illumination activates the pupillary stress response and maintains sympathetic tone. Light positioned below eye level directs photons toward surfaces rather than into the visual field directly, reducing this ongoing activation.'
    },
    sensor_mixed: {
      primary:   'Moving the main light source below eye level removes a source of alertness your nervous system does not always need — and on the days it is already dealing with more, this change is the most immediate relief available.',
      accordion: 'For a mixed integration pattern, overhead lighting is most costly on higher-load days. Repositioning light below eye level reduces this activation continuously, providing relief regardless of the day\'s starting state.'
    },
    sensor_accumulative: {
      primary:   'Moving the main light source below eye level removes one of the most consistent things keeping your nervous system switched on — quietly, all day.',
      accordion: 'For a sensor accumulative system, overhead flat illumination maintains a continuous low-level sympathetic activation that compounds across the occupancy window. Below-eye-level positioning removes this input at its source.'
    },
    seeker_integrative: {
      primary:   'A lamp at a lower level here creates a defined pool of light that makes the space feel more purposeful — better for focus, without feeling flat.',
      accordion: 'Below-eye-level positioning creates a high-contrast light pool that provides attentional anchoring for a seeker system while removing the undifferentiated overhead field that diffuses focus without engaging it.'
    },
    seeker_mixed: {
      primary:   'A lamp at a lower level here creates a focused light pool that works well for both active and quieter states — clear enough to focus in, warm enough to rest in.',
      accordion: 'For a seeker with a mixed integration pattern, below-eye-level positioning serves both system states — providing attentional definition when engaged and removing overhead activation when the system needs to recover.'
    },
    seeker_accumulative: {
      primary:   'A lamp at a lower level here replaces the overhead brightness that has been adding to the background load — with light that defines the space without demanding more of you.',
      accordion: 'A seeker accumulative system carries stimulation backlog that overhead flat illumination compounds. Below-eye-level positioning removes this activation while maintaining the environmental definition the system requires for engagement.'
    },
    anchor_integrative: {
      primary:   'A lamp at a lower level here is a simple change that improves the quality of this space more than the adjustment suggests.',
      accordion: 'Overhead flat illumination is the most common environmental stressor in domestic spaces. Below-eye-level repositioning produces a consistent improvement in the quality of both cognitive and restorative states for a broadly resilient system.'
    },
    anchor_mixed: {
      primary:   'A lamp at a lower level here removes a source of background alertness that matters most on the days your system is less resilient than usual.',
      accordion: 'For an anchor with a mixed integration pattern, overhead activation has most impact on the days the system shifts toward accumulation. Below-eye-level positioning addresses this regardless of daily state.'
    },
    anchor_accumulative: {
      primary:   'A lamp at a lower level here removes something your system has been quietly responding to without registering it.',
      accordion: 'An anchor accumulative system absorbs overhead illumination without acute distress but carries its contribution to the composite load. Below-eye-level positioning removes this input at its source without requiring any further environmental change.'
    }
  },

  // ---------------------------------------------------------------------------
  spatial_containment_furniture: {
    sensor_integrative: {
      primary:   'Moving the main seat so your back is toward a solid surface here removes a background sense of exposure your nervous system maintains without you asking it to.',
      accordion: 'Open-back seating sustains positional vigilance in the autonomic system — a continuous background scanning for threat from behind. Back-to-wall positioning removes this cost immediately and maintains the reduction across the full occupancy window.'
    },
    sensor_mixed: {
      primary:   'Moving the main seat so your back is toward a solid surface removes a source of background unease that is most noticeable on the days your system is already dealing with more.',
      accordion: 'For a mixed integration pattern, positional vigilance is most costly on higher-load days. Back-to-wall positioning removes this variable continuously, providing relief regardless of the daily starting state.'
    },
    sensor_accumulative: {
      primary:   'Moving the main seat so your back is toward a solid surface removes a quiet source of alertness your system has been maintaining all day — one less thing it has to keep track of.',
      accordion: 'For a sensor accumulative system, positional vigilance compounds across the occupancy window. Back-to-wall positioning removes this cost at its source, reducing the composite load that does not clear between sessions.'
    },
    seeker_integrative: {
      primary:   'Moving the main seat so your back is toward a solid surface and you face the room gives your system the overview it benefits from — present in the space, not on guard within it.',
      accordion: 'Back-to-wall positioning with an open visual field provides the spatial overview that supports a seeker system\'s engagement with its environment — removing the vigilance cost of exposure while preserving the environmental connection the system requires.'
    },
    seeker_mixed: {
      primary:   'Moving the main seat so your back is toward a solid surface removes the background effort of keeping track of what is behind you — freeing your attention for what is actually in front.',
      accordion: 'For a seeker with a mixed integration pattern, positional vigilance consumes executive resources that the system needs for environmental engagement. Back-to-wall positioning frees this capacity without reducing environmental connection.'
    },
    seeker_accumulative: {
      primary:   'Moving the main seat so your back is toward a solid surface removes one of the quiet background demands that has been adding to the load you are already managing.',
      accordion: 'A seeker accumulative system carries stimulation backlog that positional vigilance compounds. Back-to-wall positioning removes this cost continuously, reducing the composite load without reducing environmental engagement.'
    },
    anchor_integrative: {
      primary:   'Moving the main seat so your back is toward a solid surface is a small spatial change that removes a background effort most people do not know they are making.',
      accordion: 'Positional vigilance in exposed seating positions is a persistent low-level autonomic cost. Back-to-wall positioning removes this variable efficiently and produces a consistent improvement across the full occupancy window.'
    },
    anchor_mixed: {
      primary:   'Moving the main seat toward a solid surface removes a layer of background effort that is most significant on the days your system is less resilient than it appears.',
      accordion: 'For an anchor with a mixed integration pattern, positional vigilance contributes most to composite load on the days the system shifts toward accumulation. Back-to-wall positioning addresses this regardless of daily state.'
    },
    anchor_accumulative: {
      primary:   'Moving the main seat toward a solid surface removes something your system has been managing quietly — without you having been aware of it.',
      accordion: 'An anchor accumulative system carries positional vigilance cost without distress signals. Back-to-wall positioning removes this input at its source, reducing the composite load that accumulates without announcement.'
    }
  }
}

// =============================================================================
// HELPER — getRationale
// Returns the rationale entry for a given prescription_type and profile.
// Falls back to the integrative variant if the exact pattern is not found.
// =============================================================================

export function getRationale(
  prescriptionType: string,
  profile:          'sensor' | 'seeker' | 'anchor',
  integration:      'integrative' | 'mixed' | 'accumulative'
): RationaleEntry | null {
  const map = PRESCRIPTION_RATIONALE[prescriptionType]
  if (!map) return null

  const key        = `${profile}_${integration}` as ProfileKey
  const fallback   = `${profile}_integrative`    as ProfileKey

  return map[key] ?? map[fallback] ?? null
}
