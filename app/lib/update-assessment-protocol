// =============================================================================
// UPDATE ASSESSMENT PROTOCOL — The Sentient Home
// =============================================================================
//
// PURPOSE:
//   A lightweight reassessment triggered at day 14 and day 21 post-baseline.
//   Does not replace the baseline. Produces a second NeuroLoadResult that
//   sits alongside the original, enabling delta calculation per domain.
//
// DESIGN PRINCIPLES:
//   - One anchor question per domain (highest-discriminating item from baseline)
//   - One comparative question per domain (self-referenced progress signal)
//   - Part 0 state snapshot retained in full (feeds existing engine modifiers)
//   - Part 2 change detection: stored as context flags, not fed to scoring engine
//   - Part 3 subjective marker: stored separately, used in narrative synthesis only
//
// SCORING INTEGRATION:
//   Anchor questions map directly to original question IDs (q6, q11, q19, q21, q33).
//   Missing questions fall back to neutral (3) in getValidatedValue().
//   This is intentional — fallbacks pull toward centre, preventing over-interpretation
//   of a reduced question set. The update score is directionally valid, not
//   clinically equivalent to a full reassessment.
//
// STORAGE:
//   assessment_type: 'update'
//   compared_to: <original baseline assessment_id>
//   Comparative questions (x_delta_self) and context flags stored on the
//   update record but not passed to calculateNeuroLoad.
//
// =============================================================================

