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
  // Social demand now wired into morning feedback — closes the gap where
  // sleep-copy.getMorningEnvironmentalNote received social_demand but the
  // title/direction the user actually reads did not. The progress page passes
  // socialDemand state directly to this function.
  socialDemand?: 'low' | 'moderate' | 'high' | null
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

export function getMorningFeedback({ morningMood, tensionScore, wakeScore, socialDemand }: MorningFeedbackParams): FeedbackResult {
  const moodScore = morningMood ?? 3
  const social    = socialDemand ?? 'low'

  // ── BRANCH 1: Compound severe ─────────────────────────────────────────────
  // Low mood + high tension + fragmented sleep, OR social demand compound.
  // Social demand escalates Branch 1 when: high social + wakes >= 2 + mood <= 2.
  // Rationale: high relational load overnight produces identical ANS activation
  // pattern to physical sleep disruption (Dickerson & Kemeny 2004, HPA axis).
  // Threshold: wakeScore >= 3 — PSQI (Buysse 1989) classifies >= 3 awakenings
  // as "quite a problem." Ohayon et al. (2010) Sleep Med Rev N=35,327 confirms
  // >= 3 awakenings associated with significant next-day impairment.
  // Wüst et al. (2000) Psychoneuroendocrinology — flattened CAR in elevated
  // morning tension.
  const compoundSocialLoad = social === 'high' && wakeScore >= 2 && moodScore <= 2
  if ((moodScore <= 2 && tensionScore >= 7 && wakeScore >= 3) || compoundSocialLoad) return {
    title:     "Your Body Did Not Recover Last Night",
    reframe:   "What you are feeling this morning is not a mood state. It is a physiological one. Fragmented sleep alongside elevated somatic tension and low mood on waking describes a nervous system that remained in a low-grade threat state overnight — processing rather than restoring. The cortisol awakening response, which should produce a clean energy arc, is instead arriving into a system that never fully downregulated. This is not a reflection of how hard you tried to sleep. It is a reflection of conditions.",
    direction: "Today asks less of you, not more. Your sleep environment is the priority tonight — not optimisation, but structural protection. Close the doors, draw the curtains, use soft weighted bedding, and switch to warm dim light at least 90 minutes before bed. Do not attempt to compensate for last night through output. The debt does not clear that way."
  }

  // ── BRANCH 2: Low mood + high tension, sleep intact ──────────────────────
  // Elevated waking tension with low mood even without fragmented sleep
  // indicates ANS remained activated overnight. Pruessner et al. (1997) Life
  // Sciences: waking tension is a reliable proxy for overnight sympathetic load.
  if (moodScore <= 2 && tensionScore >= 7) return {
    title:     "You Slept Through, But Not Restfully",
    reframe:   "Sleep continuity is a necessary condition for restoration, but not a sufficient one. Sustained body tension on waking alongside low mood indicates your regulation system remained on alert overnight — processing stress and emotional load rather than clearing it. You slept through the night. Your body did not fully let go.",
    direction: "Work backwards from pre-sleep conditions. Unresolved physical tension in the hour before bed typically originates from temperature discomfort, unresolved mental activity, or the absence of physical grounding. Introduce soft weighted bedding tonight and reduce pre-sleep light exposure to warm-toned sources below 50 lux."
  }

  // ── BRANCH 3: Fragmented sleep (standalone) ───────────────────────────────
  // Wakes >= 3 regardless of mood or tension.
  // Threshold restored to original >= 3: PSQI (Buysse 1989) classifies
  // >= 3 awakenings as "quite a problem" on the gold-standard scale.
  // Ohayon et al. (2010): >= 3 awakenings associated with significant
  // next-day impairment across N=35,327.
  if (wakeScore >= 3) return {
    title:     "Sleep Interruptions Are Worth Investigating",
    reframe:   "Waking three or more times through the night is more reliably an environmental pattern than a personal one. The most common causes are temperature disruption, acoustic inconsistency, and light signals that pull you partially awake without fully waking you. Even when you feel relatively functional this morning, the disruption is still worth addressing — fragmented sleep prevents full progression through the restorative stages your nervous system depends on.",
    direction: "Audit your sleep environment for two variables tonight: ambient temperature and acoustic consistency. The optimal sleep temperature for most adults is 17–19°C. For acoustic disruption, notice whether the waking pattern is tied to a specific time of night and introduce low-level pink or white noise to soften those interruptions."
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
    reframe:   "Somatic tension on waking is not a mood indicator. It is a physiological one — a direct signal of how active your nervous system was overnight. At this level, it reflects incomplete autonomic recovery even when you feel broadly functional. The body is not signalling distress. It is signalling that the overnight restoration window was working against resistance.",
    direction: "This does not require an acute intervention today. What it warrants is attention to your pre-sleep environment tonight. Look at what was present in your sleep space: temperature, acoustic consistency, light sources, and the quality of the hour before you got into bed. One structural condition is almost always the source."
  }

  // ── BRANCH 5: Genuinely good night ───────────────────────────────────────
  // Good mood + low tension + sleep largely uninterrupted.
  // wakeScore <= 1 added: Ohayon et al. (2010) — 2 awakenings is meaningful
  // fragmentation even when subjectively tolerated. The positive label should
  // only fire when sleep was genuinely intact.
  if (moodScore >= 4 && tensionScore <= 3 && wakeScore <= 1) return {
    title:     "A Genuinely Good Night",
    reframe:   "Low body tension and elevated mood on waking are the measurable output of a sleep environment that genuinely supported you overnight. Your morning energy signal is following its natural arc, deep sleep likely proceeded without significant interruption, and your cognitive capacity is arriving at the day from a recovered baseline.",
    direction: "Identify and record what was consistent yesterday evening. Your light habits, temperature, and pre-sleep routine are currently functioning as an aligned system. Protect those conditions — especially during periods of elevated schedule demand, travel, or seasonal light change."
  }

  // ── BRANCH 6: Exhaustion without clear cause ──────────────────────────────
  // moodScore = 1 (Exhausted) with low tension and few wakes.
  // Exhaustion that cannot be attributed to environmental disruption or
  // somatic tension warrants acknowledgement — it may reflect biological
  // load, accumulative fatigue, or a state not yet captured in the logs.
  if (moodScore === 1 && tensionScore <= 4 && wakeScore <= 2) return {
    title:     "Exhausted Without A Clear Environmental Cause",
    reframe:   "Arriving at the morning feeling exhausted without high somatic tension or significant sleep fragmentation is a specific pattern. It often reflects accumulated load across multiple days rather than a single difficult night — the kind of fatigue that builds gradually and arrives without an obvious trigger. Your environment may not be the immediate cause, but it is still the most available lever.",
    direction: "Do not push through the tiredness with stimulation. Keep today's sensory environment low-demand: quieter spaces, warmer light, reduced acoustic load. Log consistently this week — the pattern across several days will be more informative than any single morning entry."
  }

  // ── FALLBACK ──────────────────────────────────────────────────────────────
  return {
    title:     "Nothing Unusual This Morning",
    reframe:   "Your morning readings sit within a neutral functional range today: no acute recovery deficit, no clear environmental signal in either direction. Neutral is not the absence of data. It is the system in maintenance mode — not under significant load, not in peak restoration. The pattern becomes legible over time, not in a single morning.",
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
    reframe:   "Sustained focused work and high social demand activate the same autonomic systems through different pathways — cognitive load through prefrontal depletion and dopamine drawdown, social demand through evaluative processing and HPA axis activation. The fact that you held your mood together through both is a regulatory achievement, not evidence that the cost was low. Your nervous system has been running two parallel load-processing systems all day. The overnight clearing window now has to address both.",
    direction: "Your environment must create a firm boundary tonight. Transition to warm-toned light below 100 lux within the next thirty minutes. Remove yourself from high-stimulation spaces. Do not re-engage with cognitively or socially demanding content this evening. Your body needs the environment to do the heavy lifting tonight — not you."
  }

  // ── BRANCH 2: High cognitive output + low mood ────────────────────────────
  // Sustained output with depleted affect = stress-driven performance pattern.
  // Focus threshold lowered to >= 6 (same evidence base as Branch 1).
  if (focusScore >= 6 && moodScore <= 2) return {
    title:     "A Demanding Day. Recovery Is Non-Negotiable Tonight.",
    reframe:   "Sustained focused output alongside low mood regulation is a recognisable autonomic signature: you maintained performance by drawing on stress-driven energy rather than recovered reserves. The output was real. So is the cost. Your nervous system is arriving at the evening carrying more than the focus score suggests — the overnight clearing window will need to work harder than usual tonight.",
    direction: "Tonight's environment must match today's demand. Transition away from screens and bright overhead light within the next thirty minutes to warm-toned sources below 100 lux. Remove high-stimulation zones from your sightline. Your body needs a firm, unhurried wind-down — not an efficient one."
  }

  // ── BRANCH 3: High cognitive output + stable or good mood ─────────────────
  // Focus threshold lowered to >= 6. A well-regulated high-output day.
  if (focusScore >= 6 && moodScore >= 4) return {
    title:     "A Strong Day. Protect The Close.",
    reframe:   "Sustained focused work across the day without a corresponding drop in mood regulation indicates your environment was supporting your cognitive load rather than competing with it. The question now is not what today cost — it is what tonight's environment does with that state. A well-regulated high-output day can become a poorly recovered one if the evening transition is not deliberate.",
    direction: "Do not coast through the evening without a deliberate close. Shift to warm light, step away from your work zone, and do one low-stimulation activity before preparing for sleep. The transition is the work now."
  }

  // ── BRANCH 4: High social demand + low or zero output ─────────────────────
  // Relational load is an ANS load even when cognitive output is low.
  // A high-demand day that was relationally rather than cognitively expensive.
  // Evidence: Dickerson & Kemeny (2004) Psych Bulletin N=8,452 — evaluative
  // social demand produces largest effect sizes for ANS and HPA activation.
  if (social === 'high' && focusScore <= 3) return {
    title:     "A High-Demand Day That Did Not Look Like One.",
    reframe:   "High social demand activates the autonomic nervous system via the same physiological pathways as sustained cognitive work. Evaluative pressure, emotional labour and relational complexity all result in measurable cortisol and sympathetic responses. A day with low focused output does not necessarily equate to a low-cost day. When the demand is relational, the cost is real, and it is carried by the overnight clearing window regardless of what the focus hours suggest.",
    direction: "The role of your environment tonight is to allow for decompression, rather than recovery from output. Reduce the acoustic and visual complexity of your surroundings. Reduce relational stimulation, including passive social media use. Your nervous system spent today processing people. Give it an evening that asks nothing of it."
  }

  // ── BRANCH 5: Moderate output + low mood ─────────────────────────────────
  // focus=3-5 with moodScore <= 2 — output present but affect depleted.
  // Van Dongen (2003), Lim & Dinges (2010): 3-5h focused work is a
  // meaningful cognitive day. Low mood alongside it = cost not being
  // offset by recovery.
  if (focusScore >= 3 && focusScore <= 5 && moodScore <= 2) return {
    title:     "The Output Was Real. So Is The Cost.",
    reframe:   "A day of moderate cognitive load alongside low mood regulation is a specific pattern: your output did not decrease, but your reserves did. Your nervous system maintained its function while depleting its regulatory reserves. This is an early signal, not a crisis, but it is not neutral either. Your body is telling you something about the rate at which it is spending energy versus restoring it.",
    direction: "Tonight is about consolidation rather than compensation. Avoid high-stimulation activities in the two hours before sleep. Protect your sleep environment: acoustic consistency, temperature and darkness are more important tonight than on an average day. Making one structural improvement to your sleep conditions this week will change this pattern more reliably than any effort-based response."
  }

  // ── BRANCH 6: Low focus + low mood ───────────────────────────────────────
  // Both attentional and affective capacity constrained — environmental lens.
  if (focusScore <= 2 && moodScore <= 2) return {
    title:     "Low Focus Today Is Not About You. Let Us Examine Your Space.",
    reframe:   "When your attention feels constrained despite your best efforts, you may be tempted to attribute it to a lack of discipline or motivation. A more precise reading, particularly when mood and focus drop together, is environmental: your surroundings did not provide the sensory conditions required for sustained cognitive engagement. Your nervous system was allocating its processing capacity to the environment rather than to your work.",
    direction: "Do not attempt to catch up on sleep tonight. Identify one controllable sensory variable in your main area such as noise, light quality or visual clutter, and focus on addressing only that. One intentional environmental change will be more beneficial for tomorrow than any amount of effort tonight."
  }

  // ── FALLBACK ──────────────────────────────────────────────────────────────
  return {
    title:     "A Steady Day. Keep The Transition Intentional.",
    reframe:   "Both output and mood regulation have remained within a functional range today, making it neither a high-cost performance day nor a low-capacity one. In this context, the evening's role is not to recover from a deficit, but to maintain the baseline that your system is already holding.",
    direction: "Move away from high-stimulation areas within the next hour. Your evening routine does not need to be elaborate; it just needs to be consistent. A reliable pre-sleep routine has a cumulative effect: your body learns to start winding down in response to environmental cues even before you are consciously aware of them."
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
        "Each entry adds a signal. The pattern emerges from consistency rather than from any single day's reading."
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
        `Across fourteen days, your morning mood has averaged ${avgMood.toFixed(1)} out of 5, somatic tension ${avgTension.toFixed(1)} out of 10, and sleep interruptions ${avgWakes.toFixed(1)} per night. The figures are not accidental. They are the quantifiable result of an environment performing its function.`,
        'Having a regulated pattern at this level means that your sensory conditions, sleep ecology and spatial habits function as a coherent system. Your home absorbs your daily stresses and strains rather than adding to them, returning your body to a workable baseline each morning.',
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
        `Over the last fourteen days, ${highDemandDays} out of 14 were logged as high social demand. High social demand activates the autonomic nervous system through evaluative pressure, emotional labour, and relational complexity; the same physiological pathways as environmental stressors, but with a different origin.`,
        `Your tension average of ${avgTension.toFixed(1)} and mood average of ${avgMood.toFixed(1)} are reflecting this load. The friction is not coming from your space. While your home can reduce the cost of what the day produces, it cannot undo what continues to arrive relationally.`,
        "The intervention is not spatial. It has two parts: managing the volume and nature of high-demand engagement where possible and deliberately using your lowest-friction space for decompression. Right now, your environment's role is to reduce the metabolic cost of processing, not to address the source."
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
        `Over fourteen days, you have averaged ${avgWakes.toFixed(1)} wake events per night alongside a somatic tension score of ${avgTension.toFixed(1)} on waking. Together, these two signals describe a recovery pattern that does not resolve overnight. Your body wakes up each morning already carrying a load from the previous day.`,
        'Interrupted sleep prevents the body from progressing fully through the deep and REM stages, which clear cortisol, consolidate emotional memory and restore autonomic balance. The result is not just tiredness; it is an impaired ability to regulate that builds up over time.',
        'The primary lever here is the sleep environment: acoustic conditions after 9 pm, evening lux levels, bedroom temperature and the sensory complexity of the space you move through in the final hour before sleep. Even a small change to your most problematic sleep variable will have a significant impact.'
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
        `Fourteen days of sustained cognitive output averaging ${avgFocus.toFixed(1)} focused hours alongside consistently low mood regulation at ${avgMood.toFixed(1)} out of 5 carries a specific signature. Your body is maintaining performance through stress-driven energy rather than from a genuinely recovered baseline.`,
        'This is a viable short-term strategy. It is not a stable one. The early indicators are present in your data now: low mood despite functional output, tension that does not fully clear overnight, a narrowing of the floor the system is borrowing from.',
        'What is required is a clear separation between your work and rest zones, and a deliberate evening transition that your nervous system can recognise. The environment needs to change clearly enough to send your body an unambiguous signal to wind down.'
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
        'If tension remains consistently high upon waking, it suggests that the body has not fully recovered overnight. When focus is constrained despite intention, the sensory conditions of the daytime environment are creating resistance. The discrepancy between your actual and perceived capabilities is environmental in origin.',
        'The two interventions with the greatest impact on this profile are your sleep ecology: acoustic conditions, evening light and thermal comfort and the sensory load of your primary daytime environment. Making targeted changes to either of these will reduce the toll taken on your body before you start work.'
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
        `Over fourteen days, ${totalDemandDays} were logged as moderate or high social demand. Alongside a mood average of ${avgMood.toFixed(1)}, this pattern suggests that your nervous system is unable to fully clear a relational load overnight, even when your environment is structurally sound.`,
        'This is neither a spatial nor a personal problem. Sustained social and cognitive demands over several days activate the same autonomic systems as environmental stressors. If this load arrives each evening without adequate time to decompress, the overnight clearing window cannot complete its work.',
        'The appropriate response is twofold: where possible, reduce the amount of high-demand social engagement during the week and set aside time each evening to relax in your least stimulating space. While your environment can support this, it cannot substitute for it.'
      ]
    }
  }

  // ── PATTERN 7: Variable / inconclusive ───────────────────────────────
  // Signals present but no dominant pattern. Genuine variability.
  return {
    ready: true,
    title: 'Your Pattern Is Present. It Is Not Yet Directional.',
    paragraphs: [
      'Fourteen days of data have been analysed. The results show genuine variability across mood, tension, focus and social load, with no consistent trend in any one direction. This is meaningful in itself.',
      'Variable patterns usually suggest that the nervous system is responding to changing conditions rather than a fixed structural issue. The load is not coming from one persistent source. It is distributed and moving, so no single environmental intervention will resolve it.',
      'Continue logging consistently. The pattern will become clearer as conditions stabilise or one domain begins to dominate. For now, reduce unnecessary sensory friction across all domains, protect sleep ecology and allow the data to accumulate. The signal will emerge.'
    ]
  }
}
