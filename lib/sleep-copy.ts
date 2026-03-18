// lib/sleep-copy.ts
// ─────────────────────────────────────────────────────────────────────────────
// SLEEP COPY FRAMEWORK — The Sentient Home
//
// EDITORIAL STANCE
// Sleep is not a performance metric. It is a rhythm that responds to the
// interaction between the body, the mind, and the environment in which we rest.
//
// Every piece of copy in this file is written to:
//   1. Remove performance pressure from sleep scores
//   2. Normalise variability as intelligent biological response
//   3. Anchor the solution in the environment — not the person
//   4. Prevent score anxiety from driving disengagement
//
// SOURCE: Internal sleep research synthesis, informed by:
//   — Roger Ekirch, historical segmented sleep documentation
//   — Nature Reviews Neuroscience, circadian/sleep pressure two-system model
//   — Journal of Clinical Sleep Medicine, orthosomnia research
//   — Esther Sternberg MD, Healing Spaces — environment and nervous system
//   — National Sleep Foundation, night-to-night variability in healthy sleepers
//
// ─────────────────────────────────────────────────────────────────────────────


// =============================================================================
// SECTION 1 — MORNING FEEDBACK COPY
// Triggered after the user logs a morning sleep entry.
// Tone: grounding, validating, non-prescriptive.
// =============================================================================

export type MorningSleepQuality = 'restorative' | 'variable' | 'disrupted' | 'fragmented'

interface MorningFeedback {
  headline: string
  body: string
  environmental_note: string
  score_reframe?: string // shown when user has BSFI access
}

export const MORNING_FEEDBACK: Record<MorningSleepQuality, MorningFeedback> = {

  restorative: {
    headline: 'Your system found its rhythm last night.',
    body:
      'Sleep aligned well with the conditions available to your nervous system. ' +
      'This is what becomes possible when the environment, your relational load, ' +
      'and the body are working in the same direction.',
    environmental_note:
      'Notice what felt different about yesterday evening. ' +
      'Light exposure, temperature,the level of social interaction and the level of sensory activity before bed ' +
      'each shape how readily the body transitions into rest.',
  },

  variable: {
    headline: 'Variable sleep is not failed sleep.',
    body:
      'Night-to-night fluctuation is a normal feature of a healthy nervous system, ' +
      'not evidence that something has gone wrong. ' +
      'Your body is responding intelligently to the shifting conditions of your life: ' +
      'emotional load, level of social interaction and exertion, and the sensory environment you rested in.',
    environmental_note:
      'Your home environment is the buffer for your life,' +
      'and one of the most adjustable inputs in this equation. ' +
      'Lighting quality, temperature, and ambient noise all send signals to your ' +
      'circadian system before you ever close your eyes.' +
      'and when social or cognitive load is high,the adjustment of light and noise becomes your primary intervention.',
    score_reframe:
      'A variable BSFI score is data, not a verdict. It reflects a nervous system responding to life, not failing at it.',
  },

  disrupted: {
    headline: 'Disrupted sleep rarely means what we think it means.',
    body:
      'Waking during the night, especially in the early hours, has been a documented ' +
      'feature of human sleep for centuries. Historical records describe a common pattern ' +
      'of two sleep phases with a quiet period between them. ' +
      'What feels like insomnia may sometimes be the body moving through its own rhythm.' +
      'That said, when relational or environmental load is high, the brain remains in a state of ' + ,
      'subtle vigilance, making you more sensitive to the early morning environment.',
    environmental_note:
      'Environmental conditions often drive disruption when the nervous system is already ' +
      'carrying a load. Light bleed, ambient temperature shifts, or subtle sound changes pull you out of recovery because ' +
      'your safety threshold is currently lowered.',
    score_reframe:
      'Your score today reflects last night\'s conditions, not your long-term trajectory. ' +
      'A single disrupted night does not define your pattern.',
  },

  fragmented: {
    headline: 'Fragmented sleep is a signal, not a character flaw.',
    body:
      'When sleep is repeatedly broken, the nervous system is communicating that ' +
      'relational or sensory load is still being processed. Research shows that ' +
      'high social demand can potentially block the continuity of REM.' +
      'This is intelligent, protective behaviour. ' +
      'The question is not: what is wrong with me? ' +
      'The question is: what in my environment, lifestyle habit or schedule is maintaining this signal?',
    environmental_note:
      'Sensory or social load carried into the evening such as bright light, noise, thermal discomfort, ' +
      'or unresolved cognitive demand extends the time it takes for the autonomic ' +
      'nervous system to shift from vigilance into recovery. ' +
      'This is where environment must act as a deliberate enclosure to signal safety.',
    score_reframe:
      'A pattern of fragmented sleep will show in your BSFI trend over time. ' +
      'That trend is useful because it points outward toward adjustable conditions, ' +
      '-both spatial and relational- rather than inward as a measure of personal inadequacy.',
  },
}


