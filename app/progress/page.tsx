'use client'

import Sidebar from '../components/Sidebar'
import { useState, useEffect } from 'react'
import { Heart, Wind, Sun, Volume2, CheckCircle, TrendingUp, Activity, Zap, Loader2, Moon, Sunrise, Brain, Fingerprint, ChevronDown, ChevronUp, Lock, AlertCircle, HelpCircle, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'
import CorrelationGraph from './CorrelationGraph'
import { LightSensorModal } from '../tools/light-meter/page'
import { NoiseSensorModal } from '../tools/noise-meter/page'

export default function Progress() {
  const supabase = createClientComponentClient()
  
  const [activeTab, setActiveTab] = useState<'morning' | 'evening'>('morning')

  // --- ACCESS CONTROL ---
  const [isPremium, setIsPremium] = useState(false)
  const [godMode, setGodMode] = useState(false)

  // --- LOGGING STATE ---
  const [morningMood, setMorningMood] = useState<number | null>(null)
  const [morningTags, setMorningTags] = useState<string[]>([])
  const [morningNote, setMorningNote] = useState('')
  
  // --- TEMPORAL ENVIRONMENTAL INPUTS ---
  const [morningLux, setMorningLux] = useState<string>('') 
  const [nighttimeDb, setNighttimeDb] = useState<string>('')
  const [eveningLux, setEveningLux] = useState<string>('')
  const [daytimeDb, setDaytimeDb] = useState<string>('')

  // --- METER MODAL STATES ---
  const [isLightMeterOpen, setIsLightMeterOpen] = useState(false)
  const [isAcousticMeterOpen, setIsAcousticMeterOpen] = useState(false)
  const [activeMeterTarget, setActiveMeterTarget] = useState<'morningLux' | 'eveningLux' | 'daytimeDb' | 'nighttimeDb' | null>(null)
  
  // --- MANUAL STATE ---
  const [isManualOpen, setIsManualOpen] = useState(false)

  // BIO-METRICS
  const [focusScore, setFocusScore] = useState<number>(0)
  const [tensionScore, setTensionScore] = useState<number>(0)
  const [wakeScore, setWakeScore] = useState<number>(0)

  const [eveningMood, setEveningMood] = useState<number | null>(null)
  const [eveningTags, setEveningTags] = useState<string[]>([])
  const [eveningNote, setEveningNote] = useState('')

  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  
  // --- SOFT-GATE VALIDATION STATE ---
  const [showAccuracyWarning, setShowAccuracyWarning] = useState(false)

  // --- BSFI STATE ---
  const [bsfiData, setBsfiData] = useState<{ total_score: number, dominant_domain: string, is_internal_driver: boolean } | null>(null)
  const [bsfiLoading, setBsfiLoading] = useState(true)

  // ACCORDION STATES
  const [isMorningOpen, setIsMorningOpen] = useState(false)
  const [isEveningOpen, setIsEveningOpen] = useState(false)
  const [isSynthesisExpanded, setIsSynthesisExpanded] = useState(false) 
  
  // CHART STATE
  const [chartLogs, setChartLogs] = useState<any[]>([])

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour >= 17) setActiveTab('evening')
  }, [])

  useEffect(() => {
    checkAccess()
    fetchTodayLog()
    fetchHistory()
  }, [])

  const checkAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (user.email === 'christchilde@gmail.com') {
      setGodMode(true)
      return
    }

    const { data: profile } = await supabase
      .from('profiles') 
      .select('is_premium')
      .eq('user_id', user.id)
      .single()

    if (profile?.is_premium) setIsPremium(true)
  }

  const hasAccess = isPremium || godMode

  // ---------------------------------------------------------------------------
  // CIRCADIAN COHERENCE SCORE (lux_score) — 0 to 100
  //
  // Encodes the full circadian light curve as a single composite score.
  // High score = correct polarity: strong morning anchor + low evening lux.
  // Neither reading alone can produce a high score — both must be correct.
  //
  // morning component = morning_lux clamped 0–1000, scaled to 0–50
  // evening component = (1 - evening_lux clamped 0–800 / 800) × 50
  //
  // Null handling:
  //   Both absent  → null (no data to score)
  //   Morning only → 0 anchor points assumed (unlogged = no activation)
  //   Evening only → 50 points assumed safe (no data = no penalty)
  //
  // Sources: Zeitzer et al. 2000, Gooley et al. 2011, Cajochen et al. 2011
  // ---------------------------------------------------------------------------
  const deriveLuxScore = (morningLux: string, eveningLux: string): number | null => {
    const morning = morningLux !== null && morningLux !== '' ? parseInt(morningLux) : null
    const evening = eveningLux !== null && eveningLux !== '' ? parseInt(eveningLux) : null

    if (morning === null && evening === null) return null

    const morningComponent = morning !== null
      ? Math.min(morning, 1000) / 1000 * 50
      : 0   // absent morning = no circadian anchor assumed

    const eveningComponent = evening !== null
      ? (1 - Math.min(evening, 800) / 800) * 50
      : 50  // absent evening = assumed safe (no penalty)

    return Math.round(morningComponent + eveningComponent)
  }

  // ---------------------------------------------------------------------------
  // THRESHOLD-NORMALISED ACOUSTIC COMPOSITE (db_score) — 0 to 100
  //
  // Scores acoustic load against WHO-validated thresholds independently
  // for each time window, then averages present readings.
  //
  // Daytime threshold:  55dB (WHO occupational noise guideline)
  // Nighttime threshold: 40dB (WHO Environmental Noise Guidelines 2018)
  //   — 15dB lower because noise travels faster at night and autonomic
  //     arousal threshold drops during sleep.
  //
  // Readings below threshold contribute 0 — no false friction.
  //   45dB daytime  = 0  (10dB below threshold)
  //   45dB nighttime = 8  (5dB above threshold)
  //
  // Sources: WHO Environmental Noise Guidelines 2018, Basner et al. 2014
  // ---------------------------------------------------------------------------
  const deriveDbScore = (daytimeDb: string, nighttimeDb: string): number | null => {
    const d = daytimeDb  !== null && daytimeDb  !== '' ? parseInt(daytimeDb)  : null
    const n = nighttimeDb !== null && nighttimeDb !== '' ? parseInt(nighttimeDb) : null

    if (d === null && n === null) return null

    const DAYTIME_THRESHOLD   = 55
    const NIGHTTIME_THRESHOLD = 40
    const CEILING = 100

    const scores: number[] = []

    if (d !== null) {
      scores.push(Math.max(0, d - DAYTIME_THRESHOLD)  / (CEILING - DAYTIME_THRESHOLD)  * 100)
    }
    if (n !== null) {
      scores.push(Math.max(0, n - NIGHTTIME_THRESHOLD) / (CEILING - NIGHTTIME_THRESHOLD) * 100)
    }

    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
  }

  // --- FEEDBACK ENGINE LOGIC ---
  const getMorningFeedback = () => {
    const moodScore = morningMood ?? 3

    if (moodScore <= 2 && tensionScore >= 7 && wakeScore >= 3) return {
      title: "You Slept, But Your Body Didn't Fully Recover",
      reframe: "Three or more wake events alongside high somatic tension and low mood on rising is a specific stress pattern, not a reflection of how well you slept in a subjective sense, but of how much biological work your system was required to do overnight. Fragmented sleep prevents full progression through deep and dream sleep, leaving cortisol clearance incomplete and the HPA axis already activated before the day begins",
      direction: "Your sleep envelope is the priority, not optimisation, but structural protection. Tonight: acoustic sealing of the sleep space, full blackout, tactile enclosure, and a firm light boundary of below 50 lux from at least 90 minutes before bed. Do not attempt to compensate for last night through output today. Your system needs a reduced load, not an increased one"
    }

    if (moodScore <= 2 && tensionScore >= 7) return {
      title: "You Slept Through, But Not Restfully",
      reframe: "Sleep continuity is a necessary condition for restoration, but it is not sufficient. Sustained somatic tension on waking, alongside low mood, indicates that your autonomic nervous system remained in an elevated state overnight. Without the parasympathetic drop required for slow-wave sleep entry, the body continues processing physiological and emotional load rather than clearing it. You slept through. Your system did not stand down.",
      direction: "Work backwards from pre-sleep conditions: unresolved physical tension in the hour before bed typically originates from thermal load, unprocessed cognitive activation, or the absence of proprioceptive grounding. Introduce tactile enclosure tonight — weighted or layered bedding — and reduce your pre-sleep light exposure to warm-toned sources below 50 lux. The goal is a nervous system that arrives at sleep already decelerating."
    }

    if (moodScore >= 3 && wakeScore >= 3) return {
      title: "Sleep Interruptions Are Worth Investigating.",
      reframe: "Waking three or more times through the night, in the presence of stable mood, is more reliably an environmental pattern than a dysregulation one. The most frequent structural causes are thermoregulatory disruption — your body temperature cycling against an unsuitable ambient environment — and acoustic intrusion events that trigger partial arousals without full conscious waking. You are coping well with the disruption. The disruption itself is still worth addressing.",
      direction: "Audit your sleep environment for two variables tonight: ambient temperature and acoustic consistency. The thermoneutral sleep zone for most adults is 17–19°C. Breathable, natural-fibre bedding supports the body's core temperature drop required for sleep stage entry. For acoustic disruption, identify whether the waking pattern correlates with a specific time — early morning traffic, household sounds, or HVAC cycling — and introduce low-level white or pink noise to mask event-based intrusions"
    }

    if (moodScore >= 4 && tensionScore <= 3) return {
      title: "A Genuinely Good Night",
      reframe: "Low somatic tension and elevated mood on waking are the measurable output of a sleep environment that supported full autonomic recovery overnight. Your cortisol awakening response is following its natural arc, slow-wave sleep likely proceeded without disruption, and your prefrontal cortex is arriving at the day with its regulatory capacity intact. This is not a passive outcome; it is the result of environmental conditions that were coherent with your nervous system's requirements",
      direction: "Identify and record what was consistent yesterday evening. Your sensory boundaries, thermal conditions, and pre-sleep routine are currently functioning as a coherent system. Protect those conditions — especially during periods of elevated schedule demand, travel, or seasonal light change, when the instinct is to deprioritise exactly what is working."
    }

    return {
      title: "Nothing Unusual This Morning",
      reframe: "Your morning readings sit within a neutral functional range today: no acute recovery deficit, no clear environmental signal in either direction. Neutral is not absence of data. It is the system in maintenance mode: not under significant load, not in peak restoration. The pattern becomes legible over time, not in a single morning",
      direction: "Log your environmental readings accurately: light levels, sounds, and sleep conditions. No acute intervention is required today. Use this session to build the baseline your fourteen-day synthesis will draw from."
    }
  }

  const getEveningFeedback = () => {
    const moodScore = eveningMood ?? 3

    if (focusScore >= 8 && moodScore <= 2) return {
      title: "A Demanding Day. Recovery Is Non-Negotiable Tonight",
      reframe: "Extended deep work alongside low mood regulation is a recognisable autonomic signature: your prefrontal cortex sustained performance by drawing on sympathetic activation rather than regulated capacity. The output was real. So is the cost. Your emotional processing systems, particularly the amygdala's overnight consolidation work, are carrying a heavier load into sleep than your focus score would suggest.",
      direction: "Tonight's environment must match today's demand. Transition away from screens and bright overhead light within the next thirty minutes to warm-toned sources below 100 lux only. Remove high-stimulation zones from your evening sightline. Your nervous system needs a firm, unhurried deceleration tonight, not a continuation of execution mode into the hours before sleep."
    }

    if (focusScore >= 8 && moodScore >= 4) return {
      title: "A Great Day. Protect the Close",
      reframe: "Deep work sustained across the day without a corresponding drop in mood regulation indicates that your environment was supporting your cognitive load rather than extracting from it. This is the functional design outcome: your nervous system was able to meet demand from a regulated baseline rather than from stress-driven performance. The risk now is not what today cost; it is what tonight's environment does with that state",
      direction: "Do not coast through the evening without a deliberate transition. High performers in sustained flow are particularly susceptible to remaining in execution mode well past the point where the cortisol curve should be descending. Initiate a conscious environmental close: shift to warm light, step away from your primary work zone, and introduce one low-stimulation activity before your sleep preparation begins"
    }

    if (focusScore <= 2 && moodScore <= 2) return {
      title: "Low Focus Today Isn't About You. Let's Examine Your Space",
      reframe: "When attentional capacity feels constrained despite effort, the instinct is to attribute it to discipline or motivation. The more precise reading, particularly when mood and focus drop together, is environmental: your space was not providing the sensory conditions required for sustained cognitive engagement. High acoustic load, insufficient light contrast between work and rest zones, and accumulated visual entropy are the most common structural contributors to this specific combined profile.",
      direction: "Do not attempt to recover through effort or extended hours tonight. Remove friction instead. Identify one controllable sensory variable in your primary space: noise, light quality, or visual clutter; and address only that. A single, deliberate environmental adjustment will do more for tomorrow morning's capacity than any amount of compensatory work tonight."
    }

    return {
      title: "A Steady Day; Keep The Transition Intentional",
      reframe: "Output and mood regulation have remained within a functional range today: neither a high-cost performance day nor a low-capacity one. The evening's role in this context is not recovery from deficit, but maintenance of the baseline your system is already holding.",
      direction: "Step away from high-stimulation zones within the next hour. Your evening transition does not need to be elaborate — it needs to be consistent. A reliable pre-sleep sensory routine is cumulative in its regulatory effect: the nervous system learns to begin decelerating in response to environmental cues before the cues themselves are consciously processed."
    }
  }

  const getMacroSynthesis = () => {
    if (chartLogs.length < 14) {
      return {
        ready: false,
        title: "Still Gathering Data",
        paragraphs: [
          `Log ${Math.max(0, 14 - chartLogs.length)} days remaining.`
        ]
      }
    }

    if (bsfiData) {
        if (bsfiData.is_internal_driver) {
           return {
              ready: true,
              title: "Your Environment Is Stable. What You're Feeling Is Coming From Inside.",
              paragraphs: [
                "Over the last fourteen days, your somatic tension and mood have shown significant variance, but your measured environmental conditions have remained largely consistent.",
                "This data signature has a specific meaning: the primary source of friction right now is not your physical space. Biological fluctuation — cyclical hormonal shifts, periods of elevated relational or emotional demand, accumulated cognitive load produces real, measurable changes in tension, sleep quality, focus, and mood that register in your logs independently of what your space is doing. Your nervous system is responding to an internal condition, not an environmental one.",
                "The appropriate response to this phase is accommodation, not optimisation. Do not attempt to redesign or reconfigure your space right now. Instead, ask your environment to do one thing: reduce the additional friction layered on top of an already-demanding internal state. Quieter, warmer, simpler. Less to manage, not more to perform."
              ]
           }
        }

        const score = bsfiData.total_score;
        const domain = bsfiData.dominant_domain;

        if (score <= 20) {
          return {
            ready: true,
            title: "Your Home Is Supporting You",
            paragraphs: [
              "Across fourteen days, your Bio-Spatial Friction Index has remained exceptionally low. Your environment is doing precisely what it is designed to do: absorbing daily sensory load, supporting overnight recovery, and returning your nervous system to a regulated baseline each morning. This is not a passive outcome — it reflects environmental conditions that are coherent with your biological requirements.",
              "What this data confirms is that your current sensory conditions are not accidental. Your light habits, acoustic boundaries, sleep ecology, and spatial practices are functioning as a coherent, mutually reinforcing system. Each element is reducing the demand placed on the others.",
              "The task now is protection, not improvement. Document the specific conditions that are producing this baseline: light levels, thermal settings, pre-sleep routine, morning habits — in sufficient detail that you can replicate them accurately during periods of elevated stress, travel, or seasonal change, when the instinct is to deprioritise exactly what is working."
            ]
          }
        }
        
        if (score <= 60) { 
          return {
            ready: true,
            title: `Moderate Friction: ${domain} Is The Primary Source`,
            paragraphs: [
              `Over the last fourteen days, your environment has been introducing a moderate but consistent level of friction. Your BSFI total indicates that your nervous system is absorbing environmental load across multiple domains — but the engine has identified ${domain} as the source generating the greatest sustained demand. This is where the leverage is.`,
              "The output you are producing is beginning to happen against environmental resistance rather than from regulated reserves. At moderate friction levels, this distinction is easy to miss — performance remains intact while the underlying cost accumulates quietly, day by day, in the form of reduced attentional stamina, elevated baseline tension, and slightly compressed emotional range.",
              `Address ${domain} this week as a structural priority. A targeted intervention in your highest-friction domain will produce a disproportionate return, reducing the load on every other domain simultaneously, because your nervous system will no longer need to compensate for it.`
            ]
          }
        }

      if (score >= 60) {
        return {
          ready: true,
          title: "High Friction Across The Board. Your Environment Needs Attention",
          paragraphs: [
             "Your fourteen-day BSFI indicates a high-load, dysregulated environmental pattern. Across circadian, acoustic, spatial, and recovery domains, your home is generating friction that is consistently arriving before your day begins — depleting regulatory capacity at the point when it should be replenishing it. The nervous system is not starting each day from a recovered baseline. It is starting each day already managing accumulated overnight load.",
             "Sustained multi-domain environmental friction at this level carries a specific physiological signature: the autonomic nervous system shifts to sympathetic maintenance mode, cortisol-driven performance rather than restored capacity. Output may remain present. But it is being borrowed, not generated. The reserves that sustain that borrowing are finite.",
             "Stop optimising for output. Start optimising for environmental recovery. The three structural priorities in order: acoustic sealing of your sleep environment, a hard circadian light boundary after 8pm, and a single cleared, low-stimulation space you can access without friction during the day. These are not enhancements to your current environment. At this score, they are the minimum viable conditions your nervous system requires to begin recovering."
          ]
        }
      }
    }

    const avgMood = chartLogs.reduce((acc, log) => acc + log.mood, 0) / (chartLogs.length || 1)
    const avgTension = chartLogs.reduce((acc, log) => acc + log.tension, 0) / (chartLogs.length || 1)
    const avgFocus = chartLogs.reduce((acc, log) => acc + log.focus, 0) / (chartLogs.length || 1)

    if (avgTension >= 6 && avgFocus <= 4) return {
        ready: true,
        title: "Your Home Is Draining You Before The Day Begins.",
        paragraphs: [
          "Fourteen days of consistently elevated somatic tension alongside constrained cognitive output describes a recognisable pattern: your nervous system is absorbing sustained environmental friction — acoustic load, circadian disruption, accumulated overnight recovery debt — and arriving at each day already partially depleted. The output you are generating is happening against environmental resistance, not from regulated reserves.",
          "At this pattern level, the gap between how capable you are and how capable you feel is environmental in origin. The space is spending your capacity before you have the opportunity to direct it. That is not a discipline or motivation problem, it is an architectural one",
          "The two most probable friction sources at this profile are your sleep ecology and the sensory load of your primary daytime environment. Both are structurally addressable. Identify which of your four domain scores is highest and begin there."
        ]
    }
    if (avgFocus >= 6 && avgMood <= 2.5) return {
        ready: true,
        title: "Strong Output, But Your Reserves Are Being Used Up",
        paragraphs: [
          "Fourteen days of sustained cognitive output alongside consistently low mood regulation carries a specific autonomic signature: your nervous system is maintaining performance through sympathetic activation rather than from a recovered, regulated baseline. The output is real. So is the cost: it is being drawn from the same reserves that emotional regulation, overnight recovery, and long-term cognitive capacity depend on.",
          "This is a viable short-term strategy. Over the course of weeks and months, it progressively narrows the floor it is borrowing from. The early indicators are already present in your data: mood that does not recover with rest, a reduced emotional margin for ordinary demands, and a performance that feels increasingly effortful to maintain.",
          "What this pattern requires is not less work — it requires a firm boundary between your work zone and your rest zone, and a deliberate evening transition that your nervous system can begin to recognise as a deceleration signal. Your environment needs a consistent floor as much as it needs a functioning ceiling."
        ]
    }
    if (avgMood >= 4 && avgTension <= 3) return {
        ready: true,
        title: "Fourteen Days of A Regulated Home. Bravo",
        paragraphs: [
          "Across fourteen days, your somatic tension has remained consistently low and your mood regulation consistently high. This is not ambient good fortune; it is the measurable output of an environment that is absorbing daily load, supporting overnight recovery, and returning your nervous system to a regulated baseline each morning. Your space is doing its job.",
          "What the data confirms is that your current environmental conditions are not accidental. Your sensory practices, thermal ecology, sleep habits, and spatial routines are functioning as a coherent, mutually reinforcing system. Each element is reducing the demand placed on the others.",
          "The task now is to understand what is working precisely enough to protect it, particularly during elevated stress periods, travel, or seasonal light change, when the instinct is to deprioritise exactly the conditions that are generating this baseline."
        ]
    }
    return {
        ready: true,
        title: "Still Working Out The Pattern",
        paragraphs: [
          "The last fourteen days show significant fluctuation across mood, tension, and focus without a consistent directional pattern. Before locating the source of that variance in your physical environment, it is worth naming what the data cannot distinguish: not all fluctuation is environmental in origin.",
          "Hormonal shifts, perimenopause, periods of elevated relational or cognitive demand, and natural energy cycles produce real, measurable changes in tension, sleep quality, focus, and mood — changes that register in your logs independently of what your physical space is doing. Your body is responding accurately to its conditions. The question the engine is still resolving is which portion of that variance is environmental and which is biological.",
          "Continue logging consistently. The appropriate response to biological fluctuation phases is not environmental optimisation, it is friction reduction. Ask your environment to do less against you, not more for you. Quieter, simpler, warmer. As the pattern stabilises, the engine will be able to isolate the environmental contribution more precisely."
        ]
    }
  }

  const morningInsight = getMorningFeedback()
  const eveningInsight = getEveningFeedback()
  const macroSynthesis = getMacroSynthesis()

  const moods = [
    { val: 1, label: 'Burned Out', desc: 'Running on empty', color: 'bg-red-500/20 border-red-500/50 text-red-400' },
    { val: 2, label: 'Tense / Edgy', desc: 'Buzzing with stress', color: 'bg-orange-500/20 border-orange-500/50 text-orange-400' },
    { val: 3, label: 'Neutral', desc: 'Holding steady', color: 'bg-[#c9ccbb]/70 border-[#c9ccbb]/50 text-[#c9ccbb]' },
    { val: 4, label: 'Grounded', desc: 'Breathing deeper', color: 'bg-[#b5a642]/20 border-[#b5a642]/50 text-[#b5a642]' },
    { val: 5, label: 'In Flow', desc: 'Effortless movement', color: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' }
  ]
  
  const morningTagOptions = [
    { id: 'ventilation', label: 'Opened Windows / Aired The Home', icon: <Wind size={14} /> },
    { id: 'sunlight', label: 'Got Early Morning Sunlight', icon: <Sun size={14} /> },
    { id: 'noise_buffer', label: 'Reduced Intrusive Noise', icon: <Volume2 size={14} /> },
    { id: 'declutter', label: 'Cleared/ Decluttered One Area', icon: <CheckCircle size={14} /> },
  ]

  const eveningTagOptions = [
    { id: 'low_horizon', label: 'Turned Off The Big Lights & Switched To Warm, Low-Level Lighting', icon: <Zap size={14} /> },
    { id: 'entropy_reset', label: 'Decluttered The First Surface I See In The Morning', icon: <CheckCircle size={14} /> },
    { id: 'acoustic_seal', label: 'Reduced or Softened Noise For The Night', icon: <Volume2 size={14} /> },
    { id: 'tactile_enclosure', label: 'Using Gentle Weight & Soft Textures for Sleep', icon: <Heart size={14} /> },
  ]

  const getBsfiLabel = (score: number) => {
    if (score <= 20) return { label: 'Your Home Is Supporting You', color: 'text-emerald-400', border: 'border-emerald-500/30' }
    if (score <= 40) return { label: 'A Little Friction Present', color: 'text-blue-400', border: 'border-blue-500/30' }
    if (score <= 60) return { label: 'Noticeable Friction Building', color: 'text-yellow-400', border: 'border-yellow-500/30' }
    if (score <= 80) return { label: 'Your home Is Actively Stressing You', color: 'text-orange-400', border: 'border-orange-500/30' }
    return { label: 'High Friction. Needs Attention', color: 'text-red-400', border: 'border-red-500/30' }
  }

  const fetchTodayLog = async () => {
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const todayStr = new Date().toLocaleDateString('en-CA') 
        const startOfToday = new Date().setHours(0, 0, 0, 0)
        const endOfToday = new Date().setHours(23, 59, 59, 999)

        const { data: logData } = await supabase
          .from('daily_logs')
          .select('*')
          .eq('user_id', user.id)
          .eq('date', todayStr)
          .single()
          
        const { data: existingBsfi } = await supabase
          .from('bsfi_results')
          .select('*')
          .eq('user_id', user.id)
          .order('calculated_for_date', { ascending: false })
          .limit(1)
          .maybeSingle() 
          
        if (existingBsfi) {
          setBsfiData({
            total_score: existingBsfi.total_score,
            dominant_domain: existingBsfi.dominant_domain,
            is_internal_driver: existingBsfi.domain_scores?.is_internal_driver || false
          })
        }

        const { data: scanData } = await supabase
          .from('meter_scans')
          .select('metric_type, value, created_at')
          .eq('user_id', user.id)
          .gte('created_at', new Date(startOfToday).toISOString())
          .lte('created_at', new Date(endOfToday).toISOString())

        let autoMorningLux = ''
        let autoEveningLux = ''
        let autoDaytimeDb = ''
        let autoNighttimeDb = ''

        if (scanData && scanData.length > 0) {
          scanData.forEach(scan => {
            const scanHour = new Date(scan.created_at).getHours()
            
            if (scan.metric_type === 'lux') {
              if (scanHour >= 4 && scanHour < 12) autoMorningLux = scan.value.toString()
              if (scanHour >= 16) autoEveningLux = scan.value.toString()
            }
            
            if (scan.metric_type === 'db') {
              if (scanHour >= 8 && scanHour < 18) autoDaytimeDb = scan.value.toString()
              if (scanHour < 6 || scanHour >= 22) autoNighttimeDb = scan.value.toString()
            }
          })
        }

        if (logData) {
          setMorningMood(logData.mood_score)
          setMorningTags(logData.tags || [])
          setMorningNote(logData.note || '')
          
          setMorningLux(logData.morning_lux !== null ? logData.morning_lux.toString() : autoMorningLux)
          setEveningLux(logData.evening_lux !== null ? logData.evening_lux.toString() : autoEveningLux)
          setDaytimeDb(logData.daytime_db !== null ? logData.daytime_db.toString() : autoDaytimeDb)
          setNighttimeDb(logData.nighttime_db !== null ? logData.nighttime_db.toString() : autoNighttimeDb)

          if (logData.focus_hours !== null) setFocusScore(logData.focus_hours)
          if (logData.morning_tension !== null) setTensionScore(logData.morning_tension)
          if (logData.sleep_wakes !== null) setWakeScore(logData.sleep_wakes)

          setEveningMood(logData.evening_mood_score)
          setEveningTags(logData.evening_tags || [])
          setEveningNote(logData.evening_note || '')
        } else {
          setMorningLux(autoMorningLux)
          setEveningLux(autoEveningLux)
          setDaytimeDb(autoDaytimeDb)
          setNighttimeDb(autoNighttimeDb)
        }
    } catch (err) {
        console.error('fetchTodayLog failed:', err)
        setStatus('error')
        setErrorMessage('Could not load today\'s log. Please refresh.')
    } finally {
        setBsfiLoading(false)
    }
  }

  const fetchHistory = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('daily_logs')
      .select('date, mood_score, focus_hours, morning_tension, sleep_wakes') 
      .eq('user_id', user.id)
      .order('date', { ascending: false }) 
      .limit(14) 

    if (data) {
        const chronologicalData = data.reverse()
        
        const formatted = chronologicalData.map((log: any) => {
            const [year, month, day] = log.date.split('-')
            const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
            
            return {
                date: dateObj.toLocaleDateString('en-US', { weekday: 'short' }),
                mood: log.mood_score || 0,        
                tension: log.morning_tension || 0,
                focus: log.focus_hours || 0,
                wakes: log.sleep_wakes || 0
            }
        })
        setChartLogs(formatted)
    }
  }

  const toggleTag = (id: string) => {
    if (activeTab === 'morning') {
        setMorningTags(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
    } else {
        setEveningTags(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
    }
  }

  const handleSave = async (isForced = false) => {
    const criticalFields = activeTab === 'morning' 
        ? [morningLux, daytimeDb]
        : [eveningLux, nighttimeDb];

    const isMissing = criticalFields.some(val => val === null || val === '');

    if (isMissing && isForced !== true) {
      setShowAccuracyWarning(true);
      return;
    }

    setStatus('saving')
    setErrorMessage('')
    setShowAccuracyWarning(false)

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("No user logged in")

        const today = new Date().toLocaleDateString('en-CA')

        const payload = {
          user_id:  user.id,
          date:     today,

          // --- SOMATIC BASELINE ---
          mood_score:       morningMood,
          tags:             morningTags,      // 'tags' column = morning tags (confirmed schema)
          note:             morningNote,
          morning_tension:  tensionScore,
          sleep_wakes:      wakeScore,

          // --- GRANULAR ENVIRONMENTAL READINGS ---
          // Primary BSFI engine inputs — always stored at full resolution.
          morning_lux:  morningLux  ? parseInt(morningLux)  : null,
          evening_lux:  eveningLux  ? parseInt(eveningLux)  : null,
          daytime_db:   daytimeDb   ? parseInt(daytimeDb)   : null,
          nighttime_db: nighttimeDb ? parseInt(nighttimeDb) : null,

          // --- DERIVED COMPOSITE SCORES ---
          // Computed from granular readings on every save.
          // Written independently of the BSFI engine.
          //
          // lux_score:   Circadian Coherence Score (0–100)
          //              Rewards high morning lux AND low evening lux together.
          //
          // db_score:    Threshold-Normalised Acoustic Composite (0–100)
          //              Each reading scored against its WHO threshold independently.
          //              Daytime: 55dB | Nighttime: 40dB
          //
          // readiness_score: null — reserved for Oura ring integration.
          lux_score:        deriveLuxScore(morningLux, eveningLux),
          db_score:         deriveDbScore(daytimeDb, nighttimeDb),
          readiness_score:  null,

          // --- COGNITIVE OUTPUT ---
          focus_hours: Math.round(focusScore),

          // --- EVENING ---
          evening_mood_score: eveningMood,
          evening_tags:       eveningTags,
          evening_note:       eveningNote,
        }

        const { error } = await supabase
          .from('daily_logs')
          .upsert(payload, { onConflict: 'user_id, date' })

        if (error) throw error

        setStatus('success')
        fetchHistory() 
        setTimeout(() => setStatus('idle'), 2000)

        try {
            const res = await fetch('/api/calculate-bsfi', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            const data = await res.json()
            if (data.success && data.bsfiResult) {
                setBsfiData({
                    total_score: data.bsfiResult.bsfi_total,
                    dominant_domain: data.bsfiResult.dominant_domain,
                    is_internal_driver: data.bsfiResult.is_internal_driver
                })
            }
        } catch (engineError) {
            console.warn("BSFI engine skipped due to missing daily counterparts, but save was successful.")
        }

    } catch (err: any) {
        console.error("Save Error:", err)
        setStatus('error')
        setErrorMessage(err.message || "Database rejected entry.")
    }
  }

  const currentMood = activeTab === 'morning' ? morningMood : eveningMood
  const setCurrentMood = activeTab === 'morning' ? setMorningMood : setEveningMood
  const currentTags = activeTab === 'morning' ? morningTags : eveningTags
  const currentNote = activeTab === 'morning' ? morningNote : eveningNote
  const setCurrentNote = activeTab === 'morning' ? setMorningNote : setEveningNote
  const currentOptions = activeTab === 'morning' ? morningTagOptions : eveningTagOptions

  return (
    <div className="min-h-screen bg-[#1b270e] font-sans selection:bg-[#b5a642] selection:text-[#1b270e]">
      <Sidebar />
      <div className="md:ml-64 min-h-screen p-6 md:p-12">
        
        <div className="max-w-4xl mx-auto">
          
          <div className="mb-12 flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-serif text-[#c9ccbb] mb-2 flex items-center gap-4">
                Your Daily Logs
                <button 
                  onClick={() => setIsManualOpen(true)} 
                  className="text-[#b5a642]/60 hover:text-[#b5a642] transition-colors p-2 rounded-full hover:bg-[#b5a642]/10"
                >
                  <HelpCircle size={24} />
                </button>
              </h1>
              <p className="text-[#c9ccbb]/80">
                Track how your home is affecting your nervous system you each day and reveal patterns over time.
              </p>
            </div>
          </div>

          <div className="glass-panel p-8 rounded-3xl mb-16 relative overflow-hidden border border-[#c9ccbb]/10">
            
            <div className="flex justify-center mb-8">
                <div className="bg-[#000]/30 p-1 rounded-full flex gap-1 border border-[#c9ccbb]/10">
                    <button 
                        onClick={() => setActiveTab('morning')}
                        className={`flex items-center gap-2 px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                            activeTab === 'morning' ? 'bg-[#b5a642] text-[#1b270e]' : 'text-[#c9ccbb]/70 hover:text-[#c9ccbb]'
                        }`}
                    >
                        <Sunrise size={14} /> Morning
                    </button>
                    <button 
                        onClick={() => setActiveTab('evening')}
                        className={`flex items-center gap-2 px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                            activeTab === 'evening' ? 'bg-[#b5a642] text-[#1b270e]' : 'text-[#c9ccbb]/70 hover:text-[#c9ccbb]'
                        }`}
                    >
                        <Moon size={14} /> Evening
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-3 mb-8">
               <div className="w-10 h-10 rounded-full bg-[#b5a642]/10 flex items-center justify-center text-[#b5a642]">
                 <Heart size={20} />
               </div>
               <h2 className="text-2xl font-serif text-[#c9ccbb]">
                   {activeTab === 'morning' ? 'How You Woke Up' : 'Evening Wind-Down'}
               </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
              {moods.map((mood) => (
                <button
                  key={mood.val}
                  onClick={() => setCurrentMood(mood.val)}
                  className={`p-4 rounded-xl border transition-all text-left flex flex-col justify-between h-28 group relative overflow-hidden ${
                    currentMood === mood.val 
                      ? `${mood.color} shadow-lg scale-105` 
                      : 'bg-[#000]/20 border-[#c9ccbb]/10 text-[#c9ccbb]/40 hover:bg-[#c9ccbb]/5'
                  }`}
                >
                  <span className="text-xl font-serif font-bold relative z-10">{mood.val}</span>
                  <div className="relative z-10">
                    <div className={`font-bold text-xs mb-1 ${currentMood === mood.val ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>
                      {mood.label}
                    </div>
                  </div>
                  {currentMood === mood.val && <div className="absolute inset-0 bg-white/5 blur-md" />}
                </button>
              ))}
            </div>

            {activeTab === 'morning' && (
                <div className="mb-8 p-6 bg-[#b5a642]/5 rounded-2xl border border-[#b5a642]/10 animate-fade-in">
                    <label className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest mb-6 block flex items-center gap-2">
                        <Activity size={12} /> How Your Body Woke Up
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                        
                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="flex items-center gap-2 text-xs font-bold text-[#c9ccbb]">
                                   <Activity size={14} className="text-[#b5a642]" /> Jaw/Body Tension
                                </label>
                                <span className="text-[#b5a642] font-mono text-xs">{tensionScore}/10</span>
                            </div>
                            <p className="text-[#c9ccbb]/40 text-[10px] mb-3">Jaw/Shoulder tightness upon waking.</p>
                            <input 
                                type="range" min="0" max="10" step="1"
                                value={tensionScore}
                                onChange={(e) => setTensionScore(parseInt(e.target.value))}
                                className="w-full accent-[#b5a642] h-1 bg-[#000]/50 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="flex items-center gap-2 text-xs font-bold text-[#c9ccbb]">
                                   <Moon size={14} className="text-[#b5a642]" /> Sleep Interruptions
                                </label>
                                <div className="flex gap-3">
                                    <button onClick={() => setWakeScore(Math.max(0, wakeScore - 1))} className="text-[#c9ccbb] hover:text-[#b5a642]">-</button>
                                    <span className="text-[#b5a642] font-mono text-xs">{wakeScore}</span>
                                    <button onClick={() => setWakeScore(wakeScore + 1)} className="text-[#c9ccbb] hover:text-[#b5a642]">+</button>
                                </div>
                            </div>
                            <p className="text-[#c9ccbb]/40 text-[10px] mb-3">How many times you woke up during the night.</p>
                        </div>
                    </div>

                    {(tensionScore > 0 || wakeScore > 0) && (
                        <div className="mt-6 bg-[#1b270e] border-l-2 border-[#b5a642] rounded-r-xl overflow-hidden shadow-md">
                            <button 
                                onClick={() => setIsMorningOpen(!isMorningOpen)}
                                className="w-full flex items-center justify-between p-4 text-left hover:bg-[#b5a642]/5 transition-colors"
                            >
                                <span className="text-[#b5a642] text-[10px] uppercase font-bold tracking-widest">
                                    {morningInsight.title}
                                </span>
                                <motion.div animate={{ rotate: isMorningOpen ? 180 : 0 }}>
                                    <ChevronDown size={14} className="text-[#b5a642]" />
                                </motion.div>
                            </button>
                            <AnimatePresence>
                                {isMorningOpen && (
                                    <motion.div 
                                        initial={{ height: 0, opacity: 0 }} 
                                        animate={{ height: "auto", opacity: 1 }} 
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                        className="overflow-hidden relative"
                                    >
                                        {hasAccess ? (
                                            <div className="p-4 pt-0 space-y-3">
                                                <div className="w-full h-px bg-[#b5a642]/10 mb-4" />
                                                <p className="text-[#c9ccbb]/80 text-xs leading-relaxed">
                                                    <strong className="text-[#c9ccbb] font-serif tracking-wide mr-2">Reframe:</strong> 
                                                    {morningInsight.reframe}
                                                </p>
                                                <p className="text-[#c9ccbb]/80 text-xs leading-relaxed">
                                                    <strong className="text-[#c9ccbb] font-serif tracking-wide mr-2">Direction:</strong> 
                                                    {morningInsight.direction}
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="relative p-4 pt-0">
                                                <div className="w-full h-px bg-[#b5a642]/10 mb-4" />
                                                <div className="filter blur-[3px] opacity-30 select-none space-y-3 pointer-events-none">
                                                    <p className="text-[#c9ccbb]/80 text-xs leading-relaxed">
                                                        <strong className="text-[#c9ccbb] font-serif tracking-wide mr-2">Reframe:</strong> 
                                                        Waking through the night is less often a sign of dysregulation than a sign of thermoregulatory shift. Your environment may not be matching its needs.
                                                    </p>
                                                    <p className="text-[#c9ccbb]/80 text-xs leading-relaxed">
                                                        <strong className="text-[#c9ccbb] font-serif tracking-wide mr-2">Direction:</strong> 
                                                        Focus on the recovery envelope: breathable organic sleepwear, a cooler ambient temperature, and complete darkness.
                                                    </p>
                                                </div>
                                                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-4">
                                                    <Lock size={16} className="text-[#b5a642] mb-2" />
                                                    <span className="text-[10px] font-bold text-[#c9ccbb] uppercase tracking-widest mb-3 text-center">Unlock Somatic Reframes</span>
                                                    <Link href="/upgrade">
                                                        <button className="px-6 py-2 bg-[#b5a642] text-[#1b270e] text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-white transition-all">
                                                            Upgrade
                                                        </button>
                                                    </Link>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'evening' && (
                <div className="mb-8 p-6 bg-[#b5a642]/5 rounded-2xl border border-[#b5a642]/10 animate-fade-in">
                    <label className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest mb-6 block flex items-center gap-2">
                        <Brain size={12} /> How Your Workday Went
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="flex items-center gap-2 text-xs font-bold text-[#c9ccbb]">
                                   <Brain size={14} className="text-[#b5a642]" /> Focused Work (Hours)
                                </label>
                                <span className="text-[#b5a642] font-mono text-xs">{focusScore}h</span>
                            </div>
                            <p className="text-[#c9ccbb]/40 text-[10px] mb-3">Hours where you were focused and uninterrupted.</p>
                            <input 
                                type="range" min="0" max="12" step="1"
                                value={focusScore}
                                onChange={(e) => setFocusScore(parseInt(e.target.value))}
                                className="w-full accent-[#b5a642] h-1 bg-[#000]/50 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                    </div>

                    {focusScore > 0 && (
                        <div className="mt-6 bg-[#1b270e] border-l-2 border-[#b5a642] rounded-r-xl overflow-hidden shadow-md">
                            <button 
                                onClick={() => setIsEveningOpen(!isEveningOpen)}
                                className="w-full flex items-center justify-between p-4 text-left hover:bg-[#b5a642]/5 transition-colors"
                            >
                                <span className="text-[#b5a642] text-[10px] uppercase font-bold tracking-widest">
                                    {eveningInsight.title}
                                </span>
                                <motion.div animate={{ rotate: isEveningOpen ? 180 : 0 }}>
                                    <ChevronDown size={14} className="text-[#b5a642]" />
                                </motion.div>
                            </button>
                            <AnimatePresence>
                                {isEveningOpen && (
                                    <motion.div 
                                        initial={{ height: 0, opacity: 0 }} 
                                        animate={{ height: "auto", opacity: 1 }} 
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                        className="overflow-hidden relative"
                                    >
                                        {hasAccess ? (
                                            <div className="p-4 pt-0 space-y-3">
                                                <div className="w-full h-px bg-[#b5a642]/10 mb-4" />
                                                <p className="text-[#c9ccbb]/80 text-xs leading-relaxed">
                                                    <strong className="text-[#c9ccbb] font-serif tracking-wide mr-2">Reframe:</strong> 
                                                    {eveningInsight.reframe}
                                                </p>
                                                <p className="text-[#c9ccbb]/80 text-xs leading-relaxed">
                                                    <strong className="text-[#c9ccbb] font-serif tracking-wide mr-2">Direction:</strong> 
                                                    {eveningInsight.direction}
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="relative p-4 pt-0">
                                                <div className="w-full h-px bg-[#b5a642]/10 mb-4" />
                                                <div className="filter blur-[3px] opacity-30 select-none space-y-3 pointer-events-none">
                                                    <p className="text-[#c9ccbb]/80 text-xs leading-relaxed">
                                                        <strong className="text-[#c9ccbb] font-serif tracking-wide mr-2">Reframe:</strong> 
                                                        Extended time in high-beta execution mode is a central nervous system stressor. The day was productive.
                                                    </p>
                                                    <p className="text-[#c9ccbb]/80 text-xs leading-relaxed">
                                                        <strong className="text-[#c9ccbb] font-serif tracking-wide mr-2">Direction:</strong> 
                                                        Tonight's environment must match today's demand. Transition strictly to warm, low-level lighting.
                                                    </p>
                                                </div>
                                                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-4">
                                                    <Lock size={16} className="text-[#b5a642] mb-2" />
                                                    <span className="text-[10px] font-bold text-[#c9ccbb] uppercase tracking-widest mb-3 text-center">Unlock Your Daily Insights</span>
                                                    <Link href="/upgrade">
                                                        <button className="px-6 py-2 bg-[#b5a642] text-[#1b270e] text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-white transition-all">
                                                            Upgrade
                                                        </button>
                                                    </Link>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            )}

            <div className="mb-8 p-6 bg-[#000]/20 rounded-2xl border border-[#c9ccbb]/5">
                <label className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest mb-4 block flex items-center gap-2">
                    <Activity size={12} /> Your Home Environment Today
                </label>
                
                {activeTab === 'morning' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2 text-[#c9ccbb]/70 text-xs font-bold uppercase tracking-widest">
                                    <Sun size={14} className="text-orange-400" /> Morning Light Level
                                </div>
                                <button 
                                    onClick={() => { setActiveMeterTarget('morningLux'); setIsLightMeterOpen(true); }}
                                    className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors flex items-center gap-1 bg-[#b5a642]/10 px-2 py-1 rounded-md border border-[#b5a642]/20"
                                >
                                    <Activity size={12} /> Measure
                                </button>
                            </div>
                            <input 
                                type="number" 
                                min="0"
                                max="100000"
                                placeholder="e.g. 250 (Dim) or 2500 (Bright)"
                                value={morningLux}
                                onChange={(e) => setMorningLux(e.target.value)}
                                className="w-full bg-[#1b270e] border border-[#c9ccbb]/10 rounded-xl p-3 text-[#c9ccbb] focus:outline-none focus:border-[#b5a642]/50 text-sm"
                            />
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2 text-[#c9ccbb]/70 text-xs font-bold uppercase tracking-widest">
                                    <Volume2 size={14} className="text-red-400" /> Daytime Sound Level
                                </div>
                                <button 
                                    onClick={() => { setActiveMeterTarget('daytimeDb'); setIsAcousticMeterOpen(true); }}
                                    className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors flex items-center gap-1 bg-[#b5a642]/10 px-2 py-1 rounded-md border border-[#b5a642]/20"
                                >
                                    <Activity size={12} /> Measure
                                </button>
                            </div>
                            <input 
                                type="number"
                                min="0"
                                max="140"
                                placeholder="e.g. 45 (Kitchen) or 70 (Bedroom)"
                                value={daytimeDb}
                                onChange={(e) => setDaytimeDb(e.target.value)}
                                className="w-full bg-[#1b270e] border border-[#c9ccbb]/10 rounded-xl p-3 text-[#c9ccbb] focus:outline-none focus:border-[#b5a642]/50 text-sm"
                            />
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2 text-[#c9ccbb]/70 text-xs font-bold uppercase tracking-widest">
                                    <Zap size={14} className="text-orange-400" /> Evening Light Level
                                </div>
                                <button 
                                    onClick={() => { setActiveMeterTarget('eveningLux'); setIsLightMeterOpen(true); }}
                                    className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors flex items-center gap-1 bg-[#b5a642]/10 px-2 py-1 rounded-md border border-[#b5a642]/20"
                                >
                                    <Activity size={12} /> Measure
                                </button>
                            </div>
                            <input 
                                type="number" 
                                placeholder="e.g. 100 (Warm) or 800 (Overhead)"
                                value={eveningLux}
                                onChange={(e) => setEveningLux(e.target.value)}
                                className="w-full bg-[#1b270e] border border-[#c9ccbb]/10 rounded-xl p-3 text-[#c9ccbb] focus:outline-none focus:border-[#b5a642]/50 text-sm"
                            />
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2 text-[#c9ccbb]/70 text-xs font-bold uppercase tracking-widest">
                                    <Moon size={14} className="text-blue-400" /> Nighttime Sound Level
                                </div>
                                <button 
                                    onClick={() => { setActiveMeterTarget('nighttimeDb'); setIsAcousticMeterOpen(true); }}
                                    className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors flex items-center gap-1 bg-[#b5a642]/10 px-2 py-1 rounded-md border border-[#b5a642]/20"
                                >
                                    <Activity size={12} /> Measure
                                </button>
                            </div>
                            <input 
                                type="number" 
                                placeholder="e.g. 35 (Quiet) or 55 (Loud)"
                                value={nighttimeDb}
                                onChange={(e) => setNighttimeDb(e.target.value)}
                                className="w-full bg-[#1b270e] border border-[#c9ccbb]/10 rounded-xl p-3 text-[#c9ccbb] focus:outline-none focus:border-[#b5a642]/50 text-sm"
                            />
                        </div>
                    </div>
                )}
            </div>

            <div className="flex flex-wrap gap-2 mb-8 animate-fade-in">
              {currentOptions.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  className={`flex items-center gap-2 px-4 py-3 h-auto rounded-full border text-[10px] font-bold uppercase tracking-widest transition-all ${
                    currentTags.includes(tag.id)
                      ? 'bg-[#b5a642] border-[#b5a642] text-[#1b270e]'
                      : 'bg-[#000]/20 border-[#c9ccbb]/10 text-[#c9ccbb]/50 hover:text-[#c9ccbb]'
                  }`}
                >
                  {tag.icon} 
                  <span className="whitespace-normal text-left leading-tight">{tag.label}</span>
                </button>
              ))}
            </div>

            <div className="mb-8">
              <textarea 
                value={currentNote}
                onChange={(e) => setCurrentNote(e.target.value)}
                placeholder={activeTab === 'morning' ? "Anything worth noting about your morning?" : "Anything worth noting about your evening?"}
                className="w-full h-24 bg-[#000]/20 border border-[#c9ccbb]/10 rounded-xl p-4 text-[#c9ccbb] text-sm placeholder:text-[#c9ccbb]/50 focus:outline-none focus:border-[#b5a642]/50 resize-none font-sans"
              />
            </div>

            <div className="flex flex-col gap-4 pt-6 border-t border-[#c9ccbb]/10">
              <AnimatePresence>
                {showAccuracyWarning && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="flex justify-between items-center p-4 bg-[#b5a642]/10 border border-[#b5a642]/30 rounded-xl"
                  >
                    <p className="text-sm text-[#c9ccbb] leading-relaxed">
                      <strong className="text-[#b5a642] uppercase tracking-widest text-[10px] mr-2 block mb-1">Data Integrity Notice:</strong> 
                      Some readings haven't been added. Your entry will still save but the score will just be based on what's here.
                    </p>
                    <button 
                        onClick={() => handleSave(true)}
                        className="px-6 py-2 rounded-xl border border-[#b5a642] text-[#b5a642] text-xs font-bold uppercase tracking-widest hover:bg-[#b5a642]/10 transition-all shrink-0"
                    > 
                        Save As Is
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-end items-center gap-4">
                 <AnimatePresence>
                    {status === 'error' && (
                        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="text-red-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                          <AlertCircle size={14} /> {errorMessage}
                        </motion.div>
                    )}
                    {status === 'success' && (
                        <motion.span 
                          initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                          className="text-[#b5a642] text-xs font-bold uppercase tracking-widest flex items-center gap-1"
                        >
                          <CheckCircle size={14} /> Saved
                        </motion.span>
                    )}
                 </AnimatePresence>
                 
                 <button  
                   onClick={() => handleSave(false)}
                   disabled={currentMood === null || status === 'saving'}
                   className={`px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${
                     currentMood === null 
                       ? 'bg-[#c9ccbb]/10 text-[#c9ccbb]/50 cursor-not-allowed'
                       : 'bg-[#c9ccbb] text-[#1b270e] hover:bg-white' 
                   }`}
                 >
                   {status === 'saving' ? <><Loader2 size={14} className="animate-spin" /> Saving</> : 'Save Entry'}
                 </button>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {bsfiData && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="glass-panel p-6 rounded-3xl mb-8 border border-[#b5a642]/30 relative overflow-hidden bg-gradient-to-br from-[#b5a642]/10 to-transparent"
              >
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                  <div className="flex items-center gap-6">
                    <div className={`w-24 h-24 rounded-full border-4 ${getBsfiLabel(bsfiData.total_score).border} flex flex-col items-center justify-center bg-[#1b270e] shrink-0 shadow-xl shadow-[#b5a642]/10`}>
                      <span className={`text-3xl font-serif ${getBsfiLabel(bsfiData.total_score).color}`}>
                        {bsfiData.total_score}
                      </span>
                      <span className="text-[10px] text-[#c9ccbb]/50 font-bold uppercase tracking-widest">BSFI</span>
                    </div>
                    <div>
                      <span className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest mb-1 block">
                        Today's Home Friction Score
                      </span>
                      <h3 className="text-xl font-serif text-[#c9ccbb] mb-1">
                        {getBsfiLabel(bsfiData.total_score).label}
                      </h3>
                      {bsfiData.is_internal_driver ? (
                         <p className="text-[#c9ccbb]/80 text-xs max-w-md leading-relaxed mt-2">
                           <strong className="text-[#b5a642] uppercase tracking-widest text-[10px] block mb-1">The friction looks internal right now:</strong> 
                           Your space reads stable. What you're feeling is more likely coming from inside: hormonal shifts, a demanding period, or accumulated stress. Ask your home to do less right now, not more.
                         </p>
                      ) : (
                         <p className="text-[#c9ccbb]/80 text-xs mt-2">
                           Where the friction is coming from: <strong className="text-white bg-[#000]/30 px-2 py-1 rounded ml-1">{bsfiData.dominant_domain}</strong>
                         </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right md:text-left self-start md:self-center">
                    <p className="text-[10px] text-[#c9ccbb]/50 uppercase tracking-widest max-w-[150px] leading-relaxed">
                      Based on your last 14 days of logs
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className={`glass-panel p-6 rounded-3xl mb-8 border relative overflow-hidden transition-all ${!macroSynthesis.ready || hasAccess ? 'bg-gradient-to-r from-[#b5a642]/10 to-transparent border-[#b5a642]/20' : 'bg-[#b5a642]/10 border-[#b5a642]/40 shadow-lg shadow-[#b5a642]/5'}`}>
            <div 
              className={`flex items-center justify-between w-full relative z-10 ${hasAccess && macroSynthesis.ready ? 'cursor-pointer group' : ''}`}
              onClick={() => {
                if (hasAccess && macroSynthesis.ready) setIsSynthesisExpanded(!isSynthesisExpanded)
              }}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#b5a642]/20 rounded-full text-[#b5a642] shrink-0">
                  {macroSynthesis.ready && !hasAccess ? <Lock size={20} /> : <Fingerprint size={20} />}
                </div>
                <div>
                  <span className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest mb-1 block">
                    {macroSynthesis.ready ? "Your 14-Day Pattern" : "Building Your Picture"}
                  </span>
                  <h4 className="text-xl font-serif text-[#c9ccbb]">{macroSynthesis.title}</h4>
                </div>
              </div>

              {hasAccess && macroSynthesis.ready && (
                <div className="text-[#c9ccbb]/40 group-hover:text-[#b5a642] transition-colors ml-4 shrink-0">
                  {isSynthesisExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              )}
            </div>

            {!macroSynthesis.ready ? (
               <div className="mt-4 pt-4 border-t border-[#c9ccbb]/10 w-full relative z-10">
                 <p className="text-sm text-[#c9ccbb]/80 leading-relaxed max-w-2xl">
                    {macroSynthesis.paragraphs[0]}
                 </p>
                 <div className="w-full max-w-md h-1 bg-[#000]/50 rounded-full mt-4 overflow-hidden">
                    <div 
                      className="h-full bg-[#b5a642] transition-all duration-1000" 
                      style={{ width: `${(chartLogs.length / 14) * 100}%` }}
                    />
                 </div>
               </div>
            ) : hasAccess ? (
               <AnimatePresence>
                 {isSynthesisExpanded && (
                   <motion.div 
                     initial={{ height: 0, opacity: 0 }} 
                     animate={{ height: "auto", opacity: 1 }} 
                     exit={{ height: 0, opacity: 0 }}
                     transition={{ duration: 0.3, ease: "easeInOut" }}
                     className="overflow-hidden relative z-10"
                   >
                     <div className="mt-6 space-y-4 text-[#c9ccbb]/80 text-sm leading-relaxed border-t border-[#c9ccbb]/10 pt-6">
                       {macroSynthesis.paragraphs.map((para, i) => (
                         <p key={i}>{para}</p>
                       ))}
                     </div>
                   </motion.div>
                 )}
               </AnimatePresence>
            ) : (
               <div className="mt-6 pt-6 border-t border-[#c9ccbb]/10 flex flex-col md:flex-row md:items-center justify-between gap-6 w-full relative z-10">
                 <p className="text-sm text-[#c9ccbb]/80 leading-relaxed max-w-xl">
                   14 days of data collected. Your home's friction pattern is ready. Upgrade to see what it means for you.
                 </p>
                 <Link href="/upgrade" className="shrink-0 w-full md:w-auto">
                   <button className="w-full md:w-auto px-8 py-3 bg-[#b5a642] text-[#1b270e] text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-white transition-all shadow-lg shadow-[#b5a642]/20">
                     Read My Pattern
                   </button>
                 </Link>
               </div>
            )}
          </div>

          <div className="animate-fade-in-up delay-100 mb-12">
              <div className="flex justify-between items-end mb-6">
                <div>
                   <div className="flex items-center gap-2 text-[#c9ccbb]/80 text-xs font-bold uppercase tracking-widest mb-1">
                     <TrendingUp size={14} /> Your Daily Pattern
                   </div>
                   <h3 className="text-xl font-serif text-[#c9ccbb]">Your Mood, Tension & Focus Rhythm Over Time</h3>
                </div>
              </div>
              
              <div className="glass-panel p-4 md:p-8 rounded-3xl border border-[#c9ccbb]/10 relative overflow-hidden">
                   <div className="w-full overflow-x-auto hide-scrollbar">
                     <div className="min-w-[600px] h-[300px]">
                       <CorrelationGraph data={chartLogs} />
                     </div>
                   </div>
              </div>
          </div>

        </div>
      </div>

      <AnimatePresence>
        {isManualOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#000]/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="w-full max-w-2xl max-h-[85vh] overflow-y-auto hide-scrollbar bg-[#1b270e] border border-[#b5a642]/30 rounded-3xl shadow-2xl relative p-8 md:p-12"
            >
              <button 
                onClick={() => setIsManualOpen(false)} 
                className="absolute top-6 right-6 text-[#c9ccbb]/50 hover:text-[#b5a642] z-10 transition-colors bg-[#000]/20 p-2 rounded-full"
              >
                <X size={20} />
              </button>

              <h2 className="text-3xl font-serif text-[#c9ccbb] mb-8 border-b border-[#c9ccbb]/10 pb-6">How This Works</h2>

              <div className="space-y-8 text-[#c9ccbb]/80 text-sm leading-relaxed font-light">
                <section>
                  <h3 className="text-lg font-serif text-[#b5a642] mb-2">The Purpose of Logging</h3>
                  <p>This isn't about optimising yourself. It's about understanding how aligned your home is with your nervous systems needs. Consistent daily entries build a picture that a single day can never show, revealing which parts of your environment are genuinely supporting you and which are slowly draining you.</p>
                </section>

                <section>
                  <h3 className="text-lg font-serif text-[#b5a642] mb-2">How Your Body Woke Up (Morning)</h3>
                  <p>This captures what your body held overnight. Waking up with tension in your jaw or shoulders, or waking frequently through the night, are flagging internal and external signals. This section tracks whether your home is helping your body rest or asking it to endure.</p>
                </section>

                <section>
                  <h3 className="text-lg font-serif text-[#b5a642] mb-2">How Your Day Went (Evening)</h3>
                  <p>This captures how much focused work you had in the day. A demanding day needs a deliberate evening. Without one, tomorrow pays the cost. We track this to ensure your evening environment matches what your day actually asked of you.</p>
                </section>

                <section>
                  <h3 className="text-lg font-serif text-[#b5a642] mb-2">Your Home Friction Score</h3>
                  <p>A daily score from 0 to 100 that measures how aligned or misaligned your home environment is with your nervous system on any given day. A low score means your home is supporting you. A high score means it is quietly draining you through light, noise, or accumulated stress, before the day has properly begun.</p>
                </section>

                <section>
                  <h3 className="text-lg font-serif text-[#b5a642] mb-2">Your 14-Day Pattern</h3>
                  <p>After 14 days of entries, the pattern becomes readable. The system separates friction that is coming from your physical space from fluctuation that is coming from inside, such as hormonal shifts, emotional load and natural energy cycles. Not everything you feel is your home's doing. The 14-day picture helps identify what actually is.</p>
                </section>
              </div>
            </motion.div>
          </div>
        )}

        {isLightMeterOpen && (
          <LightSensorModal 
            onClose={() => setIsLightMeterOpen(false)} 
            onSave={(lux) => {
              if (activeMeterTarget === 'morningLux') setMorningLux(lux.toString());
              if (activeMeterTarget === 'eveningLux') setEveningLux(lux.toString());
              setIsLightMeterOpen(false);
            }} 
          />
        )}

        {isAcousticMeterOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#000]/80 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#1b270e] border border-[#b5a642]/30 rounded-3xl overflow-hidden shadow-2xl relative"
            >
              <button onClick={() => setIsAcousticMeterOpen(false)} className="absolute top-4 right-4 text-[#c9ccbb]/50 hover:text-[#b5a642] z-10">✕</button>
              
              <NoiseSensorModal 
                onClose={() => setIsAcousticMeterOpen(false)}
                onSave={(db) => {
                  if (activeMeterTarget === 'nighttimeDb') setNighttimeDb(db.toString());
                  if (activeMeterTarget === 'daytimeDb') setDaytimeDb(db.toString());
                  setIsAcousticMeterOpen(false);
                }} 
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
