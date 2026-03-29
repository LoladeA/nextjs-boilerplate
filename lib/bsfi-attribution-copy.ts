// /lib/bsfi-attribution-copy.ts
//
// Copy for the BSFI card "What this means for you right now" section.
// Three attribution states × two sessions = six copy blocks.
//
// BRAND VOICE CONTRACT:
//   Mirror → Reframe → Direction
//   Regulate before persuading. Lead with lived experience, not science.
//   No blame. No optimisation pressure. No pathologising.
//   Environmental: the space is the lever.
//   Internal: the body is carrying something the space didn't create.
//   Biological: the cycle is doing its work. This is not malfunction.
// ─────────────────────────────────────────────────────────────────────────────

export type LoadAttribution = 'environmental' | 'internal' | 'biological'
export type Session         = 'morning' | 'evening'

export interface AttributionCopy {
  // Rendered inline above the BSFI context copy (italic, smaller weight)
  // One or two sentences — names the source without over-explaining it.
  source_note: string
  // Rendered in the internal_driver block replacing the old boolean text
  // One short paragraph — reframes, does not instruct.
  reframe: string
  // Optional directional note — only shown when it adds genuine value
  direction: string | null
}

const copy: Record<Session, Record<LoadAttribution, AttributionCopy>> = {

  morning: {

    environmental: {
      source_note: "The friction present this morning has a measurable environmental source.",
      reframe:
        "What your body registered overnight was shaped by the conditions of your space: " +
        "light, sound, temperature, and the sensory quality of the hour before sleep. " +
        "These are not permanent features of how you function. They are adjustable inputs.",
      direction:
        "Your sleep environment is the most direct lever available to you tonight. " +
        "One precise change to the highest-friction variable will produce a disproportionate return.",
    },

    internal: {
      source_note: "Your environment appears stable. The friction this morning is coming from within.",
      reframe:
        "Your space is not the source of what you are experiencing this morning. " +
        "High body tension alongside an optimal sleep environment is indicative of something internal: " +
        "accumulated psychological load, unresolved emotional residue, or cognitive carry-over " +
        "that cannot be fully cleared by sleep alone. This is not a reflection of your environment's failure. " +
        "It is information about what your nervous system is currently processing.",
      direction:
        "Your environment can still support you today; not by solving the source of your stress, but by " +
        "reducing the additional cost of your surroundings. Keep your space low-demand, " +
        "low-stimulation, and acoustically consistent.",
    },

    biological: {
      source_note: "Biological load is present. Your cycle is influencing how you feel this morning.",
      reframe:
        "The friction registered this morning is neither environmental in origin, nor " +
        "a sign that something is wrong. Your cycle phase produces real, measurable shifts in " +
        "sensory sensitivity, recovery capacity, and somatic tension. " +
        "What you are feeling is your physiology doing its work, not a failure of your space " +
        "or your habits.",
      direction:
        "Your environment's role during this phase is to ask less of you, not more. " +
        "Lower sensory demand, warmer light, and acoustic softness are the most useful adjustments " +
        "you can make right now.",
    },

  },

  evening: {

    environmental: {
      source_note: "The load present this evening has a measurable environmental source.",
      reframe:
        "The friction that your nervous system is carrying into tonight has identifiable environmental " +
        "contributors, such as the acoustic and light conditions of your day, and the quality of the " +
        "space you have moved through. These inputs have a cost, which is incurred at the " +
        "overnight clearing window.",
      direction:
        "What's needed tonight is a clear shift in register. Warm light, acoustic quiet, " +
        "and a deliberate transition away from stimulating spaces are the most direct interventions " +
        "available before sleep.",
    },

    internal: {
      source_note: "Your environment appears stable. The load tonight is coming from within.",
      reframe:
        "The friction present this evening cannot be attributed to your physical environment. " +
        "Your acoustic and light conditions are not the primary source. What you are experiencing " +
        "is more likely the residue of psychological or emotional processing. This kind of load " +
        "accumulates in the mind and body independently of the space around you. " +
        "Your environment can reduce the cost of holding it, but it cannot resolve the source.",
      direction:
        "Give your nervous system an evening that asks as little of it as possible. " +
        "Lower the sensory complexity of your space, step away from relational or cognitive demands, " +
        "and let the environment be quiet so the body can do its own work overnight.",
    },

    biological: {
      source_note: "Biological load is present. Your cycle phase is contributing to this evening's friction.",
      reframe:
        "The load that your nervous system is processing tonight has a physiological component " +
        "that sits outside what your environment can provide. Your cycle phase produces real " +
        "shifts in sensory sensitivity and recovery capacity. The overnight window will " +
        "encounter more resistance than usual. This is not a problem to solve, it is a condition " +
        "to support.",
      direction:
        "Ensure optimal conditions for slumber this evening. Thermal, physical and material comfort, acoustic consistency, " +
        "and darkness matter more during this phase than at other points in your cycle. " +
        "What you do in the final hour before sleep will have a disproportionate effect.",
    },

  },
}

export function getAttributionCopy(
  attribution: LoadAttribution,
  session:     Session
): AttributionCopy {
  return copy[session][attribution]
}
