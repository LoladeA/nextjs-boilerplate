export type DossierProfile = 'anchor' | 'seeker' | 'sensor'

export const SENSORY_DOSSIERS = {
  sensor: {
    title: "The Sensor",
    archetype: "The Filter",
    mechanism: "Your nervous system has a low neurological threshold. You register sensory input (sound, light, texture) at a much higher volume than average.",
    experience: "You don't just see a messy room; you feel it. Background noise isn't background for you: it's active data. Your brain is constantly working to filter out excess signal, leading to rapid energy depletion.",
    mandate: "Your home must act as a Filter. Its primary job is to reduce signal—turning down the volume of the world so your system can recover."
  },
  seeker: {
    title: "The Seeker",
    archetype: "The Generator",
    mechanism: "Your nervous system has a high neurological threshold. Your brain naturally under-registers passive input, meaning standard environments feel 'mute' to you.",
    experience: "You aren't easily distracted; you are under-stimulated. You seek movement, texture, and intensity because silence feels like stagnation. You don't need calm; you need flow.",
    mandate: "Your home must act as a Generator. Its primary job is to provide curated friction—visual hooks and tactile feedback—to keep your executive brain online."
  },
  anchor: {
    title: "The Anchor",
    archetype: "The Mirror",
    mechanism: "Your nervous system is robust and flexible. You possess a high registration threshold paired with passive regulation.",
    experience: "You are the eye of the storm. You can tolerate chaos that would break a Sensor, and silence that would bore a Seeker. You are steady—but this means you often ignore your environment until it is critically failing.",
    mandate: "Your home must act as a Mirror. Since you rarely complain, your space needs to be designed to proactively support your rhythms before you even realize you are tired."
  }
}
