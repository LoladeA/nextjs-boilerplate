// lib/progress-feedback.ts
//
// Pure feedback and synthesis functions for the daily logs / progress page.
// All state dependencies are passed as explicit parameters — no closures
// over component state. No React. No side effects.
//
// GRAPH SAFETY NOTE:
// These functions do not touch chartLogs data writes or Supabase queries.
// The correlation graph and dashboard mood graph connections are unaffected
// by this extraction. fetchHistory() and chartLogs state remain in the
// main progress page component.

import { getDomainDisplay } from './progress-domains'
import type { BsfiState }   from './progress-domains'

// ─────────────────────────────────────────────────────────────────────────────
// PARAMETER TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface MorningFeedbackParams {
  morningMood:   number | null
  tensionScore:  number
  wakeScore:     number
}

export interface EveningFeedbackParams {
  focusScore:   number
  eveningMood:  number | null
}

export interface MacroSynthesisParams {
  chartLogs:   any[]
  morningBsfi: BsfiState | null
  eveningBsfi: BsfiState | null
}

export interface FeedbackResult {
  title:     string
  reframe:   string
  direction: string
}

export interface MacroSynthesisResult {
  ready:      boolean
  title:      string
  paragraphs: string[]
}

// ─────────────────────────────────────────────────────────────────────────────
// MORNING FEEDBACK ENGINE
// ─────────────────────────────────────────────────────────────────────────────

