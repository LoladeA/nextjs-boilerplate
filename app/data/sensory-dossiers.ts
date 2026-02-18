export type DossierProfile = 'anchor' | 'seeker' | 'sensor'

export const SENSORY_DOSSIERS = {
  sensor: {
    title: "The Sensor",
    archetype: "The Filter",
    mechanism: "You represent a population estimated at 20–30% of the general population who carry a biologically anchored trait: a genuinely lower neurological threshold. Your brain receives everything and then works  hard to make sense of it all.",
    experience: "Every unmanaged sensory input in a poorly designed space is active load on the Sensor's nervous system. You cannot simply choose to ignore it. You are overwhelmed by internal and external demands simultaneously. When the Sensor is already processing a difficult conversation, background music becomes unbearable. When you're tired, visual clutter reads as chaos.",
    mandate: "The Sensor's home must reduce the number and intensity of active sensory signals competing for cortical processing. Every design decision is evaluated through a single question: does this add signal, or does it remove it?
."
  },
  seeker: {
    title: "The Seeker",
    archetype: "The Generator",
    mechanism: "Your nervous system has a wide cup. it requires a significantly higher volume, intensity, or novelty of sensory input before it registers and responds. The result is not a broken system. It is a system calibrated for high stimulation environments.",
    experience: "Your prefrontal cortex, responsible for executive function, decision-making, planning, requires a certain baseline of stimulation to operate at full capacity. Below that baseline, the Seeker loses focus, drive, and cognitive clarity. Movement is a regulation strategy, not a symptom, and novelty is not distraction, it is fuel.",
    mandate: "The Seeker's home must function as a curated stimulation system: providing intentional, varied, controllable sensory input that meets the nervous system's threshold without becoming chaotic. The operative word is CURATED."
  },
  anchor: {
    title: "The Anchor",
    archetype: "The Mirror",
    mechanism: "Your nervous system type is arguably the least understood and most under-served sensory profile in residential design, precisely because the Anchor rarely complains. Your system is robust and flexible. You can tolerate chaos that would dysregulate a Sensor, and silence that would bore a Seeker. You function across a wide range of environmental conditions without apparent distress.",
    experience: "You are the eye of the storm. Other household members may be dysregulated by noise, clutter and poor lighting. The Anchor remains steady. This is a genuine strength: you are a resilient, grounding presence in shared spaces. But this resilience is not infinite, and, crucially, it does not come with an early-warning system.",
    mandate: "Your home must do the noticing for you. Where the Sensor's home reduces input and the Seeker's generates it, the Anchor's home must be designed to proactively pace, cue, and support biological rhythms, automatically, without requiring the you to take initiative or recognise a need."
  }
}
