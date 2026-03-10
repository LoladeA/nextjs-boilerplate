// =============================================================================
// ASSESSMENT PROTOCOL — The Sentient Home
// =============================================================================
//
// CHANGE LOG:
//
//   STRUCTURE
//   Part 0 expanded from 4 to 7 questions.
//   Three integration pattern questions (q_int1, q_int2, q_int3) inserted
//   between primary_strain and neuro_lens. neuro_lens moved to last position
//   in Part 0 — it now functions as a corroborative signal, not a primary
//   classifier. The behavioural questions speak first; the self-identification
//   label follows.
//
//   NEW QUESTIONS
//   q_int1 — Residue / carry-over signal
//     Detects whether sensation resolves once the stimulus is removed, or
//     continues to activate the nervous system after the environment has
//     changed. High agreement = accumulative integration pattern.
//     Source: Ayres Sensory Integration Theory (1972); Marco et al.,
//     Nature Reviews Neuroscience (2011).
//
//   q_int2 — Loading curve / cumulative depletion signal
//     Detects progressive capacity loss across the day where no single event
//     was responsible. The hallmark of accumulative processing. Also the
//     question most likely to produce a recognition moment for undiagnosed
//     users. High agreement = accumulative integration pattern.
//     Source: Dunn Sensory Processing Model (1997, 2001); McEwen allostatic
//     load research.
//
//   q_int3 — Transition friction / boundary resolution signal
//     Detects whether the nervous system carries one environmental context
//     into the next, or resolves and arrives in the new space. High
//     agreement = accumulative integration pattern.
//     Source: Cascio et al. (2016); Sternberg, Healing Spaces.
//
//   SCORING
//   q_int1, q_int2, q_int3 score into a new Integration Index (0–100),
//   separate from the five BSFI domains. The Integration Index acts as a
//   profile modifier — it reweights how BSFI domain scores are interpreted
//   rather than replacing them.
//
//     0–35:  Integrative pattern
//            Sensation resolves with recovery. Prescriptions focus on quality
//            and timing of recovery windows.
//
//     36–64: Mixed pattern
//            Integration is context-dependent. Some environments or seasons
//            tip the system toward accumulation. Prescriptions acknowledge
//            variability.
//
//     65–100: Accumulative pattern
//             Sensation layers and persists. Prescriptions prioritise
//             environmental consistency above all else. PLI and RCI weights
//             increase. Mid-range ALI scores are read as more serious.
//             Recovery is structural, not periodic.
//
//   EXISTING QUESTION CHANGES
//   q27 — reworded to clarify that avoidance is driven by how the room makes
//          the person feel, not simply by disuse. Scoring direction unchanged.
//   q30 — reworded to frame the behaviour as a demand the home places on the
//          person rather than a coping competence. Scoring direction unchanged.
//   q31 — reworded to frame constant adjustment as a home failing its resident
//          rather than attentive self-care. Scoring direction unchanged.
//
// SCORING PRINCIPLE (q30 & q31):
//   A Sentient Home should not require its resident to perform constant
//   environmental labour to feel regulated. High agreement with q30 and q31
//   indicates a home that is imposing active management demands — which is
//   high friction, not high agency. The scoring direction (high = friction)
//   is intentional and clinically correct.
//
// SCIENTIFIC FOUNDATIONS:
//   Aron & Aron (1997) — Sensory Processing Sensitivity
//   Dunn (1997, 2001) — Sensory Processing Model
//   Ayres (1972) — Sensory Integration Theory
//   Marco et al., Nature Reviews Neuroscience (2011) — sensory processing
//     in autism; atypical multisensory integration as distinct from threshold
//     sensitivity
//   Cascio et al. (2016) — tactile processing differences, autism vs HSP
//   McEwen — allostatic load; apparent high threshold as system already full
//   Sternberg, Healing Spaces — environmental neuroscience; spatial
//     translation from sensory type to environmental prescription
// =============================================================================