export function getMorningFeedback({ morningMood, tensionScore, wakeScore }: MorningFeedbackParams): FeedbackResult {
  const moodScore = morningMood ?? 3

  if (moodScore <= 2 && tensionScore >= 7 && wakeScore >= 3) return {
    title:     "You Slept, But Your Body Didn't Fully Recover",
    reframe:   "Three or more wake events alongside high somatic tension and low mood on rising is a specific stress pattern — not a reflection of how well you slept in a subjective sense, but of how much biological work your system was required to do overnight. Fragmented sleep prevents full progression through deep and dream sleep, leaving stress hormones elevated and your body already on alert before the day begins.",
    direction: "Your sleep envelope is the priority — not optimisation, but structural protection. Tonight: close the doors, draw the curtains, use soft weighted bedding, and switch to warm dim light at least 90 minutes before bed. Do not attempt to compensate for last night through output today. Your body needs less asked of it today, not more."
  }

  if (moodScore <= 2 && tensionScore >= 7) return {
    title:     "You Slept Through, But Not Restfully",
    reframe:   "Sleep continuity is a necessary condition for restoration, but it is not sufficient. Sustained body tension on waking, alongside low mood, indicates that your body's regulation system remained on alert overnight. Without your body's calm-down response needed for deep sleep, you continue processing stress and emotional load rather than clearing it. You slept through. Your body did not fully let go.",
    direction: "Work backwards from pre-sleep conditions: unresolved physical tension in the hour before bed typically originates from temperature discomfort, unresolved mental activity, or the absence of physical grounding. Introduce soft, weighted bedding tonight and reduce your pre-sleep light exposure to warm-toned sources below 50 lux."
  }

  if (moodScore >= 3 && wakeScore >= 3) return {
    title:     "Sleep Interruptions Are Worth Investigating",
    reframe:   "Waking three or more times through the night, in the presence of stable mood, is more reliably an environmental pattern than a dysregulation one. The most common causes are temperature disruption and sounds that pull you partially awake without fully waking you. You are coping well with the disruption. The disruption itself is still worth addressing.",
    direction: "Audit your sleep environment for two variables tonight: ambient temperature and acoustic consistency. The ideal sleep temperature for most adults is 17–19°C. For acoustic disruption, notice whether the waking pattern is tied to a specific time and introduce low-level white or pink noise to soften those disruptions."
  }

  if (moodScore >= 4 && tensionScore <= 3) return {
    title:     "A Genuinely Good Night",
    reframe:   "Low body tension and elevated mood on waking are the measurable output of a sleep environment that genuinely supported you overnight. Your natural morning energy signal is following its arc, deep sleep likely proceeded without disruption, and your thinking capacity is arriving at the day fully charged.",
    direction: "Identify and record what was consistent yesterday evening. Your light habits, temperature, and pre-sleep routine are currently functioning as an aligned system. Protect those conditions — especially during periods of elevated schedule demand, travel, or seasonal light change."
  }

  return {
    title:     "Nothing Unusual This Morning",
    reframe:   "Your morning readings sit within a neutral functional range today: no acute recovery deficit, no clear environmental signal in either direction. Neutral is not absence of data. It is the system in maintenance mode: not under significant load, not in peak restoration. The pattern becomes legible over time, not in a single morning.",
    direction: "Log your environmental readings accurately: light levels, sounds, and sleep conditions. No acute intervention is required today. Use this session to build the baseline your fourteen-day synthesis will draw from."
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// EVENING FEEDBACK ENGINE
// ─────────────────────────────────────────────────────────────────────────────

export function getEveningFeedback({ focusScore, eveningMood }: EveningFeedbackParams): FeedbackResult {
  const moodScore = eveningMood ?? 3

  if (focusScore >= 8 && moodScore <= 2) return {
    title:     "A Demanding Day. Recovery Is Non-Negotiable Tonight",
    reframe:   "Extended deep work alongside low mood regulation is a recognisable autonomic signature: you sustained performance by drawing on stress-driven energy rather than actual reserves. The output was real. So is the cost. Your brain's overnight emotional processing is carrying a heavier load into sleep than your focus score would suggest.",
    direction: "Tonight's environment must match today's demand. Transition away from screens and bright overhead light within the next thirty minutes to warm-toned sources below 100 lux only. Remove high-stimulation zones from your evening sightline. Your body needs a firm, unhurried wind-down tonight."
  }

  if (focusScore >= 8 && moodScore >= 4) return {
    title:     "A Great Day. Protect the Close",
    reframe:   "Deep work sustained across the day without a corresponding drop in mood regulation indicates that your environment was supporting your cognitive load rather than extracting from it. The question now is not what today cost — it is what tonight's environment does with that state.",
    direction: "Do not coast through the evening without a deliberate transition. Make a deliberate close: shift to warm light, step away from your work zone, and do one low-stimulation activity before you prepare for sleep."
  }

  if (focusScore <= 2 && moodScore <= 2) return {
    title:     "Low Focus Today Isn't About You. Let's Examine Your Space",
    reframe:   "When attentional capacity feels constrained despite effort, the instinct is to attribute it to discipline or motivation. The more precise reading — particularly when mood and focus drop together — is environmental: your space was not providing the sensory conditions required for sustained cognitive engagement.",
    direction: "Do not attempt to recover through effort or extended hours tonight. Identify one controllable sensory variable in your primary space — noise, light quality, or visual clutter — and address only that. One intentional environmental change will do more for tomorrow than any amount of extra effort tonight."
  }

  return {
    title:     "A Steady Day. Keep The Transition Intentional",
    reframe:   "Output and mood regulation have remained within a functional range today: neither a high-cost performance day nor a low-capacity one. The evening's role in this context is not recovery from deficit, but maintenance of the baseline your system is already holding.",
    direction: "Step away from high-stimulation zones within the next hour. Your evening transition does not need to be elaborate — it needs to be consistent. A reliable pre-sleep routine is cumulative in its effect: your body learns to begin winding down in response to environmental cues before you are even consciously aware of them."
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 14-DAY MACRO SYNTHESIS
//
// Requires chartLogs (14-day history) and the current BSFI state objects.
// Returns a ready flag, title, and paragraphs array for the UI.
//
// GRAPH SAFETY: chartLogs is passed in as a parameter — this function
// does not fetch or mutate any data. The graph connection in the main
// component is completely unaffected.
// ─────────────────────────────────────────────────────────────────────────────

export function getMacroSynthesis({ chartLogs, morningBsfi, eveningBsfi }: MacroSynthesisParams): MacroSynthesisResult {

  if (chartLogs.length < 14) {
    return {
      ready:      false,
      title:      "Still Gathering Data",
      paragraphs: [`${Math.max(0, 14 - chartLogs.length)} days of logs remaining before your pattern is readable.`]
    }
  }

  const bsfiRef = morningBsfi || eveningBsfi

  if (bsfiRef) {
    if (bsfiRef.is_internal_driver) {
      return {
        ready: true,
        title: "Your Environment Is Stable. What You're Feeling Is Coming From Inside.",
        paragraphs: [
          "Over the last fourteen days, your somatic tension and mood have shown significant variance, but your measured environmental conditions have remained largely consistent.",
          "This data signature has a specific meaning: the primary source of friction right now is not your physical space. Biological fluctuations — cyclical hormonal shifts, periods of elevated emotional demand, accumulated stress — produce real, measurable changes in tension, sleep quality, focus, and mood that register in your logs independently of what your space is doing.",
          "The appropriate response to this phase is accommodation, not optimisation. Ask your environment to do one thing: reduce the additional friction layered on top of an already-demanding internal state. Quieter, warmer, simpler."
        ]
      }
    }

    const score  = bsfiRef.total_score
    const domain = bsfiRef.dominant_domain

    if (score <= 20) return {
      ready: true,
      title: "Your Home Is Supporting You",
      paragraphs: [
        "Across fourteen days, your Bio-Spatial Friction Index has remained exceptionally low. Your home is doing precisely what it should: absorbing daily sensory load, supporting overnight recovery, and returning your body to a settled baseline each morning.",
        "What this data confirms is that your current sensory conditions are not accidental. Your light habits, acoustic boundaries, sleep ecology, and spatial practices are functioning as a coherent, mutually reinforcing system.",
        "The task now is protection, not improvement. Document the specific conditions that are producing this baseline in sufficient detail that you can replicate them accurately during periods of elevated stress, travel, or seasonal change."
      ]
    }

    if (score <= 60) return {
      ready: true,
      title: `Moderate Friction: ${getDomainDisplay(domain).label} Is The Primary Source`,
      paragraphs: [
        `Over the last fourteen days, your home environment has been introducing a moderate but consistent level of friction. ${getDomainDisplay(domain).label} is the source generating the greatest sustained demand. This is where the leverage is.`,
        "The output you are producing is beginning to happen against environmental resistance rather than from regulated reserves. At moderate friction levels, this distinction is easy to miss. Performance remains intact while the underlying cost accumulates.",
        `Address ${getDomainDisplay(domain).label} this week as a priority. A targeted change in your highest-friction area will produce a disproportionate return, reducing the load on every other area simultaneously.`
      ]
    }

    return {
      ready: true,
      title: "High Friction Across The Board. Your Environment Needs Attention",
      paragraphs: [
        "Your fourteen-day pattern indicates a high-load, dysregulated environmental pattern. Across light timing, sound, spatial clarity, and overnight recovery, your home is generating friction that arrives before your day begins.",
        "Sustained multi-domain environmental friction at this level carries a specific physiological signature: your body shifts into a low-level stress state, running on stress-fuelled performance rather than restored capacity. The reserves that sustain that are finite.",
        "Stop optimising for output. Start optimising for environmental recovery. Three priorities in order: close and soften your sleep environment acoustically, enforce a warm dim light boundary after 8pm, and clear one low-stimulation space you can access easily during the day."
      ]
    }
  }

  const avgMood    = chartLogs.reduce((acc, log) => acc + log.mood,    0) / (chartLogs.length || 1)
  const avgTension = chartLogs.reduce((acc, log) => acc + log.tension, 0) / (chartLogs.length || 1)
  const avgFocus   = chartLogs.reduce((acc, log) => acc + log.focus,   0) / (chartLogs.length || 1)

  if (avgTension >= 6 && avgFocus <= 4) return {
    ready: true,
    title: "Your Home Is Draining You Before The Day Begins",
    paragraphs: [
      "Fourteen days of consistently elevated somatic tension alongside constrained cognitive output describes a recognisable pattern: your body is absorbing sustained environmental friction and arriving at each day already partially depleted.",
      "At this pattern level, the gap between how capable you are and how capable you feel is environmental in origin. Your home is spending your capacity before you have the chance to direct it.",
      "The two most probable friction sources at this profile are your sleep ecology and the sensory load of your primary daytime environment. Both are structurally addressable."
    ]
  }

  if (avgFocus >= 6 && avgMood <= 2.5) return {
    ready: true,
    title: "Strong Output, But Your Reserves Are Being Used Up",
    paragraphs: [
      "Fourteen days of sustained cognitive output alongside consistently low mood regulation carries a specific autonomic signature: your body is maintaining performance through stress-driven energy rather than from a genuinely recovered baseline.",
      "This is a viable short-term strategy. Over weeks and months, it progressively narrows the floor it is borrowing from. The early indicators are already present in your data.",
      "What this pattern requires is a firm boundary between your work zone and your rest zone, and a deliberate evening transition that your body can begin to recognise as a signal to wind down."
    ]
  }

  if (avgMood >= 4 && avgTension <= 3) return {
    ready: true,
    title: "Fourteen Days of A Regulated Home",
    paragraphs: [
      "Across fourteen days, your somatic tension has remained consistently low and your mood regulation consistently high. This is the measurable output of a home that is absorbing daily load, supporting overnight recovery, and returning your body to a settled baseline each morning.",
      "What the data confirms is that your current environmental conditions are not accidental. Your sensory practices, thermal ecology, sleep habits, and spatial routines are functioning as a coherent, mutually reinforcing system.",
      "The task now is to understand what is working precisely enough to protect it — particularly during elevated stress periods, travel, or seasonal light change."
    ]
  }

  return {
    ready: true,
    title: "Your Pattern Is Present. It Is Not Yet Directional",
    paragraphs: [
      "The last fourteen days show significant fluctuation across mood, tension, and focus without a consistent directional pattern. Before locating the source of that variance in your physical environment, it is worth naming what the data cannot distinguish: not all fluctuation is environmental in origin.",
      "Hormonal shifts, periods of elevated relational or cognitive demand, and natural energy cycles produce real, measurable changes in tension, sleep quality, focus, and mood: changes that register in your logs independently of what your physical space is doing.",
      "Continue logging consistently. The pattern will sharpen as the conditions stabilise or as one domain begins to lead. What the engine is looking for is repetition such as the same friction appearing across multiple days. That signal will emerge."
    ]
  }
}
