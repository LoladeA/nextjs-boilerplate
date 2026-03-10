// =============================================================================
// PROTOCOLS : The Sentient Home
// =============================================================================
//
// CHANGE LOG (this version):
//
//   NINE-VARIANT ARCHITECTURE
//   Previous version: 3 variants per ritual (anchor / seeker / sensor)
//   This version:     9 variants per ritual : threshold × integration pattern
//
//   Keys follow the pattern: {threshold}_{integrationPattern}
//   e.g. sensor_integrative, sensor_mixed, sensor_accumulative
//        seeker_integrative, seeker_mixed, seeker_accumulative
//        anchor_integrative, anchor_mixed, anchor_accumulative
//
//   RitualsInterface resolves the correct variant using:
//     `${profile}_${integrationPattern}`
//   falling back to `${profile}_integrative` when integrationPattern
//   is not available (users who completed the assessment before the
//   integration questions were added).
//
//   RATIONALE
//   A Sensor Accumulative and a Sensor Integrative share a threshold trait
//   but require genuinely different protocols. The accumulative pattern means
//   prior-day residue is present at the start of every ritual window. Step
//   durations are longer, containment requirements are higher, and the framing
//   shifts from managing current sensitivity to managing carried load.
//   Option B (overlay notes) was evaluated and rejected: the step instructions
//   themselves change, not just the framing. Six rituals x 9 profiles = 54
//   variant blocks.
//
// =============================================================================

export type TimeOfDay   = 'morning' | 'afternoon' | 'evening'
export type StressLevel = 'low' | 'medium' | 'high'
export type SensoryProfile    = 'anchor' | 'seeker' | 'sensor'
export type IntegrationVariant = 'integrative' | 'mixed' | 'accumulative'
export type RitualProfileKey =
  | 'sensor_integrative' | 'sensor_mixed' | 'sensor_accumulative'
  | 'seeker_integrative' | 'seeker_mixed' | 'seeker_accumulative'
  | 'anchor_integrative' | 'anchor_mixed' | 'anchor_accumulative'

export type SensoryAction = {
  type:         'light' | 'sound' | 'space' | 'somatic'
  label:        string
  instruction:  string
  duration?:    string
  toolLink?:    string
  spotifyLink?: string
}

export type RitualVariant = {
  tagline:      string
  description:  string
  spotifyLink?: string
  toolLink?:    string
  steps:        SensoryAction[]
}

export type Ritual = {
  id:               string
  name:             string
  triggerCondition: string
  variants:         Record<RitualProfileKey, RitualVariant>
}

// Helper: resolve the correct variant from a profile + integration pattern.
// Falls back to the integrative variant if the integration pattern is unknown.
export function resolveRitualVariant(
  ritual:             Ritual,
  profile:            SensoryProfile,
  integrationPattern: IntegrationVariant = 'integrative'
): RitualVariant {
  const key = `${profile}_${integrationPattern}` as RitualProfileKey
  return ritual.variants[key] ?? ritual.variants[`${profile}_integrative` as RitualProfileKey]
}