export const assessmentProtocol = {
  part0: {
    title: "Nervous System Snapshot",
    step: 0,
    subtitle: "Current State",
    main_question: "Baseline Regulation Check",
    description: "Before we assess the environment, we must establish the current load on your nervous system, and how it tends to process what it receives.",
    questions: [
      // ------------------------------------------------------------------
      // EXISTING — current state snapshot
      // ------------------------------------------------------------------
      {
        id: 'q_state',
        text: "How does your body feel in your home environment right now?",
        type: 'choice',
        options: ['Alert', 'Calm', 'Wired', 'Flat', 'Tense']
      },
      {
        id: 'energy_tax',
        text: "What percentage of your energy goes toward managing your environment vs. living in it?",
        type: 'slider'
        // Range: 0–100. Stored as numeric.
        // Used as: baseline load modifier on final NeuroLoad score
        //          + baseline for progress tracking across cycles
      },
      {
        id: 'primary_strain',
        text: "Which feels most true right now?",
        type: 'choice',
        options: ['Mental overload', 'Physical tension', 'Emotional volatility', 'Sleep disruption', 'None of the above']
        // Used as: domain pre-weight modifier before scale responses are scored
        //          + cross-validation signal against derived domain scores
        //          + stored for progress tracking
      },

      // ------------------------------------------------------------------
      // NEW — integration pattern (q_int1, q_int2, q_int3)
      //
      // UI NOTE: Render a soft visual divider above q_int1 with the
      // following reframe line:
      //   "Three more questions — these ones are about how your body
      //    handles what it receives, rather than what it's carrying
      //    right now."
      //
      // This prepares the user for the register shift without creating
      // a new named section or step.
      // ------------------------------------------------------------------
      {
        id: 'q_int1',
        text: "If my day has been loud or demanding, I can still feel its effects in my body hours later, even once I am home and the noise has stopped.",
        type: 'scale',
        // Detects: residue / carry-over
        // High agreement = accumulative integration pattern
        // Scientific basis: Ayres (1972); Marco et al. (2011)
        scores_into: 'integration_index'
      },
      {
        id: 'q_int2',
        text: "By the end of the day, small things that would not have bothered me in the morning feel much harder to tolerate.",
        type: 'scale',
        // Detects: loading curve / cumulative depletion
        // High agreement = accumulative integration pattern
        // Scientific basis: Dunn (1997, 2001); McEwen allostatic load
        scores_into: 'integration_index'
      },
      {
        id: 'q_int3',
        text: "Moving from one environment to another: arriving home, entering a different room, returning from outside, takes time before my body feels settled in the new space.",
        type: 'scale',
        // Detects: transition friction / boundary resolution
        // High agreement = accumulative integration pattern
        // Scientific basis: Cascio et al. (2016); Sternberg, Healing Spaces
        scores_into: 'integration_index'
      },

      // ------------------------------------------------------------------
      // EXISTING — self-identification (moved to last position)
      //
      // Rationale: neuro_lens is now a corroborative signal. The three
      // integration questions above establish the behavioural pattern
      // without requiring the user to hold a clinical label. neuro_lens
      // follows as confirmation — not as the primary classifier.
      // Undiagnosed users complete the integration questions on their own
      // terms before being asked to identify with a clinical category.
      // ------------------------------------------------------------------
      {
        id: 'neuro_lens',
        text: "My sensory processing is influenced by:",
        type: 'choice',
        options: ['HSP', 'ADHD', 'Autism', 'Dyslexia', 'SPD', 'None / Unsure']
        // Changed: 'None' → 'None / Unsure' to hold undiagnosed users
        // without forcing a false negative.
        //
        // Used as: corroborative modifier (structural neurological trait)
        //          + blend tiebreaker when integration classification is
        //            ambiguous at 36–64 mixed range
        //          + no longer used as primary threshold classifier
      },
    ]
  },

  part1: {
    title: "Circadian Integrity",
    step: 1,
    subtitle: "Light → Hormones",
    main_question: "How well does your home support your natural body clock?",
    description: "This section measures whether your lighting, daily rhythms and environmental signals help or hinder your body's regulation of energy, sleep and hormonal cycles.",
    questions: [
      { id: 'q5', text: "I feel alert in the morning without needing to push myself.", type: 'scale' },
      { id: 'q6', text: "I feel naturally tired at night and fall asleep without difficulty.", type: 'scale' },
      { id: 'q7', text: "My energy rises and falls at predictable times throughout the day.", type: 'scale' },
      { id: 'q8', text: "Bright lighting in the evening makes it harder for me to wind down.", type: 'scale' },
      { id: 'q9', text: "Low light levels during the day makes me feel sluggish or foggy.", type: 'scale' },
    ]
  },

  part2: {
    title: "Autonomic Load",
    step: 2,
    subtitle: "Stress Axis",
    main_question: "How hard is your nervous system working to stay regulated?",
    description: "This section reveals whether your home allows your body to switch off and recover, or keeps your stress system partially activated, even when you are at rest.",
    questions: [
      { id: 'q10', text: "Small changes in sound, light, or temperature quickly make me tense.", type: 'scale' },
      { id: 'q11', text: "I feel on edge at home even when nothing is wrong.", type: 'scale' },
      { id: 'q12', text: "I find it hard to fully relax, even when nothing is wrong.", type: 'scale' },
      { id: 'q13', text: "I rarely feel settled at home without making constant micro-adjustments.", type: 'scale' },
      { id: 'q14', text: "I notice subtle changes in sound, lighting, or temperature before others do.", type: 'scale' },
    ]
  },

  part3: {
    title: "Predictive Legibility",
    step: 3,
    subtitle: "Hierarchy & Flow",
    main_question: "How easily can your brain read and navigate your surroundings?",
    description: "This section assesses whether your environment is spatially clear and intuitive, or if it requires constant micro-decisions and mental recalibration to make sense of it.",
    questions: [
      { id: 'q15', text: "When I enter a room in my home, I immediately know what it's for.", type: 'scale' },
      { id: 'q16', text: "I move through my home easily without bumping into things or backtracking.", type: 'scale' },
      { id: 'q17', text: "In most rooms, my eyes naturally settle on one main feature.", type: 'scale' },
      { id: 'q18', text: "My eyes don't feel pulled in multiple directions.", type: 'scale' },
      { id: 'q19', text: "Moving through my home feels automatic rather than mentally effortful.", type: 'scale' },
    ]
  },

  part4: {
    title: "Sensory Load",
    step: 4,
    subtitle: "Sensory Gating",
    main_question: "How much sensory information is your nervous system filtering out?",
    description: "This captures the cumulative impact of light, sound, texture and visual complexity, as well as how your nervous system experiences them: whether as soothing or overwhelming.",
    questions: [
      { id: 'q20', text: "Too many visible objects make it hard for me to focus.", type: 'scale' },
      { id: 'q21', text: "Background noise in my home makes it hard to fully relax.", type: 'scale' },
      { id: 'q22', text: "I sometimes do not notice background sounds or visual details unless they become very strong.", type: 'scale' },
      { id: 'q23', text: "Very quiet or visually minimal environments can make me feel dull or unfocused.", type: 'scale' },
      { id: 'q24', text: "Overhead lighting feels harsh or tiring and causes strain.", type: 'scale' },
      { id: 'q25', text: "I avoid certain materials (the feel of certain fabrics) because of how they feel.", type: 'scale' },
      { id: 'q26', text: "I feel my body relax in some rooms and tense up in others.", type: 'scale' },
    ]
  },

  part5: {
    title: "Recovery Capacity",
    step: 5,
    subtitle: "Parasympathetic Restoration",
    main_question: "How effectively does your home help you to restore energy?",
    description: "This section indicates whether your space truly enables you to relax, recover and recharge, or leaves you technically off duty, but never fully restored.",
    questions: [
      {
        id: 'q27',
        // REWORDED: adds causal link — avoidance because of how the room
        // makes the person feel, not simply because it goes unused.
        text: "There are rooms in my home I avoid because of how they make me feel.",
        type: 'scale'
      },
      { id: 'q28', text: "Time at home does not always leave me feeling fully restored.", type: 'scale' },
      { id: 'q29', text: "It takes me a long time to mentally wind down at night.", type: 'scale' },
      {
        id: 'q30',
        // REWORDED: frames the behaviour as a demand the home places on the
        // person. High agreement = home is failing to self-regulate for its
        // resident. Scoring direction (high = friction) is correct and intentional.
        text: "I find myself having to leave or change rooms in order to feel regulated.",
        type: 'scale'
      },
      {
        id: 'q31',
        // REWORDED: 'requires' makes the home the subject imposing the demand.
        // High agreement = the home does not support the person — the person
        // must support the home. Scoring direction (high = friction) is correct.
        text: "Feeling comfortable at home requires me to regularly adjust the lighting, sound, or layout.",
        type: 'scale'
      },
      { id: 'q32', text: "I feel more relaxed outside my home than inside.", type: 'scale' },
      {
        id: 'q33',
        text: "My home helps me recover, not just get through the day.",
        type: 'scale',
        reverse: true
      },
    ]
  }
}