// =============================================================================
// SECTION 2 — EVENING FEEDBACK COPY
// Triggered after the user logs an evening / wind-down entry.
// Tone: orienting, permission-giving, environment-focused.
// =============================================================================

export type EveningMoodLevel = 1 | 2 | 3 | 4 | 5

// Evening mood scale (confirmed):
// 1 = Tired but Wired (exhausted but can't come down)
// 2 = Buzzing (surface agitation, body still running)
// 3 = Present (here, nothing pulling)
// 4 = Settling (body beginning to release)
// 5 = Sleep Ready (genuinely quiet)

interface EveningFeedback {
  headline: string
  body: string
  environment_action: string
}

export const EVENING_FEEDBACK: Record<EveningMoodLevel, EveningFeedback> = {

  1: {
    headline: 'Tired but wired is an autonomic state, not a personal failure.',
    body:
      'This pattern of physical exhaustion paired with mental activation ' +
      'is one of the clearest signs that high social demand or sensory noise has kept your sympathetic system in on mode. ' +
      'The body knows it is tired. It is currently not reading your environment as safe to rest.',
    environment_action:
      'Reduce light intensity in the space you are moving through now. ' +
      'Warm-toned, low-lux lighting tells the circadian system the day is ending. ' +
      'Bright overhead light sends the opposite message regardless of how tired you feel.' +
      'Your environment must provide the safety signal your day did not.',
  },

  2: {
    headline: 'Surface agitation usually has an environmental source.',
    body:
      'A buzzing, restless state in the evening often reflects the cumulative sensory ' +
      'load of the day such as relational residue, noise, light, cognitive demand that has not yet had space to clear. ' +
      'The body is still processing. It has not received a clear signal to begin winding down.',
    environment_action:
      'Introduce a transition. A 15-minute shift in sensory input like lower light levels, ' +
      'reduced screen exposure, quieter surroundings. These give the nervous system ' +
      'the environmental cue it needs to wind down.',
  },

  3: {
    headline: 'Present is a good place to build from.',
    body:
      'Arriving at the evening feeling grounded and neutral is a solid baseline. ' +
      'The nervous system is neither overloaded nor depleted. ' +
      'What happens between now and sleep will shape what kind of rest follows.',
    environment_action:
      'This is the window where environment has the most leverage. ' +
      'A gradual reduction in light and sensory input over the next hour ' +
      'supports a natural shift toward the sleep state without force.',
  },

  4: {
    headline: 'Settling is the beginning of rest, not just a precursor to it.',
    body:
      'The release you are noticing is physiological. Your autonomic nervous system ' +
      'is beginning to down-regulate. This is the process working as intended. ' +
      'Sleep is not an event that starts when you close your eyes. ' +
      'It begins here.',
    environment_action:
      'Protect this state. Keep light low, temperature slightly cool, ' +
      'and avoid re-engaging with stimulating content. ' +
      'The environment does not need to induce sleep. It just needs to stop preventing it.',
  },

  5: {
    headline: 'Genuinely quiet is what the body was built for.',
    body:
      'Sleep readiness is not something you achieve through effort. ' +
      'It is what emerges when the environment and the nervous system are in alignment. ' +
      'What you are feeling now is that alignment.',
    environment_action:
      'Move to your sleep environment while this state is present. ' +
      'Darkness, thermal comfort, and quiet will support the transition ' +
      'your body has already begun.',
  },
}


