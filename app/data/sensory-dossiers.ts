// =============================================================================
// SENSORY DOSSIERS — The Sentient Home
// =============================================================================
//
// CHANGE LOG (this version):
//
//   STRUCTURE — Option B architecture.
//   title, archetype, and mechanism are shared across all integration variants
//   of each profile. These describe the threshold trait — the permanent
//   biological characteristic. It does not change by integration pattern.
//
//   experience and mandate are now pattern-specific, held in a variants map:
//     variants.integrative  — sensation resolves with recovery
//     variants.mixed        — context-dependent processing
//     variants.accumulative — sensation layers and persists
//
//   The experience describes what daily life actually feels like given both
//   the threshold AND the integration pattern together.
//   The mandate describes what the home must do given both dimensions.
//
//   BACKWARDS COMPATIBILITY
//   SensoryModal resolves variants[integrationPattern] at render time,
//   falling back to 'integrative' when no integrationPattern prop is passed.
//   Existing call-sites without integrationPattern are unaffected.
//
// =============================================================================

export type DossierProfile      = 'anchor' | 'seeker' | 'sensor'
export type IntegrationVariant  = 'integrative' | 'mixed' | 'accumulative'

export interface DossierVariant {
  experience: string
  mandate:    string
}

export interface SensoryDossier {
  title:     string
  archetype: string
  mechanism: string
  variants:  Record<IntegrationVariant, DossierVariant>
}

