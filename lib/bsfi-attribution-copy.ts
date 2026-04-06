// /lib/bsfi-attribution-copy.ts
//
// Copy for the BSFI card "What this means for you right now" section.
// Three attribution states × two sessions = six copy blocks.
// Morning environmental copy branches on subjective state (positive / neutral / distressed).
//
// BRAND VOICE CONTRACT:
//   Mirror → Reframe → Direction
//   Regulate before persuading. Lead with lived experience, not science.
//   No blame. No optimisation pressure. No pathologising.
//   Environmental: the space is the lever.
//   Internal: the body is carrying something the space didn't create.
//   Biological: the cycle is doing its work. This is not malfunction.
//
// USER PROFILE NUANCES (written without flags — universally accurate,
// specifically resonant for HSP, neurodivergent, perimenopausal,
// midlife transition, and high-performing home-based users):
//   — Sensory amplitude differences acknowledged in environmental copy
//   — Cognitive processing overhead named in internal copy
//   — Thermal disruption and hormonal transitions named in biological copy
//   — Life transition load acknowledged in internal direction
//   — Environmental agency cost named in evening environmental direction
// ─────────────────────────────────────────────────────────────────────────────

export type LoadAttribution = 'environmental' | 'internal' | 'biological'
export type Session         = 'morning' | 'evening'
export type SubjectiveState = 'positive' | 'neutral' | 'distressed'

export interface AttributionCopy {
  source_note: string
  reframe:     string
  direction:   string | null
}

// ─────────────────────────────────────────────────────────────────────────────
// MORNING ENVIRONMENTAL — three branches on subjective state
//
// positive:   mood ≥ 4 AND tension ≤ 2
//             Body recovered well. Environmental variable is a calibration.
//
// distressed: mood ≤ 2 OR tension ≥ 7
//             Friction is felt. Environment is the lever.
//
// neutral:    everything else
//             Some friction present. One variable is addressable.
//
// Derive in the BSFI card before calling getAttributionCopy:
//   mood ≥ 4 AND tension ≤ 2 → 'positive'
//   mood ≤ 2 OR tension ≥ 7  → 'distressed'
//   everything else           → 'neutral'
// ─────────────────────────────────────────────────────────────────────────────

const morningEnvironmental: Record<SubjectiveState, AttributionCopy> = {

  positive: {
    source_note:
      "Your body recovered well. There is one environmental variable worth noting.",
    reframe:
      "You woke feeling settled, which tells you the recovery process ran without significant " +
      "interference overnight. The light environment flagged here is a structural signal " +
      "rather than a felt one. Your circadian system registers light levels below the optimal " +
      "threshold even when the body shows no conscious trace of it. " +
      "This is not friction you are carrying. It is a calibration available to you. " +
      "If your nervous system processes sensory input with greater intensity or depth, " +
      "it is worth knowing that the body's response to suboptimal light is cumulative — " +
      "even when you feel well-rested.",
    direction:
      "Your sleep environment is working. The one adjustment available to you is morning " +
      "light exposure. Open the blinds immediately on waking, or step outside within the " +
      "first thirty minutes. This is a refinement, not a repair.",
  },

  neutral: {
    source_note:
      "Some friction is present this morning, with an environmental component.",
    reframe:
      "What your body registered overnight reflects the conditions of your sleep environment such as " +
      "light, sound, and temperature in the hours before and during sleep. " +
      "The friction present is mild and addressable. " +
      "These are not fixed features of how your nights go. They are inputs. " +
      "If your nervous system processes sensory conditions with greater sensitivity, " +
      "the impact of these inputs may be greater than the score alone suggests, " +
      "which makes the adjustment more worthwhile.",
    direction:
      "Identify the one environmental variable most likely responsible for the signal present today. " +
      "A single, precise change to your sleep conditions tonight will produce a disproportionate return.",
  },

  distressed: {
    source_note:
      "The friction present this morning has a measurable environmental source.",
    reframe:
      "What your body registered overnight was shaped by the conditions of your space: " +
      "light, sound, temperature, and the sensory quality of the hour before sleep. " +
      "These are not permanent features of how you function. They are adjustable inputs. " +
      "If your nervous system processes sensory conditions with greater intensity, " +
      "the cost of these inputs accumulates differently. " +
      "What reads as moderate friction on a score can represent genuine dysregulation in the body.",
    direction:
      "Your sleep environment is the most direct lever available to you tonight. " +
      "One precise change to the highest-friction variable will produce a disproportionate return.",
  },

}

// ─────────────────────────────────────────────────────────────────────────────
// FULL COPY MAP
// ─────────────────────────────────────────────────────────────────────────────