// =============================================================================
// SECTION 3 — BSFI SCORE CONTEXTUAL FRAMING
// Shown alongside BSFI scores to prevent performance anxiety.
// Applied at: dashboard sleep panel, progress view, weekly summary.
// =============================================================================

export interface BSFIScoreContext {
  range: [number, number]
  label: string
  reframe: string
  environment_lens: string
}

export const BSFI_SCORE_CONTEXTS: BSFIScoreContext[] = [
  {
    range: [0, 30],
    label: 'Low Friction',
    reframe:
      'Your environment and nervous system are well-aligned today. ' +
      'This reflects conditions, not a fixed state. Take note what made this possible.',
    environment_lens:
      'Low friction scores tend to correlate with good circadian light anchoring ' +
      'and low ambient sensory load across the day.',
  },
  {
    range: [31, 55],
    label: 'Moderate Friction',
    reframe:
      'Moderate friction is within the normal range of daily variation for most people. ' +
      'The body is responding to its current conditions. This is adaptive, not problematic.',
    environment_lens:
      'Moderate scores often reflect a slight mismatch between your autonomic load' +
      '(social or environmental) and your current sensory threshold. These may be slightly misaligned with your nervous system\'s current needs. ' ,
  },
  {
    range: [56, 74],
    label: 'Elevated Friction',
    reframe:
      'An elevated score is a signal, not a diagnosis. ' +
      'It means your system is working harder than usual against its current environment. ' +
      'One difficult night or one high-demand day can move a score significantly. ' +
      'Remember that a single data point is not a pattern.',
    environment_lens:
      'Elevated friction most often traces back to light environment, acoustic load, ' +
      'or temperature conditions during sleep. ',
  },
  {
    range: [75, 100],
    label: 'High Friction',
    reframe:
      'A high friction score is your nervous system communicating that the gap between ' +
      'its needs and its current environment is significant. ' +
      'This is useful information, not a failure state. ' +
      'The question this score asks is not: what is wrong with me? ' +
      'It is: what in my environment is maintaining this load?',
    environment_lens:
      'High friction is rarely caused by a single factor. ' +
      'Your domain breakdown will identify which systems are carrying the most load ' +
      'and where environmental intervention will have the greatest leverage.',
  },
]

export function getBSFIContext(score: number): BSFIScoreContext {
  return (
    BSFI_SCORE_CONTEXTS.find(c => score >= c.range[0] && score <= c.range[1]) ||
    BSFI_SCORE_CONTEXTS[BSFI_SCORE_CONTEXTS.length - 1]
  )
}


// =============================================================================
// SECTION 4 — SCORE VARIANCE CALLOUTS
// Short-form copy shown when a score has shifted significantly day-to-day.
// Applied at: dashboard delta indicators, weekly trend view.
// =============================================================================

export const VARIANCE_CALLOUTS = {
  improved_significant: {
    headline: 'Noticeably lower friction today.',
    subtext:
      'Single-day improvements often reflect changes in one or two environmental factors. ' +
      'Your log will indicate what shifted.',
  },
  worsened_significant: {
    headline: 'Higher friction than recent days.',
    subtext:
      'A single elevated score rarely indicates a trend. ' +
      'Sleep is inherently variable. What the body needs one night ' +
      'may differ considerably from the next.',
  },
  stable: {
    headline: 'Consistent friction pattern.',
    subtext:
      'Stability in your score [in either direction]is informative. ' +
      'It suggests your environmental conditions are relatively constant.',
  },
}


