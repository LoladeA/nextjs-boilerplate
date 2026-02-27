// =============================================================================
// NEURO TYPES — The Sentient Home
// =============================================================================
//
// CHANGE LOG:
//   AdaptiveProtocols.standard renamed to AdaptiveProtocols.anchor
//   Reason: all Ritual.variants objects use 'anchor' as the balanced-profile key.
//   'standard' was causing a silent type mismatch — any component accessing
//   insight.protocols.standard received undefined at runtime.
// =============================================================================

// 1. The core protocol structure.
//    Every branch (anchor, seeker, sensor) receives the same level of detail.
export type ProtocolVariant = {
  protocolName:     string    // e.g., "The Spotlight Effect"
  primaryAdjustment: string   // The specific physical action
  refinement:       string[]  // 2–3 specific bullet points
  whyItWorks:       string    // Neuroscience mechanism for this profile
  integrationCue:   string    // How the user knows it's working
}

// 2. The branching logic — one variant per dashboard profile.
export type AdaptiveProtocols = {
  // 🟢 Anchor — Balanced / Grounded profile
  //    Neuro-normative system. Needs rhythmic cuing and proactive pacing.
  //    Previously named 'standard' — renamed to match Ritual.variants key.
  anchor: ProtocolVariant

  // 🟠 Seeker — ADHD / Hypo-aroused profile
  //    Needs: visual cues, stimulation, friction, object permanence.
  seeker: ProtocolVariant

  // 🔵 Sensor — HSP / Autism / Hyper-aroused profile
  //    Needs: reduced contrast, silence, perimeter safety, containment.
  sensor: ProtocolVariant
}

// 3. The main exported interface used by insights and priority action data.
export type NeuroAdaptiveInsight = {
  id:       number
  category: string
  title:    string

  // THE CONTEXT (The "Why")
  insight: {
    scienceFact:   string
    whyItMatters:  string
  }

  // THE SOLUTIONS (The "How")
  protocols: AdaptiveProtocols
}
