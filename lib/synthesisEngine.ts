// lib/synthesisEngine.ts

export const getMorningFeedback = (tensionScore: number, wakeScore: number) => {
    if (tensionScore >= 7 && wakeScore >= 3) return {
      title: "The System Was Working Through the Night",
      reframe: "What you felt on waking is not a failure of sleep. It is the trace of active biological labour. Your nervous system was processing accumulated daytime load, navigating hormonal cycles, or responding to sensory intrusion that your sleeping environment did not adequately support or absorb. Your body did what it was designed to do. The environment did not hold it.",
      direction: "The priority is your sleep envelope: absolute darkness, a stable ambient temperature, a robust pre-sleep routine and organic breathable sleepwear that removes thermoregulatory friction from the recovery equation. Reduce what the system has to manage at 2am, and it will spend that energy on restoration instead."
    }
    if (tensionScore >= 7) return {
      title: "You Slept Through, But Your Body Was Bracing Itself",
      reframe: "Continuous sleep is not the same as restorative sleep. When muscular tension persists through the night, it indicates the nervous system remained in a low-grade protective state: bracing against residual stress, uncomfortable materials, inadequate sleep support or acoustic intrusion that never fully resolved. You rested. You did not recover.",
      direction: "Work backwards from the source: unresolved physical tension before bed, the acoustic quality of your sleep environment, and the materials you are sleeping on and in. Each is a variable within your control."
    }
    if (wakeScore >= 3) return {
      title: "Interrupted Sleep Is Often an Environmental Signal",
      reframe: "Waking through the night —particularly if re-entry is relatively easy— is less often a sign of dysregulation than a sign of thermoregulatory shift. Night sweats, hormonal fluctuations, or subtle changes in ambient temperature are among the most common and most overlooked disruptors. Your nervous system is not the problem. Its environment may not be matching its needs.",
      direction: "Focus on the recovery envelope: breathable organic sleepwear, a cooler ambient temperature, and complete darkness. These three variables together reduce the physiological triggers that pull the system up from deep sleep."
    }
    return {
      title: "Environment Held. System Restored",
      reframe: "This is what successful environmental design produces: a night in which your nervous system was not required to manage, defend, or compensate. It simply recovered. That distinction matters: a regulated morning is not luck. It is the result of an environment that absorbed your physical needs and returned you to capacity.",
      direction: "Maintain what is working. Your sensory boundaries, thermal ecology, and evening wind-down pattern are functioning as an eco-system. The task now is to protect them, particularly during periods of higher stress, when the temptation to compromise the environment increases."
    }
  }
  
  export const getEveningFeedback = (focusScore: number) => {
    if (focusScore >= 8) return {
      title: "High Cognitive Output Requires Deliberate Recovery",
      reframe: "Extended time in high-beta execution mode — sustained focus, decision-making, problem-solving — is a central nervous system stressor in the same category as physical exertion. The day was productive. The nervous system is now carrying that cost. Recovery is not optional tonight; it is proportional to output.",
      direction: "Tonight's environment must match today's demand. Transition strictly to warm, low-level lighting. This is not aesthetic preference but a direct instruction to your melatonin pathway. Protect your wind down routine after work with the same intentionality you protect your peak focus window."
    }
    if (focusScore >= 4) return {
      title: "Output Was Balanced. Protect the Transition",
      reframe: "A sustainable ratio of deep work to recovery indicates your environment was supporting your capacity rather than extracting from it. That balance reflects an alignment between your energy curve and your spatial conditions. Your nervous system is not depleted, but transitions matter: how the evening begins determines whether that capacity is replenished or quietly eroded overnight.",
      direction: "Step out of optimisation mode with a deliberate act, not a gradual drift. One small environmental reset, such as clearing the first surface you will see tomorrow morning or closing the workshop moving away from your work zone, signals to the nervous system that the day has ended and the recovery cycle has begun."
    }
    return {
      title: "Low Output Is an Environmental Symptom, Not a Personal One",
      reframe: "When capacity feels constrained despite effort, the instinct is to attribute it to discipline or motivation. That is rarely the case. Constrained cognitive output is most often the product of environmental friction such as visual noise, interruption patterns, inadequate lighting, or a space that does not signal focus clearly enough for the brain to enter and sustain it. The environment set the conditions. You responded to them.",
      direction: "Do not attempt to recover through effort tonight. Instead, remove friction: evaluate the visual noise in your primary spaces, identify what broke your attention during the day, and approach this evening as architectural decompression, the deliberate restoration of the conditions capacity requires."
    }
  }
  
  export const getMacroSynthesis = (chartLogs: any[], bsfiData: any | null) => {
    if (chartLogs.length < 14) {
      return {
        ready: false,
        title: "System Calibrating",
        paragraphs: [
          `Log ${Math.max(0, 14 - chartLogs.length)} more days to generate your biological rhythm synthesis. The engine requires a complete cycle to identify environmental friction patterns.`
        ]
      }
    }
  
    if (chartLogs.length >= 14 && !bsfiData) {
      return {
        ready: false,
        title: "Calibration Complete",
        paragraphs: [
          "You have successfully logged 14 days of baseline data. Log your entry today to trigger the Bio-Spatial Friction engine and reveal your first synthesis."
        ]
      }
    }
  
    if (bsfiData) {
        if (bsfiData.is_internal_driver) {
           return {
              ready: true,
              title: "Environment is Stable. Fluctuation is Internal.",
              paragraphs: [
                "Over the last fourteen days, your somatic tension and focus have shown high variance, but your environmental metrics (light, noise) have remained remarkably stable.",
                "This data signature tells us the friction you are feeling is not coming from your physical space. It is biological or cognitive—such as a period of high emotional demand, cyclical changes, or natural energy rhythms.",
                "The appropriate response to this phase is not spatial optimization. Do not attempt to 'fix' the room today; instead, lower your overall demands and allow your body to move through its natural rhythm without adding extra friction."
              ]
           }
        }
  
        const score = bsfiData.total_score;
        const domain = bsfiData.dominant_domain;
  
        if (score <= 20) {
          return {
            ready: true,
            title: "Low Friction Environment: Regulated Ground",
            paragraphs: [
              "Across the board, your Bio-Spatial Friction Index is exceptionally low. This is the result of an environment that is doing its job: absorbing daily load, supporting overnight recovery, and returning you to capacity.",
              "What this data confirms is that your current environmental conditions are not accidental. Your sensory boundaries, thermal ecology, and recovery architecture are functioning as a coherent system.",
              "The task now is to protect this baseline. Document what is working right now so you can replicate it during periods of elevated stress or seasonal change."
            ]
          }
        }
        
        if (score <= 60) { 
          return {
            ready: true,
            title: `Moderate Strain: ${domain} Dominance`,
            paragraphs: [
              `Your environment is introducing a moderate level of friction, pulling your nervous system out of baseline. The algorithm has identified ${domain} as the primary source of this drain.`,
              "The output you are generating is beginning to happen against resistance, not from reserves. You are spending cognitive capacity just to manage the space.",
              `Target the ${domain} immediately. If it is Acoustic Load, upgrade your buffering. If it is Circadian Friction, audit your evening light exposure. Removing this specific friction point will return you to baseline.`
            ]
          }
        }
  
        return {
          ready: true,
          title: "Dysregulated Load Pattern: System Under Extraction",
          paragraphs: [
             "Your Bio-Spatial Friction Index indicates a high-load, dysregulated pattern. The environment is actively extracting from your capacity before you even begin your day.",
             "Fourteen days of sustained environmental friction alongside lowered mood regulation carries a specific signature: your nervous system is maintaining performance by drawing on sympathetic activation (stress hormones) rather than restorative capacity.",
             "Deploy immediate architectural interventions. You need strict acoustic sealing, absolute darkness for sleep, and a rigid boundary between work and rest zones. Stop optimizing for output and start optimizing for spatial recovery."
          ]
        }
    }
  
    // FALLBACK
    const avgMood = chartLogs.reduce((acc: any, log: any) => acc + log.mood, 0) / chartLogs.length
    const avgTension = chartLogs.reduce((acc: any, log: any) => acc + log.tension, 0) / chartLogs.length
    const avgFocus = chartLogs.reduce((acc: any, log: any) => acc + log.focus, 0) / chartLogs.length
  
    if (avgTension >= 6 && avgFocus <= 4) return {
        ready: true,
        title: "The Environment Is Spending Your Capacity Before You Do",
        paragraphs: [
          "Across the last fourteen days, your somatic cost has remained consistently elevated while cognitive output has stayed constrained. This is a recognisable pattern: the nervous system is absorbing chronic environmental friction—sensory noise, thermal disruption, accumulated overnight load—and arriving at each day already depleted.",
          "The output you are generating is happening against resistance, not from reserves.",
          "This pattern resolves when the environmental source of the drain is identified and reduced. The two most probable contributors are your sleep ecology and the sensory load of your primary daytime spaces. Both are addressable."
        ]
    }
    if (avgFocus >= 6 && avgMood <= 2.5) return {
        ready: true,
        title: "High Output, Borrowed Cost",
        paragraphs: [
          "Fourteen days of sustained cognitive output alongside consistently low mood regulation carries a specific signature: the nervous system is maintaining performance by drawing on sympathetic activation rather than restorative capacity.",
          "This is a viable strategy in the short term. Over time, it erodes the very reserves it is borrowing from.",
          "What this pattern is asking for is not less work. It needs a clear boundary between your work and rest zones, and a firm evening wind-down routine. Your rhythm needs a floor, not a ceiling."
        ]
    }
    if (avgMood >= 4 && avgTension <= 3) return {
        ready: true,
        title: "Fourteen Days of Regulated Ground",
        paragraphs: [
          "Across the board, your somatic tension has remained low and your mood regulation consistently high. This is the result of an environment that is doing its job: absorbing daily load, supporting overnight recovery, and returning you to capacity.",
          "What this data confirms is that your current environmental conditions are not accidental. Your sensory boundaries, thermal ecology, and recovery architecture are functioning as a coherent system.",
          "The task now is to understand what is working precisely enough to protect it, particularly during elevated stress periods, travel, or seasonal change."
        ]
    }
    return {
        ready: true,
        title: "High Variance. No Stable Floor Yet",
        paragraphs: [
          "The last fourteen days show fluctuation across mood, tension, and focus. Before locating the source of that variance in your environment, it is worth naming something the data cannot distinguish: not all fluctuation is environmental.",
          "Hormonal shifts, perimenopause, periods of high relational or emotional demand produce real, measurable changes in energy, sleep quality, focus, and somatic load. Your body is doing precisely what it is designed to do under particular biological conditions.",
          "The appropriate response to those phases is not optimisation. It is accommodation. If your variance aligns with a cyclical or biological pattern, the role of your environment is to reduce the additional friction layered on top of it, so the body can move through its natural rhythm without also managing an environment that is working against it."
        ]
    }
  }
