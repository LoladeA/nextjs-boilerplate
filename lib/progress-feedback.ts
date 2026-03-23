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

  // ── BRANCH 1: Compound severe ─────────────────────────────────────────────
  // Low mood + high tension + fragmented sleep.
  // Threshold: wakeScore >= 3 — PSQI (Buysse 1989) classifies >= 3 awakenings
  // as "quite a problem." Ohayon et al. (2010) Sleep Med Rev N=35,327 confirms
  // >= 3 awakenings associated with significant next-day impairment.
  // Wüst et al. (2000) Psychoneuroendocrinology — flattened CAR in elevated
  // morning tension.
  if (moodScore <= 2 && tensionScore >= 7 && wakeScore >= 3) return {
    title:     "You Slept, But Your Body Didn't Fully Recover",
    reframe:   "Three or more wake events alongside high somatic tension and low mood on rising is a specific stress pattern — not a reflection of how well you slept in a subjective sense, but of how much biological work your system was required to do overnight. Fragmented sleep prevents full progression through deep and dream sleep, leaving stress hormones elevated and your body already on alert before the day begins.",
    direction: "Your sleep environment is the priority, not optimisation, but structural protection. Tonight, close the doors and draw the curtains. Use soft, weighted bedding and switch to a warm, dim light source at least 90 minutes before bedtime. Do not try to make up for last night by overdoing it today. Your body needs less to be asked of it today, not more."
  }

  // ── BRANCH 2: Low mood + high tension, sleep intact ──────────────────────
  // Elevated waking tension with low mood even without fragmented sleep
  // indicates ANS remained activated overnight. Pruessner et al. (1997) Life
  // Sciences: waking tension is a reliable proxy for overnight sympathetic load.
  if (moodScore <= 2 && tensionScore >= 7) return {
    title:     "You Slept Through, But Not Restfully",
    reframe:   "Sleep continuity is a necessary condition for restoration, but it is not sufficient. Sustained body tension on waking, alongside low mood, indicates that your body's regulation system remained on alert overnight. Without your body's calm-down response needed for deep sleep, you continue processing stress and emotional load rather than clearing it. You slept through the night. Your body may not have fully let go.",
    direction: "Work backwards from pre-sleep conditions. Unresolved physical tension in the hour before bed often reflects temperature discomfort, unresolved mental activity, or lack of physical grounding. Introduce soft weighted bedding tonight and reduce pre-sleep light exposure to warm-toned sources below 50 lux."
  }

  // ── BRANCH 3: Fragmented sleep (standalone) ───────────────────────────────
  // Wakes >= 3 regardless of mood or tension.
  // Threshold restored to original >= 3: PSQI (Buysse 1989) classifies
  // >= 3 awakenings as "quite a problem" on the gold-standard scale.
  // Ohayon et al. (2010): >= 3 awakenings associated with significant
  // next-day impairment across N=35,327.
  if (wakeScore >= 3) return {
    title:     "Sleep Interruptions Are Worth Investigating",
    reframe:   "Waking three or more times through the night often reflects an environmental pattern rather than a personal one. Common contributors include temperature shifts, acoustic inconsistency, and light signals that partially activate the brain. Even when you feel relatively functional this morning, the disruption is still meaningful, as fragmented sleep can limit full progression through restorative stages.",
    direction: "Audit your sleep environment for two variables tonight: ambient temperature and acoustic consistency. The optimal sleep temperature for most adults is typically around 17–19°C. Notice whether waking patterns cluster at certain times and consider introducing low-level pink or white noise."
  }

  // ── BRANCH 4: Elevated tension, neutral mood ──────────────────────────────
  // tensionScore >= 5 with neutral or low mood, sleep largely intact.
  // This is the silent accumulative load pattern — the user does not feel
  // bad enough to register it, but waking tension at this level reflects
  // incomplete ANS recovery regardless of subjective state.
  // Evidence: Pruessner et al. (1997); Wüst et al. (2000) — morning tension
  // correlates with flattened CAR independent of mood report.
  if (tensionScore >= 5 && moodScore <= 3) return {
    title:     "Your Body Is Carrying More Than You Are Registering",
    reframe:   "Somatic tension on waking is not primarily a mood indicator. It is a physiological signal often reflecting how active your nervous system remained overnight. At this level, it can suggest incomplete autonomic recovery even when you feel broadly functional. The body is not signalling distress. It is signalling that restoration may have occurred under some resistance.",
    direction: "This does not require an acute intervention today. What it warrants is attention to your pre-sleep environment tonight. Look at temperature, acoustic consistency, light sources, and the quality of the hour before bed. One structural condition is often the primary contributor."
  }

  // ── BRANCH 5: Genuinely good night ───────────────────────────────────────
  // Good mood + low tension + sleep largely uninterrupted.
  // wakeScore <= 1 added: Ohayon et al. (2010) — 2 awakenings is meaningful
  // fragmentation even when subjectively tolerated. The positive label should
  // only fire when sleep was genuinely intact.
  if (moodScore >= 4 && tensionScore <= 3 && wakeScore <= 1) return {
    title:     "A Genuinely Good Night",
    reframe:   "Low body tension and elevated mood on waking are the measurable output of a sleep environment that genuinely supported you overnight. our morning energy signal appears to be following a natural arc, and your system is likely arriving from a relatively recovered baseline.",
    direction: "Identify and record what was consistent yesterday evening. Your light habits, temperature, and pre-sleep routine are currently functioning as an aligned system. Protect those conditions, especially during periods of elevated schedule demand, travel, or seasonal light change."
  }

  // ── BRANCH 6: Exhaustion without clear cause ──────────────────────────────
  // moodScore = 1 (Exhausted) with low tension and few wakes.
  // Exhaustion that cannot be attributed to environmental disruption or
  // somatic tension warrants acknowledgement — it may reflect biological
  // load, accumulative fatigue, or a state not yet captured in the logs.
  if (moodScore === 1 && tensionScore <= 4 && wakeScore <= 2) return {
    title:     "Exhausted Without A Clear Environmental Cause",
    reframe:   "Arriving at the morning feeling exhausted without high somatic tension or significant sleep fragmentation suggests a pattern that often reflects accumulated load across multiple days rather than a single night. The environment may not be the sole driver, but it remains the most accessible lever.",
    direction: "Do not push through the tiredness with stimulation. Keep today's sensory environment low-demand: quieter spaces, warmer light, reduced acoustic load. Log consistently this week. The pattern across several days will be more informative than any single morning entry."
  }

  // ── FALLBACK ──────────────────────────────────────────────────────────────
  return {
    title:     "Nothing Unusual This Morning",
    reframe:   "Your morning readings sit within a neutral functional range today. Neutral is not the absence of data, it suggests the system is in maintenance mode, without a strong directional signal. The pattern becomes clearer over time rather than from a single entry.",
    direction: "Log your environmental readings accurately: light levels, sounds, and sleep conditions. No acute intervention is required today. Use this session to build the baseline your fourteen-day synthesis will draw from."
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// EVENING FEEDBACK ENGINE
// ─────────────────────────────────────────────────────────────────────────────

export function getEveningFeedback({ focusScore, eveningMood, socialDemand }: EveningFeedbackParams): FeedbackResult {
  const moodScore = eveningMood ?? 3
  const social    = socialDemand ?? 'low'

  // ── BRANCH 1: High cognitive output + high social demand ──────────────────
  // Two parallel ANS loads. Fires first — mood cannot mask this combination.
  // Focus threshold lowered to >= 6: Van Dongen et al. (2003) Sleep shows
  // cognitive performance after 6h sustained effort = 24h sleep deprivation.
  // Lim & Dinges (2010) Ann Rev Psych: sustained attention declines at 4-6h.
  // Dickerson & Kemeny (2004): high social demand produces robust ANS
  // activation independent of cognitive load.
  if (focusScore >= 6 && social === 'high') return {
    title:     "A High-Output, High-Demand Day. Recovery Is Non-Negotiable Tonight.",
    reframe:   "Both sustained focused work and high social demand place a load on the autonomic nervous system, albeit through different pathways: cognitive effort through sustained attentional demand and social engagement through evaluative and relational processing. Maintaining your mood through both suggests strong regulation, not low cost. It is likely that your system is carrying a dual load into the evening.",
    direction: "Your environment must establish a clear boundary tonight. Within the next thirty minutes, transition to warm-toned light below 100 lux. Remove yourself from high-stimulation spaces. Do not engage with cognitively or socially demanding content this evening. Your body needs the environment to take the strain tonight, not you."
  }

  // ── BRANCH 2: High cognitive output + low mood ────────────────────────────
  // Sustained output with depleted affect = stress-driven performance pattern.
  // Focus threshold lowered to >= 6 (same evidence base as Branch 1).
  if (focusScore >= 6 && moodScore <= 2) return {
    title:     "A Demanding Day. Recovery Is Non-Negotiable Tonight.",
    reframe:   "Sustained focused output alongside low mood regulation suggests your system may have relied on stress-driven energy rather than recovered reserves. The output was real, and the cost is likely present even if not immediately obvious.",
    direction: "Tonight's environment must match today's demand. Transition away from screens and bright overhead light within the next thirty minutes to warm-toned sources below 100 lux. Remove high-stimulation zones from your sightline. Your body needs a firm, unhurried wind-down, not an efficient one."
  }

  // ── BRANCH 3: High cognitive output + stable or good mood ─────────────────
  // Focus threshold lowered to >= 6. A well-regulated high-output day.
  if (focusScore >= 6 && moodScore >= 4) return {
    title:     "A Strong Day. Protect The Close.",
    reframe:   "If you were able to maintain a sustained level of focus throughout the day without experiencing a corresponding drop in mood regulation, it suggests that your environment was supporting your cognitive load rather than competing with it. The question now is not what today cost, but what tonight's environment does with that state. A well-regulated, high-output day can turn into a poorly recovered one if the transition into the evening is not deliberate.",
    direction: "Do not coast through the evening without a deliberate close. Shift to warm light, step away from your work zone, and do one low-stimulation activity before preparing for sleep. The transition is the work now."
  }

  // ── BRANCH 4: High social demand + low or zero output ─────────────────────
  // Relational load is an ANS load even when cognitive output is low.
  // A high-demand day that was relationally rather than cognitively expensive.
  // Evidence: Dickerson & Kemeny (2004) Psych Bulletin N=8,452 — evaluative
  // social demand produces largest effect sizes for ANS and HPA activation.
  if (social === 'high' && focusScore <= 3) return {
    title:     "A High-Demand Day That Did Not Look Like One.",
    reframe:   "High social demand can activate the nervous system through evaluative and relational processing. Even with low visible output, the physiological cost may still be present. The day may have been more demanding than it appeared.",
    direction: "Your environment's role tonight is decompression, not recovery from output. Lower the acoustic and visual complexity of your evening space. Reduce relational stimulation, including passive social media. Your nervous system spent today processing people energies. Give it an evening that asks nothing of that system."
  }

  // ── BRANCH 5: Moderate output + low mood ─────────────────────────────────
  // focus=3-5 with moodScore <= 2 — output present but affect depleted.
  // Van Dongen (2003), Lim & Dinges (2010): 3-5h focused work is a
  // meaningful cognitive day. Low mood alongside it = cost not being
  // offset by recovery.
  if (focusScore >= 3 && focusScore <= 5 && moodScore <= 2) return {
    title:     "The Output Was Real. So Is The Cost.",
    reframe:   "Moderate output alongside low mood suggests your system maintained function while drawing on reserves. This is an early signal of imbalance between demand and recovery.",
    direction: "Tonight is for consolidation rather than compensation. Avoid high-stimulation inputs in the final two hours before sleep. Protect the sleep environment: acoustic consistency, temperature, and darkness matter more tonight than on a neutral day. One structural improvement to your sleep conditions this week will change this pattern more reliably than any effort-based response."
  }

  // ── BRANCH 6: Low focus + low mood ───────────────────────────────────────
  // Both attentional and affective capacity constrained — environmental lens.
  if (focusScore <= 2 && moodScore <= 2) return {
    title:     "Low Focus Today Isn't About You. Let's Examine Your Space.",
    reframe:   "When your attention feels limited despite your efforts, you may be inclined to attribute this to a lack of discipline or motivation. A more precise interpretation, particularly when mood and focus decline simultaneously, is environmental: your surroundings did not provide the sensory conditions necessary for sustained cognitive engagement..",
    direction: "Do not attempt to recover through effort or extended hours tonight. Identify one controllable sensory variable in your primary space — noise, light quality, or visual clutter — and address only that. One intentional environmental change will do more for tomorrow than any amount of extended effort tonight."
  }

  // ── FALLBACK ──────────────────────────────────────────────────────────────
  return {
    title:     "A Steady Day. Keep The Transition Intentional.",
    reframe:   "Output and mood regulation have remained within a functional range today. This suggests a relatively stable day without strong directional load. The evening's role in this context is not recovery from deficit but maintenance of the baseline your system is already holding.",
    direction: "Step away from high-stimulation zones within the next hour. Your evening transition does not need to be elaborate, but it needs to be consistent. A reliable pre-sleep routine is cumulative in its effect: your body learns to begin winding down in response to environmental cues before you are consciously aware of them."
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
        "Each entry adds signal. The pattern emerges from consistency, not from any single day's reading."
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
        "The intervention is not spatial. It is two-part: manage the volume and nature of high-demand engagement where possible, and use your lowest-friction space deliberately for decompression. Your environment's role right now is to reduce the metabolic cost of processing, not to address the source."
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