export const updateAssessmentProtocol = {

  meta: {
    assessment_type: 'update',
    label: 'Two-Week Check-In',
    subtitle: 'Your home has been working. Let us see what shifted.',
    description: 'This short check-in takes 3–4 minutes. It measures how your nervous system and environment are responding to the changes made since your last assessment.',
    trigger_days: [14, 21],    // days post-baseline at which nudge surfaces
    estimated_minutes: 4
  },

  // ============================================================
  // PART 0 — STATE SNAPSHOT
  // Identical structure to baseline Part 0.
  // All three questions feed directly into calculateNeuroLoad:
  //   q_state      → choiceMap (stored, not scored)
  //   energy_tax   → ±0.08 final composite modifier
  //   primary_strain → STRAIN_DOMAIN_BOOST additive pre-weight
  //
  // energy_tax delta (update vs baseline) is a primary progress signal:
  // a drop from 70 → 30 is the clearest single indicator of improvement.
  // ============================================================

  part0: {
    title: 'Nervous System Snapshot',
    step: 0,
    subtitle: 'Current State',
    description: 'Before we assess what has changed, we check in with your nervous system right now.',
    questions: [
      {
        id: 'q_state',
        text: 'How does your body feel in your home environment right now?',
        type: 'choice',
        options: ['Alert', 'Calm', 'Wired', 'Flat', 'Tense']
      },
      {
        id: 'energy_tax',
        text: 'What percentage of your energy still goes toward managing your environment vs. living in it?',
        type: 'slider'
        // Range: 0–100.
        // Delta vs baseline energy_tax stored as energy_tax_delta.
        // A reduction of ≥20 points is flagged as a meaningful improvement signal.
      },
      {
        id: 'primary_strain',
        text: 'Which feels most true right now?',
        type: 'choice',
        options: ['Mental overload', 'Physical tension', 'Emotional volatility', 'Sleep disruption', 'None of the above']
        // If primary_strain has shifted from baseline, stored as strain_shift: true
        // and surfaced in narrative synthesis as a domain priority change.
      }
    ]
  },

  // ============================================================
  // PART 1 — DOMAIN RE-SURVEY
  // One anchor question per domain — maps to original question ID.
  // One comparative question per domain — new, self-referenced framing.
  //
  // ANCHOR questions are passed to calculateNeuroLoad under their
  // original question IDs (q6, q11, q19, q21, q33).
  //
  // COMPARATIVE questions are stored as x_delta_self fields on the
  // update record. They are NOT passed to the scoring engine.
  // They are used in delta narrative synthesis to validate or
  // contradict the quantitative domain delta.
  // ============================================================

  part1: {
    title: 'Domain Check-In',
    step: 1,
    subtitle: 'Five areas, two questions each.',
    description: 'For each area, we ask how things are now — and whether they feel different from when you started.',
    sections: [

      // ----------------------------------------------------------
      // CII — CIRCADIAN INTEGRITY
      // Anchor: q6 — the most direct sleep-onset indicator in the CII domain.
      // Chosen over q5 (morning alertness) because sleep onset is more
      // directly influenced by evening light environment — the primary
      // CII intervention lever.
      // ----------------------------------------------------------
      {
        domain: 'cii',
        domain_label: 'Sleep & Energy Rhythm',
        questions: [
          {
            id: 'q6',                    // anchor — fed to scoring engine
            text: 'I feel naturally tired at night and fall asleep without difficulty.',
            type: 'scale',
            role: 'anchor'
          },
          {
            id: 'cii_delta_self',        // comparative — stored only
            text: 'Compared to when I started, my sleep rhythm feels more predictable.',
            type: 'scale',
            role: 'comparative',
            scale_labels: {
              1: 'Much less predictable',
              3: 'About the same',
              5: 'Much more predictable'
            }
          }
        ]
      },

      // ----------------------------------------------------------
      // ALI — AUTONOMIC LOAD
      // Anchor: q11 — the most direct autonomic vigilance indicator.
      // "On edge when nothing is wrong" is the purest measure of
      // baseline sympathetic tone unrelated to external triggers.
      // Chosen over q10 (reactivity) because reactivity can be
      // environmental; q11 measures the resting load.
      // ----------------------------------------------------------
      {
        domain: 'ali',
        domain_label: 'Nervous System Activation',
        questions: [
          {
            id: 'q11',                   // anchor — fed to scoring engine
            text: 'I feel on edge at home even when nothing is wrong.',
            type: 'scale',
            role: 'anchor'
          },
          {
            id: 'ali_delta_self',        // comparative — stored only
            text: 'Compared to when I started, I feel less activated at home.',
            type: 'scale',
            role: 'comparative',
            scale_labels: {
              1: 'Much more activated',
              3: 'About the same',
              5: 'Much less activated'
            }
          }
        ]
      },

      // ----------------------------------------------------------
      // PLI — PREDICTIVE LEGIBILITY
      // Anchor: q19 — the most behavioural PLI indicator.
      // "Automatic vs mentally effortful" captures spatial cognitive
      // load directly. Chosen over q15 (purpose clarity) because
      // automaticity is the end-state of successful legibility
      // intervention — it is what improvement looks like in the body.
      // ----------------------------------------------------------
      {
        domain: 'pli',
        domain_label: 'Spatial Clarity',
        questions: [
          {
            id: 'q19',                   // anchor — fed to scoring engine
            text: 'Moving through my home feels automatic rather than mentally effortful.',
            type: 'scale',
            role: 'anchor'
          },
          {
            id: 'pli_delta_self',        // comparative — stored only
            text: 'Compared to when I started, my home feels easier to navigate mentally.',
            type: 'scale',
            role: 'comparative',
            scale_labels: {
              1: 'More effortful',
              3: 'About the same',
              5: 'Less effortful'
            }
          }
        ]
      },

      // ----------------------------------------------------------
      // STL — SENSORY LOAD
      // Anchor: q21 — the broadest sensory load indicator across
      // all three sensory channels (acoustic primary, applies widely).
      // Chosen over q20 (visual) because acoustic overload is the
      // most common intervention point and the hardest to self-modify
      // — improvement here most reliably reflects environmental change.
      // ----------------------------------------------------------
      {
        domain: 'stl',
        domain_label: 'Sensory Environment',
        questions: [
          {
            id: 'q21',                   // anchor — fed to scoring engine
            text: 'Background noise in my home makes it hard to fully relax.',
            type: 'scale',
            role: 'anchor'
          },
          {
            id: 'stl_delta_self',        // comparative — stored only
            text: 'Compared to when I started, my environment feels less overwhelming.',
            type: 'scale',
            role: 'comparative',
            scale_labels: {
              1: 'More overwhelming',
              3: 'About the same',
              5: 'Less overwhelming'
            }
          }
        ]
      },

      // ----------------------------------------------------------
      // RCI — RECOVERY CAPACITY
      // Anchor: q33 — the only reverse-scored RCI item. The most
      // positively framed question in the entire protocol.
      // "Helps me recover, not just get through" is the precise
      // language of the platform's core promise — using it as the
      // anchor means the update assessment closes on the platform's
      // own standard. Engine handles reverse scoring (REVERSE_SCORED set).
      // ----------------------------------------------------------
      {
        domain: 'rci',
        domain_label: 'Recovery & Restoration',
        questions: [
          {
            id: 'q33',                   // anchor — fed to scoring engine (reverse scored)
            text: 'My home helps me recover, not just get through the day.',
            type: 'scale',
            role: 'anchor',
            reverse: true
          },
          {
            id: 'rci_delta_self',        // comparative — stored only
            text: 'Compared to when I started, I feel more restored after time at home.',
            type: 'scale',
            role: 'comparative',
            scale_labels: {
              1: 'Less restored',
              3: 'About the same',
              5: 'More restored'
            }
          }
        ]
      }
    ]
  },

  // ============================================================
  // PART 2 — CHANGE DETECTION
  // Not fed to scoring engine. Stored as context_flags on update record.
  // Used for attribution (did improvement correlate with a specific change?)
  // and confound capture (did worsening correlate with a life context shift?).
  // ============================================================

  part2: {
    title: 'What Has Changed',
    step: 2,
    subtitle: 'Help us understand the context.',
    description: 'These questions help interpret your results — they tell us whether changes in your scores are likely linked to your environment or to other factors.',
    questions: [
      {
        id: 'env_change_sleep',
        text: 'Since your last assessment, have you made any changes to your bedroom or sleep setup?',
        type: 'multi_select',
        options: [
          'Changed lighting',
          'Changed bedding or temperature setup',
          'Reduced noise sources',
          'Rearranged furniture',
          'Moved bedroom',
          'No changes'
        ],
        stored_as: 'context_flag',
        // Attribution logic:
        //   env_change_sleep + CII improvement → sleep environment confirmed effective
        //   env_change_sleep + CII unchanged   → sleep changes did not address the right variable
        //   no change        + CII improvement → recovery or autonomic shift drove the gain
      },
      {
        id: 'env_change_day',
        text: 'Since your last assessment, have you made any changes to your primary daytime space?',
        type: 'multi_select',
        options: [
          'Changed lighting',
          'Reduced clutter or visual complexity',
          'Changed acoustic conditions',
          'Added natural elements',
          'Moved or reorganised workspace',
          'No changes'
        ],
        stored_as: 'context_flag',
        // Attribution logic feeds STL and PLI domain narratives.
      },
      {
        id: 'life_context_change',
        text: 'Has anything significant changed in your daily life since your last assessment?',
        type: 'multi_select',
        options: [
          'New or increased work demands',
          'Change in household members',
          'Health changes',
          'Seasonal shift',
          'Significant travel',
          'Relationship changes',
          'Nothing significant'
        ],
        stored_as: 'context_flag',
        // Confound capture:
        //   life_context_change present + domain worsening
        //   → external pressure, not environmental failure
        //   → narrative explicitly names this to protect user's trust in the methodology
      }
    ]
  },

  // ============================================================
  // PART 3 — SUBJECTIVE PROGRESS MARKER
  // One question. System 1. Asked LAST — after the user has been
  // walked through their domain check-in and is primed to self-compare.
  // Stored as subjective_alignment_score (1–5).
  // Not fed to scoring engine.
  //
  // Agreement between subjective_alignment_score direction and
  // load_delta direction → strong positive signal, reinforce.
  //
  // Disagreement (quantitative improved, subjective worsened) →
  // most clinically significant finding — triggers specific narrative
  // acknowledging the gap without dismissing the felt experience.
  // ============================================================

  part3: {
    title: 'The Felt Sense',
    step: 3,
    subtitle: 'One final question.',
    description: 'No analysis here — just your gut response.',
    questions: [
      {
        id: 'subjective_alignment_score',
        text: 'Compared to when you started, how does your home feel?',
        type: 'choice',
        options: [
          'Significantly worse',
          'Slightly worse',
          'About the same',
          'Slightly better',
          'Significantly better'
        ],
        numeric_map: {
          'Significantly worse':  1,
          'Slightly worse':       2,
          'About the same':       3,
          'Slightly better':      4,
          'Significantly better': 5
        },
        stored_as: 'subjective_alignment_score'
      }
    ]
  }
}