const copy: Record<Session, Record<LoadAttribution, AttributionCopy>> = {

  morning: {

    // Fallback only — overridden by morningEnvironmental branches in getAttributionCopy
    environmental: morningEnvironmental.neutral,

    internal: {
      source_note:
        "Your environment appears stable. The friction this morning is coming from within.",
      reframe:
        "Your space is not the source of what you are experiencing this morning. " +
        "High body tension alongside an optimal sleep environment is indicative of something internal: " +
        "accumulated psychological load, unresolved emotional residue, or cognitive carry-over " +
        "that cannot be fully cleared by sleep alone. " +
        "For some nervous systems, this load accumulates not only from emotional residue, " +
        "but from the sustained overhead of cognitive processing such as " +
        "executive function, sensory filtering, social navigation, and the effort of task-switching. " +
        "These demands leave a physiological trace as real and as legitimate as any emotional stressor. " +
        "This is not a reflection of your environment's failure. " +
        "It is information about what your nervous system is currently processing. " +
        "For those moving through significant life transitions hallmarked by shifts in identity, " +
        "household structure, or the meaning of home itself, this pattern is both common and proportionate.",
      direction:
        "Your environment can still support you today. It will not do that by solving the source, but by " +
        "reducing the additional cost of your surroundings. Keep your space low-demand, " +
        "low-stimulation, and acoustically consistent.",
    },

    biological: {
      source_note:
        "Biological load is present. Your cycle is influencing how you feel this morning.",
      reframe:
        "The friction registered this morning is neither environmental in origin, nor " +
        "a sign that something is wrong. Your cycle phase produces real, measurable shifts in " +
        "sensory sensitivity, recovery capacity, and somatic tension. " +
        "What you are feeling is your physiology doing its work, not a failure of your space " +
        "or your habits. " +
        "If you are navigating a hormonal transition rather than a predictable cycle, " +
        "the load present may extend beyond what this score currently captures. " +
        "Vasomotor symptoms, thermal instability, and unpredictable shifts in sensory threshold " +
        "are real disruptions to recovery that the engine is not yet equipped to fully measure. " +
        "Your experience is valid even where the data is not yet precise enough to name it.",
      direction:
        "Your environment's role during this phase is to ask less of you, not more. " +
        "Lower sensory demand, warmer light, and acoustic softness are the most useful adjustments " +
        "you can make right now. It is particularly important to maintain thermal comfort in your sleep space, " +
        "sas small fluctuations in temperature can have a significant impact when biological load " +
        "is already present.",
    },

  },

  evening: {

    environmental: {
      source_note:
        "The load present this evening has a measurable environmental source.",
      reframe:
        "The friction that your nervous system is carrying into tonight has identifiable environmental " +
        "contributors, such as the acoustic and lighting conditions you experienced during the day, and the quality of the " +
        "spaces you moved through. These inputs incur a cost at the " +
        "overnight clearing window. " +
        "If your nervous system processes sensory input with greater intensity or depth, " +
        "the conditions reflected here carry a higher physiological cost than the number alone suggests. " +
        "The same acoustic or light level that is tolerable for one nervous system " +
        "can be genuinely dysregulating for another.",
      direction:
        "What's needed tonight is a clear shift in register. Warm light, acoustic quiet, " +
        "and a deliberate transition away from stimulating spaces are the most direct interventions " +
        "available before sleep. " +
        "The inability to regulate the sensory conditions of your space, whether due to the demands " +
        "of a working day, shared environments, or noise sources outside your control, " +
        "is not a minor inconvenience. It is a measurable input to your autonomic nervous system, " +
        "and its effect accumulates across the hours.",
    },

    internal: {
      source_note:
        "Your environment appears stable. The load tonight is coming from within.",
      reframe:
        "The friction present this evening cannot be attributed to your physical environment. " +
        "Your acoustic and light conditions are not the primary source. What you are experiencing " +
        "is more likely the residue of psychological or emotional processing " +
        "or the accumulated overhead of cognitive demand throughout the day. " +
        "Executive function, sensory filtering, social navigation, and sustained task-switching " +
        "all leave a physiological trace. This kind of load accumulates in the mind and body " +
        "independently of the space around you. " +
        "Your environment can reduce the cost of holding it, but it cannot resolve the source. " +
        "For those moving through significant life transitions hallmarked by shifts in identity, " +
        "household structure, or the meaning and function of home itself, " +
        "this pattern of internal load is both common and proportionate.",
      direction:
        "Give your nervous system an evening that asks as little of it as possible. " +
        "Lower the sensory complexity of your space, step away from relational or cognitive demands, " +
        "and let the environment be quiet so the body can do its own work overnight.",
    },

    biological: {
      source_note:
        "Biological load is present. Your cycle phase is contributing to this evening's friction.",
      reframe:
        "The load that your nervous system is processing tonight has a physiological component " +
        "that sits outside what your environment can address. Your cycle phase produces real " +
        "shifts in sensory sensitivity and recovery capacity. The overnight window will " +
        "encounter more resistance than usual — this is not a problem to solve, it is a condition " +
        "to support. " +
        "If you are navigating a hormonal transition rather than a predictable cycle, " +
        "the load present may extend beyond what this score currently captures. " +
        "Vasomotor symptoms, thermal instability, and unpredictable shifts in sensory threshold " +
        "are real disruptions to recovery. " +
        "Your experience is valid even where the data is not yet precise enough to name it.",
      direction:
        "Ensure optimal conditions for slumber this evening. Thermal, physical and material comfort, " +
        "acoustic consistency, and darkness matter more during this phase than at other points in your cycle. " +
        "Thermal regulation deserves particular attention, as small fluctuations in bedroom temperature " +
        "carry a disproportionate cost when biological load is already present. " +
        "What you do in the final hour before sleep will have a disproportionate effect.",
    },

  },
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC FUNCTION
// ─────────────────────────────────────────────────────────────────────────────

export function getAttributionCopy(
  attribution:     LoadAttribution,
  session:         Session,
  subjectiveState?: SubjectiveState
): AttributionCopy {

  if (session === 'morning' && attribution === 'environmental') {
    return morningEnvironmental[subjectiveState ?? 'neutral']
  }

  return copy[session][attribution]
}
