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

// ─────────────────────────────────────────────────────────────────────────────
// PARAMETER TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface MorningFeedbackParams {
  morningMood:   number | null
  tensionScore:  number
  wakeScore:     number
}

export interface EveningFeedbackParams {
  focusScore:    number
  eveningMood:   number | null
  socialDemand?: 'low' | 'moderate' | 'high' | null
}

export interface MacroSynthesisParams {
  chartLogs: any[]
  // morningBsfi and eveningBsfi removed — getMacroSynthesis computes
  // entirely from 14-day chartLogs history. Today's BSFI state belongs
  // on the daily cards only. Using today's score to title a 14-day
  // synthesis caused the panel to reflect a single day's reading.
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
    direction: "Your sleep environment is the priority, not optimisation, but structural protection. Tonight, close the doors and draw the curtains. Use soft, weighted bedding and switch to a warm, dim light source at least 90 minutes before bedtime. Do not try to make up for last night by overdoing it today. Your body needs less to be asked of it today, not more."
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

export function getEveningFeedback({ focusScore, eveningMood, socialDemand }: EveningFeedbackParams): FeedbackResult {
  const moodScore = eveningMood ?? 3
  const social    = socialDemand ?? 'low'

  // Compound load: high cognitive output + high social demand
  // Fires before all other branches — mood cannot mask this combination.
  // Restored after being inadvertently removed during synthesis rebuild.
  if (focusScore >= 8 && social === 'high') return {
    title:     "A High-Output, High-Demand Day. Recovery Is Non-Negotiable Tonight.",
    reframe:   "Sustained deep work and high social demand activate the same autonomic systems through different pathways — cognitive load through prefrontal depletion, social demand through interpersonal processing and HPA axis activation. Holding your mood together through both is a regulatory achievement, not evidence that the cost was low. Your nervous system has been running on two parallel loads all day. The overnight clearing window now has to process both.",
    direction: "Your environment must create a firm boundary tonight. Transition to warm-toned light below 100 lux within the next thirty minutes. Remove yourself from high-stimulation spaces. Do not re-engage with cognitively or socially demanding content. Your body needs the environment to do the heavy lifting tonight — not you."
  }

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

export function getMacroSynthesis({ chartLogs }: MacroSynthesisParams): MacroSynthesisResult {

  // ── Building state ─────────────────────────────────────────────────────
  if (chartLogs.length < 14) {
    return {
      ready:      false,
      title:      'Still Gathering Data',
      paragraphs: [
        `${Math.max(0, 14 - chartLogs.length)} more ${14 - chartLogs.length === 1 ? 'day' : 'days'} of logs before your pattern becomes readable.`,
        'Each entry adds signal. The pattern emerges from consistency, not from any single days reading.'
      ]
    }
  }

  // ── 14-day signal aggregation ───────────────────────────────────────────
  //
  // All five signals computed from the 14-day chartLogs window.
  // No external state. No today's BSFI. No shortcuts.
  //
  // Signal definitions:
  //   avgMood         — average morning mood (1–5 scale)
  //   avgTension      — average somatic tension on waking (0–10 scale)
  //   avgFocus        — average focused work hours (0–12)
  //   avgWakes        — average nightly wake events
  //   highDemandDays  — count of days logged as high social demand
  //   moderateDemandDays — count of days logged as moderate social demand
  //
  // Pattern classification fires in priority order. The first match wins.
  // Priority: regulated → relational → sleep → output/recovery → environmental → variable
  // ─────────────────────────────────────────────────────────────────────────

  const n = chartLogs.length

  const avgMood    = chartLogs.reduce((s, l) => s + (l.mood    || 0), 0) / n
  const avgTension = chartLogs.reduce((s, l) => s + (l.tension || 0), 0) / n
  const avgFocus   = chartLogs.reduce((s, l) => s + (l.focus   || 0), 0) / n
  const avgWakes   = chartLogs.reduce((s, l) => s + (l.wakes   || 0), 0) / n

  const highDemandDays     = chartLogs.filter(l => l.socialDemand === 'high').length
  const moderateDemandDays = chartLogs.filter(l => l.socialDemand === 'moderate').length
  const totalDemandDays    = highDemandDays + moderateDemandDays

  // ── PATTERN 1: Regulated ──────────────────────────────────────────────
  // Mood is stable, tension is low, sleep is largely uninterrupted.
  // The environment is absorbing load rather than generating it.
  if (avgMood >= 3.5 && avgTension <= 4 && avgWakes <= 1.2) {
    return {
      ready: true,
      title: 'Your Home Is Working For You',
      paragraphs: [
        `Across fourteen days, your morning mood has averaged ${avgMood.toFixed(1)} out of 5, somatic tension ${avgTension.toFixed(1)} out of 10, and sleep interruptions ${avgWakes.toFixed(1)} per night. These are not accident figures — they are the measurable output of an environment that is doing its job.`,
        'A regulated pattern at this level means your sensory conditions, sleep ecology, and spatial habits are functioning as a coherent system. Your home is absorbing daily load rather than adding to it, and returning your body to a workable baseline each morning.',
        'The task now is not to improve but to understand precisely what is producing this. Document the specific habits and conditions so you can replicate them accurately when elevated stress, travel, or seasonal change puts pressure on the baseline.'
      ]
    }
  }

  // ── PATTERN 2: Relational load dominant ──────────────────────────────
  // High social demand on 5+ days signals relational load as the primary
  // source — distinct from environmental friction, requires a different response.
  if (highDemandDays >= 5) {
    return {
      ready: true,
      title: 'Your Environment Is Stable. Your Relational Load Is Not.',
      paragraphs: [
        `Over the last fourteen days, ${highDemandDays} out of 14 were logged as high social demand. High social demand activates the autonomic nervous system through evaluative pressure, emotional labour, and relational complexity — the same physiological pathways as environmental stressors, but with a different origin.`,
        `Your tension average of ${avgTension.toFixed(1)} and mood average of ${avgMood.toFixed(1)} are reflecting this load. The friction is not coming from your space. Your home can reduce the cost of what the day produces, but it cannot undo what continues to arrive relationally.`,
        'The intervention is not spatial. It is two-part: manage the volume and nature of high-demand engagement where possible, and use your lowest-friction space deliberately for decompression. Your environment's role right now is to reduce the metabolic cost of processing, not to address the source.'
      ]
    }
  }

  // ── PATTERN 3: Sleep disruption dominant ─────────────────────────────
  // Elevated wakes alongside tension signals a recovery failure pattern.
  // Sleep ecology is the primary addressable lever.
  if (avgWakes >= 2 && avgTension >= 5) {
    return {
      ready: true,
      title: 'Disrupted Sleep Is The Primary Source Of Friction',
      paragraphs: [
        `Over fourteen days, you have averaged ${avgWakes.toFixed(1)} wake events per night alongside a somatic tension score of ${avgTension.toFixed(1)} on waking. These two signals together describe a recovery pattern that is not completing overnight. Your body is arriving at each morning already carrying load from the previous day.`,
        'Interrupted sleep prevents full progression through the deep and REM stages that clear cortisol, consolidate emotional memory, and restore autonomic balance. The result is not simply tiredness — it is a narrowed capacity for regulation that accumulates across days.',
        'The sleep environment is the primary lever here: acoustic conditions after 9pm, evening lux levels, bedroom temperature, and the sensory complexity of the space you move through in the final hour before sleep. One precise change in your highest-friction sleep variable will produce a disproportionate return.'
      ]
    }
  }

  // ── PATTERN 4: High output, low recovery ─────────────────────────────
  // Performance is sustained but mood regulation is low — stress-driven output.
  if (avgFocus >= 7 && avgMood <= 2.5) {
    return {
      ready: true,
      title: 'Strong Output. Diminishing Reserves.',
      paragraphs: [
        `Fourteen days of sustained cognitive output — averaging ${avgFocus.toFixed(1)} focused hours — alongside consistently low mood regulation at ${avgMood.toFixed(1)} out of 5 carries a specific signature. Your body is maintaining performance through stress-driven energy rather than from a genuinely recovered baseline.`,
        'This is a viable short-term strategy. It is not a stable one. The early indicators are present in your data now — low mood despite functional output, tension that does not fully clear overnight, a narrowing of the floor the system is borrowing from.',
        'What the pattern requires is a structural separation between your work zone and your rest zone, and a deliberate evening transition your nervous system can learn to recognise. The environment needs to change register clearly enough that your body receives an unambiguous wind-down signal.'
      ]
    }
  }

  // ── PATTERN 5: Environmental friction dominant ────────────────────────
  // Tension is high, focus is constrained — space is spending capacity.
  if (avgTension >= 6 && avgFocus <= 4) {
    return {
      ready: true,
      title: 'Your Environment Is Spending Your Capacity Before You Can.',
      paragraphs: [
        `Across fourteen days, somatic tension has averaged ${avgTension.toFixed(1)} out of 10 on waking, and focused output has averaged ${avgFocus.toFixed(1)} hours. This pattern has a structural cause: your environment is generating friction that the nervous system must absorb before the day begins.`,
        'When tension is consistently elevated at waking, the body did not fully recover overnight. When focus is constrained despite intention, the sensory conditions of the daytime space are creating resistance. The gap between how capable you are and how capable you feel is environmental in origin.',
        'The two highest-leverage interventions at this profile are your sleep ecology — acoustic conditions, evening light, and thermal comfort — and the sensory load of your primary daytime environment. A targeted change in either will reduce the cost your body is paying before it reaches the work.'
      ]
    }
  }

  // ── PATTERN 6: Mixed / high social demand + low mood ─────────────────
  // Sustained moderate-to-high relational load affecting baseline.
  if (totalDemandDays >= 8 && avgMood <= 3) {
    return {
      ready: true,
      title: 'Sustained Relational Demand Is Affecting Your Baseline.',
      paragraphs: [
        `Over fourteen days, ${totalDemandDays} were logged as moderate or high social demand. Alongside a mood average of ${avgMood.toFixed(1)}, this pattern suggests your nervous system is carrying a relational load that is not fully clearing overnight — even when your environment is structurally sound.`,
        'This is not a spatial problem and it is not a personal one. Sustained social and cognitive demand across days activates the same autonomic systems as environmental stressors. When that load arrives each evening without adequate decompression time, the overnight clearing window cannot complete its work.',
        'The appropriate response is two-part: where possible, reduce the density of high-demand social engagement during the week, and protect deliberate decompression time in your lowest-stimulation space each evening. Your environment can support this — it cannot substitute for it.'
      ]
    }
  }

  // ── PATTERN 7: Variable / inconclusive ───────────────────────────────
  // Signals present but no dominant pattern. Genuine variability.
  return {
    ready: true,
    title: 'Your Pattern Is Present. It Is Not Yet Directional.',
    paragraphs: [
      'The last fourteen days show significant fluctuation across mood, tension, and focus without a consistent directional pattern. Before locating the source of that variance in your physical environment, it is worth naming what the data cannot distinguish: not all fluctuation is environmental in origin.',
      'Hormonal shifts, periods of heightened emotional or cognitive demand, and natural energy cycles can produce real, measurable changes in tension, sleep quality, focus and mood. These changes are recorded in your logs, regardless of what is happening in your physical space.',
      'Continue logging consistently. The pattern will become clearer as conditions stabilise or one domain begins to lead. For now, reduce unnecessary sensory friction across all domains, protect sleep ecology and continue to accumulate data. The signal will emerge.'
    ]
  }
}