// ============================================================
// ANCHOR QUESTION EXTRACTOR
// Utility: pulls only the anchor questions from part1 for
// passing to calculateNeuroLoad. Comparative questions are
// excluded — they are stored separately via storeDeltaFields().
// ============================================================

export const extractAnchorResponses = (
  allUpdateResponses: { question_key: string; answer: { response: any } }[]
): { question_key: string; answer: { response: any } }[] => {
  const anchorIds = new Set(['q6', 'q11', 'q19', 'q21', 'q33', 'q_state', 'energy_tax', 'primary_strain'])
  return allUpdateResponses.filter(r => anchorIds.has(r.question_key))
}

// ============================================================
// COMPARATIVE FIELD EXTRACTOR
// Utility: pulls only the self-delta and context flag fields
// for direct storage on the update record.
// ============================================================

export const extractDeltaFields = (
  allUpdateResponses: { question_key: string; answer: { response: any } }[]
): Record<string, any> => {
  const deltaKeys = new Set([
    'cii_delta_self', 'ali_delta_self', 'pli_delta_self',
    'stl_delta_self', 'rci_delta_self',
    'env_change_sleep', 'env_change_day', 'life_context_change',
    'subjective_alignment_score'
  ])
  return allUpdateResponses
    .filter(r => deltaKeys.has(r.question_key))
    .reduce((acc, r) => {
      acc[r.question_key] = r.answer.response
      return acc
    }, {} as Record<string, any>)
}