export const SENSORY_DOSSIERS: Record<DossierProfile, SensoryDossier> = {

  // ===========================================================================
  // THE SENSOR — low neurological threshold
  // ===========================================================================

  sensor: {
    title:     "The Sensor",
    archetype: "The Filter",

    mechanism:
      "You represent a population estimated at 20–30% of the general population who carry a biologically anchored trait: a genuinely lower neurological threshold. Your brain receives everything and then works hard to make sense of it all.",

    variants: {

      integrative: {
        experience:
          "Every unmanaged sensory input in a poorly designed space is active load on your nervous system. You cannot simply choose to ignore it. When you are already processing a difficult conversation, background music becomes unbearable. When you are tired, visual clutter reads as chaos. The good news: with adequate recovery conditions, your system does release and reset. A well-designed environment is not a luxury — it is what makes the difference between a day that costs you and a day that sustains you.",
        mandate:
          "The Sensor's home must reduce the number and intensity of active sensory signals competing for cortical processing. Every design decision is evaluated through a single question: does this add signal, or does it remove it? Recovery windows must be built in and protected — your system will use them effectively when the conditions are right."
      },

      mixed: {
        experience:
          "Every unmanaged sensory input in a poorly designed space is active load on your nervous system. How much it costs you depends on what you are already carrying. Some days, the same environment that barely registers becomes genuinely depleting — not because it changed, but because your capacity did. You cannot always predict which days those will be. The environment that felt manageable last week may feel intolerable this week, and back again next week.",
        mandate:
          "The Sensor's home must reduce the number and intensity of active sensory signals competing for cortical processing. Because your integration pattern is variable, the environment should be calibrated for your most sensitive days — not your average ones. A home built for when you have capacity will fail you when you do not. Build for the harder days and the easier days look after themselves."
      },

      accumulative: {
        experience:
          "Every unmanaged sensory input in a poorly designed space is active load on your nervous system — and for you, that load does not clear between exposures the way it might for others. A difficult morning is still present in your body by evening. A demanding week leaves a residue that the weekend does not fully clear. You are not being dramatic and you are not failing to cope. Your nervous system is doing exactly what it was designed to do — it simply does not have an off switch that the environment can trigger without active support.",
        mandate:
          "The Sensor's home must reduce the number and intensity of active sensory signals competing for cortical processing. For your pattern, this is not a preference — it is a biological requirement. Consistency is the operative word: not a quiet corner you retreat to, but a baseline environmental load low enough that your nervous system is never asked to absorb more than it can process. Every design decision is evaluated through a single question: does this add signal, or does it remove it? The answer must be the same on every day of the week."
      }
    }
  },

  // ===========================================================================
  // THE SEEKER — high threshold, active regulation
  // ===========================================================================

  seeker: {
    title:     "The Seeker",
    archetype: "The Generator",

    mechanism:
      "Your nervous system has a wide cup. It requires a significantly higher volume, intensity, or novelty of sensory input before it registers and responds. The result is not a broken system. It is a system calibrated for high stimulation environments.",

    variants: {

      integrative: {
        experience:
          "Your prefrontal cortex — responsible for executive function, decision-making, and planning — requires a certain baseline of stimulation to operate at full capacity. Below that baseline, you lose focus, drive, and cognitive clarity. Movement is a regulation strategy, not a symptom. Novelty is not distraction — it is fuel. When the right conditions are in place, you process, engage, and recover well. The challenge is not managing overwhelm — it is ensuring the environment provides enough without tipping into the kind of chaos that depletes rather than activates.",
        mandate:
          "The Seeker's home must function as a curated stimulation system: providing intentional, varied, controllable sensory input that meets the nervous system's threshold without becoming chaotic. The operative word is CURATED. You need variety you can modulate — not a fixed level of stimulation imposed on a system in flux. Recovery looks different for you: the wind-down environment must be deliberately designed, because your system does not drift into rest."
      },

      mixed: {
        experience:
          "Your prefrontal cortex requires a certain baseline of stimulation to operate at full capacity — but where that baseline sits shifts depending on what you are already carrying. The same environment that energises you on a clear day can tip into overwhelm when you are loaded. You may find yourself craving more stimulation in one moment and unable to tolerate what was fine an hour ago. This is not inconsistency on your part. It is a system whose threshold changes with accumulated demand.",
        mandate:
          "The Seeker's home must function as a curated stimulation system — but one that is adjustable, not fixed. Because your threshold varies, the environment needs to offer a range you can move through: sufficient stimulation as a baseline, with the capacity to reduce it when your system has less to give. The operative word is still CURATED, but the curation must be dynamic. Build the controls into the space, not just the default setting."
      },

      accumulative: {
        experience:
          "Your prefrontal cortex requires stimulation to function — but for you, the challenge is not finding enough. It is that stimulation you have already absorbed does not fully clear before the next arrives. You may seek more input precisely because your system is trying to process what it has not yet resolved. The restlessness that feels like a need for more is sometimes a system running on a backlog. The environment you need is not more stimulation — it is the right stimulation, on your terms, at a pace your system can actually process.",
        mandate:
          "The Seeker's home must provide intentional, controllable sensory input — but for your pattern, predictability matters as much as variety. Stimulation that arrives uninvited compounds load rather than meeting it. The environment must give you agency over contrast: enough to engage your system, structured enough that nothing arrives before you are ready for it. You do not need a quiet room — you need a room you are always in control of."
      }
    }
  },

  // ===========================================================================
  // THE ANCHOR — high threshold, passive regulation
  // ===========================================================================

  anchor: {
    title:     "The Anchor",
    archetype: "The Mirror",

    mechanism:
      "Your nervous system type is arguably the least understood and most under-served sensory profile in residential design, precisely because the Anchor rarely complains. Your system is robust and flexible. You can tolerate chaos that would dysregulate a Sensor, and silence that would bore a Seeker. You function across a wide range of environmental conditions without apparent distress.",

    variants: {

      integrative: {
        experience:
          "You are the eye of the storm. Other household members may be dysregulated by noise, clutter, and poor lighting. You remain steady. This is a genuine strength — you are a resilient, grounding presence in shared spaces. But this resilience is not infinite, and it does not come with an early-warning system. By the time you notice the environment has been affecting you, it usually has been doing so for some time. Your system processes and releases well — the risk is not accumulation, it is that you may not notice the need to recover until the deficit is already significant.",
        mandate:
          "Your home must do the noticing for you. Where the Sensor's home reduces input and the Seeker's generates it, the Anchor's home must be designed to proactively pace, cue, and support biological rhythms — automatically, without requiring you to take initiative or recognise a need. Build in the signals your nervous system does not send spontaneously."
      },

      mixed: {
        experience:
          "You are broadly resilient to environmental variation — but this resilience is not uniform. There are conditions, usually cumulative ones, or particular sensory channels, where the steadiness gives way. You may not always be able to trace what shifted. A week that looked manageable from the outside leaves you flatter than expected. The challenge is not sensitivity — it is that your system provides inconsistent feedback, steady in some conditions and unexpectedly taxed in others.",
        mandate:
          "Your home must do the noticing for you — and on the days when your processing pattern shifts toward accumulation, it must do more of it. Build reliable anchors for the moments when your usual steadiness is not available: environmental cues that support regulation without requiring you to recognise a need first. The baseline should be stable enough that variable processing days do not compound into depletion."
      },

      accumulative: {
        experience:
          "Your threshold appears high — small things do not visibly bother you, and you rarely register distress in the way others do. But this apparent resilience may not reflect what is actually happening inside. A system that is already carrying a significant accumulated load has little remaining capacity for new input. What looks like tolerance from the outside is sometimes a system that is already full, with no space to signal that fact. The absence of a complaint is not the presence of regulation.",
        mandate:
          "Your home must do the noticing for you — and for your pattern, that noticing must prioritise load reduction above all else. The goal is not to add regulation cues to an already full system. It is to reduce the baseline load that the system is carrying continuously, so that capacity begins to return. Every environmental decision should be evaluated against a single question: does this reduce what my nervous system is asked to carry, or does it add to it?"
      }
    }
  }
}