// =============================================================================
// SECTION 5 — ONBOARDING / CONTEXTUAL EDUCATION COPY
// Shown to new users and within tooltip / info panels throughout the app.
// Establishes the philosophy before the user sees their first score.
// =============================================================================

export const SLEEP_EDUCATION_COPY = {

  before_first_score: {
    headline: 'About your BSFI score.',
    body:
      'Your Baseline Sensory Friction Index is a measure of environmental load, ' +
      'not a sleep grade. ' +
      'It reflects the gap between what your nervous system needs and what your ' +
      'current environment provides. ' +
      '\n\n' +
      'Sleep is not perfectly linear. Night-to-night variation is a normal feature of ' +
      'a healthy nervous system responding to changing conditions. ' +
      'Your score will fluctuate—and that is expected. ' +
      '\n\n' +
      'What matters is the pattern over time, and what it points to in your environment.',
  },

  score_tooltip: {
    short:
      'Your BSFI reflects environmental load, not sleep quality as a personal achievement. ' +
      'Variability is normal.',
  },

  waking_at_night: {
    headline: 'Waking during the night.',
    body:
      'Brief awakenings between sleep cycles are a normal feature of human sleep ' +
      'often unnoticed by healthy sleepers. ' +
      'Before artificial lighting, many people experienced two distinct sleep phases ' +
      'separated by a natural period of quiet wakefulness. ' +
      '\n\n' +
      'If you are waking and finding it difficult to return to sleep, ' +
      'the question is not what is wrong with you, ' +
      'it is what in your environment may be extending that window unnecessarily.',
  },

  performance_anxiety_note: {
    headline: 'A note on sleep scores.',
    body:
      'Focusing too intently on achieving a perfect sleep score can itself ' +
      'become a source of sleep disruption: a phenomenon researchers call orthosomnia. ' +
      '\n\n' +
      'Your BSFI is a compass, not a target. ' +
      'Use it to understand your environment. ' +
      'Do not use it to grade yourself.',
  },

}


// =============================================================================
// SECTION 6 — getMorningFeedback() FUNCTION
// Drop-in replacement for the existing getMorningFeedback utility.
// Takes sleep_wakes and mood_score as primary signals.
// =============================================================================

interface MorningLogInputs {
  sleep_wakes: number | null   // number of wake events logged
  mood_score: number | null    // 1–5 morning state
  morning_tension: number | null // 1–5 tension on waking
  social_demand?: 'low' | 'moderate' | 'high' | null
}

export function getMorningFeedback(inputs: MorningLogInputs): MorningFeedback {
  const { sleep_wakes, mood_score, morning_tension, social_demand } = inputs

  const wakes = sleep_wakes ?? 0
  const mood  = mood_score ?? 3
  const tension = morning_tension ?? 3
  const social = social_demand ?? 'low'
  
  // Fragmented: multiple wakes + low mood or high tension
  if (wakes >= 3 || (wakes >= 2 && (mood <= 2 || social === 'high'))) {
    return MORNING_FEEDBACK.fragmented
  }

  // Disrupted: at least one wake + elevated tension or low mood
  if (wakes >= 1 && (tension >= 4 || mood <= 2 || social === 'moderate')) {
    return MORNING_FEEDBACK.disrupted
  }

  // Variable: some wakes or middling mood without clear disruption
  if (wakes >= 1 || mood <= 3) {
    return MORNING_FEEDBACK.variable
  }

  // Restorative: no wakes, good mood, low tension
  return MORNING_FEEDBACK.restorative
}


// =============================================================================
// SECTION 7 — getEveningFeedback() FUNCTION
// Drop-in replacement for the existing getEveningFeedback utility.
// =============================================================================

export function getEveningFeedback(eveningMoodScore: number | null): EveningFeedback {
  const score = eveningMoodScore ?? 3
  const clamped = Math.max(1, Math.min(5, Math.round(score))) as EveningMoodLevel
  return EVENING_FEEDBACK[clamped]
}