export const RITUALS: Record<string, Ritual> = {

  // ===========================================================================
  // MORNING ACTIVATION : Low / Medium Load
  // ===========================================================================

  'morning-activation': {
    id:               'morning-activation',
    name:             'First Light Rhythm',
    triggerCondition: 'Morning + Low Energy',
    variants: {

      // -----------------------------------------------------------------------
      sensor_integrative: {
        tagline:     'The Gentle Ascent: Waking Without Overwhelm.',
        description: 'For the highly sensitive system, the standard alarm-and-blast morning routine is assaultive, triggering an immediate cortisol spike that registers as anxiety. Your protocol prioritises a Soft Start: titrating sensory input slowly so your nervous system comes online without tripping the threat-detection wires. When recovery conditions were adequate overnight, your system arrives ready to use a gentle morning well.',
        spotifyLink: 'https://open.spotify.com/playlist/37i9dQZF1DZ06evO1A8iR2?si=fefd25a5476e4952',
        steps: [
          {
            type: 'light',
            label: 'Indirect Illumination',
            instruction: 'Do not open curtains immediately. Sit near a window but out of direct glare. Let light reach your eyes indirectly first, allowing your pupils to adjust without strain.',
            duration: '20 min'
          },
          {
            type: 'somatic',
            label: 'Thermal Comfort',
            instruction: 'Drink warm water. Keep a robe or blanket on. Thermal shock drains your battery rapidly. Safety signals come from warmth and containment, not stimulation.'
          },
          {
            type: 'space',
            label: 'The Low-Demand Zone',
            instruction: 'Stay in your quiet corner for the first 15 minutes. Avoid the high-traffic kitchen hub until you feel physiologically grounded. Your nervous system needs to complete its own startup sequence before encountering social demands.'
          }
        ]
      },

      // -----------------------------------------------------------------------
      sensor_mixed: {
        tagline:     'The Variable Morning: Calibrating Before Committing.',
        description: 'Your morning capacity is not fixed. Some days your system arrives reset and ready for a gentle activation. Other days the same protocol will feel like too much. The priority is not to follow a sequence but to read your system first and then respond to what you find. Build a brief check-in moment before deciding how slow or structured your morning needs to be.',
        spotifyLink: 'https://open.spotify.com/playlist/37i9dQZF1DZ06evO1A8iR2?si=fefd25a5476e4952',
        steps: [
          {
            type: 'somatic',
            label: 'The Morning Read',
            instruction: 'Before doing anything else, take 60 seconds to notice where you are. Is there tension in your chest or jaw? Does the light in the room feel manageable or sharp? This is not rumination -- it is data collection. Your response to the next steps depends on what you find.',
            duration: '1 min'
          },
          {
            type: 'light',
            label: 'Graduated Exposure',
            instruction: 'On easier mornings, indirect window light for 15 minutes is sufficient. On harder mornings, stay away from windows entirely for the first 10 minutes. Let your initial read determine which you need today.'
          },
          {
            type: 'space',
            label: 'The Staged Entry',
            instruction: 'Move through the morning in stages rather than all at once. Bedroom first, then the quietest shared space, then higher-traffic areas. Do not enter a demanding environment until your nervous system has had at least one zero-demand window.'
          }
        ]
      },

      // -----------------------------------------------------------------------
      sensor_accumulative: {
        tagline:     'Carrying Yesterday: The Residue-Aware Morning.',
        description: 'Your system does not arrive at each morning fully reset. What the previous day held -- its noise, its demands, its unresolved moments -- is still present in your nervous system when you wake. The morning protocol must account for this prior-day load before attempting any activation. The goal is not to begin the day. The goal is to discharge what the night did not clear, and then begin.',
        spotifyLink: 'https://open.spotify.com/playlist/37i9dQZF1DZ06evO1A8iR2?si=fefd25a5476e4952',
        steps: [
          {
            type: 'space',
            label: 'The Residue Hold',
            instruction: 'Before moving or reaching for any device, remain still for a minimum of 10 minutes. This is not laziness. Your nervous system needs time to locate itself in the current moment rather than continuing to process the previous day. Silence and stillness are the fastest tools available for this.',
            duration: '10 min'
          },
          {
            type: 'somatic',
            label: 'Thermal Grounding',
            instruction: 'Warm hands around a hot drink before any other sensory input. The oral-thermal pathway activates vagal tone directly. For your system, warmth is a regulatory signal, not a comfort preference.'
          },
          {
            type: 'light',
            label: 'Incremental Light Only',
            instruction: 'Introduce light in stages: one low lamp before any natural light, indirect window light before direct. Your threat-detection system is still calibrated to the previous day. A sudden brightness shift will register as a demand rather than a cue.',
            duration: '20 min'
          }
        ]
      },

      // -----------------------------------------------------------------------
      seeker_integrative: {
        tagline:     'Dopamine Ignition: Engaging the Executive Brain.',
        description: 'Your nervous system does not drift into wakefulness. It needs a spark. Without sufficient intensity, the prefrontal cortex remains in low-arousal fog, and intention does not become action. You stack high-lux light with vestibular input to jumpstart executive function. When your integration pattern is working well overnight, your system arrives ready to be activated rather than needing to be reset first.',
        spotifyLink: 'https://open.spotify.com/playlist/2TwygCUmV9hogNFqZZ4to2?si=0e20cd0bc7684d86',
        steps: [
          {
            type: 'light',
            label: 'High-Lux Launch',
            instruction: 'Direct sunlight is the priority. If unavailable, use a 10,000 Lux SAD lamp at close range as soon as you leave bed. Your brain requires this photon density to synthesise the dopamine needed for focus.',
            duration: '15 min'
          },
          {
            type: 'somatic',
            label: 'Vestibular Wake-Up',
            instruction: 'Do not sit. Drink your water or tea while standing, pacing, or stretching. Your brain requires movement through space to feel fully online. Sitting down immediately delays this signal by 20 to 30 minutes.'
          },
          {
            type: 'sound',
            label: 'Sonic Drive',
            instruction: 'Play complex, fast-tempo music at 140 BPM or above. Silence allows the mind to drift. Structured, high-energy sound anchors you to the present moment and gives the executive brain something to entrain to.'
          }
        ]
      },

      // -----------------------------------------------------------------------
      seeker_mixed: {
        tagline:     'The Unpredictable Engine: Reading the Threshold Before Activating.',
        description: 'Your stimulation needs are real but they shift. The same activation protocol that produces clarity on a high-capacity morning can produce scattered overwhelm when your system is carrying variable load. The Seeker with a mixed integration pattern needs to check the engine before flooring the accelerator. Some mornings need ignition. Others need a gentler ramp.',
        spotifyLink: 'https://open.spotify.com/playlist/2TwygCUmV9hogNFqZZ4to2?si=0e20cd0bc7684d86',
        steps: [
          {
            type: 'somatic',
            label: 'The Threshold Check',
            instruction: 'Before reaching for stimulation, take 90 seconds of stillness. Notice whether restlessness feels hungry or agitated. Hungry restlessness means your system wants activation. Agitated restlessness means it is already carrying load and adding stimulation will compound rather than regulate.',
            duration: '2 min'
          },
          {
            type: 'light',
            label: 'Modulated Lux',
            instruction: 'On high-capacity mornings, go directly to high-lux sunlight or SAD lamp. On variable-load mornings, begin with moderate indirect light and allow 10 minutes before escalating. Forcing full activation into a loaded system backfires.'
          },
          {
            type: 'sound',
            label: 'Tiered Sonic Entry',
            instruction: 'Start at medium tempo (100 to 120 BPM) and assess after 5 minutes. If your focus sharpens, increase toward your usual activation range. If it increases restlessness, hold at medium. The sound is a tool you are operating, not a protocol you are following.'
          }
        ]
      },

      // -----------------------------------------------------------------------
      seeker_accumulative: {
        tagline:     'The Loaded Engine: Activation Without Compounding.',
        description: 'Your system needs stimulation to function -- but it is also carrying a backlog from prior exposures that have not fully cleared. Adding more stimulation to a loaded system does not produce activation. It compounds the backlog. The morning priority is a controlled discharge of residual load before any activation attempt. The ignition comes second, not first.',
        spotifyLink: 'https://open.spotify.com/playlist/2TwygCUmV9hogNFqZZ4to2?si=0e20cd0bc7684d86',
        steps: [
          {
            type: 'somatic',
            label: 'Physical Discharge First',
            instruction: '10 minutes of moderate movement before any stimulation input -- a slow walk, light stretching, or gentle joint rotation. This is not activation. It is metabolisation of the residual load your system arrived with. Until this step is done, stimulation will scatter rather than focus.',
            duration: '10 min'
          },
          {
            type: 'light',
            label: 'Graduated Lux',
            instruction: 'Begin with indirect natural light rather than high-lux exposure. Allow your visual system to find its current tolerance before escalating. A system carrying a backlog needs a slower photon ramp than a fully reset system.'
          },
          {
            type: 'sound',
            label: 'Rhythmic Anchor, Not Volume',
            instruction: 'Use steady rhythmic music at moderate tempo. The goal is entrainment to a stable beat -- not the dopamine spike of high-intensity audio. Rhythm regulates. Volume, at this stage, loads.'
          }
        ]
      },

      // -----------------------------------------------------------------------
      anchor_integrative: {
        tagline:     'Master Your Morning: Activate Your Neuro-Hormonal Advantage.',
        description: 'Your internal clock, the Suprachiasmatic Nucleus, is the CEO of your day. To unlock peak cognitive clarity, you must strategically signal the Cortisol Awakening Response. Your system processes and releases well, which means a well-designed morning protocol produces reliable results. The risk is not overwhelm -- it is the absence of intentional design leaving your capacity on the table.',
        spotifyLink: 'https://open.spotify.com/playlist/37i9dQZF1DX71VcjjnyaBQ?si=ed214b46173540d7',
        steps: [
          {
            type: 'light',
            label: 'Sky View: The First Signal',
            instruction: 'Within 10 minutes of waking, seek early morning low-angle sunlight. Step outside, open a window fully, or take a short walk. You are calibrating your internal compass for the day.',
            duration: '15 min'
          },
          {
            type: 'somatic',
            label: 'Cold Signal: The Ignition',
            instruction: 'A brief splash of cold water triggers a controlled release of noradrenaline. It enhances alertness without the dysregulation of a startle response. Your resilient system can absorb this signal cleanly.'
          },
          {
            type: 'space',
            label: 'Open Boundaries',
            instruction: 'Open all curtains and blinds. Maximising visual expansion signals to your nervous system that the environment is adapting to you. Your system does not need easing in -- it needs activating.'
          }
        ]
      },

      // -----------------------------------------------------------------------
      anchor_mixed: {
        tagline:     'The Steady Start: Reliable Activation With Variable Awareness.',
        description: 'Your system is broadly resilient, but your processing pattern shifts with accumulated context. Most mornings, full activation protocols work cleanly. On mornings where prior-day load sits higher than usual -- and your system may not signal this directly -- a gentler initial sequence protects against an activation that pushes a partially loaded system rather than a fully reset one.',
        spotifyLink: 'https://open.spotify.com/playlist/37i9dQZF1DX71VcjjnyaBQ?si=ed214b46173540d7',
        steps: [
          {
            type: 'light',
            label: 'Natural Light, Paced Entry',
            instruction: 'Open one set of curtains before all others. Allow 5 minutes of indirect morning light before full exposure. On most mornings this will feel unnecessary. On the mornings it is needed, it prevents a harder recovery later in the day.',
            duration: '10 min'
          },
          {
            type: 'somatic',
            label: 'Temperature Scan',
            instruction: 'Notice whether a cold-water signal feels energising or jarring this morning. Energising means your system is reset and ready. Jarring means it is carrying load. Let this reading guide the pace of the rest of your morning.'
          },
          {
            type: 'space',
            label: 'Staged Open',
            instruction: 'Open your space progressively rather than all at once. Your system does not need protection -- but a staged opening builds in the 60-second awareness window that helps you notice when load is higher than it appears.'
          }
        ]
      },

      // -----------------------------------------------------------------------
      anchor_accumulative: {
        tagline:     'The Silent Load: Starting From Where You Actually Are.',
        description: 'Your system looks resilient because it rarely signals distress. But apparent resilience and genuine reset are not the same thing. A system carrying accumulated load that receives no distress signals is not an empty system -- it is a full system with no warning light. The morning protocol must account for what your nervous system is carrying even when it is not telling you.',
        spotifyLink: 'https://open.spotify.com/playlist/37i9dQZF1DX71VcjjnyaBQ?si=ed214b46173540d7',
        steps: [
          {
            type: 'somatic',
            label: 'The Pre-Activation Pause',
            instruction: 'Before any activation input, take 5 minutes of complete stillness. Not because you feel overwhelmed -- you probably do not -- but because your system needs a moment to locate its actual baseline rather than proceeding as if it arrived fully reset.',
            duration: '5 min'
          },
          {
            type: 'light',
            label: 'Graduated Light Entry',
            instruction: 'Indirect light before direct. One window before all windows. Your system will not complain about full light exposure, but the gradual entry gives accumulated load a route out rather than adding more input on top of what is already present.'
          },
          {
            type: 'space',
            label: 'Load-Reduction First',
            instruction: 'Before adding any activation elements to your environment, remove one thing that adds background demand -- a notification alert, an open door, a cluttered surface in your immediate line of sight. Reduction before activation is the sequence for your pattern.'
          }
        ]
      }
    }
  },


  // ===========================================================================
  // MORNING CALM : High Load
  // ===========================================================================

  'morning-calm': {
    id:               'morning-calm',
    name:             'The Steady Ground',
    triggerCondition: 'Morning + High Load',
    variants: {

      // -----------------------------------------------------------------------
      sensor_integrative: {
        tagline:     'Zero Demands. Full Containment.',
        description: 'A high-load morning for the Sensor with an integrative pattern means the sensory bucket arrived full -- likely from poor sleep, overnight noise, or emotional residue. The integrative pattern means recovery is available, but only when the conditions genuinely support it. Do not attempt to push through. The only productive move is decompression before any environmental exposure.',
        toolLink: 'https://insig.ht/eu6G6KYTm1b',
        steps: [
          {
            type: 'space',
            label: 'The Containment Hold',
            instruction: 'Remain in bed or in your quietest space. Heavy blanket on. No screens, no conversation. Give your nervous system a minimum of 10 minutes of zero-input recovery before attempting to enter the day. With your integration pattern, this window will produce genuine reset if you protect it.',
            duration: '10 min'
          },
          {
            type: 'somatic',
            label: 'Thermal Reset',
            instruction: 'Warm hands around a hot drink. Heat activates the vagus nerve through the oral-thermal pathway, gently shifting the autonomic state toward regulation. No cold exposure this morning.'
          },
          {
            type: 'light',
            label: 'Controlled Exposure',
            instruction: 'Introduce light incrementally. One lamp on low first. A cracked window before a fully open blind. Your eyes are still in threat-detection mode -- do not overwhelm them with a sudden brightness shift.'
          }
        ]
      },

      // -----------------------------------------------------------------------
      sensor_mixed: {
        tagline:     'High Load, Unknown Capacity: Assume the Harder Day.',
        description: 'On a high-load morning, your mixed integration pattern means you cannot predict whether today will resolve with recovery or compound further. When the answer is unknown, calibrate for the harder scenario. A morning designed for a difficult day will not harm you on an easier one. A morning that assumes capacity you do not have will compound the load you are already carrying.',
        steps: [
          {
            type: 'space',
            label: 'Extended Containment',
            instruction: 'Stay in your quietest space for a minimum of 15 minutes before any transition. On variable-pattern days with high load, the decision about how much the morning will cost you is made in this window. Protect it.',
            duration: '15 min'
          },
          {
            type: 'somatic',
            label: 'Slow Thermal Entry',
            instruction: 'Warm drink before any other sensory input. Notice whether warmth produces visible relaxation or whether the body stays tense. The response tells you which version of your integration pattern is operating today and shapes the rest of the morning accordingly.'
          },
          {
            type: 'light',
            label: 'Minimum Viable Light',
            instruction: 'Use the least light that allows you to function rather than the most light that feels tolerable. On high-load mornings with a variable pattern, the tolerable threshold and the optimal threshold are not the same. Err toward less.'
          }
        ]
      },

      // -----------------------------------------------------------------------
      sensor_accumulative: {
        tagline:     'The Full Bucket: Discharging Before the Day Begins.',
        description: 'For the Sensor with an accumulative pattern, a high-load morning is not a temporary state caused by a difficult night. It is the result of several days of input that has not cleared. This morning does not just need containment -- it needs a longer discharge window than a single morning protocol can fully deliver. What the protocol can do is prevent compounding and give your system the most recovery-friendly conditions available.',
        toolLink: 'https://insig.ht/eu6G6KYTm1b',
        steps: [
          {
            type: 'space',
            label: 'The Extended Hold',
            instruction: 'A minimum of 20 minutes in complete sensory withdrawal before any transition. This is not negotiable for your pattern. Your system does not respond to brief windows the way an integrative system does. The discharge requires time proportionate to the load carried.',
            duration: '20 min'
          },
          {
            type: 'somatic',
            label: 'Layered Warmth',
            instruction: 'Heavy blanket, warm drink, and if available a heated pad at the base of the spine. Proprioceptive pressure and thermal warmth are the two fastest regulatory inputs available to your pattern. Use both simultaneously.'
          },
          {
            type: 'light',
            label: 'Darkness as a Starting Point',
            instruction: 'Begin in near-darkness and introduce light only when the body visibly softens -- a loosening of jaw or shoulder tension. Do not use time as the trigger for light introduction. Use your body state. Your system sets the schedule today.'
          }
        ]
      },

      // -----------------------------------------------------------------------
      seeker_integrative: {
        tagline:     'Burn It Off First.',
        description: 'For your system, anxiety and restlessness are often the same signal. When the morning arrives with high load, the most direct regulatory tool available is physical discharge. Move the stress through the body before attempting any cognitive task. With your integrative pattern, the discharge window will produce a genuine reset rather than a temporary distraction.',
        toolLink: 'https://insig.ht/D7GHJJRTm1b',
        steps: [
          {
            type: 'somatic',
            label: 'Discharge Protocol',
            instruction: '10 to 15 minutes of vigorous physical movement -- jumping jacks, a brisk walk, or weighted stretching. Your nervous system needs to metabolise the stress hormones before it can regulate. This is not optional. It is the mechanism, not a warm-up.',
            duration: '15 min'
          },
          {
            type: 'sound',
            label: 'Rhythmic Anchor',
            instruction: 'Play steady, rhythmic music -- structured and pulse-driven, not chaotic. Rhythm entrains the nervous system. It provides predictability without understimulation. After discharge, rhythm is the bridge back to a working baseline.'
          },
          {
            type: 'space',
            label: 'Command Point',
            instruction: 'After movement, position yourself at your primary workspace with your back to a wall, facing the room. Control of your visual field reduces background vigilance and allows your executive brain to re-engage.'
          }
        ]
      },

      // -----------------------------------------------------------------------
      seeker_mixed: {
        tagline:     'High Load, Variable System: Discharge With Awareness.',
        description: 'On a high-load morning, your mixed integration pattern means the discharge that usually resets your system may land differently today. Some mornings the movement protocol produces rapid regulation. Others it increases agitation. The protocol stays the same but the intensity is modulated by what you observe in the first two minutes of movement.',
        steps: [
          {
            type: 'somatic',
            label: 'Modulated Discharge',
            instruction: 'Begin with 5 minutes of moderate movement -- a brisk walk or light jumping. Assess after 5 minutes. If agitation decreases, continue and increase intensity. If agitation increases, drop to slow rhythmic movement such as walking or gentle stretching. Your system is telling you which direction discharge needs to go today.',
            duration: '10 min'
          },
          {
            type: 'sound',
            label: 'Rhythm Before Volume',
            instruction: 'Start with medium-tempo structured music. Only increase tempo and volume if the first 3 minutes produce visible regulation. Do not front-load high stimulation when load is already high -- the goal is rhythm, not intensity.'
          },
          {
            type: 'space',
            label: 'Contained Command Point',
            instruction: 'Position with back to a wall, visual field open in front. On variable-pattern high-load mornings, reduce the number of visible objects in your immediate line of sight before settling. Your threat-assessment system is running higher than usual.'
          }
        ]
      },

      // -----------------------------------------------------------------------
      seeker_accumulative: {
        tagline:     'The Backlog Morning: Discharge What Arrived, Not Just What Is Here.',
        description: 'A high-load morning for the Seeker with an accumulative pattern means the morning arrived with the residue of prior days already present, and today has added to it. Standard discharge protocols address current load. Your pattern requires addressing carried load first, at lower intensity, before any standard activation sequence. Forcing high-output discharge into a loaded accumulative system compounds the backlog rather than clearing it.',
        steps: [
          {
            type: 'somatic',
            label: 'Low-Intensity Discharge First',
            instruction: '10 minutes of slow walking or gentle rhythmic movement -- nothing vigorous. This is not the full discharge protocol. This is the pre-discharge: giving accumulated load a route out before the system is asked to produce more. Only once this window is complete should you assess whether higher-intensity movement is appropriate.',
            duration: '10 min'
          },
          {
            type: 'space',
            label: 'One Controlled Variable',
            instruction: 'Choose one element of your morning environment that you control completely -- a chair position, a window you open or close, a single lamp. For your pattern, agency over one concrete variable reduces the sensation of being managed by your environment rather than managing it.'
          },
          {
            type: 'sound',
            label: 'Predictable Rhythm Only',
            instruction: 'On a high-load accumulative morning, do not use music to activate. Use it to anchor. Choose something with a steady, predictable beat at low-to-moderate volume. The goal is rhythm as a container, not stimulation as a spark.'
          }
        ]
      },

      // -----------------------------------------------------------------------
      anchor_integrative: {
        tagline:     'Regulation Before Performance.',
        description: 'When your system is already taxed before the day has started, activation is the wrong first move. Your integrative pattern means recovery is available -- but only when it is genuinely prioritised. Stability first. The performance that your resilient system is capable of follows from a solid baseline, not from pushing through a depleted one.',
        toolLink: 'https://insig.ht/8UcaqAHTm1b',
        steps: [
          {
            type: 'somatic',
            label: 'Physiological Sigh',
            instruction: 'Two sharp inhales through the nose followed by one long slow exhale through the mouth. Repeat 5 times. This mechanically resets CO2 balance and activates the parasympathetic brake within 90 seconds.',
            duration: '3 min'
          },
          {
            type: 'light',
            label: 'Soft Natural Light',
            instruction: 'Sit near a window without direct glare. Indirect morning light provides the circadian signal without the stimulation spike. Stay still -- this is passive intake, not an activation cue.',
            duration: '10 min'
          },
          {
            type: 'space',
            label: 'The Still Point',
            instruction: 'Before checking any device or entering any social space, spend five minutes in the quietest room available. Give your nervous system a zero-demand window to find its own footing.'
          }
        ]
      },

      // -----------------------------------------------------------------------
      anchor_mixed: {
        tagline:     'High Load, Uncertain Capacity: Regulate Before Assuming Resilience.',
        description: 'Your system is broadly resilient, but a high-load morning with a mixed integration pattern means you cannot assume your usual tolerance is available. The mornings where your pattern shifts toward accumulation are rarely signalled clearly in advance. A high-load morning is the most likely context for that shift. Regulate first and test your resilience second, rather than the other way around.',
        steps: [
          {
            type: 'somatic',
            label: 'Sigh and Scan',
            instruction: 'Five rounds of the physiological sigh -- two sharp inhales, one long exhale -- followed by a 60-second body scan. Notice whether tension releases after the sigh or stays present. Staying present means today is a variable-pattern day and the protocol needs to stay regulatory rather than activating.',
            duration: '5 min'
          },
          {
            type: 'light',
            label: 'Indirect First',
            instruction: 'Indirect morning light for 10 minutes before any direct exposure. On most high-load mornings for your system, this is sufficient to establish a regulated baseline. The step exists to prevent loading a potentially depleted system with an unnecessary stimulation ramp.'
          },
          {
            type: 'space',
            label: 'Low-Demand Window',
            instruction: 'Delay the first high-demand transition -- a meeting, a conversation, a complex task -- by at least 20 minutes. Your system does not signal distress readily, but that does not mean it is not present. Give the regulation window time to work before asking your resilience to carry the morning.',
            duration: '20 min'
          }
        ]
      },

      // -----------------------------------------------------------------------
      anchor_accumulative: {
        tagline:     'The Silent Overflow: Managing What You Cannot Yet Feel.',
        description: 'A high-load morning for the Anchor with an accumulative pattern is the context where the absence of distress signals is most misleading. Your system is likely carrying significant load without advertising it. The morning protocol is not about managing what you feel. It is about managing what is present whether you feel it or not.',
        steps: [
          {
            type: 'somatic',
            label: 'Extended Stillness',
            instruction: 'A minimum of 10 minutes of complete inactivity before any transition. No devices, no decisions, no movement beyond breathing. This is not rest -- it is load assessment. Your system uses this window to surface what it is carrying even when it has not been volunteering that information.',
            duration: '10 min'
          },
          {
            type: 'space',
            label: 'Reduction Before Entry',
            instruction: 'Before moving into any shared or high-stimulus space, reduce the immediate environment by one sensory variable -- close a door, lower a blind, remove an object from your sight line. Reduction is the first regulatory tool for your pattern, not the last.'
          },
          {
            type: 'light',
            label: 'Minimum Functional Light',
            instruction: 'Use the least light that allows you to function rather than the most you can tolerate. Your threshold is not the correct calibration point for a high-load accumulative morning. Your actual system state is -- and that state is carrying more than your threshold suggests.'
          }
        ]
      }
    }
  },


  // ===========================================================================
  // AFTERNOON FOCUS : Low / Medium Load
  // ===========================================================================

  'afternoon-focus': {
    id:               'afternoon-focus',
    name:             'The Second Wind',
    triggerCondition: 'Afternoon + Focus Block',
    variants: {

      // -----------------------------------------------------------------------
      sensor_integrative: {
        tagline:     'The Shielded Focus: Reducing Sensory Friction.',
        description: 'Your afternoon distraction is likely caused by sensory fatigue -- the exhaust of processing too much environmental data across the morning. A well-supported integrative morning means you arrive at the afternoon with reasonable capacity remaining, but that capacity is not infinite. The protocol does not add stimulation. It subtracts friction, liberating the processing power needed for sustained focus.',
        spotifyLink: 'https://insig.ht/UVO8dS7QP0b',
        steps: [
          {
            type: 'light',
            label: 'Glare Reduction',
            instruction: 'Dim the room significantly. Ensure no light sources are visible in your peripheral vision. Lower your screen brightness to match the ambient light. Visual friction is the fastest route to afternoon depletion for your profile.'
          },
          {
            type: 'space',
            label: 'The Protected Back',
            instruction: 'Ensure your back is to a solid wall or a high-backed chair. You cannot focus deeply if your nervous system is subconsciously scanning open space. This single change reduces background vigilance load measurably.'
          },
          {
            type: 'somatic',
            label: 'Deep Pressure',
            instruction: 'Place a heavy pillow, blanket, or weighted lap pad on your thighs. Proprioceptive input grounds you and reduces the sensation of sensory flutter. For your pattern this is a productive regulation tool, not a comfort preference.'
          }
        ]
      },

      // -----------------------------------------------------------------------
      sensor_mixed: {
        tagline:     'The Variable Afternoon: Adapting the Focus Protocol to Available Capacity.',
        description: 'Your afternoon capacity is not predictable from your morning. A manageable morning may have consumed more than you realise, leaving less available for afternoon focus than you expected. The mixed integration pattern means the same friction-reduction protocol produces different results on different days. Build in a brief assessment before committing to the depth of focus you are asking for.',
        steps: [
          {
            type: 'somatic',
            label: 'Capacity Check',
            instruction: 'Before beginning a focus block, take 2 minutes to notice your current state. Is your visual field sharp or slightly blurred at the edges? Is background sound registering as noise rather than neutral presence? These are early-stage depletion signals for your pattern. Adjust your session length accordingly.',
            duration: '2 min'
          },
          {
            type: 'light',
            label: 'Adaptive Glare Management',
            instruction: 'On lower-load afternoons, moderate dimming is sufficient. On higher-load afternoons, reduce to the minimum light that allows reading. Your processing threshold for visual input is lower when total load is higher.'
          },
          {
            type: 'space',
            label: 'Containment + Reduced Field',
            instruction: 'Back to a wall. Narrow your visual field by positioning facing a plain surface rather than a busy room. On variable-pattern afternoons, the amount of environmental data your peripheral vision is processing has a direct impact on the focus depth available to your central attention.'
          }
        ]
      },

      // -----------------------------------------------------------------------
      sensor_accumulative: {
        tagline:     'The Compounding Afternoon: Focus Within Reduced Capacity.',
        description: 'By afternoon, your accumulative pattern means the sensory and cognitive load of the morning has not cleared -- it has built. The focus window available to you is real but narrower than it would be for an integrative system at the same point in the day. The protocol does not try to extend this window artificially. It protects what remains and reduces the rate of further accumulation.',
        steps: [
          {
            type: 'space',
            label: 'The Minimum Environment',
            instruction: 'Strip the immediate environment to its minimum before beginning. One surface, one task, one light source, closed door. Your accumulated load means every background signal costs processing capacity that an integrative system still has available at this hour. You do not.',
            duration: '5 min'
          },
          {
            type: 'light',
            label: 'Lowest Functional Lux',
            instruction: 'Use the least light that allows reading without strain. Do not compensate for fatigue with brighter light -- bright light adds processing demand. The goal is minimum input to sustain the task, not optimal environment for peak performance.'
          },
          {
            type: 'somatic',
            label: 'Sustained Pressure and Warmth',
            instruction: 'Weighted lap pad and warm drink at hand throughout the focus block. For your pattern, these are not comfort items -- they are active regulatory inputs that slow the rate of further accumulation across the session.'
          }
        ]
      },

      // -----------------------------------------------------------------------
      seeker_integrative: {
        tagline:     'The Spotlight Protocol: Forcing the Flow State.',
        description: 'You do not lack focus. You lack sufficient stimulation. When the afternoon task is insufficiently engaging, your brain scans the environment for dopamine. The Vignette Effect creates a high-contrast environment that forces attention into the work rather than into the room. With your integrative pattern, a well-structured afternoon protocol reliably produces a second peak of cognitive output.',
        spotifyLink: 'https://insig.ht/skmY1CZQP0b',
        steps: [
          {
            type: 'light',
            label: 'The Vignette Effect',
            instruction: 'Turn off overhead lights. Turn on a bright task lamp directly on your workspace. This high-contrast pool of light creates a theatrical spotlight, anchoring your gaze and narrowing your attentional field to the work in front of you.'
          },
          {
            type: 'sound',
            label: 'Brown Noise Wall',
            instruction: 'Play brown noise -- rougher and deeper than white noise. It occupies the distraction centre of your auditory cortex so the rest of your brain can work. Your integrative system can sustain this input without loading from it.'
          },
          {
            type: 'somatic',
            label: 'Active Sitting',
            instruction: 'Sit on one leg, use a wobble stool, or chew gum. Give your body a fidget task so your mind is free to stay engaged. Movement is regulation for your profile -- contain it to something small and rhythmic rather than suppressing it.'
          }
        ]
      },

      // -----------------------------------------------------------------------
      seeker_mixed: {
        tagline:     'The Shifting Spotlight: Stimulation That Adapts to Carried Load.',
        description: 'Your afternoon stimulation needs vary with what you are carrying. On lower-load afternoons, the standard Seeker focus protocol produces reliable results. On higher-load afternoons, the same stimulation profile can tip into scattered overactivation. The protocol stays structured but the intensity of each element is modulated by a brief assessment at the outset.',
        steps: [
          {
            type: 'somatic',
            label: 'Load Assessment',
            instruction: 'Before activating the focus environment, take 90 seconds to assess your current state. Is restlessness focused or scattered? Focused restlessness responds well to high stimulation. Scattered restlessness responds better to moderate stimulation with strong rhythm. Set the environment accordingly.',
            duration: '2 min'
          },
          {
            type: 'light',
            label: 'Adaptive Vignette',
            instruction: 'On focused-restlessness afternoons, use the full vignette effect -- overhead lights off, task lamp high. On scattered afternoons, soften the contrast slightly: task lamp on but not at full intensity. The contrast cues attention; the degree depends on what your system can absorb today.'
          },
          {
            type: 'sound',
            label: 'Tiered Noise',
            instruction: 'Start with brown noise at medium volume. Increase if focus sharpens after 5 minutes. Hold if it does not. On variable-load afternoons, the noise wall provides containment first -- stimulation is secondary to that function.'
          }
        ]
      },

      // -----------------------------------------------------------------------
      seeker_accumulative: {
        tagline:     'Focus Through the Backlog: Sustainable Output Over Forced Activation.',
        description: 'By afternoon, your accumulative pattern means stimulation from the morning has layered rather than cleared. Adding more stimulation to pursue focus compounds the backlog rather than producing clarity. The afternoon focus protocol for your pattern is not about activation -- it is about creating the right conditions for sustained output within a system that is already running a higher baseline load than it appears to be.',
        steps: [
          {
            type: 'space',
            label: 'Agency Over One Variable',
            instruction: 'Before beginning, make one deliberate environmental adjustment that increases your sense of control over the space -- open a window, position a chair differently, clear one surface. For your pattern, perceived agency over the environment reduces the vigilance cost of being in it, which directly increases available focus.'
          },
          {
            type: 'light',
            label: 'Predictable Contrast',
            instruction: 'Task lamp on, overhead off. Same as the standard Seeker protocol -- but the goal here is predictability of the visual field rather than stimulation of attention. A stable, controlled lighting environment gives your accumulated system fewer variables to track.'
          },
          {
            type: 'sound',
            label: 'Rhythmic Containment',
            instruction: 'Steady, medium-tempo music or brown noise at moderate volume. For an accumulative afternoon, the sound should anchor rather than activate. Rhythm provides structure. Volume is kept below your usual preference -- not because of sensitivity, but because adding more input to a loaded system reduces output rather than increasing it.'
          }
        ]
      },

      // -----------------------------------------------------------------------
      anchor_integrative: {
        tagline:     'Capture Your Second Peak: The Ultradian Reset.',
        description: 'Your brain operates in 90-minute ultradian cycles. To trigger a second peak of focus in the afternoon, heighten alertness slightly without spiking anxiety. Your integrative pattern means a well-structured reset produces a reliable second cognitive window. The tools here work with the biology rather than forcing against a depleted baseline.',
        spotifyLink: 'https://insig.ht/TcOSceRQP0b',
        steps: [
          {
            type: 'sound',
            label: '40Hz Gamma Protocol',
            instruction: 'Use headphones to listen to 40Hz Gamma waves. This frequency is associated with high-level cognitive synthesis, acting as audio caffeine without the jitters. Your resilient system absorbs this cleanly and responds with measurable sharpening of attention.'
          },
          {
            type: 'somatic',
            label: 'The Physiological Sigh',
            instruction: 'Five rounds of the double-inhale, long-exhale pattern. This mechanically offloads CO2 and sharpens alertness. For your integrative system, this produces a rapid reset rather than a gradual shift.'
          },
          {
            type: 'space',
            label: 'The ISO-Stand',
            instruction: 'Switch to a standing position. Novel proprioceptive input activates the Reticular Activating System, preventing the static lethargy that settles into the afternoon without intervention.'
          }
        ]
      },

      // -----------------------------------------------------------------------
      anchor_mixed: {
        tagline:     'The Adaptive Second Wind: Performance With Variable Awareness.',
        description: 'Your system is capable of a strong afternoon focus block, but your mixed integration pattern means the available capacity varies. On most afternoons the standard Anchor protocol produces solid results. On afternoons where prior load has been quietly higher than usual, the same activation attempt produces diminishing returns. Build in a brief assessment before choosing your activation intensity.',
        steps: [
          {
            type: 'somatic',
            label: 'Sigh and Assess',
            instruction: 'Three rounds of the physiological sigh before committing to the focus session. Notice whether the third sigh produces visible relaxation or whether the body stays in the same state. Relaxation response means your system is available for activation. No response means this afternoon needs a restorative window before a focus attempt.',
            duration: '3 min'
          },
          {
            type: 'sound',
            label: 'Modulated Frequency',
            instruction: 'On responsive afternoons, proceed to 40Hz Gamma as usual. On non-responsive afternoons, use Theta binaural beats instead -- these support consolidation and moderate restoration rather than activation. Your output on a partially loaded afternoon is higher from a rested baseline than from a pushed one.'
          },
          {
            type: 'space',
            label: 'Upright and Open',
            instruction: 'Standing or upright seated position with a wide visual field. For your profile this activates the RAS without requiring additional sensory input. On variable-load afternoons, the posture change alone may be sufficient to shift the state.'
          }
        ]
      },

      // -----------------------------------------------------------------------
      anchor_accumulative: {
        tagline:     'Sustained Output, Managed Load: Focus Without Adding to the Stack.',
        description: 'Your afternoon cognitive capacity is present but it is being sustained by a system that is carrying more than it appears to be. The focus protocol does not attempt to activate past that load. It creates the conditions for sustained output within it -- and prioritises not adding further to what is already accumulated.',
        steps: [
          {
            type: 'somatic',
            label: 'Passive Reset First',
            instruction: 'Five minutes of complete inactivity before beginning -- no screens, no movement, no input. For your accumulative pattern, this window gives the system a brief route for discharge before another demand is added. The focus block following a passive reset produces more output than one begun immediately after a transition.',
            duration: '5 min'
          },
          {
            type: 'space',
            label: 'Reduced Input Field',
            instruction: 'Before beginning, remove one non-essential item from your immediate environment -- an object, a notification source, an open application. Your system is tracking more background data than you are aware of. Reducing one variable reduces the vigilance cost without requiring you to feel it first.'
          },
          {
            type: 'sound',
            label: 'Low-Frequency Anchor',
            instruction: 'Brown noise or steady low-frequency music at moderate volume. The goal is masking of unpredictable environmental sound, not activation. For your pattern, predictability of the auditory field is more valuable than stimulation of attention.'
          }
        ]
      }
    }
  },


  // ===========================================================================
  // AFTERNOON RESET : High Load
  // ===========================================================================

  'afternoon-reset': {
    id:               'afternoon-reset',
    name:             'The Restoration Window',
    triggerCondition: 'Afternoon + High Load',
    variants: {

      // -----------------------------------------------------------------------
      sensor_integrative: {
        tagline:     'Sensory Retreat: Emptying the Afternoon Bucket.',
        description: 'By high-stress afternoon, the Sensor with an integrative pattern is at or near processing threshold. Any additional input -- no matter how minor -- registers as friction. The protocol is complete sensory withdrawal. Your integrative pattern means this withdrawal window will produce genuine restoration if the conditions are right and the time is sufficient.',
        toolLink: 'https://insig.ht/SGjhihjUm1b',
        steps: [
          {
            type: 'space',
            label: 'The Retreat Room',
            instruction: 'Move to the quietest available space. Lie down or sit fully supported. No phone, no background sound, no open doors. If sharing the space, use noise-cancelling headphones even in silence. Minimum 15 minutes.',
            duration: '15 min'
          },
          {
            type: 'light',
            label: 'Near-Darkness',
            instruction: 'Dim to the lowest tolerable level or use an eye mask. Visual input is one of the highest-bandwidth sensory channels. Taking it offline provides the most significant processing relief available to your pattern in the shortest amount of time.'
          },
          {
            type: 'somatic',
            label: 'Weight and Warmth',
            instruction: 'A heavy blanket or cushion over your legs and torso. Proprioceptive pressure tells the nervous system it is physically contained and not under threat. This is a direct input to the autonomic regulation pathway. For your integrative pattern, it creates the conditions for genuine reset within the window.'
          }
        ]
      },

      // -----------------------------------------------------------------------
      sensor_mixed: {
        tagline:     'Variable Afternoon Load: Withdrawal Calibrated to Current State.',
        description: 'A high-load afternoon with a mixed integration pattern requires withdrawal -- but the depth and duration of that withdrawal depends on which version of your processing pattern is active. If today has been compounding, you need deeper withdrawal. If the load arrived recently rather than across the day, a shorter window may be sufficient. Assess before choosing the duration.',
        steps: [
          {
            type: 'somatic',
            label: 'State Assessment',
            instruction: 'Before lying down, take 60 seconds to notice whether your depletion feels shallow or deep. Shallow depletion -- arriving in the last hour or two -- responds to a 10-minute retreat. Deep depletion -- present since mid-morning or building across days -- requires 20 minutes minimum and will not fully respond to a single window.',
            duration: '1 min'
          },
          {
            type: 'space',
            label: 'Scaled Retreat',
            instruction: 'For shallow depletion: quietest available room, door closed, 10 minutes. For deep depletion: full sensory withdrawal with eye mask and weighted blanket, 20 minutes minimum. Do not use the shorter window on a day that requires the longer one.',
            duration: '10-20 min'
          },
          {
            type: 'light',
            label: 'Darkness as Default',
            instruction: 'On any high-load afternoon, default to near-darkness regardless of which depletion depth applies. The visual channel is always the first to withdraw and the last to re-engage. It costs nothing to close it and restores faster than any other input channel.'
          }
        ]
      },

      // -----------------------------------------------------------------------
      sensor_accumulative: {
        tagline:     'The Compounded Afternoon: Withdrawal as Biological Necessity.',
        description: 'For the Sensor with an accumulative pattern, a high-load afternoon is not a temporary depletion event. It is the cumulative result of days of input that has not cleared. A single retreat window will not fully restore capacity -- but it will prevent further accumulation and reduce the load carried into the evening and the following day. That is the goal. Complete restoration is a longer arc.',
        steps: [
          {
            type: 'space',
            label: 'Maximum Withdrawal',
            instruction: 'The fullest retreat available to you in this moment -- quietest room, closed door, lowest light, no devices, no sound. Minimum 20 minutes. For your pattern, a partial retreat compounds rather than restores: a space that is almost quiet continues to demand processing. All the way or not at all.',
            duration: '20 min'
          },
          {
            type: 'somatic',
            label: 'Full-Body Pressure',
            instruction: 'Weighted blanket covering the full body including arms. Pillow under the knees to release the lumbar spine. The goal is total proprioceptive containment -- a physical signal to the nervous system that it does not need to maintain postural vigilance. Your accumulative pattern needs this signal held for the full duration, not just the opening minutes.'
          },
          {
            type: 'light',
            label: 'Complete Visual Closure',
            instruction: 'Eye mask, not just dimmed lighting. A partially darkened room still requires passive visual processing. Complete visual closure is the only input that genuinely stops the visual channel rather than merely reducing it. For your pattern, partial measures produce partial results.'
          }
        ]
      },

      // -----------------------------------------------------------------------
      seeker_integrative: {
        tagline:     'Pattern Interrupt: The Hard Reset.',
        description: 'For the Seeker with an integrative pattern, afternoon overload is often disguised as restlessness or boredom. The brain has exhausted available dopamine and is cycling through distraction in search of more. The reset is not stillness -- it is a deliberate pattern interrupt that breaks the depletion loop. Your integrative pattern means the discharge and descent will produce a genuine reset within the window.',
        steps: [
          {
            type: 'somatic',
            label: 'Movement Flush',
            instruction: 'Leave your workspace completely. 10 minutes of vigorous movement -- a fast walk, stairs, dynamic stretching. This metabolises stress hormones and triggers a dopamine reset rather than waiting passively for a state shift that will not arrive on its own.',
            duration: '10 min'
          },
          {
            type: 'space',
            label: 'Environment Change',
            instruction: 'Return to a different space from where you were working. Your brain associates the original space with the depleted state. A new visual environment signals novelty to the Reticular Activating System and provides a meaningful regulatory shift.'
          },
          {
            type: 'sound',
            label: 'Binaural Theta Reset',
            instruction: 'After movement, 10 minutes of Theta binaural beats at 4 to 8Hz with eyes closed. This pulls the brain from Beta toward Theta -- rest and consolidation -- without requiring sleep. Your integrative pattern means the descent will be genuine rather than resisted.',
            duration: '10 min',
            toolLink: 'https://insig.ht/7mS0eZaUm1b'
          }
        ]
      },

      // -----------------------------------------------------------------------
      seeker_mixed: {
        tagline:     'The Variable Reset: Interrupt Calibrated to Available Capacity.',
        description: 'On a high-load afternoon with a mixed integration pattern, the full pattern-interrupt protocol may produce scattered overactivation rather than reset. The movement flush that clears the system on a high-capacity day can compound restlessness on a day where capacity has been quietly depleted. Read the state before choosing the intensity of the interrupt.',
        steps: [
          {
            type: 'somatic',
            label: 'Modulated Movement Flush',
            instruction: 'Begin with 5 minutes of moderate-intensity movement -- a brisk walk, not a sprint. Assess after 5 minutes: if agitation has decreased, continue for a further 5 minutes and increase intensity slightly. If agitation has increased, transition immediately to slow rhythmic movement for the remaining time. The flush is real for your profile -- its intensity must match what is actually present.',
            duration: '10 min'
          },
          {
            type: 'space',
            label: 'Novel but Quiet Environment',
            instruction: 'Move to a different space that is quieter than your workspace rather than more stimulating. The novelty cue is sufficient for RAS activation. On a variable-load high-load afternoon, adding more stimulation through environmental change compounds the load you are trying to discharge.'
          },
          {
            type: 'sound',
            label: 'Theta or Delta Based on Response',
            instruction: 'If the movement flush produced visible regulation, use Theta binaural beats for 10 minutes -- rest and consolidation. If regulation was partial or absent, use Delta instead -- deeper deactivation at 0.5 to 4Hz. For a mixed pattern under high load, the descent may need to go deeper than a standard afternoon reset.',
            duration: '10 min',
            toolLink: 'https://insig.ht/7mS0eZaUm1b'
          }
        ]
      },

      // -----------------------------------------------------------------------
      seeker_accumulative: {
        tagline:     'Backlog Discharge: Moving Load Without Adding More.',
        description: 'A high-load afternoon for the Seeker with an accumulative pattern requires a discharge that works with the backlog rather than adding to it. High-intensity movement on a fully loaded accumulative system metabolises some of what is present but adds new input simultaneously. The protocol is moderate discharge followed by controlled descent -- not the full pattern-interrupt sequence used for an integrative system.',
        steps: [
          {
            type: 'somatic',
            label: 'Low-Intensity Sustained Movement',
            instruction: '15 minutes of slow, rhythmic movement -- walking at conversation pace, gentle stretching, or slow floor-based movement. The goal is metabolisation of accumulated load at a rate the system can process, not a fast dump that exceeds processing capacity. Stay at this pace for the full duration regardless of how your system is responding.',
            duration: '15 min'
          },
          {
            type: 'space',
            label: 'Controlled Novel Environment',
            instruction: 'Move to a space that offers a mild change of visual field -- a different room, an outdoor seat, a window you do not usually sit near. Minimal novelty is sufficient for the RAS signal. A high-stimulation new environment adds to the backlog. A calm new environment provides the shift without the cost.'
          },
          {
            type: 'sound',
            label: 'Delta Descent',
            instruction: '15 minutes of Delta binaural beats at 0.5 to 4Hz with eyes closed. For an accumulative high-load afternoon, Theta is insufficient -- your system needs to be pulled deeper to access genuine rest. Delta is the appropriate target regardless of whether it feels accessible from where you currently are.',
            duration: '15 min',
            toolLink: 'https://insig.ht/7mS0eZaUm1b'
          }
        ]
      },

      // -----------------------------------------------------------------------
      anchor_integrative: {
        tagline:     'Non-Sleep Deep Rest: The Strategic Recovery.',
        description: 'When afternoon load is high, continuing to push cognitive output accelerates depletion without proportional return. The most efficient use of a 20-minute window is Non-Sleep Deep Rest -- a protocol that restores dopamine, improves retention, and resets executive function. Your integrative pattern means this window will produce genuine restoration. Protect it completely.',
        steps: [
          {
            type: 'somatic',
            label: 'NSDR Protocol',
            instruction: 'Lie flat or recline fully. Use a Yoga Nidra or body scan audio. You do not need to fall asleep. The goal is deliberate nervous system downregulation. 20 minutes of NSDR produces restoration equivalent to several hours of light sleep for a system that processes and releases as well as yours.',
            duration: '20 min',
            toolLink: 'https://insig.ht/TRHQ0iERP0b'
          },
          {
            type: 'light',
            label: 'Light Reduction',
            instruction: 'Dim the room or close the blinds. High lux in a depleted state increases cortisol without the energy available to use it productively. Darkness signals the body that the performance window has closed and recovery is permitted.'
          },
          {
            type: 'space',
            label: 'The Closed Door',
            instruction: 'Signal to others and to your own nervous system that this is protected time. Close the door. Set a timer. Do not compromise the window once it has started. Your integrative pattern means the reset is real -- but only if the conditions are genuinely protected.'
          }
        ]
      },

      // -----------------------------------------------------------------------
      anchor_mixed: {
        tagline:     'Strategic Recovery With Variable Depth.',
        description: 'Your system is capable of effective afternoon recovery, but a high-load afternoon with a mixed integration pattern means the depth of reset available varies. On most afternoons, a standard NSDR window produces reliable restoration. On afternoons where load has been quietly accumulating, the same window may produce lighter rest than expected. The protocol is the same -- the expectation of complete reset is adjusted.',
        steps: [
          {
            type: 'somatic',
            label: 'NSDR or Passive Rest',
            instruction: 'Lie flat or recline. Use a body scan or Yoga Nidra audio if available. If the mind is too active for guided audio, close your eyes and focus solely on the breath. On a variable-load afternoon, passive rest without complete shutdown is still restorative -- partial recovery is better than no recovery.',
            duration: '20 min',
            toolLink: 'https://insig.ht/TRHQ0iERP0b'
          },
          {
            type: 'light',
            label: 'Dimmed Environment',
            instruction: 'Reduce light significantly. On a mixed-pattern high-load afternoon, the absence of the usual resilience buffer means light sensitivity may be higher than you expect. Default to darker rather than testing your current tolerance.'
          },
          {
            type: 'space',
            label: 'Protected Window',
            instruction: 'Close the door and set a timer. On variable-load afternoons, your system will not signal urgency for the recovery window even when it is needed. The closed door and the timer create the structure your nervous system is not generating internally.'
          }
        ]
      },

      // -----------------------------------------------------------------------
      anchor_accumulative: {
        tagline:     'Load Reduction Over Recovery: The Afternoon Priority.',
        description: 'For the Anchor with an accumulative pattern, a high-load afternoon is the moment when the absence of distress signals is most costly. Your system has been carrying load without advertising it and is now asking it to continue performing. The afternoon protocol is not primarily about rest -- it is about reducing the rate of further accumulation and providing the longest possible discharge window before evening.',
        steps: [
          {
            type: 'space',
            label: 'Extended NSDR',
            instruction: 'A minimum of 25 minutes -- not 20 -- in complete inactivity. Reclined, door closed, no devices. Your accumulative pattern means the standard 20-minute window clears less than it does for an integrative system. The additional five minutes is not optional padding. It is the portion of the window where genuine discharge begins for your pattern.',
            duration: '25 min',
            toolLink: 'https://insig.ht/TRHQ0iERP0b'
          },
          {
            type: 'light',
            label: 'Full Dimming',
            instruction: 'Minimum light for the full duration. For an accumulative system under high load, even moderate ambient light maintains a low level of visual processing that competes with the discharge the rest protocol is trying to produce. Darker is not a comfort choice -- it is a condition for the protocol to work.'
          },
          {
            type: 'somatic',
            label: 'Weighted and Supported',
            instruction: 'Weighted blanket if available. Full body supported. The proprioceptive containment signal reduces the postural vigilance cost your system maintains even at rest. For your accumulative pattern, removing this background cost is what makes the rest window genuinely restorative rather than merely inactive.'
          }
        ]
      }
    }
  },


  // ===========================================================================
  // EVENING TAPER : Low / Medium Load
  // ===========================================================================

  'evening-taper': {
    id:               'evening-taper',
    name:             'The Descent',
    triggerCondition: 'Evening + Sleep Prep',
    variants: {

      // -----------------------------------------------------------------------
      sensor_integrative: {
        tagline:     'Sensory Decompression: Emptying the Bucket Before Sleep.',
        description: 'The modern day is loud and bright. By evening, your sensory processing system has been working at capacity for many hours. This protocol is not only about sleep preparation -- it is about emptying the accumulated input of the day so that it does not carry into sleep and into tomorrow. Your integrative pattern means the emptying is available when the conditions are right. The conditions must be built, not hoped for.',
        spotifyLink: 'https://app.declutterthemind.com/?meditation=1677352314447x311753051750268900',
        steps: [
          {
            type: 'space',
            label: 'The Compression Cocoon',
            instruction: 'Get into bed or your quietest space earlier than feels necessary. Heavy blanket on. A small, enclosed physical space. You need physical containment to feel safe enough to release the vigilance your nervous system has been maintaining all day.'
          },
          {
            type: 'light',
            label: 'Zero Lux Protocol',
            instruction: 'A blackout mask is the most reliable tool available. Even the standby light on a device is a photon signal that your vigilant nervous system will track across the night. Eliminate every light source you can before the mask goes on.'
          },
          {
            type: 'sound',
            label: 'Noise Masking',
            instruction: 'Silence can register as loud when every background creak and shift is audible. Use steady nature sound to smooth the auditory edges of the room. This is acoustic containment, not stimulation -- the sound removes unpredictability from the auditory field.',
            toolLink: 'https://insig.ht/oiIEJeSRP0b'
          }
        ]
      },

      // -----------------------------------------------------------------------
      sensor_mixed: {
        tagline:     'The Variable Evening: Building Down at the Right Pace.',
        description: 'Your evening descent cannot follow a fixed timetable because your residual load varies. Some evenings the day has discharged reasonably well and a standard taper is sufficient. Others the load has been building since morning and the taper needs to begin earlier and run longer. The protocol provides the structure -- you set the pace based on what the day has actually been.',
        steps: [
          {
            type: 'light',
            label: 'Early Kelvin Drop',
            instruction: 'Transition to warm-spectrum lighting -- below 2700K -- at least 90 minutes before your intended sleep time. On higher-load evenings, begin this transition two hours out. Your mixed pattern means the descent takes longer on some days than others. More time, not more effort, is the solution.'
          },
          {
            type: 'space',
            label: 'Progressive Closure',
            instruction: 'Close the home room by room over 45 to 60 minutes rather than all at once. Each closure reduces a zone of environmental processing demand. By the time you reach your sleep space, your nervous system has been stepping down for some time rather than attempting an abrupt transition from full engagement to rest.'
          },
          {
            type: 'somatic',
            label: 'Contained and Warm',
            instruction: 'Heavy blanket, warm temperature in the sleep space, and if available a warm drink 30 minutes before sleep. On evenings where the day has been harder, add proprioceptive pressure -- a cushion against your back or a weighted blanket across the full body. Contain the nervous system physically before asking it to rest cognitively.'
          }
        ]
      },

      // -----------------------------------------------------------------------
      sensor_accumulative: {
        tagline:     'The Long Descent: Unwinding What the Day Left Behind.',
        description: 'For the Sensor with an accumulative pattern, the evening is not simply the end of today -- it is also carrying what the previous days did not fully clear. A standard evening taper is insufficient. The descent must begin earlier, run longer, and go deeper than it would for a system that clears between exposures. The goal is not perfect reset -- it is maximum discharge before sleep, so that tomorrow begins with less carried load than today did.',
        steps: [
          {
            type: 'light',
            label: 'Two-Hour Kelvin Drop',
            instruction: 'Begin the warm-spectrum transition two full hours before sleep. Switch all lighting to below 2700K and below eye level. For your accumulative pattern, the circadian shutdown signal needs more lead time than a standard taper because your system has more to discharge before it can transition into rest.',
            duration: '120 min'
          },
          {
            type: 'space',
            label: 'Complete Environmental Closure',
            instruction: 'Every room in the home closed and darkened before you enter your sleep space. The goal is that by the time you lie down, your nervous system has not encountered a new sensory demand in at least 30 minutes. The sleep space must be the quietest environment of the entire day, not just of the hour.'
          },
          {
            type: 'somatic',
            label: 'Maximum Containment',
            instruction: 'Heaviest available blanket. Blackout mask. Acoustic masking with steady nature sound at low volume. For your accumulative pattern, each of these is a non-negotiable layer rather than an optional comfort add. The combination creates a sensory environment where your nervous system encounters nothing that requires processing -- the only condition under which genuine overnight clearing can begin.',
            toolLink: 'https://insig.ht/oiIEJeSRP0b'
          }
        ]
      },

      // -----------------------------------------------------------------------
      seeker_integrative: {
        tagline:     'The Dopamine Detox: Landing the Plane.',
        description: 'Your brain resists the evening transition because rest feels understimulating compared to the high-dopamine engagement of the day. You need to transition from high-dopamine to low-dopamine using tools that are complex enough to keep the active mind occupied while the body shuts down. Your integrative pattern means the descent is available -- the challenge is bridging the gap between where your system is and where sleep requires it to be.',
        spotifyLink: 'https://insig.ht/j0QXp1mRP0b',
        steps: [
          {
            type: 'somatic',
            label: 'Vipassana Body Scan',
            instruction: 'Do not attempt to empty your mind. Instead, conduct a full-body scan from toes to head, moving attention deliberately through each region. This gives the active mind a specific task that gradually reduces in intensity as it moves upward, bringing the system down through engagement rather than fighting it into stillness.',
            toolLink: 'https://insig.ht/47MXPahRP0b'
          },
          {
            type: 'sound',
            label: 'Complex Harmonic Sound',
            instruction: 'Tibetan gongs or layered harmonic soundscapes. Unlike white noise, these contain complex harmonics that satisfy the active mind with sufficient novelty while dragging brainwave frequency down toward Theta. The ADHD brain will track the sound rather than spiral into tomorrow.',
            toolLink: 'https://insig.ht/Uk4k9dwRP0b'
          },
          {
            type: 'somatic',
            label: 'NSDR Backup',
            instruction: 'If sleep does not arrive within 20 minutes, switch to Yoga Nidra or Non-Sleep Deep Rest audio. This systematically shuts down the nervous system even when the mind is still partially active. 20 minutes produces restoration equivalent to 3 to 4 hours of recovery-quality sleep. For your integrative pattern, it is a reliable bridge to sleep rather than a substitute for it.',
            toolLink: 'https://insig.ht/TRHQ0iERP0b'
          }
        ]
      },

      // -----------------------------------------------------------------------
      seeker_mixed: {
        tagline:     'The Variable Descent: Matching the Landing to the Current Load.',
        description: 'Your evening dopamine transition is real but its difficulty varies with what you are already carrying. On lower-load evenings, the standard body scan and harmonic sound produces a clean descent. On evenings where load has been higher, the same tools may not be sufficient to bridge from your current activation level to rest. The protocol adapts the descent depth to the day.',
        steps: [
          {
            type: 'light',
            label: 'Adaptive Kelvin Timing',
            instruction: 'On standard evenings, begin the warm-spectrum transition 60 minutes before sleep. On higher-load evenings, begin 90 minutes out. Your mixed pattern means the circadian shutdown signal needs more lead time on the days where your system has been carrying more -- but you may not feel the difference until the window has already closed.'
          },
          {
            type: 'somatic',
            label: 'Tiered Scan Protocol',
            instruction: 'Begin with the full Vipassana body scan. If relaxation is visible after one pass, you are on a lower-load evening and the standard protocol is sufficient. If the mind remains active after one pass, conduct a second slower scan and add the harmonic sound layer simultaneously. The double-pass is the variable-load adjustment.',
            toolLink: 'https://insig.ht/47MXPahRP0b'
          },
          {
            type: 'sound',
            label: 'Harmonic or Delta Based on State',
            instruction: 'If the scan produces visible softening, stay with Tibetan gongs or harmonic sound. If it does not, transition to Delta binaural beats. For a mixed-pattern Seeker, some evenings the brain needs to be pulled down to Delta rather than guided there through harmonic engagement.',
            toolLink: 'https://insig.ht/Uk4k9dwRP0b'
          }
        ]
      },

      // -----------------------------------------------------------------------
      seeker_accumulative: {
        tagline:     'The Backlog Evening: Descent Through a Loaded System.',
        description: 'For the Seeker with an accumulative pattern, the evening challenge is not simply transitioning from high stimulation to rest. It is transitioning from high stimulation while carrying accumulated load that has not cleared across the day. The active mind cannot be occupied into rest when the nervous system is simultaneously managing a backlog. The backlog must be addressed first, the descent second.',
        steps: [
          {
            type: 'somatic',
            label: 'Physical Pre-Discharge',
            instruction: '10 minutes of slow, sustained movement before any wind-down begins -- gentle floor stretching, a slow walk, or progressive joint rotation. This is not activation. It is giving accumulated load a physical route out before the system is asked to shut down. Attempting descent without this step produces restlessness that harmonic sound cannot bridge.',
            duration: '10 min'
          },
          {
            type: 'somatic',
            label: 'Progressive Muscle Release',
            instruction: 'Lying down, systematically tense and release each muscle group from feet to face. Hold each tension for 5 seconds and release for 10. This is one of the most reliable tools for bringing a loaded accumulative system into parasympathetic range. The physical release works independently of whether the mind cooperates.',
            duration: '10 min'
          },
          {
            type: 'sound',
            label: 'Delta Entrainment',
            instruction: 'Delta binaural beats at 0.5 to 4Hz for the full sleep-onset window. For your accumulative pattern, Theta is an intermediate state your system may not sustain -- the target is Delta directly. The active mind will track the frequency as it descends, which is the mechanism rather than an obstacle to it.',
            spotifyLink: 'https://insig.ht/SbedT0EUm1b'
          }
        ]
      },

      // -----------------------------------------------------------------------
      anchor_integrative: {
        tagline:     'Engineer Your Restoration: The Biological Sunset.',
        description: 'As the day concludes, your nervous system requires a deliberate transition signal. Your integrative pattern means rest is available when conditions are designed for it -- the risk is assuming the transition will happen without intentional design. By mimicking the setting sun, you signal to the pineal gland that vigilance is no longer required and restoration can begin.',
        spotifyLink: 'https://open.spotify.com/playlist/37i9dQZF1DWXSyfX6gqDNp?si=4e071e2e23394ff5',
        steps: [
          {
            type: 'light',
            label: 'Kelvin Drop',
            instruction: 'Switch to warm-spectrum lighting below 2700K. Ensure all light sources are below eye level to mimic the angle of the setting sun. This is the most reliable single intervention for advancing the circadian melatonin signal for your profile.'
          },
          {
            type: 'space',
            label: 'Visual Closure',
            instruction: 'Close blinds and doors. This creates a contained environment that signals safety to the amygdala and prepares the body for the vulnerability of sleep. Your system responds to these cues -- they need to be present for the response to be reliable.'
          },
          {
            type: 'sound',
            label: 'Acoustic Softening',
            instruction: 'Transition to instrumental audio only. Lyrics require active language processing. Instrumental sound allows the verbal processing centres to deactivate without requiring deliberate effort. Your integrative system uses this window efficiently when the acoustic environment supports it.'
          }
        ]
      },

      // -----------------------------------------------------------------------
      anchor_mixed: {
        tagline:     'The Consistent Descent: Building Rest on a Variable Foundation.',
        description: 'Your system is broadly resilient and the evening transition usually follows its course without significant effort. But your mixed integration pattern means some evenings arrive with more accumulated load than is visible from the outside. On those evenings, the standard taper is necessary but not sufficient. The protocol builds in the consistency that your nervous system needs on both types of evening.',
        steps: [
          {
            type: 'light',
            label: 'Early Consistent Kelvin Drop',
            instruction: 'Begin the warm-spectrum transition at the same time every evening regardless of how the day felt. Your mixed pattern means the evenings where you need the earlier signal most are not always the ones where you will think to implement it. Consistency removes the decision from the equation.'
          },
          {
            type: 'space',
            label: 'Reliable Environmental Anchors',
            instruction: 'The same sequence of closures every evening -- the same blinds, the same doors, in the same order. Repetition builds a conditioned shutdown response in your nervous system over time. On variable-load evenings, the conditioned response does the work that your internal signals may not be providing.'
          },
          {
            type: 'somatic',
            label: 'Breathing as a Baseline Check',
            instruction: 'Five rounds of the physiological sigh before sleep. On standard evenings, this produces a visible relaxation response and sleep follows. If the relaxation response is absent after five rounds, tonight is a higher-load evening and the sleep space needs to be quieter and darker than usual before attempting rest.'
          }
        ]
      },

      // -----------------------------------------------------------------------
      anchor_accumulative: {
        tagline:     'The Proactive Evening: Reducing Load Before It Compounds Overnight.',
        description: 'For the Anchor with an accumulative pattern, the evening is the most important regulatory window of the day. Your system does not signal depletion clearly enough for you to catch it at the point of onset. By evening, accumulated load is present whether you can locate it or not. The taper is not about winding down from a feeling -- it is about creating conditions that allow overnight clearing to begin as early as possible.',
        steps: [
          {
            type: 'light',
            label: 'Extended Kelvin Transition',
            instruction: 'Begin the warm-spectrum transition 90 minutes before sleep -- not 60. For your accumulative pattern, the earlier start gives the circadian shutdown signal more lead time to work through what your system has been carrying. The difference between a 60 and 90 minute ramp is most significant on the days you cannot feel the difference.',
            duration: '90 min'
          },
          {
            type: 'space',
            label: 'Load-Reduction Sweep',
            instruction: 'Before entering your sleep space, spend 5 minutes reducing background demand in the adjacent spaces -- close doors, lower any remaining lights, remove objects from visible surfaces. Your accumulative pattern means your nervous system is tracking more environmental data than you are consciously registering. Reducing that data reduces the load your system carries into sleep.'
          },
          {
            type: 'somatic',
            label: 'Passive Grounding',
            instruction: 'Lie down with one hand on your chest and one on your abdomen. Take 10 slow, deliberate breaths noticing the rise and fall. This is not a relaxation technique -- it is a load-awareness practice. For your profile, connecting to body sensation before sleep surfaces what the day has deposited and gives the nervous system permission to begin clearing it.',
            spotifyLink: 'https://insig.ht/cT2RQ9xUm1b'
          }
        ]
      }
    }
  },


  // ===========================================================================
  // EVENING SHELTER : High Load
  // ===========================================================================

  'evening-shelter': {
    id:               'evening-shelter',
    name:             'The Shelter Protocol',
    triggerCondition: 'Evening + High Load',
    variants: {

      // -----------------------------------------------------------------------
      sensor_integrative: {
        tagline:     'The Total Sanctuary: Rest Through Full Withdrawal.',
        description: 'A high-load evening for the Sensor with an integrative pattern means the sensory bucket overflowed before bedtime arrived. Standard taper protocol is insufficient. You require a complete sensory sanctuary -- an environment stripped of all non-essential input so that your nervous system has nothing left to process and the only available direction is inward and down. Your integrative pattern means genuine clearing is available within this environment, but only if the environment is complete rather than approximate.',
        steps: [
          {
            type: 'light',
            label: 'Absolute Darkness',
            instruction: 'Every light source eliminated. Blackout blind or mask. Any screen indicator covered. This is not a preference -- it is a condition. Even a single LED is a photon signal your vigilant system will track through the night. Your integrative pattern can release from this environment. It cannot release from one that continues to emit signals.'
          },
          {
            type: 'sound',
            label: 'Acoustic Sealing',
            instruction: 'Foam or silicone earplugs first, then noise-cancelling headphones over them if available. Pink noise or nature sound at very low volume if complete silence increases hypervigilance rather than reducing it. The goal is a sealed auditory environment -- unpredictable sound eliminated, optional masking sound at the minimum volume that prevents silence from registering as threat.',
            toolLink: 'https://insig.ht/oiIEJeSRP0b'
          },
          {
            type: 'somatic',
            label: 'Maximum Containment',
            instruction: 'Full weighted blanket coverage. Body fully supported. A body pillow or cushion against any side that feels exposed. Your nervous system reads physical enclosure as biological safety and reduces autonomic vigilance accordingly. For your integrative pattern, this is the condition that allows the overnight clearing your system is capable of.'
          }
        ]
      },

      // -----------------------------------------------------------------------
      sensor_mixed: {
        tagline:     'Variable High Load: Full Shelter, Adjusted Duration.',
        description: 'A high-load evening with a mixed integration pattern requires complete shelter -- but the duration and depth of recovery available within that shelter varies. On evenings where the load has arrived recently and sharply, the full sanctuary protocol will produce substantial overnight clearing. On evenings where load has been building across several days, the same environment will reduce further accumulation without fully clearing what is already present. Both are valid outcomes. The protocol does not change based on which one tonight is.',
        steps: [
          {
            type: 'space',
            label: 'Full Environmental Closure',
            instruction: 'Every door and blind closed. Sleep space cleared of any visible objects that carry cognitive or emotional association -- work items, unfinished tasks, pending decisions. For your mixed pattern under high load, every object in the visual field that carries association adds to the processing demand your nervous system carries into sleep.'
          },
          {
            type: 'light',
            label: 'Complete Visual Shutdown',
            instruction: 'Blackout mask regardless of how dark the room appears. On a high-load evening with a variable integration pattern, residual ambient light that feels tolerable at the start of the window will register differently at 2am when processing capacity is lower. Eliminate it at the outset.'
          },
          {
            type: 'somatic',
            label: 'Layered Physical Containment',
            instruction: 'Weighted blanket, earplugs or masking sound, and warm temperature in the sleep space. Each layer addresses a different sensory channel. On a mixed-pattern high-load evening, the layers collectively reduce the threshold of input that can interrupt your rest without any single layer needing to carry the full burden.'
          }
        ]
      },

      // -----------------------------------------------------------------------
      sensor_accumulative: {
        tagline:     'The Accumulated Evening: Shelter as Multi-Day Recovery.',
        description: 'For the Sensor with an accumulative pattern, a high-load evening is not an acute event. It is the visible surface of what several days have deposited. The shelter protocol will not clear this overnight. What it will do is stop the accumulation from continuing, provide the deepest available clearing conditions, and give your system the best chance of arriving at tomorrow with less than it carries today. Consistency of this protocol across several nights is the arc. Tonight is one step of it.',
        steps: [
          {
            type: 'space',
            label: 'The Complete Sanctuary',
            instruction: 'Every sensory variable in the sleep environment controlled to its minimum state: darkness, silence or steady masking sound, cool temperature, closed door, no devices. For your pattern, approximations compound. The sanctuary must be complete to function as one. Identify the one element that is usually left incomplete and address it tonight.',
          },
          {
            type: 'somatic',
            label: 'Extended Containment',
            instruction: 'Heaviest available blanket. Full body supported including neck and arms. If a body pillow is available, use it to eliminate the sensation of open space on any side. For your accumulative pattern, the physical containment signal needs to be present at the start of the sleep window and maintained through it -- not applied briefly as a comfort measure.',
          },
          {
            type: 'sound',
            label: 'Sustained Acoustic Masking',
            instruction: 'Nature sound or pink noise running throughout the entire sleep window -- not just at the start. For your pattern, acoustic unpredictability in the early hours of the morning registers as a new input on a system that has been attempting to clear overnight. The masking sound removes that variable for the full duration.',
            toolLink: 'https://insig.ht/oiIEJeSRP0b'
          }
        ]
      },

      // -----------------------------------------------------------------------
      seeker_integrative: {
        tagline:     'Discharge and Descend: Racing Mind Toward Rest.',
        description: 'A high-load evening for the Seeker with an integrative pattern is characterised by a racing, looping mind that cannot locate the off switch. The system is still in high-dopamine mode and rest feels inaccessible. The fastest path is physical exhaustion followed by a controlled descent using tools the active brain will actually engage with rather than resist. Your integrative pattern means the descent is available if the pre-discharge is genuine.',
        steps: [
          {
            type: 'somatic',
            label: 'Physical Release',
            instruction: '10 to 15 minutes of vigorous physical exertion before wind-down begins -- not exercise for fitness, but stress hormone metabolisation. The goal is to arrive at your sleep space with the sympathetic tank meaningfully emptied. Your integrative pattern means this discharge will produce a genuine shift rather than a temporary suppression.',
            duration: '15 min'
          },
          {
            type: 'somatic',
            label: 'Progressive Muscle Release',
            instruction: 'Lying down, systematically tense and release each muscle group from feet to face. Hold each tension for 5 seconds and release for 10. This brings a hyper-aroused nervous system into parasympathetic range through physical mechanism rather than cognitive effort. Your active mind does not need to cooperate -- the body leads.',
            duration: '10 min'
          },
          {
            type: 'sound',
            label: 'Delta Entrainment',
            instruction: 'Binaural beats in the Delta range at 0.5 to 4Hz. Your active brain will track the frequency as it descends. This is the mechanism -- not an obstacle to it. Allow the tracking to happen rather than trying to stop it.',
            spotifyLink: 'https://insig.ht/SbedT0EUm1b'
          }
        ]
      },

      // -----------------------------------------------------------------------
      seeker_mixed: {
        tagline:     'The Variable High-Load Evening: Discharge Calibrated to Carried Load.',
        description: 'A high-load evening with a mixed integration pattern means the discharge protocol that reliably produces rest on other evenings may not be sufficient or appropriate tonight. On evenings where load has been primarily acute, vigorous discharge followed by descent works cleanly. On evenings where load has been building across days, vigorous discharge adds to the backlog rather than clearing it. Read the state before choosing the intensity.',
        steps: [
          {
            type: 'somatic',
            label: 'Discharge Intensity Assessment',
            instruction: 'Before any movement, take 2 minutes of stillness and notice whether the restlessness feels energised or depleted. Energised restlessness means today is an acute high-load evening -- proceed with vigorous discharge. Depleted restlessness means load has been accumulating and discharge should be slow and sustained rather than intense.',
            duration: '2 min'
          },
          {
            type: 'somatic',
            label: 'Appropriate Discharge',
            instruction: 'For energised restlessness: 10 to 15 minutes of vigorous movement followed by progressive muscle release. For depleted restlessness: 15 minutes of slow walking or gentle floor stretching followed by a full-body supported rest with weighted blanket. The goal in both cases is metabolisation of carried load -- the route differs.',
            duration: '15 min'
          },
          {
            type: 'sound',
            label: 'Delta as the Consistent Target',
            instruction: 'Regardless of which discharge path was used, end with Delta binaural beats for the sleep-onset window. For a mixed-pattern Seeker on a high-load evening, Delta is the appropriate target in both scenarios -- it is deep enough to serve as genuine descent for an acute load and as a container for the slower clearing of an accumulative state.',
            spotifyLink: 'https://insig.ht/SbedT0EUm1b'
          }
        ]
      },

      // -----------------------------------------------------------------------
      seeker_accumulative: {
        tagline:     'The Backlog Shelter: Clearing What Cannot Be Rushed.',
        description: 'A high-load evening for the Seeker with an accumulative pattern is the point where the backlog is most visible -- the racing mind is running on accumulated load that has nowhere to go. The shelter protocol does not attempt to clear the backlog tonight. It creates the conditions under which the maximum possible clearing can occur, prevents further accumulation, and gives the active mind a structure to work within rather than against.',
        steps: [
          {
            type: 'somatic',
            label: 'Low-Intensity Sustained Discharge',
            instruction: '15 to 20 minutes of slow, rhythmic movement -- floor stretching, a slow walk, or gentle progressive joint rotation. This is the only discharge protocol appropriate for a fully loaded accumulative system. Vigorous movement on top of a significant backlog produces a temporary dopamine spike that delays rest rather than enabling it.',
            duration: '20 min'
          },
          {
            type: 'space',
            label: 'The Stripped Environment',
            instruction: 'Sleep space at its minimum state: complete darkness, sealed acoustics, cool temperature, all devices removed or covered. For your accumulative pattern, each sensory variable that remains active in the sleep environment is something your system will continue processing. The environment must offer nothing for it to engage with.'
          },
          {
            type: 'sound',
            label: 'Delta for the Full Night',
            instruction: 'Set Delta binaural beats to run for the full intended sleep duration rather than just the onset window. For your accumulative pattern, the overnight clearing that needs to occur is deeper and longer than for other profiles. Maintaining the Delta frequency environment through the night supports deeper sleep phases rather than allowing the system to return to lighter processing states.',
            spotifyLink: 'https://insig.ht/SbedT0EUm1b'
          }
        ]
      },

      // -----------------------------------------------------------------------
      anchor_integrative: {
        tagline:     'Safety First. Sleep Follows.',
        description: 'When the day has been genuinely dysregulating, attempting a standard wind-down is counterproductive. Your nervous system is still in threat-assessment mode and will resist the transition. The first priority is re-establishing a physiological sense of safety. Your integrative pattern means once the threat signal subsides, the descent follows naturally -- the work is in creating the conditions, not in forcing the outcome.',
        steps: [
          {
            type: 'somatic',
            label: 'Thermal Descent',
            instruction: 'Take a warm shower or bath 60 to 90 minutes before sleep. The subsequent body temperature drop mimics the natural cooling signal that precedes deep sleep, creating a reliable biological bridge to rest that works independently of your cognitive state.',
            duration: '15 min'
          },
          {
            type: 'space',
            label: 'Full Environmental Closure',
            instruction: 'Close every door and blind. Remove visible clutter from immediate sight lines. Your amygdala continues scanning even when you are trying to rest. Reducing visual data points lowers the threat-detection burden and allows the safety signal from the thermal descent to take hold.'
          },
          {
            type: 'somatic',
            label: 'Somatic Grounding',
            instruction: 'Lie down. One hand on your chest, one on your abdomen. Ten slow, deliberate breaths noticing the rise and fall. This body-contact grounding activates interoceptive awareness and redirects attention from ruminative thought to physical presence -- the most reliable on-ramp to rest for your integrative pattern.',
            spotifyLink: 'https://insig.ht/cT2RQ9xUm1b'
          }
        ]
      },

      // -----------------------------------------------------------------------
      anchor_mixed: {
        tagline:     'High-Load Shelter: Protection for the Nights When Resilience Is Not Available.',
        description: 'A high-load evening with a mixed integration pattern is one of the contexts where your system is most likely to be carrying more than it is showing. Your usual resilience is not guaranteed tonight. The shelter protocol does not assume resilience -- it builds the conditions that allow whatever capacity remains to work as effectively as possible. Protection now prevents a harder recovery across the following days.',
        steps: [
          {
            type: 'somatic',
            label: 'Thermal Descent and Sigh Sequence',
            instruction: 'Warm shower or bath followed by 10 rounds of the physiological sigh after lying down. The thermal descent creates the biological cooling signal. The sigh sequence resets the CO2 balance and engages the parasympathetic brake. For a mixed-pattern system under high load, these two tools in sequence are more effective than either alone.',
            duration: '20 min'
          },
          {
            type: 'space',
            label: 'Complete Closure',
            instruction: 'Every door and blind. No devices visible or audible. For a mixed-pattern high-load evening, the environmental closure matters more than it appears to on ordinary nights -- your internal warning system is not reliably providing the signals that would tell you this.'
          },
          {
            type: 'somatic',
            label: 'Grounding and Supported Rest',
            instruction: 'One hand on chest, one on abdomen, 10 deliberate breaths. Then heavy blanket and full body supported. The grounding practice surfaces the actual state. The containment provides the response to whatever it surfaces. Together they form the complete shelter for your pattern.',
            spotifyLink: 'https://insig.ht/cT2RQ9xUm1b'
          }
        ]
      },

      // -----------------------------------------------------------------------
      anchor_accumulative: {
        tagline:     'The Invisible Full: Shelter for What You Cannot Measure.',
        description: 'A high-load evening for the Anchor with an accumulative pattern is the moment where the gap between what is present and what is visible is largest. Your system is carrying significant accumulated load without advertising it and is now approaching sleep without the capacity to clear it that a fully reset system would have. The shelter protocol creates the deepest available overnight clearing conditions. Tonight begins a recovery arc -- not a single event.',
        steps: [
          {
            type: 'somatic',
            label: 'Extended Thermal Protocol',
            instruction: 'Warm bath of at least 20 minutes, 90 minutes before sleep. The longer duration produces a more substantial body temperature drop in the subsequent hour, which creates a stronger biological sleep-onset signal. For an accumulative system under high load, the standard 15-minute shower produces a weaker version of this signal than the situation requires.',
            duration: '20 min'
          },
          {
            type: 'space',
            label: 'Maximum Load Reduction',
            instruction: 'Full environmental closure. Additionally: remove or cover any object in the sleep space that carries cognitive association -- work items, unread messages, pending tasks. For your accumulative pattern, these objects are not background neutral. They are active low-level processing demands your system will maintain across the night without any signal that it is doing so.'
          },
          {
            type: 'somatic',
            label: 'Full Physical Grounding',
            instruction: 'Heaviest available blanket. Full body supported. One hand on chest, one on abdomen. Ten deliberate breaths. Then release all intentional effort. For your pattern, the grounding practice is the handover point -- the moment you give the rest of the recovery work to the environment you have built rather than continuing to manage it consciously.',
            spotifyLink: 'https://insig.ht/cT2RQ9xUm1b'
          }
        ]
      }
    }
  }

}
