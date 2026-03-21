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
        spotifyLink: 'https://open.spotify.com/playlist/37i9dQZF1DXcgZcN2HVMoe?si=b5de500358ea4a7d',
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
        description: 'Your system does not arrive at each morning fully reset. What the previous day held [its noise, its demands, its unresolved moments] is still present in your nervous system when you wake. The morning protocol must account for this prior-day load before attempting any activation. The goal is not to begin the day. The goal is to discharge what the night did not clear, and then begin.',
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
        spotifyLink: 'https://open.spotify.com/playlist/37i9dQZF1DZ06evO3YvhXa?si=bf3de439385949a5',
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
        spotifyLink: 'https://open.spotify.com/album/3PcQ6nRD17dBvMspFwXIx4?si=J25A9fn6RWWEIc_Ed7ZfUA',
        steps: [
          {
            type: 'somatic',
            label: 'Physical Discharge First',
            instruction: 'Engage in 10 minutes of moderate movement before any stimulation input, such as a slow walk, light stretching or gentle joint rotation. This is not activation. It is the metabolism of the residual load that your system arrived with. Until this step is complete, stimulation will be scattered rather than focused.',
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
            instruction: 'Use steady rhythmic music at moderate tempo. The goal is entrainment to a stable beat, not the dopamine spike of high-intensity audio. Rhythm regulates. Volume, at this stage, loads.'
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
        description: 'For the Sensor, a high-load morning with an integrative pattern means that the sensory bucket is full, likely due to poor sleep, overnight noise or emotional residue. Although recovery is available when the conditions genuinely support it, it is best not to push through. Do not attempt to push through. The only productive move is to decompress before any environmental exposure.',
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
        toolLink: 'https://insig.ht/rQC9fMIrG1b',
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
        description: 'For the Sensor with an accumulative pattern, a high-load morning is not a temporary state caused by a difficult night. It is the result of several days of input that has not cleared. This morning does not just need containment, it needs a longer discharge window than a single morning protocol can fully deliver. What the protocol can do is prevent compounding and give your system the most recovery-friendly conditions available.',
        toolLink: 'https://app.declutterthemind.com/?meditation=1667764972208x231304055037624320',
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
            instruction: 'Start in near-darkness and only introduce light when there is a visible softening of the body, such as a loosening of the jaw or shoulders. Do not use time as the trigger for introducing light. Use your bodys state as the trigger. Your body will set the schedule today.'
          }
        ]
      },

      // -----------------------------------------------------------------------
      seeker_integrative: {
        tagline:     'Burn It Off First.',
        description: 'For your system, anxiety and restlessness are often the same signal. When the morning arrives with high load, the most direct regulatory tool available is physical discharge. Move the stress through the body before attempting any cognitive task. With your integrative pattern, the discharge window will produce a genuine reset rather than a temporary distraction.',
        toolLink: 'https://app.declutterthemind.com/?meditation=1667765819764x345910268725559300',
        steps: [
          {
            type: 'somatic',
            label: 'Discharge Protocol',
            instruction: '10 to 15 minutes of vigorous physical movement such as jumping jacks, a brisk walk, or weighted stretching. Your nervous system needs to metabolise the stress hormones before it can regulate. This is not optional. It is the mechanism, not a warm-up.',
            duration: '15 min'
          },
          {
            type: 'sound',
            label: 'Rhythmic Anchor',
            instruction: 'Play steady, rhythmic music that is structured and pulse-driven, rather than chaotic. Rhythm entrains the nervous system. It provides predictability without understimulation. After discharge, rhythm acts as a bridge back to a working baseline.'
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
        toolLink: 'https://app.declutterthemind.com/?meditation=1667765819764x345910268725559300',
        steps: [
          {
            type: 'somatic',
            label: 'Modulated Discharge',
            instruction: 'Start with five minutes of moderate movement, such as a brisk walk or light jumping. Assess your progress after five minutes. If your agitation has decreased, continue and increase the intensity. If your agitation increases, switch to slow, rhythmic movements such as walking, meditation or gentle stretching. Your body is telling you which direction it needs to go in today.',
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
        toolLink: 'https://app.declutterthemind.com/?meditation=1667765819764x345910268725559300',
        steps: [
          {
            type: 'somatic',
            label: 'Low-Intensity Discharge First',
            instruction: 'Do 10 minutes of slow walking or gentle, rhythmic movement; nothing vigorous. This is not the full discharge protocol. It is a pre-discharge process, providing an outlet for accumulated load before the system is asked to produce more. Only once this process is complete should you consider whether higher-intensity movement is appropriate.',
            duration: '10 min'
          },
          {
            type: 'space',
            label: 'One Controlled Variable',
            instruction: 'Choose one element of your morning environment that you can control completely, such as the position of a chair, whether you open or close a window, or the use of a single lamp. Having agency over one concrete variable in this way reduces the sensation of being managed by your environment rather than managing it.'
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
        toolLink: 'https://app.declutterthemind.com/?meditation=1728331909613x189005917071605760',
        steps: [
          {
            type: 'somatic',
            label: 'Sigh and Scan',
            instruction: 'Complete five rounds of the physiological sigh [two sharp inhales followed by one long exhale] and then perform a 60-second body scan or a morning Vipassana meditation. Notice whether any tension releases after the sigh or remains present. If you are still tense, today is a variable-pattern day and the protocol needs to be regulatory rather than activating.',
            duration: '15 min'
          },
          {
            type: 'light',
            label: 'Indirect First',
            instruction: 'Allow 10 minutes of indirect morning light before any direct exposure. For most high-load mornings, this is sufficient to establish a regulated baseline for your system. This step is designed to prevent an unnecessary stimulation ramp from being loaded onto a potentially depleted system.'
          },
          {
            type: 'space',
            label: 'Low-Demand Window',
            instruction: 'Postpone the first high-demand activity such as a meeting, conversation or complex task by at least 20 minutes. Your system does not readily signal distress, but that does not mean it is not present. Allow the regulation window time to work before expecting your resilience to carry you through the morning.',
            duration: '20 min'
          }
        ]
      },

      // -----------------------------------------------------------------------
      anchor_accumulative: {
        tagline:     'The Silent Overflow: Managing What You Cannot Yet Feel.',
        description: 'A high-load morning for the Anchor with an accumulative pattern is the context where the absence of distress signals is most misleading. Your system is likely carrying significant load without advertising it. The morning protocol is not about managing what you feel. It is about managing what is present whether you feel it or not.',
        toolLink: 'https://app.declutterthemind.com/?meditation=1728331909613x189005917071605760',
        steps: [
          {
            type: 'somatic',
            label: 'Extended Stillness',
            instruction: 'Allow yourself a minimum of 10 minutes of complete inactivity before any transition. This means no devices, no decisions and no movement beyond breathing. This is not rest; it is a load assessment. During this time, your system will reveal what it is carrying, even if it has not volunteered that information.',
            duration: '10 min'
          },
          {
            type: 'space',
            label: 'Reduction Before Entry',
            instruction: 'Before moving into any shared or high-stimulus space, reduce the sensory input in your immediate environment by one sensory variable: close a door, lower a blind or remove an object from your line of sight. Reduction is the first regulatory tool, not the last.'
          },
          {
            type: 'light',
            label: 'Minimum Functional Light',
            instruction: 'Use the minimum amount of light that allows you to function, rather than the maximum amount that you can tolerate. Your threshold is not the correct calibration point for an intense morning with a high workload. Your actual system state is carrying more than your threshold suggests.'
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
        description: 'Your afternoon distraction is probably due to sensory fatigue, which is the result of processing too much environmental data during the morning. If you have a well-structured morning, you will arrive at the afternoon with some capacity remaining, but this is not infinite. The protocol does not introduce additional stimulation. It reduces friction, freeing up the processing power needed for sustained focus.',
        spotifyLink: 'https://app.declutterthemind.com/?meditation=1678059799227x776951858712019000',
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
        spotifyLink: 'https://app.declutterthemind.com/?meditation=1678059799227x776951858712019000',
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
        spotifyLink: 'https://app.declutterthemind.com/?meditation=1678059799227x776951858712019000',
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
            instruction: 'Use the minimum amount of light required for reading without straining your eyes. Do not compensate for fatigue by using brighter light, as this increases the processing demand. The goal is to sustain the task with minimum input, not to create an optimal environment for peak performance.'
          },
          {
            type: 'somatic',
            label: 'Sustained Pressure and Warmth',
            instruction: 'Keep a weighted lap pad and a warm drink to hand throughout the focus block. These are not comfort items for you; they are active regulatory inputs that slow the rate of further accumulation across the session.'
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
            instruction: 'Play brown noise, which is rougher and deeper than white noise, or the flow state link provided here. It occupies the distraction centre of your auditory cortex, allowing the rest of your brain to function. Your integrative system can process this input without being overwhelmed by it.'
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
        spotifyLink: 'https://insig.ht/skmY1CZQP0b',
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
            instruction: 'When you are feeling restless in the afternoon, make the most of the full vignette effect by switching off the overhead lights and turning up the task lamp. On more scattered afternoons, soften the contrast slightly by leaving the task lamp on, but not at full intensity. The degree of contrast depends on what your system can absorb today.'
          },
          {
            type: 'sound',
            label: 'Tiered Noise',
            instruction: 'Start with brown noise or the provided flow state music at a medium volume. Increase the volume if your focus sharpens after five minutes. Hold if it does not. On variable-load afternoons, the noise walls primary function is containment; stimulation is secondary.'
          }
        ]
      },

      // -----------------------------------------------------------------------
      seeker_accumulative: {
        tagline:     'Focus Through the Backlog: Sustainable Output Over Forced Activation.',
        description: 'By afternoon, your accumulative pattern means stimulation from the morning has layered rather than cleared. Adding more stimulation to pursue focus compounds the backlog rather than producing clarity. The afternoon focus protocol for your pattern is not about activation -- it is about creating the right conditions for sustained output within a system that is already running a higher baseline load than it appears to be.',
        spotifyLink: 'https://insig.ht/skmY1CZQP0b',
        steps: [
          {
            type: 'space',
            label: 'Agency Over One Variable',
            instruction: 'Before you begin, make one deliberate environmental adjustment that will increase your sense of control over the space. This could be as simple as opening a window, moving a chair, or clearing a surface. Having perceived agency over the environment reduces the cost of vigilance, which increases available focus.'
          },
          {
            type: 'light',
            label: 'Predictable Contrast',
            instruction: 'Turn on the task lamp and turn off the overhead light. The aim is to make the visual field predictable rather than stimulating attention. A stable, controlled lighting environment reduces the number of variables your accumulated system has to track.'
          },
          {
            type: 'sound',
            label: 'Rhythmic Containment',
            instruction: 'Play steady, medium-tempo music or brown noise at a moderate volume. For a productive afternoon, the sound should provide a sense of stability rather than stimulation. Rhythm provides structure. The volume should be kept below your usual preference not because of sensitivity, but because adding more input to a loaded system reduces output rather than increasing it.'
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
        spotifyLink: 'https://insig.ht/TcOSceRQP0b',
        steps: [
          {
            type: 'somatic',
            label: 'Sigh and Assess',
            instruction: 'Do three rounds of the physiological sigh before committing to the focus session. Observe whether the third sigh produces visible relaxation, or if the body remains in the same state. A relaxation response means that your system is ready to be activated. If there is no response, this afternoon will require a restorative period before attempting to focus.',
            duration: '3 min'
          },
          {
            type: 'sound',
            label: 'Modulated Frequency',
            instruction: 'On responsive afternoons, proceed as usual with 40 Hz gamma. On non-responsive afternoons, use Theta binaural beats instead, as these support consolidation and moderate restoration rather than activation. Your output on a partially loaded afternoon is higher from a rested baseline than from a pushed one.'
          },
          {
            type: 'space',
            label: 'Upright and Open',
            instruction: 'Adopt a standing or upright seated position that provides a wide visual field. On afternoons with variable loads, changing your posture alone may be enough to shift your state.'
          }
        ]
      },

      // -----------------------------------------------------------------------
      anchor_accumulative: {
        tagline:     'Sustained Output, Managed Load: Focus Without Adding to the Stack.',
        description: 'Your afternoon cognitive capacity is present but it is being sustained by a system that is carrying more than it appears to be. The focus protocol does not attempt to activate past that load. It creates the conditions for sustained output within it -- and prioritises not adding further to what is already accumulated.',
        spotifyLink: 'https://insig.ht/TcOSceRQP0b',
        steps: [
          {
            type: 'somatic',
            label: 'Passive Reset First',
            instruction: 'You must allow five minutes of complete inactivity before beginning. This means no screens, no movement, no input. For your accumulative pattern, this window allows the system to discharge briefly before another layer of demand is added. A focus block following a passive reset produces more output than one that begins immediately after a transition.',
            duration: '5 min'
          },
          {
            type: 'space',
            label: 'Reduced Input Field',
            instruction: 'Before you begin, remove one non-essential item from your immediate environment. This could be an object, a notification source or an open application. Your system is tracking more background data than you realise. Reducing one variable lowers the cost of vigilance without you having to experience it first.'
          },
          {
            type: 'sound',
            label: 'Low-Frequency Anchor',
            instruction: 'Play brown noise or steady, low-frequency music at a moderate volume. The aim is to mask unpredictable environmental sounds, not to activate attention. In your case, predictability of the auditory field is more important than stimulating attention.'
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
            instruction: 'Move to the quietest available space. Lie down or sit in a fully supported position. There should be no phones, background sounds or open doors. If you already practise meditation, you may do so. If you are sharing the space, wear noise cancelling headphones, even if you are not listening to anything.',
            duration: '15 min'
          },
          {
            type: 'light',
            label: 'Near-Darkness',
            instruction: 'Dim the light to the lowest tolerable level, or wear an eye mask. Visual input is one of the highest-bandwidth sensory channels. Taking it offline provides the most significant processing relief for your brain in the shortest amount of time.'
          },
          {
            type: 'somatic',
            label: 'Weight and Warmth',
            instruction: 'Place a heavy blanket or cushion over your legs and torso. This proprioceptive pressure tells the nervous system that the body is physically contained and not under threat. This provides direct input to the autonomic regulation pathway. For your integrative pattern, it creates the conditions for a genuine reset within the window.'
          }
        ]
      },

      // -----------------------------------------------------------------------
      sensor_mixed: {
        tagline:     'Variable Afternoon Load: Withdrawal Calibrated to Current State.',
        description: 'A high-load afternoon with a mixed integration pattern requires withdrawal -- but the depth and duration of that withdrawal depends on which version of your processing pattern is active. If today has been compounding, you need deeper withdrawal. If the load arrived recently rather than across the day, a shorter window may be sufficient. Assess before choosing the duration.',
        toolLink: 'https://insig.ht/SGjhihjUm1b',
        steps: [
          {
            type: 'somatic',
            label: 'State Assessment',
            instruction: 'Before lying down, take 60 seconds to notice whether your depletion feels shallow or deep. Shallow depletion, which arrives in the last hour or two, responds to a 10-minute retreat. Deep depletion, present since mid-morning or building over several days, requires a minimum of 20 minutes and will not fully respond to a single session.',
            duration: '1 min'
          },
          {
            type: 'space',
            label: 'Scaled Retreat',
            instruction: 'For shallow depletion, use the quietest available room with the door closed for 10 minutes. For deep depletion, full sensory withdrawal is required, using an eye mask and a weighted blanket for a minimum of 20 minutes. Do not use the shorter time frame on a day when the longer one is required.',
            duration: '10-20 min'
          },
          {
            type: 'light',
            label: 'Darkness as Default',
            instruction: 'On any high-load afternoon, default to near-darkness. This applies regardless of which depletion depth applies. The visual channel is always the first to be withdrawn and the last to be re-engaged. Closing it incurs no cost and it restores faster than any other input channel.'
          }
        ]
      },

      // -----------------------------------------------------------------------
      sensor_accumulative: {
        tagline:     'The Compounded Afternoon: Withdrawal as Biological Necessity.',
        description: 'For the Sensor with an accumulative pattern, a high-load afternoon is not a temporary depletion event. It is the cumulative result of days of input that has not cleared. A single retreat window will not fully restore capacity -- but it will prevent further accumulation and reduce the load carried into the evening and the following day. That is the goal. Complete restoration is a longer arc.',
        toolLink: 'https://insig.ht/SGjhihjUm1b',
        steps: [
          {
            type: 'space',
            label: 'Maximum Withdrawal',
            instruction: 'The most restful retreat available to you right now is a quiet room with the door closed, the lights turned down low, and no electronic devices or sounds. Minimum 20 minutes. For you, a partial retreat has the opposite effect of a full retreat: a space that is almost quiet continues to demand processing. Go all the way or not at all.',
            duration: '20 min'
          },
          {
            type: 'somatic',
            label: 'Full-Body Pressure',
            instruction: 'Use a weighted blanket that covers the whole body, including the arms. Place a pillow under the knees to release the lumbar spine. The goal is to achieve total proprioceptive containment, which sends a physical signal to the nervous system that it does not need to maintain postural vigilance. This signal must be held for the full duration, not just the opening minutes, to break your accumulative pattern.'
          },
          {
            type: 'light',
            label: 'Complete Visual Closure',
            instruction: 'Use an eye mask rather than just dimmed lighting. Even in a partially darkened room, passive visual processing is still required. Only complete visual closure genuinely stops the visual channel rather than merely reducing it. For your pattern, partial measures produce partial results.'
          }
        ]
      },

      // -----------------------------------------------------------------------
      seeker_integrative: {
        tagline:     'Pattern Interrupt: The Hard Reset.',
        description: 'For the Seeker with an integrative pattern, afternoon fatigue is often mistaken for restlessness or boredom. The brain has exhausted its supply of dopamine and is seeking distraction in an attempt to replenish it. This reset does not involve stillness; rather, it is a deliberate pattern interruption that breaks the depletion loop. Your integrative pattern means that the discharge and descent will produce a genuine reset within the timeframe.',
        toolLink: 'https://open.spotify.com/track/2cvmmQpGZW79o4Yq8cZeXF?si=2d4ad5046071436f',
        steps: [
          {
            type: 'somatic',
            label: 'Movement Flush',
            instruction: 'Leave your workspace completely. Do 10 minutes of vigorous movement, such as a fast walk, going up and down the stairs or doing dynamic stretches. This metabolises stress hormones and triggers a dopamine reset, rather than passively waiting for a state shift that will not happen by itself.',
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
            instruction: 'After movement, listen to 10 minutes of Theta binaural beats at 4–8 Hz with your eyes closed. This shifts the brain from beta to theta, promoting rest and consolidation, without requiring sleep. Your integrative pattern means that the descent will be genuine rather than resisted.',
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
            instruction: 'Start with five minutes of moderate-intensity movement, such as a brisk walk. After 5 minutes, assess whether your agitation has decreased. If so, continue for a further 5 minutes, increasing the intensity slightly. If your agitation has increased, transition immediately to slow, rhythmic movement for the remainder of the time. The flush is real for your profile so its intensity must match what is actually present.',
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
            instruction: 'If the movement flush produced visible regulation, use the Theta binaural beats for ten minutes, then rest to consolidate. If the regulation was partial or absent, use the Delta frequency instead for deeper deactivation at 0.5 to 4 Hz. For a mixed pattern under high load, the descent may need to go deeper than a standard afternoon reset.',
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
            instruction: 'Engage in 15 minutes of slow, rhythmic movement, such as walking at a conversational pace, gentle stretching or slow floor-based exercises. The goal is to metabolise accumulated load at a rate that the system can process; not to dump it all too quickly and exceed the processing capacity. Maintain this pace for the full duration, regardless of how your body responds.',
            duration: '15 min'
          },
          {
            type: 'space',
            label: 'Controlled Novel Environment',
            instruction: 'Move to a space that offers a slight change in your visual field, such as a different room, an outdoor seat or a window that you do not usually sit near. A new environment with high stimulation adds to the backlog. A calm new environment provides the shift without the cost.'
          },
          {
            type: 'sound',
            label: 'Delta Descent',
            instruction: 'Listen to 15 minutes of Delta binaural beats at 0.5–4 Hz with your eyes closed. For a high-load afternoon, Theta is insufficient as your system needs to be pulled deeper to achieve genuine rest. Delta is the appropriate target, even if it does not currently feel accessible.',
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
            toolLink: 'https://insig.ht/N6VKvNwvG1b'
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
            toolLink: 'https://insig.ht/N6VKvNwvG1b'
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
            instruction: 'You must spend a minimum of 25 minutes in complete inactivity. You must be reclined with the door closed and no devices. Due to your accumulative pattern, the standard 20-minute window clears less frequently than it does for an integrative system. The additional five minutes are not optional. It is the period during which genuine discharge begins for your pattern.',
            duration: '25 min',
            toolLink: 'https://insig.ht/ML24YLQvG1b'
          },
          {
            type: 'light',
            label: 'Full Dimming',
            instruction: 'The light must be kept as low as possible for the whole time. For a accumulative system under high load, even moderate ambient light maintains a low level of visual processing, which competes with the discharge that the rest protocol is trying to produce. Darker conditions are a prerequisite for the protocol to work.'
          },
          {
            type: 'somatic',
            label: 'Weighted and Supported',
            instruction: 'If available, use a weighted blanket. Make sure your whole body is fully supported; the proprioceptive containment signal reduces the postural vigilance your system maintains, even at rest. For your accumulative pattern, it is the removal of this background cost that makes the rest window genuinely restorative rather than merely inactive.'
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
        description: 'The modern world is loud and bright. By evening, your sensory processing system has been working at full capacity for hours on end. This protocol is not only about preparing for sleep; it is also about clearing the accumulated input of the day so that it does not affect your sleep or tomorrow. Your integrative pattern means that emptying is possible when the conditions are right. These conditions must be created, not just hoped for.',
        spotifyLink: 'https://app.declutterthemind.com/?meditation=1677352314447x311753051750268900',
        steps: [
          {
            type: 'space',
            label: 'The Compression Cocoon',
            instruction: 'Go to bed or retreat to your quietest space earlier than you think necessary. Put the heavy blanket on. Create a small, enclosed physical space. You need physical containment in order to feel safe enough to relax after maintaining your nervous systems vigilance all day.'
          },
          {
            type: 'light',
            label: 'Zero Lux Protocol',
            instruction: 'A blackout mask is the most reliable tool available. Even the standby light on a device is a photon signal that your vigilant nervous system will track across the night. Eliminate every light source you can before the mask goes on.'
          },
          {
            type: 'sound',
            label: 'Noise Masking',
            instruction: 'When every background creak and shift is audible, silence can register as loud. Use steady nature sounds to soften the rooms acoustic edges. This removes unpredictability from the soundscape.',
            toolLink: 'https://insig.ht/oiIEJeSRP0b'
          }
        ]
      },

      // -----------------------------------------------------------------------
      sensor_mixed: {
        tagline:     'The Variable Evening: Building Down at the Right Pace.',
        description: 'Your evening descent cannot follow a fixed timetable because your residual load varies. On some evenings, the day has progressed reasonably well and a standard taper is sufficient. On other days, the load has been building up since the morning, so the taper needs to start earlier and continue for longer. The protocol provides the structure, you set the pace based on how the day has actually gone.',
        spotifyLink: 'https://app.declutterthemind.com/?meditation=1677352314447x311753051750268900',
        steps: [
          {
            type: 'light',
            label: 'Early Kelvin Drop',
            instruction: 'Switch to warm-spectrum lighting (below 2700K) at least 90 minutes before your intended bedtime. On evenings when you have more to do, begin this transition two hours beforehand. Due to your mixed pattern, the descent takes longer on some days than others. The solution is to allow more time, not to try harder.'
          },
          {
            type: 'space',
            label: 'Progressive Closure',
            instruction: 'Close the home room by room over 45 to 60 minutes rather than all at once. Each closure reduces a zone of environmental processing demand. By the time you reach your sleep space, your nervous system has been stepping down for some time rather than attempting an abrupt transition from full engagement to rest.'
          },
          {
            type: 'somatic',
            label: 'Contained and Warm',
            instruction: 'Use a heavy blanket and keep the sleep space warm. If available, have a warm drink 30 minutes before sleep. On evenings when the day has been particularly challenging, try applying proprioceptive pressure, such as placing a cushion against your back or using a weighted blanket across your whole body. Physically contain the nervous system before asking it to rest cognitively.'
          }
        ]
      },

      // -----------------------------------------------------------------------
      sensor_accumulative: {
        tagline:     'The Long Descent: Unwinding What the Day Left Behind.',
        description: 'For the Sensor with an accumulative pattern, evening does not simply mark the end of the day; it also carries forward what the previous days did not fully clear. A standard evening taper is therefore insufficient. The descent must begin earlier, last longer and go deeper than it would for a system that clears between exposures. The goal is not a perfect reset, but rather maximum discharge before sleep so that tomorrow begins with a lighter load than today.',
        steps: [
          {
            type: 'light',
            label: 'Two-Hour Kelvin Drop',
            instruction: 'Start the transition to a warm spectrum two hours before going to sleep. Switch all lighting to below 2700K and below eye level. Due to the accumulative nature of your pattern, the circadian shutdown signal requires more lead time than a standard taper because your system has more to discharge before it can transition to rest.',
            duration: '120 min'
          },
          {
            type: 'space',
            label: 'Complete Environmental Closure',
            instruction: 'Close and darken every room in the house before you enter your sleep space. Ideally, your nervous system should not have encountered any new sensory demands for at least 30 minutes by the time you lie down. Your sleep space should be the quietest place you visited all day.'
          },
          {
            type: 'somatic',
            label: 'Maximum Containment',
            instruction: 'Use the heaviest blanket available and a blackout mask. Achieve acoustic masking with steady nature sounds at low volume. Each of these is a non-negotiable layer for your accumulative pattern, rather than an optional comfort addition. Together, they create a sensory environment in which your nervous system encounters nothing that requires processing. The only condition under which genuine overnight clearing can begin.',
            toolLink: 'https://insig.ht/oiIEJeSRP0b'
          }
        ]
      },

      // -----------------------------------------------------------------------
      seeker_integrative: {
        tagline:     'The Dopamine Detox: Landing the Plane.',
        description: 'Your brain resists the transition to evening because rest feels under-stimulating compared to the high-dopamine engagement of the day. You need tools that are complex enough to keep an active mind occupied while the body shuts down, to transition from high-dopamine to low-dopamine. Your integrative pattern means the descent is possible: the challenge lies in bridging the gap between where your system is and where sleep onset requires it to be.',
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
            instruction: 'Play tibetan gongs or layered harmonic soundscapes. These are not like white noise. They contain complex harmonics that satisfy the active mind with sufficient novelty while dragging brainwave frequency down toward theta. The ADHD brain will track the sound, not spiral into the future.',
            toolLink: 'https://insig.ht/Uk4k9dwRP0b'
          },
          {
            type: 'somatic',
            label: 'NSDR Backup',
            instruction: 'If sleep does not arrive within 20 minutes, switch to Yoga Nidra or Non-Sleep Deep Rest audio. This systematically shuts down the nervous system even when the mind is still partially active. 20 minutes of restoration is equivalent to 3 to 4 hours of recovery-quality sleep. Your integrative pattern is a reliable bridge to sleep, not a substitute.',
            toolLink: 'https://insig.ht/TRHQ0iERP0b'
          }
        ]
      },

      // -----------------------------------------------------------------------
      seeker_mixed: {
        tagline:     'The Variable Descent: Matching the Landing to the Current Load.',
        description: 'Your evening dopamine transition is real, but its difficulty varies depending on what you are already carrying. On lower-load evenings, the standard body scan and harmonic sound reliably produces a clean descent. It is clear that on evenings where load has been higher, the same tools are simply not enough to bridge from your current activation level to rest. The protocol adapts the descent depth to the day.',
        steps: [
          {
            type: 'light',
            label: 'Adaptive Kelvin Timing',
            instruction: 'On standard evenings, begin the warm-spectrum transition 60 minutes before sleep. On higher-load evenings, begin 90 minutes earlier. Your mixed pattern means the circadian shutdown signal needs more lead time on the days where your system has been carrying more, but you may not feel the difference until the window has already closed.'
          },
          {
            type: 'somatic',
            label: 'Tiered Scan Protocol',
            instruction: 'Begin with the full body scan. If relaxation is tangible after one pass, you are on a lower-load evening and the standard protocol is sufficient. If the mind remains active after one pass, conduct a second slower scan and add the harmonic sound layer simultaneously. The double-pass is the variable-load adjustment.',
            toolLink: 'https://insig.ht/cEolRaexG1b'
          },
          {
            type: 'sound',
            label: 'Harmonic or Delta Based on State',
            instruction: 'If the scan produces visible softening, stay with Tibetan gongs or a harmonic sound of your choice. If it does not, transition to Delta binaural beats. For a mixed-pattern Seeker, some evenings the brain needs to be pulled down to Delta rather than guided there through harmonic engagement.',
            toolLink: 'https://insig.ht/Psm1vYmxG1b'
          }
        ]
      },

      // -----------------------------------------------------------------------
      seeker_accumulative: {
        tagline:     'The Backlog Evening: Descent Through a Loaded System.',
        description: 'For the Seeker with an accumulative pattern, the evening challenge is not just transitioning from high stimulation to rest. It is transitioning from high stimulation while carrying accumulated load that has not cleared across the day. The active mind cannot be occupied with rest when the nervous system is simultaneously managing a backlog. The backlog must be addressed first, the descent second.',
        steps: [
          {
            type: 'somatic',
            label: 'Physical Pre-Discharge',
            instruction: 'Engage in 10 minutes of slow, sustained movement before winding down. This can be gentle floor stretching, a slow walk or progressive joint rotation. This is not activation. It gives accumulated load a physical route out before the system is asked to shut down. Attempting descent without this step produces restlessness that harmonic sound cannot bridge.',
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
            instruction: 'Play Delta binaural beats at 0.5 to 4Hz for the full sleep-onset window. For your accumulative pattern, Theta is an intermediate state your system may not sustain; the target is Delta directly. The active mind will track the frequency as it descends, which is the mechanism rather than an obstacle to it.',
            spotifyLink: 'https://insig.ht/z0x4OVExG1b'
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
        spotifyLink: 'https://open.spotify.com/playlist/37i9dQZF1DWXSyfX6gqDNp?si=4e071e2e23394ff5',
        steps: [
          {
            type: 'light',
            label: 'Early Consistent Kelvin Drop',
            instruction: 'Begin the warm-spectrum transition at the same time every evening regardless of how the day felt. Your mixed pattern means the evenings where you need the earlier signal most are not always the ones where you will think to implement it. Consistency removes the decision from the equation.'
          },
          {
            type: 'space',
            label: 'Reliable Environmental Anchors',
            instruction: 'The sequence of closures is always the same every evening: the same blinds, the same doors, in the same order. Repetition builds a conditioned shutdown response in your nervous system over time. The conditioned response is key to ensuring the work is done on variable-load evenings, especially when your internal signals are lacking.'
          },
          {
            type: 'somatic',
            label: 'Breathing as a Baseline Check',
            instruction: 'Do five rounds of the physiological sigh before sleep. On standard evenings, this produces a visible relaxation response and sleep follows. If the relaxation response is absent after five rounds, tonights sleep will be a higher-load evening. The sleep space must be quieter and darker than usual before you attempt to rest.'
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
            instruction: 'Start the warm-spectrum transition 90 minutes before sleep, not 60. For your body clock, starting earlier gives it more time to process what your body has been dealing with.',
            duration: '90 min'
          },
          {
            type: 'space',
            label: 'Load-Reduction Sweep',
            instruction: 'Before entering your sleep space,  take 5 minutes to make sure that other rooms are as tidy as possible. Close doors, turn off any lights that are still on and move things off the surfaces you can see. Your nervous system is tracking more environmental data than you are consciously aware of. If you reduce that data, it will reduce the load on your system when it is in sleep mode.'
          },
          {
            type: 'somatic',
            label: 'Passive Grounding',
            instruction: 'Lie down with one hand on your chest and one on your stomach. Take 10 slow, deep breaths, noticing the rise and fall.  When you connect with your bodys sensory experiences before bed, it helps you process everything you have experienced during the day.',
            spotifyLink: 'https://app.declutterthemind.com/?meditation=1699207765523x297746389593489400'
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
            instruction: 'Start with foam or silicone earplugs, and then put noise-cancelling headphones on top if you have them. Pink noise or nature sounds at a very low volume can help to stop you being so watchful. The aim is to create an environment where you can only hear sounds that are meant to be there. This means that any unexpected sounds are stopped, and there is just enough masking sound to stop the silence from sounding too quiet.',
            toolLink: 'https://insig.ht/S3CKJKnyG1b'
          },
          {
            type: 'somatic',
            label: 'Maximum Containment',
            instruction: 'Make sure you are covered from head to toe with a full weighted blanket and that your body is fully supported. Use a body pillow or cushion to support any side that feels exposed. When you are in an enclosed space, your nervous system thinks that it is safe and you will not worry as much. This is the condition that lets your body recover overnight.'
          }
        ]
      },

      // -----------------------------------------------------------------------
      sensor_mixed: {
        tagline:     'Variable High Load: Full Shelter, Adjusted Duration.',
        description: 'A high-load evening with a mixed integration pattern requires complete shelter, but the duration and depth of recovery available within that shelter varies. On evenings where the load has arrived recently and suddenly, the full sanctuary protocol will produce substantial overnight clearing. On evenings where load has been building across several days, the same environment will reduce further accumulation without fully clearing what is already present. Both are valid outcomes. The protocol does not change based on which one tonight is.',
        spotifyLink: 'https://app.declutterthemind.com/?meditation=1699207765523x297746389593489400',
        steps: [
          {
            type: 'space',
            label: 'Full Environmental Closure',
            instruction: 'Keep every door and blind closed. Clear your sleep space of any visible objects that carry cognitive or emotional association such as work items, unfinished tasks, pending decisions. For your mixed pattern under high load, every object in the visual field that carries association, adds to the processing demand your nervous system carries into sleep.'
          },
          {
            type: 'light',
            label: 'Complete Visual Shutdown',
            instruction: 'Use a blackout mask regardless of how dark the room appears. On a high-load evening with a variable integration pattern, residual ambient light that feels tolerable at the start of the window will register differently at 2am when processing capacity is lower. Eliminate it at the outset.'
          },
          {
            type: 'somatic',
            label: 'Layered Physical Containment',
            instruction: 'Use a weighted blanket and earplugs, and make sure your sleep environment is warm. Each layer addresses a different sensory channel. On a mixed-pattern high-load evening, the layers collectively reduce the threshold of input that can interrupt your rest without any single layer needing to carry the full burden.'
          }
        ]
      },

      // -----------------------------------------------------------------------
      sensor_accumulative: {
        tagline:     'The Accumulated Evening: Shelter as Multi-Day Recovery.',
        description: 'For the Sensor with an accumulative pattern, a high-load evening is not an acute event. It is the visible surface of what several days have deposited. The shelter protocol will not clear this overnight. What it will do is stop the accumulation from continuing, provide the deepest available clearing conditions, and give your nervous system the best chance of waking up tomorrow with less than it carries today. Consistency of this protocol across several nights is the arc. Tonight is one step of it.',
        steps: [
          {
            type: 'space',
            label: 'The Complete Sanctuary',
            instruction: 'Make sure that every sensory variable in the sleep is environment controlled to its minimum state: darkness, silence or steady masking sound, cool temperature, closed door, no devices. For your pattern, approximations compound. The sanctuary must be complete to function as one. Identify the one element that is usually left incomplete and address it tonight.',
          },
          {
            type: 'somatic',
            label: 'Extended Containment',
            instruction: 'Use your heaviest available blanket. Fully support your body, including neck and arms. If a body pillow is available, use it to eliminate the sensation of open space on any side. For your accumulative pattern, the physical containment signal needs to be present at the start of the sleep window and maintained through it, not applied briefly as a comfort measure.',
          },
          {
            type: 'sound',
            label: 'Sustained Acoustic Masking',
            instruction: 'Keep nature sounds or pink noise running throughout the entire sleep window, not just at the start. If sounds interfere with sleep onset, adjust it to play for a longer period that you envisage you would be awake for. For your pattern, acoustic unpredictability in the early hours of the morning may register as a new input on a system that has been attempting to clear overnight. The masking sound removes that variable for the full duration.',
            toolLink: 'https://insig.ht/ORMNOrezG1b'
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
            instruction: 'Engage in 10 to 15 minutes of vigorous physical exertion before wind-down begins: not exercise for fitness, but stress hormone metabolisation. The goal is to arrive at your sleep space with the sympathetic tank meaningfully emptied. Your integrative pattern means this discharge will produce a genuine shift rather than a temporary suppression.',
            duration: '15 min'
          },
          {
            type: 'somatic',
            label: 'Progressive Muscle Release',
            instruction: 'Lying down, systematically tense and release each muscle group from feet to face. Hold each tension for 5 seconds and release for 10. This brings a hyper-aroused nervous system into parasympathetic range through physical mechanism rather than cognitive effort. Your active mind does not need to cooperate, let your body lead.',
            duration: '10 min'
          },
          {
            type: 'sound',
            label: 'Delta Entrainment',
            instruction: 'Play binaural beats in the Delta range at 0.5 to 4Hz or listen to a sleep talk down. Your active brain will track the frequency as it descends. This is the mechanism and not an obstacle to it. Allow the tracking to happen rather than trying to stop it.',
            spotifyLink: 'https://insig.ht/n2NvswtzG1b'
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
            instruction: 'Before any movement, take 2 minutes of stillness and notice whether the restlessness feels energised or depleted. Energised restlessness means today is an acute high-load evening; so proceed with vigorous discharge. Depleted restlessness means the load has been accumulating and discharge should be slow and sustained rather than intense.',
            duration: '2 min'
          },
          {
            type: 'somatic',
            label: 'Appropriate Discharge',
            instruction: 'For energised restlessness: engage in 10 to 15 minutes of vigorous movement followed by progressive muscle release. For depleted restlessness: engage in 15 minutes of slow walking or gentle floor stretching followed by a full-body supported rest with weighted blanket. The goal in both cases is metabolisation of carried load; how you arrive at the result differs.',
            duration: '15 min'
          },
          {
            type: 'sound',
            label: 'Delta as the Consistent Target',
            instruction: 'Whatever discharge path you used, end with delta binaural beats in the sleep-onset window. For a mixed-pattern Seeker on a busy evening when a lot is going on, Delta is the right choice. It is deep enough to be used for real descent for a big load and as a storage space for the slower clearance of an accumulation.',
            spotifyLink: 'https://insig.ht/muntQtOzG1b'
          }
        ]
      },

      // -----------------------------------------------------------------------
      seeker_accumulative: {
        tagline:     'The Backlog Shelter: Clearing What Cannot Be Rushed.',
        description: 'The Seeker has a lot on their plate this evening, with a pattern that has built up over time. This makes it hard for them to focus, as they feel like they have a lot on their mind all at once. The shelter protocol will not try to clear the backlog tonight. It creates the conditions under which the most possible clearing can occur, prevents further accumulation, and gives the active mind a structure to work within rather than against.',
        steps: [
          {
            type: 'somatic',
            label: 'Low-Intensity Sustained Discharge',
            instruction: 'Do 15 to 20 minutes of gentle, rhythmic exercise. This could be floor stretching, a slow walk or gentle joint rotation. This is the only discharge method that is right for a fully loaded accumulative system. When you move around a lot, even when you are tired, it can make you feel good. But this can actually make it harder to get to sleep.',
            duration: '20 min'
          },
          {
            type: 'space',
            label: 'The Stripped Environment',
            instruction: 'The best sleep space is one with no light, no noise and a cool temperature. All devices should be removed or covered. When you are asleep, your brain keeps processing information from your environment. The environment must offer nothing for it to engage with.'
          },
          {
            type: 'sound',
            label: 'Delta for the Full Night',
            instruction: 'Set Delta binaural beats to run for part of, or the full intended sleep duration rather than just the onset window. For your accumulative pattern, the overnight clearing that needs to occur is deeper and longer than for other profiles. Maintaining the Delta frequency environment through the night supports deeper sleep phases rather than allowing the system to return to lighter processing states.',
            spotifyLink: 'https://insig.ht/1NK7nv5zG1b'
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
            instruction: 'Lie down, with one hand on your chest and one on your stomach. Take 10 slow, deep breaths, noticing the rise and fall of your chest. This grounding technique, which involves touching the body, helps you to become more aware of your bodily sensations and directs your attention away from negative thoughts and towards your physical experience. It is a reliable way to find rest for your integrative pattern.',
            spotifyLink: 'https://insig.ht/cT2RQ9xUm1b'
          }
        ]
      },

      // -----------------------------------------------------------------------
      anchor_mixed: {
        tagline:     'High-Load Shelter: Protection for the Nights When Resilience Is Not Available.',
        description: 'A high-load evening with a mixed integration pattern is one of the contexts where your system is most likely to be carrying more than it is showing. Your usual resilience is not guaranteed tonight. The shelter protocol does not assume resilience, it builds the conditions that allow whatever capacity remains to work as effectively as possible. Protection now prevents a harder recovery across the following days.',
        steps: [
          {
            type: 'somatic',
            label: 'Thermal Descent and Sigh Sequence',
            instruction: 'Take a warm shower or bath followed by 10 rounds of the physiological sigh after lying down. The thermal descent creates the biological cooling signal. The sigh sequence resets the CO2 balance and engages the parasympathetic brake. For a mixed-pattern system under high load, these two tools in sequence are more effective than either alone.',
            duration: '20 min'
          },
          {
            type: 'space',
            label: 'Complete Closure',
            instruction: 'Close every door and window blind. Make sure no devices are visible or audible. For a mixed-pattern high-load evening, the environmental closure matters more than it appears to on ordinary nights, as your internal warning system is not reliably providing the signals that would tell you this.'
          },
          {
            type: 'somatic',
            label: 'Grounding and Supported Rest',
            instruction: 'Place one hand on your chest and one on your stomach. Breathe in and out, making a total of 10 breaths. Then cover the body completely with a thick blanket. The grounding practice shows the real state of things. The containment provides a response to whatever it surfaces. Together they form the complete shelter for your pattern.',
            spotifyLink: 'https://insig.ht/cT2RQ9xUm1b'
          }
        ]
      },

      // -----------------------------------------------------------------------
      anchor_accumulative: {
        tagline:     'The Invisible Full: Shelter for What You Cannot Measure.',
        description: 'A high-load evening for the Anchor with an accumulative pattern is the moment where the gap between what is present and what is visible is largest. Your system is carrying significant accumulated load without advertising it and is now approaching sleep without the capacity to clear it that a fully reset system would have. The shelter protocol creates the deepest available overnight clearing conditions. Tonight begins a recovery arc, not a single event.',
        steps: [
          {
            type: 'somatic',
            label: 'Extended Thermal Protocol',
            instruction: 'Take a long, warm bath 90 minutes before sleep. The longer duration produces a more substantial body temperature drop in the subsequent hour, which creates a stronger biological sleep-onset signal. For an accumulative system under high load, the standard 15-minute shower produces a weaker version of this signal than the situation requires.',
            duration: '20 min'
          },
          {
            type: 'space',
            label: 'Maximum Load Reduction',
            instruction: 'Create a full environmental closure. Additionally: remove or store away any object in your sleep environment that carries cognitive association such as work items, unread messages and pending tasks. For your accumulative pattern, these objects are not background neutral. They are active low-level processing demands your system will maintain across the night without any signal that it is doing so.'
          },
          {
            type: 'somatic',
            label: 'Full Physical Grounding',
            instruction: 'Use your heaviest available blanket, making sure yout entire body is supported. Place one hand on your chest and one on your abdomen. Take 10, deep breaths, then release all effort. For your pattern, the grounding practice is the handover point, which is the moment you hand over the rest of the recovery work to the environment you have built rather than continuing to manage it consciously.',
            spotifyLink: 'https://insig.ht/cT2RQ9xUm1b'
          }
        ]
      }
    }
  }

}
